'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createEngine,validateJob,Deadline}=require('../experiments/jev/production/engine.cjs');
const {createEngine:oldEngine}=require('../experiments/jev/full/engine.cjs');
const {proposal,buildRequest,evidence,validateScores,callScores,SETTINGS}=require('../experiments/jev/production/policy.cjs');
const {runSearch}=require('../experiments/jev/production/search.cjs');
const {report}=require('../experiments/jev/production/report.cjs');
function job(){return {schemaVersion:2,id:'fixture',split:'development',units:'mm',spacing:0,margin:0,media:{type:'sheet',width:100,height:80},provenance:{kind:'test',family:'fixture'},parts:[{key:'L',quantity:3,rotations:[0,90,180,270],points:[[0,0],[30,0],[30,8],[8,8],[8,30],[0,30]]},{key:'square',quantity:3,rotations:[0,90],points:[[0,0],[12,0],[12,12],[0,12]]}]};}
function response(request){return {model:request.model,usage:{input_tokens:123,output_tokens:45},answers:Object.fromEntries(Object.entries(request.questions).map(([id,q])=>[id,{type:'score',score:1.2,confidence:.4,legend:Object.fromEntries(q.criteria.map((v,i)=>[String(i),v])),probabilities:{'0':.1,'1':.6,'2':.3}}]))};}
test('lazy NFPs reproduce the original worker, including rotations, and reuse identical shapes',()=>{
 const j=job(),e=createEngine(j),schedule=proposal(e,2,0).schedule;
 for(const index of [0,1,3]){
 const schedule=proposal(e,2,index).schedule,got=e.evaluate(schedule),geometry=e.geometry,old=oldEngine(geometry,2),individual={placement:schedule.map(s=>Object.assign(geometry.parts[s.id].points.map(p=>({...p})),{id:s.id,source:geometry.parts[s.id].source})),rotation:schedule.map(s=>s.rotation)};
 const ref=old.evaluate(individual,{unmodified:true});assert.deepEqual(got.result.placements,ref.result.placements);assert.equal(e.validate(got).valid,true);
 }
 const before=e.profile.nfpGenerated;e.evaluate(schedule);assert.equal(e.profile.nfpGenerated,before);assert.ok(e.profile.nfpHits>0);
});
test('spacing envelopes reject overlapping clearance and forbidden rotations',()=>{
 const j=job();j.spacing=4;j.margin=5;const e=createEngine(j),r=e.evaluate(proposal(e,1,0).schedule);assert.ok(e.validate(r).valid);
 const bad=structuredClone(r);bad.result.placements[0][1]={...bad.result.placements[0][0],id:1};assert.throws(()=>e.validate(bad),/overlap/);
 const rot=structuredClone(r);rot.result.placements[0][0].rotation=45;assert.throws(()=>e.validate(rot),/rotation/);
});
test('invalid topology, holes and transforms fail explicitly',()=>{
 const j=job();j.parts[0].holes=[[[1,1],[2,1],[2,2]]];assert.throws(()=>validateJob(j),/Holes/);
 const x=job();x.parts[0].points=[[0,0],[30,30],[0,30],[30,0]];assert.throws(()=>validateJob(x));
 const y=job();y.parts[0].transform='scale(2)';assert.throws(()=>validateJob(y),/transforms/);
});
test('fit witnesses distinguish a full occupied strip from an available opening',()=>{
 const j=job();j.parts=[{key:'box',quantity:2,rotations:[0],points:[[0,0],[20,0],[20,20],[0,20]]}];j.media={type:'sheet',width:100,height:20};
 const e=createEngine(j);assert.equal(e.fitWitness([{id:0,rotation:0,x:0,y:0}],e.parts[1],0,20),false);
 // Give nondegenerate clearance in Y: positive-region witnesses deliberately exclude exact fits.
 j.media.height=21;const f=createEngine(j);assert.equal(f.fitWitness([{id:0,rotation:0,x:0,y:0}],f.parts[1],0,50),true);
});
test('roll objective is consumed feed length and accounts for margin',()=>{
 const j=job();j.media={type:'roll',width:80};j.margin=2;const e=createEngine(j),r=e.evaluate(proposal(e,1,0).schedule);assert.equal(r.metrics.bins,1);assert.ok(r.metrics.length>0);assert.ok(e.validate(r).valid);assert.equal(r.metrics.length,r.metrics.occupiedLength+4);
});
test('all proposal dimensions share a request with explicit candidate paths; real payload validator',async()=>{
 const e=createEngine(job()),rows=[evidence(e,proposal(e,1,0)),evidence(e,proposal(e,1,1))],request=buildRequest(e,rows);
 assert.equal(Object.keys(request.questions).length,6);assert.ok(Object.values(request.questions).every(q=>q.instructions.includes('`proposals[')));
 const body=response(request),v=validateScores(body,request);assert.equal(v.ranking.length,2);
 const broken=structuredClone(body);delete broken.answers[Object.keys(broken.answers)[0]];assert.throws(()=>validateScores(broken,request),/keys/);
 const invalid=structuredClone(body);Object.values(invalid.answers)[0].score=99;assert.throws(()=>validateScores(invalid,request),/score/);
 let receipts=0,calls=0;const result=await callScores(request,{apiKey:'test-only',deadline:performance.now()+5000,onReceipt:()=>receipts++,fetchImpl:async()=>{calls++;return {ok:true,json:async()=>body}}});assert.equal(calls,1);assert.equal(receipts,1);assert.equal(result.usage.input_tokens,123);
});
test('budget stops geometry and never admits late incumbent; API failures remain visible',async()=>{
 assert.throws(()=>createEngine(job(),{deadline:performance.now()-1}),Deadline);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jev-production-'));
 try{
  const r=await runSearch(job(),{policy:'jev',seed:1,budgetMs:3000,dir,apiKey:'test-only',fetchImpl:async()=>({ok:false,status:401})});assert.equal(r.status,'failed');assert.match(r.error,/401/);assert.ok(r.trace.every(t=>t.elapsedMs<=3000));assert.ok(r.metrics);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('an end-to-end injected Score response drives full geometry, cap and logs without a per-part call',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jev-ranked-'));
 try{
  const r=await runSearch(job(),{policy:'jev',seed:1,budgetMs:5000,maxCalls:1,dir,apiKey:'test-only',fetchImpl:async(_u,o)=>({ok:true,json:async()=>response(JSON.parse(o.body))})});
  assert.equal(r.status,'call-cap');assert.equal(r.calls,1);assert.equal(r.evaluations,3);assert.ok(fs.existsSync(path.join(dir,'responses.ndjson')));assert.ok(r.trace.every(t=>t.elapsedMs<=5000));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('report never counts failed model runs as successful packing comparisons',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jev-report-'));
 try{
  const base={job:'fixture',family:'f',seed:1,media:'sheet',partCount:100,status:'complete',firstValidMs:2,trace:[{elapsedMs:2,metrics:{unplaced:0,bins:2,occupiedLength:100}}],metrics:{bins:2},evaluations:1,profile:{nfpGenerated:1},calls:0,inputTokens:0,outputTokens:0};
  const result=report(dir,{expectedPolicyRuns:2,policies:['control','jev'],config:{live:true,budgets:[1],inputPrice:null,outputPrice:null}},[{...base,policy:'control'},{...base,policy:'jev',status:'failed'}]);assert.equal(result.comparisons[0].outcome,'failed-comparison');assert.equal(result.summaries[0].wins,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
