'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const {rng,area}=require('./corpus.cjs');
const root=path.resolve(__dirname,'../../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const plain=x=>JSON.parse(JSON.stringify(x));
function replaceOnce(s,a,b) {assert.equal(s.split(a).length,2,'Engine seam changed: '+a);return s.replace(a,b);}
function workerSource(source,generator) {
  let s=source;
  s=replaceOnce(s,'// first placement, put it on the left','var scoreStarted = performance.now();\n// first placement, put it on the left');
  s=replaceOnce(s,'// choose placement that results in the smallest bounding box','var scoreStarted = performance.now();\n// choose placement that results in the smallest bounding box');
  const seam='if(capture){ finishDecision(decision); }';
  assert.equal(s.split(seam).length,3);
  const override=generator ? `
    if(decision.candidates.length){
      var requested = yield decision;
      if(requested !== null && requested !== undefined){
        var chosen = decision.candidates.filter(function(c){return c.id === requested;})[0];
        if(!chosen) throw new Error('Policy returned an illegal candidate ID');
        position = {x:chosen.x,y:chosen.y,id:path.id,rotation:path.rotation};
        if(placed.length){position.nfp=combinedNfp;minwidth=chosen.width;}
        decision.selectedCandidateId=chosen.id;
      }
    }` : '';
  s=s.split(seam).join('global.env.profile.scoreLoopsMs += performance.now()-scoreStarted;\n'+override+'\n'+seam);
  if(generator) s=replaceOnce(s,'function(paths)','function*(paths)');
  return s;
}
function createEngine(geometry,seed) {
  const began=performance.now();
  const context=vm.createContext({console:{log(){}},performance,navigator:{userAgent:'chrome',appName:'Netscape'}});
  vm.runInContext('var self=this; var window=this; var global={};',context);
  for(const file of ['util/clipper.js','util/geometryutil.js','util/placementworker.js','benchmarks/runner.js']) vm.runInContext(read(file),context);
  const src=read('svgnest.js'),start='\t\t\tp.map(function(pair){',end='\t\t\t}).then(function(generatedNfp){';
  assert.equal(src.split(start).length,2);assert.equal(src.split(end).length,2);
  const generate=vm.runInContext('(function(pair){'+src.split(start)[1].split(end)[0]+'})',context);
  const gaStart=src.indexOf('\tfunction GeneticAlgorithm(adam, bin, config){');
  assert.ok(gaStart>0);vm.runInContext(src.slice(gaStart,src.lastIndexOf('})(window);')),context);
  context.seededRandom=rng(seed);vm.runInContext('Math.random=seededRandom',context);
  function hydrate(p) {return Object.assign(p.points.map(v=>({...v})),{id:p.id,source:p.source});}
  const bin=hydrate(geometry.bin),parts=geometry.parts.map(hydrate);
  parts.sort((a,b)=>area(b)-area(a));
  const ga=new context.GeneticAlgorithm(parts,bin,geometry.config);
  const worker=new context.PlacementWorker(bin,parts,[],[],geometry.config,{});
  const native=worker.placePaths;
  const classic=vm.runInContext('('+workerSource(native.toString(),false)+')',context);
  const guided=vm.runInContext('('+workerSource(native.toString(),true)+')',context);
  let cache={},profile={};
  function prepare(individual,capture) {
    profile={nfpMs:0,scoreLoopsMs:0,nfpGenerated:0,nfpReused:0};
    const paths=individual.placement.map((p,i)=>Object.assign(p.map(v=>({...v})),{id:p.id,source:p.source,rotation:individual.rotation[i]}));
    const t=performance.now(),next={};
    context.global.env={searchEdges:geometry.config.exploreConcave,useHoles:geometry.config.useHoles};
    for(let i=0;i<paths.length;i++) {
      const B=paths[i],pairs=[{A:bin,B,key:{A:-1,B:B.id,inside:true,Arotation:0,Brotation:B.rotation}}];
      for(let j=0;j<i;j++) pairs.push({A:paths[j],B,key:{A:paths[j].id,B:B.id,inside:false,Arotation:paths[j].rotation,Brotation:B.rotation}});
      for(const pair of pairs) {
        const key=JSON.stringify(pair.key);
        if(cache[key]) {next[key]=cache[key];profile.nfpReused++;}
        else {const out=generate(pair);profile.nfpGenerated++;assert.ok(out?.value,'NFP generation failed: '+key);next[key]=out.value;}
      }
    }
    cache=next;profile.nfpMs=performance.now()-t;
    const worker=new context.PlacementWorker(bin,paths,[],[],{...geometry.config,captureCandidates:capture},cache);
    context.global.env={self:worker,profile};
    return {paths,worker};
  }
  function finish(raw,started) {
    const result=plain({fitness:raw.fitness,area:raw.area,placements:raw.placements.map(b=>b.map(({id,rotation,x,y})=>({id,rotation,x,y}))),unplaced:raw.paths.map(({id,rotation})=>({id,rotation}))});
    const placed=result.placements.flat(),placedArea=placed.reduce((s,p)=>s+area(geometry.parts.find(g=>g.id===p.id).points),0);
    return {result,metrics:{bins:result.placements.length,placed:placed.length,unplaced:result.unplaced.length,utilisation:placedArea/(result.area*result.placements.length),fitness:raw.fitness},
      profile:{...profile,evaluationMs:performance.now()-started},decisions:raw.instrumentation?.decisions};
  }
  function evaluate(individual,{capture=false,unmodified=false}={}) {
    const started=performance.now(),{paths}=prepare(individual,capture);
    return finish((unmodified ? native : classic)(paths),started);
  }
  async function evaluateGuided(individual,select) {
    const started=performance.now(),{paths}=prepare(individual,true),gen=guided(paths);
    let step=gen.next();
    while(!step.done) {
      const decision=plain(step.value);
      const id=await select(decision,context);
      step=gen.next(id);
    }
    return finish(step.value,started);
  }
  function nextIndividual() {let individual=ga.population.find(p=>!p.fitness);if(!individual){ga.generation();individual=ga.population[1];}return individual;}
  return {ga,context,setupMs:performance.now()-began,evaluate,evaluateGuided,nextIndividual,
    validate:result=>{const v=plain(context.validateGeometry(result,geometry));assert.ok(v.valid,JSON.stringify(v.violations));return v;}};
}
module.exports={createEngine,plain};
