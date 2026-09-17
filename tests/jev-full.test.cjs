'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {makeJob}=require('../experiments/jev/full/corpus.cjs');
const {createEngine}=require('../experiments/jev/full/engine.cjs');
const {features,requestsFor}=require('../experiments/jev/full/features.cjs');
const {unzipSync}=require('fflate'),fs=require('node:fs');
test('unmodified browser reference results equal full engine and native/profiled/generator Classic',async()=>{
 const zip=unzipSync(fs.readFileSync('benchmarks/baselines/classic-initial.zip'));
 const prefix=Object.keys(zip).find(p=>p.endsWith('/concave-seed-1/geometry.json')).replace('geometry.json','');
 const read=f=>JSON.parse(Buffer.from(zip[prefix+f]));const geometry=read('geometry.json'),snap=read('best-decisions.json');
 const e=createEngine(geometry,1),input={placement:snap.inputParts.map(p=>Object.assign(geometry.parts.find(g=>g.id===p.id).points.map(v=>({...v})),{id:p.id,source:p.source})),rotation:snap.inputParts.map(p=>p.rotation)};
 const native=e.evaluate(input,{unmodified:true,capture:true}),profiled=e.evaluate(input,{capture:true}),guided=await e.evaluateGuided(input,d=>d.selectedCandidateId);
 const canonical=x=>JSON.parse(JSON.stringify(x));
 assert.deepEqual(native.result,read('best.json').result);
 assert.deepEqual(profiled.result,native.result);assert.deepEqual(guided.result,native.result);
 assert.deepEqual(canonical(guided.decisions),canonical(native.decisions));e.validate(guided.result);
});
test('changed choices feed fresh geometry for entire 50-part nest; all options supplied without labels',async()=>{
 const job=makeJob(3),e=createEngine(job.geometry,7),baseline=e.evaluate(e.ga.population[0],{capture:true});let choices=0,changedStates=0;
 const guided=await e.evaluateGuided(e.ga.population[0],d=>{
  const before=baseline.decisions.find(b=>b.id===d.id);
  if(before&&JSON.stringify(d.placed)!==JSON.stringify(before.placed))changedStates++;
  const f=features(job.geometry,d),requests=requestsFor(f);
  const ids=requests.flatMap(r=>Object.keys(r.questions.placement.criteria));assert.deepEqual(ids,d.candidates.map(c=>c.id));
  for(const r of requests){assert.ok(Buffer.byteLength(JSON.stringify(r))<=16384);assert.ok(!JSON.stringify(r).includes('selectedCandidateId'));assert.ok(r.state.remaining.every(p=>p.id!==d.partId));}
  choices++;return d.candidates.at(-1).id;
 });
 assert.equal(choices,50);assert.ok(changedStates>10);assert.notDeepEqual(guided.result,baseline.result);assert.equal(e.validate(guided.result).valid,true);
});
test('stock GA reproduces seed and profiler preserves complete layouts across generations',()=>{
 const g=makeJob(0).geometry,a=createEngine(g,91),b=createEngine(g,91);
 for(let i=0;i<22;i++) {const x=a.nextIndividual(),y=b.nextIndividual(),p=a.evaluate(x),q=b.evaluate(y,{unmodified:true});assert.deepEqual(p.result,q.result);x.fitness=p.metrics.fitness;y.fitness=q.metrics.fitness;}
});
