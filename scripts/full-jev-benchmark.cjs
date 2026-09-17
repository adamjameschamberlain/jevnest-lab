#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const {zipSync}=require('fflate');
const {makeJob,svg}=require('../experiments/jev/full/corpus.cjs');
const {createEngine}=require('../experiments/jev/full/engine.cjs');
const {features,requestsFor,contactChoice}=require('../experiments/jev/full/features.cjs');
const {aggregate,quality}=require('../experiments/jev/full/report.cjs');
const {callJev,digest,MODEL,ENDPOINT}=require('../experiments/jev/offline.cjs');
const {renderSheets}=require('../experiments/jev/replay.cjs');
const root=path.resolve(__dirname,'..');
const opts={live:false,jobs:20,seeds:[1,2,3,4,5],seconds:2,minEvaluations:1,out:'jev-results/full-classic',model:MODEL};
for(let i=2;i<process.argv.length;i++) {
 const k=process.argv[i];if(k==='--live'){opts.live=true;opts.out='jev-results/full-live';continue;}
 const v=process.argv[++i];assert.ok(v,'Missing argument '+k);
 if(k==='--jobs')opts.jobs=Number(v);else if(k==='--seeds')opts.seeds=v.split(',').map(Number);
 else if(k==='--seconds')opts.seconds=Number(v);else if(k==='--min-evaluations')opts.minEvaluations=Number(v);
 else if(k==='--out')opts.out=v;else if(k==='--model')opts.model=v;else throw new Error('Unknown option '+k);
}
assert.ok(Number.isInteger(opts.jobs)&&opts.jobs>=1&&opts.jobs<=20);
assert.ok(opts.seeds.length&&new Set(opts.seeds).size===opts.seeds.length&&opts.seeds.every(s=>Number.isInteger(s)&&s>=0&&s<2**32));
assert.ok(opts.seconds>0&&opts.seconds<=300&&Number.isInteger(opts.minEvaluations)&&opts.minEvaluations>=1&&opts.minEvaluations<=1000);
const out=path.resolve(root,opts.out);
const json=(file,v)=>fs.writeFileSync(file,JSON.stringify(v,null,2)+'\n');
const append=(file,v)=>fs.appendFileSync(file,JSON.stringify(v)+'\n');
const readLines=file=>fs.existsSync(file)?fs.readFileSync(file,'utf8').trim().split(/\r?\n/).filter(Boolean).map(l=>JSON.parse(l)):[];
async function secret() {
 if(process.env.TYPESAFE_API_KEY?.trim())return process.env.TYPESAFE_API_KEY.trim();
 if(!process.stdin.isTTY)throw new Error('Live run requires TYPESAFE_API_KEY or an interactive terminal for the masked prompt');
 const readline=require('node:readline');readline.emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdin.resume();
 process.stdout.write('TypeSafe API key (hidden; press Enter): ');
 return new Promise((resolve,reject)=>{let value='';function done(){process.stdin.off('keypress',onKey);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');}
 function onKey(s,key){if(key?.ctrl&&key.name==='c'){done();reject(new Error('Cancelled'));}else if(key?.name==='return'){done();value.trim()?resolve(value.trim()):reject(new Error('Empty key'));}else if(key?.name==='backspace')value=value.slice(0,-1);else if(s&&!key?.ctrl)value+=s;}
 process.stdin.on('keypress',onKey);});
}
function pack() {const files={};function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())visit(p);else if(e.name!=='results.zip')files[path.relative(out,p).split(path.sep).join('/')]=new Uint8Array(fs.readFileSync(p));}}visit(out);fs.writeFileSync(path.join(out,'results.zip'),zipSync(files,{level:6}));}
function saveSheets(dir,policy,value,geometry) {renderSheets(value.result,geometry).forEach((s,i)=>fs.writeFileSync(path.join(dir,`${policy}-sheet-${i+1}.svg`),s));}
function single(job,seed) {const start=performance.now(),e=createEngine(job.geometry,seed),value=e.evaluate(e.ga.population[0]);const v=performance.now(),validation=e.validate(value.result),validationMs=performance.now()-v;const runtimeMs=performance.now()-start;return {...value,runtimeMs,validation,validationMs};}
async function guided(job,seed,policy,dir,apiKey) {
 const start=performance.now(),e=createEngine(job.geometry,seed);
 const responseFile=path.join(dir,'choices.ndjson'),requestFile=path.join(dir,'requests.ndjson');
 const cached=new Map(readLines(responseFile).map(r=>[r.key,r])),requestKeys=new Set(readLines(requestFile).map(r=>r.key));
 let apiMs=0,featureMs=0,calls=0,cachedCalls=0,decisions=0,disagreements=0,inputTokens=0,outputTokens=0,cacheMs=0,tournamentDecisions=0;
 const value=await e.evaluateGuided(e.ga.population[0],async d=>{
  if(!d.candidates.length)return null;
  decisions++;
  if(d.candidates.length===1)return d.candidates[0].id;
  const began=performance.now(),f=features(job.geometry,d);featureMs+=performance.now()-began;
  let choice;
  if(policy==='contact')choice=contactChoice(f);
  else {
   let rows=f.rows,round=0;
   while(rows.length>1) {
    const prep=performance.now(),requests=requestsFor(f,rows,opts.model);featureMs+=performance.now()-prep;
    if(round===0&&requests.length>1)tournamentDecisions++;
    if(round>0&&requests.length===rows.length)throw new Error('Candidate tournament cannot reduce within request size cap');
    const winners=[];
    for(let group=0;group<requests.length;group++) {
     const request=requests[group],ids=Object.keys(request.questions.placement.criteria);
     if(ids.length===1){winners.push(ids[0]);continue;}
     const key=d.id+':'+round+':'+group+':'+digest(request);
     if(!requestKeys.has(key)){append(requestFile,{key,decisionId:d.id,round,group,request});requestKeys.add(key);}
     let answer=cached.get(key);
     if(answer){cachedCalls++;cacheMs+=answer.latencyMs;}
     else {answer={key,...await callJev(request,{apiKey})};append(responseFile,answer);cached.set(key,answer);}
     assert.ok(ids.includes(answer.choice),'Cached response does not match request');
     calls++;apiMs+=answer.latencyMs;inputTokens+=answer.usage.input_tokens;outputTokens+=answer.usage.output_tokens;winners.push(answer.choice);
    }
    rows=rows.filter(r=>winners.includes(r.id));round++;
   }
   choice=rows[0].id;
  }
  if(choice!==d.selectedCandidateId)disagreements++;
  if(policy==='jev')append(path.join(dir,'decisions.ndjson'),{decision:d,selectedCandidateId:choice,features:f.rows});
  return choice;
 });
 const v=performance.now(),validation=e.validate(value.result),validationMs=performance.now()-v;
 const observedRuntimeMs=performance.now()-start,runtimeMs=observedRuntimeMs+cacheMs;
 return {...value,decisions:undefined,runtimeMs,observedRuntimeMs,timingReconstructed:cachedCalls>0,cacheMs,apiMs,featureMs,calls,cachedCalls,decisionCount:decisions,disagreements,inputTokens,outputTokens,tournamentDecisions,
  validation,validationMs};
}
function ga(job,seed,target) {
 const start=performance.now(),e=createEngine(job.geometry,seed),deadline=Math.max(opts.seconds*1000,target?.runtimeMs??0);
 let best=null,evaluations=0,validationMs=0;const trace=[],profiles={nfpMs:0,scoreLoopsMs:0,evaluationMs:0,nfpGenerated:0,nfpReused:0};
 do {
  const individual=e.nextIndividual(),r=e.evaluate(individual);individual.fitness=r.metrics.fitness;evaluations++;
  if(!best||r.metrics.fitness<best.metrics.fitness){const v=performance.now();r.validation=e.validate(r.result);validationMs+=performance.now()-v;best=r;}
  for(const k of Object.keys(profiles))profiles[k]+=r.profile[k];
  trace.push({evaluation:evaluations,elapsedMs:performance.now()-start,metrics:best.metrics});
 }while((evaluations<opts.minEvaluations||performance.now()-start<deadline)&&evaluations<10000);
 const runtimeMs=performance.now()-start;
 const atJevBudget=target?trace.filter(r=>r.elapsedMs<=target.runtimeMs).at(-1)??null:null;
 const timeToJevQualityMs=target?trace.find(r=>quality(r.metrics,target.metrics)<=0)?.elapsedMs??null:null;
 return {...best,profile:profiles,runtimeMs,evaluations,budgetMs:deadline,capReached:evaluations===10000,atJevBudget,timeToJevQualityMs,trace,validationMs,validation:best.validation};
}
async function main() {
 const apiKey=opts.live?await secret():null;
 const sourceFiles=['svgnest.js','util/placementworker.js','util/geometryutil.js','util/clipper.js','benchmarks/runner.js','experiments/jev/offline.cjs','experiments/jev/replay.cjs','experiments/jev/full/corpus.cjs','experiments/jev/full/engine.cjs','experiments/jev/full/features.cjs','experiments/jev/full/report.cjs','scripts/full-jev-benchmark.cjs'];
 const sourceSha256=Object.fromEntries(sourceFiles.map(p=>[p,digest(fs.readFileSync(path.join(root,p),'utf8'))]));
 const config={...opts,out:undefined};const signature=digest({config,sourceSha256});
 fs.mkdirSync(path.join(out,'trials'),{recursive:true});
 const metadataFile=path.join(out,'metadata.json');
 let metadata={version:1,signature,config,expectedTrials:opts.jobs*opts.seeds.length,sourceSha256,startedAt:new Date().toISOString(),endpoint:ENDPOINT,
  machine:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model},
  protocol:'Same generated job and initial order/rotation per seed. Native Classic one pass; geometric contact/fragmentation control one pass; stock SVGnest GA with a wall-clock budget and at least one evaluation; Jev one complete sequential rollout. GA equal-time outcome uses only completed evaluations. Cold NFP caches per method, original one-cycle cache policy within GA. API latency, feature generation and logging included in guided runtime. VM setup and validation included in all methods. No browser worker parallelism.',
  decisionRule:'Primary: fewer unplaced, then fewer sheets at equal runtime. Secondary: utilisation, fitness, time to Jev quality, per-job clustered uncertainty. No model claim until full live suite complete.'};
 if(fs.existsSync(metadataFile)){const old=JSON.parse(fs.readFileSync(metadataFile));assert.equal(old.signature,signature,'Output belongs to a different configuration or source version; choose a new --out');assert.equal(old.machine.node,process.version,'Resume requires same Node version');metadata=old;}
 else json(metadataFile,metadata);
 console.log(`${opts.live?'LIVE':'CLASSIC ONLY'}: ${metadata.expectedTrials} matched trials; 20–50 concave parts each. Results: ${out}`);
 let index=0;
 for(let jobIndex=0;jobIndex<opts.jobs;jobIndex++)for(const seed of opts.seeds){
  const job=makeJob(jobIndex),id=job.id+'-seed-'+seed,file=path.join(out,'trials',id+'.json'),dir=path.join(out,id);index++;
  if(fs.existsSync(file)){console.log(`[${index}/${metadata.expectedTrials}] ${id}: already complete`);continue;}
  fs.mkdirSync(dir,{recursive:true});json(path.join(dir,'geometry.json'),job);fs.writeFileSync(path.join(dir,'input.svg'),svg(job));
  console.log(`[${index}/${metadata.expectedTrials}] ${id}, ${job.geometry.parts.length} parts`);
  // Alternate whether native Classic precedes/follows Jev. Every method has its own cold VM and NFP cache.
  const trial={index,job:job.id,seed,partCount:job.geometry.parts.length,areaLowerBound:job.areaLowerBound,executionOrder:[]};
  if(index%2){trial.classic=single(job,seed);trial.executionOrder.push('classic');}
  if(opts.live){trial.jev=await guided(job,seed,'jev',dir,apiKey);trial.executionOrder.push('jev');}
  if(!trial.classic){trial.classic=single(job,seed);trial.executionOrder.push('classic');}
  trial.contact=await guided(job,seed,'contact',dir,null);trial.executionOrder.push('contact');
  trial.ga=ga(job,seed,trial.jev);trial.executionOrder.push('ga');
  for(const policy of ['classic','contact','ga','jev'])if(trial[policy])saveSheets(dir,policy,trial[policy],job.geometry);
  json(file,trial);aggregate(out,metadata);
  console.log(`  sheets: Classic ${trial.classic.metrics.bins}, control ${trial.contact.metrics.bins}, GA ${trial.ga.metrics.bins}${trial.jev?', Jev '+trial.jev.metrics.bins:''}; GA evaluated ${trial.ga.evaluations} layouts`);
 }
 metadata.finishedAt=new Date().toISOString();json(metadataFile,metadata);const summary=aggregate(out,metadata);pack();
 console.log(`\n${summary.status}. Report: ${path.join(out,'report.html')}\nUpload: ${path.join(out,'results.zip')}`);
}
main().catch(error=>{fs.mkdirSync(out,{recursive:true});json(path.join(out,'error.json'),{message:error.message,date:new Date().toISOString()});try{if(fs.existsSync(path.join(out,'metadata.json')))aggregate(out,JSON.parse(fs.readFileSync(path.join(out,'metadata.json'))));pack();}catch{}console.error('Stopped:',error.message,'\nCompleted trials and successful API responses are saved. Rerun the same command to resume.');process.exitCode=1;});
