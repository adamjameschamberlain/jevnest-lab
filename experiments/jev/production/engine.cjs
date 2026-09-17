'use strict';
// Versioned experiment engine. The original browser worker and v1 runner are untouched.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const {digest}=require('../offline.cjs');
const {area,rng}=require('../full/corpus.cjs');
const root=path.resolve(__dirname,'../../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const plain=x=>JSON.parse(JSON.stringify(x));
class Deadline extends Error {constructor(){super('Search deadline reached');this.name='Deadline';}}
const rect=(w,h)=>[{x:0,y:0},{x:0,y:h},{x:w,y:h},{x:w,y:0}];
const rotate=(p,r)=>{const a=r*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return p.map(v=>({x:v.x*c-v.y*s,y:v.x*s+v.y*c}));};
function bounds(p){const x=Math.min(...p.map(v=>v.x)),y=Math.min(...p.map(v=>v.y));return {x,y,width:Math.max(...p.map(v=>v.x))-x,height:Math.max(...p.map(v=>v.y))-y};}
function simple(points){
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const on=(a,b,c)=>Math.abs(cross(a,b,c))<1e-8&&c.x>=Math.min(a.x,b.x)-1e-8&&c.x<=Math.max(a.x,b.x)+1e-8&&c.y>=Math.min(a.y,b.y)-1e-8&&c.y<=Math.max(a.y,b.y)+1e-8;
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
  if(j===i+1||(i===0&&j===points.length-1))continue;
  const a=points[i],b=points[(i+1)%points.length],c=points[j],d=points[(j+1)%points.length];
  assert.ok(!(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)&&!on(a,b,c)&&!on(a,b,d)&&!on(c,d,a)&&!on(c,d,b),'Self-intersecting or touching outline');
 }
}
function validateJob(job){
 assert.equal(job.schemaVersion,2);assert.equal(job.units,'mm','Convert source coordinates explicitly to millimetres');
 assert.ok(/^[a-zA-Z0-9_-]+$/.test(job.id));assert.ok(['sheet','roll'].includes(job.media?.type));
 for(const k of ['width',...(job.media.type==='sheet'?['height']:[])])assert.ok(Number.isFinite(job.media[k])&&job.media[k]>0&&job.media[k]<=1e6,'Invalid media '+k);
 assert.ok(Number.isFinite(job.spacing)&&job.spacing>=0&&job.spacing<=100);
 assert.ok(Number.isFinite(job.margin)&&job.margin>=0&&job.margin<=1000);
 assert.ok(job.provenance?.kind&&job.provenance?.family,'Missing provenance/family');
 assert.ok(['development','evaluation'].includes(job.split));assert.ok(Array.isArray(job.parts)&&job.parts.length);
 const keys=new Set();let count=0;
 for(const p of job.parts){
  assert.ok(typeof p.key==='string'&&!keys.has(p.key),'Duplicate/missing part key');keys.add(p.key);
  assert.ok(!p.holes?.length&&!p.children?.length,'Holes are unsupported; do not silently drop internal contours');
  assert.ok(!p.transform,'Apply transforms explicitly to coordinates before importing');
  assert.ok(Number.isInteger(p.quantity)&&p.quantity>0);count+=p.quantity;
  assert.ok(p.points.length>=3&&p.points.length<=2000,'Invalid vertex count');
  for(const v of p.points)assert.ok(Array.isArray(v)&&v.length===2&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=1e6),'Invalid point');
  assert.ok(new Set(p.points.map(v=>JSON.stringify(v))).size===p.points.length,'Duplicate vertex; omit closing point');
  assert.ok(p.rotations?.length&&new Set(p.rotations).size===p.rotations.length&&p.rotations.every(r=>Number.isFinite(r)&&r>=0&&r<360),'Explicit unique rotations required');
  const points=p.points.map(([x,y])=>({x,y}));assert.ok(area(points)>1e-6);simple(points);
 }
 assert.ok(count<=2000,'At most 2000 parts in this version');return job;
}
function createEngine(job,{deadline=Infinity,cacheLimit=30000,seed=1}={}){
 const started=performance.now();validateJob(job);
 const check=()=>{if(performance.now()>=deadline)throw new Deadline();};
 const context=vm.createContext({console:{log(){}},performance,navigator:{userAgent:'chrome',appName:'Netscape'},checkDeadline:check});
 vm.runInContext('var self=this;var window=this;var global={};',context);
 for(const f of ['util/clipper.js','util/geometryutil.js','util/placementworker.js','benchmarks/runner.js'])vm.runInContext(read(f),context);
 const C=context.ClipperLib,G=context.GeometryUtil,scale=10000000;
 const clip=p=>p.map(v=>({X:Math.round(v.x*scale),Y:Math.round(v.y*scale)}));
 const from=p=>p.map(v=>({x:v.X/scale,y:v.Y/scale}));
 function offset(points,d){
  if(!d)return points.map(v=>({...v}));
  let poly=clip(points);if(!C.Clipper.Orientation(poly))poly.reverse();
  // Miter envelope is conservative at convex corners; exact output remains the original outline.
  const co=new C.ClipperOffset(4,.01*scale),out=new C.Paths();co.AddPath(poly,C.JoinType.jtMiter,C.EndType.etClosedPolygon);co.Execute(out,d*scale);
  assert.equal(out.length,1,'Offset split/erased outline is unsupported');return from(out[0]);
 }
 const half=job.spacing/2,parts=[];
 for(const p of job.parts){
  check();let points=p.points.map(([x,y])=>({x,y}));const b=bounds(points);points=points.map(v=>({x:v.x-b.x,y:v.y-b.y}));
  const envelope=offset(points,half),shapeKey=digest(envelope),a=area(points),box=bounds(points);
  const allowed=p.rotations.filter(r=>{const b=bounds(rotate(envelope,r));return job.media.type==='sheet'?b.width<=job.media.width-2*job.margin+1e-7&&b.height<=job.media.height-2*job.margin+1e-7:b.height<=job.media.width-2*job.margin+1e-7;});
  assert.ok(allowed.length,'Part '+p.key+' has no allowed orientation fitting the media and spacing');
  for(let i=0;i<p.quantity;i++)parts.push({id:parts.length,source:p.key,points,envelope,shapeKey,allowed,area:a,box,concavity:1-a/(box.width*box.height)});
 }
 // Roll feed runs along X; cross-web width is Y. Finite upper bound can fit parts in a row.
 const width=job.media.type==='sheet'?job.media.width-2*job.margin:parts.reduce((s,p)=>s+Math.max(...p.allowed.map(r=>bounds(rotate(p.envelope,r)).width))+1,0);
 const height=job.media.type==='sheet'?job.media.height-2*job.margin:job.media.width-2*job.margin;
 assert.ok(width>0&&height>0);
 assert.ok(Math.max(width,height)*scale<2**50,'Media exceeds conservative numeric precision range');
 const config={clipperScale:scale,curveTolerance:.01,spacing:0,rotations:4,populationSize:10,mutationRate:10,useHoles:false,exploreConcave:false,captureCandidates:false};
 const bin=Object.assign(rect(width,height),{id:-1});
 const src=read('svgnest.js'),start='\t\t\tp.map(function(pair){',end='\t\t\t}).then(function(generatedNfp){';
 assert.equal(src.split(start).length,2);assert.equal(src.split(end).length,2);
 const generate=vm.runInContext('(function(pair){'+src.split(start)[1].split(end)[0]+'})',context);
 const gaStart=src.indexOf('\tfunction GeneticAlgorithm(adam, bin, config){');assert.ok(gaStart>0);
 vm.runInContext(src.slice(gaStart,src.lastIndexOf('})(window);')),context);
 context.seededRandom=rng(seed);vm.runInContext('Math.random=seededRandom',context);
 const native=new context.PlacementWorker(bin,[],[],[],config,{}).placePaths.toString();
 const seam='for(i=0; i<paths.length; i++){';assert.ok(native.includes(seam));
 const worker=vm.runInContext('('+native.split(seam).join(seam+'checkDeadline();')+')',context);
 const profile={nfpGenerated:0,nfpHits:0,nfpMs:0,fullEvaluations:0,probeEvaluations:0,fitChecks:0,validationMs:0,cacheEvictions:0};
 const cache=new Map();
 function nfp(a,b,ar,br,inside=false,w=width,h=height){
  check();const key=JSON.stringify([inside?['bin',w,h]:a.shapeKey,b.shapeKey,ar,br]);
  if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);profile.nfpHits++;return v;}
  const t=performance.now();context.global.env={searchEdges:false,useHoles:false};
  const A=Object.assign((inside?rect(w,h):a.envelope).map(v=>({...v})),{id:inside?-1:a.id});
  const B=Object.assign(b.envelope.map(v=>({...v})),{id:b.id});
  const out=generate({A,B,key:{A:A.id,B:B.id,inside,Arotation:ar,Brotation:br}});
  profile.nfpGenerated++;profile.nfpMs+=performance.now()-t;check();
  if(inside&&out&&!out.value)out.value=[];
  assert.ok(out&&Array.isArray(out.value),'NFP generation failed');
  cache.set(key,out.value);if(cache.size>cacheLimit){cache.delete(cache.keys().next().value);profile.cacheEvictions++;}return out.value;
 }
 const geometry={bin:{id:-1,points:rect(width,height)},parts:parts.map(p=>({id:p.id,source:p.source,points:p.envelope})),config};
 function evaluate(schedule,{probe=false}={}){
  check();assert.ok(schedule.length&&new Set(schedule.map(x=>x.id)).size===schedule.length,'Invalid schedule');
  if(!probe)assert.equal(schedule.length,parts.length);
  const paths=schedule.map(x=>{const p=parts[x.id];assert.ok(p&&p.allowed.includes(x.rotation),'Forbidden rotation');return Object.assign(p.envelope.map(v=>({...v})),{id:p.id,source:p.source,rotation:x.rotation});});
  const lazy=new Proxy({}, {get(_target,key){if(typeof key!=='string'||key[0]!=='{')return undefined;const k=JSON.parse(key);const value=nfp(k.A===-1?null:parts[k.A],parts[k.B],k.Arotation,k.Brotation,k.inside);return value;}});
  // NFP generation temporarily changes env; getters restore the placement environment.
  const env={self:new context.PlacementWorker(bin,paths,[],[],config,lazy)};
  const proxy=new Proxy({}, {get(_t,k){const v=lazy[k];context.global.env=env;return v;}});env.self.nfpCache=proxy;context.global.env=env;
  const raw=worker(paths);
  const result={fitness:raw.fitness,area:raw.area,placements:plain(raw.placements.map(b=>b.map(({id,rotation,x,y})=>({id,rotation,x,y})))),unplaced:plain(raw.paths.map(({id,rotation})=>({id,rotation})))};
  if(probe)profile.probeEvaluations++;else profile.fullEvaluations++;
  const lengths=result.placements.map(b=>Math.max(0,...b.flatMap(p=>rotate(parts[p.id].envelope,p.rotation).map(v=>v.x+p.x))));
  const placed=result.placements.flat();const materialArea=placed.reduce((s,p)=>s+parts[p.id].area,0);
  const bins=result.placements.length;
  const length=job.media.type==='roll'?(bins===1?lengths[0]+2*job.margin:Infinity):null;
  const metrics={unplaced:result.unplaced.length,bins,length,occupiedLength:lengths.reduce((s,x)=>s+x,0),fitness:raw.fitness,
   utilisation:materialArea/(job.media.type==='roll'?length*job.media.width:bins*job.media.width*job.media.height)};
  if(job.media.type==='roll'&&bins>1)throw new Error('Roll upper-bound overflow');
  check();return {result,metrics,schedule:plain(schedule)};
 }
 function validate(value){
  check();const t=performance.now(),result=value.result;
  for(const p of result.placements.flat())assert.ok(parts[p.id]?.allowed.includes(p.rotation),'Invalid rotation in final layout');
  const validation=plain(context.validateGeometry(result,geometry));
  assert.ok(validation.valid,JSON.stringify(validation.violations));
  profile.validationMs+=performance.now()-t;check();return validation;
 }
 function fitWitness(placements,part,rotation,w=width){
  check();profile.fitChecks++;
  const inner=nfp(null,part,0,rotation,true,w,height);if(!inner.length)return false;
  const cl=new C.Clipper(),out=new C.Paths();
  cl.AddPaths(inner.map(clip),C.PolyType.ptSubject,true);
  for(const p of placements){const nf=nfp(parts[p.id],part,p.rotation,rotation);cl.AddPaths(nf.map(poly=>clip(poly.map(v=>({x:v.x+p.x,y:v.y+p.y})))),C.PolyType.ptClip,true);}
  assert.ok(cl.Execute(C.ClipType.ctDifference,out,C.PolyFillType.pftNonZero,C.PolyFillType.pftNonZero),'Fit witness clipping failed');
  return out.some(poly=>Math.abs(C.Clipper.Area(poly))>1e-6*scale*scale);
 }
 function makeGa(){const hydrated=parts.slice().sort((a,b)=>b.area-a.area).map(p=>Object.assign(p.envelope.map(v=>({...v})),{id:p.id,source:p.source}));return new context.GeneticAlgorithm(hydrated,bin,config);}
 function gaSchedule(individual){return individual.placement.map((p,i)=>({id:p.id,rotation:parts[p.id].allowed.includes(individual.rotation[i])?individual.rotation[i]:parts[p.id].allowed[0]}));}
 return {job,parts,geometry,width,height,profile,check,evaluate,validate,fitWitness,makeGa,gaSchedule,setupMs:performance.now()-started,
  renderGeometry:{...geometry,parts:parts.map(p=>({id:p.id,points:p.points}))}};
}
module.exports={createEngine,validateJob,Deadline,bounds,rotate,rect};
