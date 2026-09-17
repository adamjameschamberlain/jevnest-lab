'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {unzipSync}=require('fflate');
const {digest,MODEL}=require('../experiments/jev/offline.cjs');
const {resumeMetadata,validatedReceipt}=require('../experiments/jev/full/resume.cjs');
const {createEngine}=require('../experiments/jev/full/engine.cjs');
const {features,requestsFor}=require('../experiments/jev/full/features.cjs');
const archive=unzipSync(fs.readFileSync(path.join(__dirname,'../experiments/jev/results/live-first-14/results.zip')));
const read=name=>JSON.parse(Buffer.from(archive[name]));
const lines=name=>Buffer.from(archive[name]).toString().trim().split('\n').filter(Boolean).map(l=>JSON.parse(l));
const fixture=require('./fixtures/jev-nonmax-choice.json');
test('actual rejected response preserves Jev choice, flags mismatch and keeps timing',()=>{
 const r=validatedReceipt(fixture.receipt,fixture.request);
 assert.equal(r.choice,'d31:c1');assert.equal(r.probabilities[r.choice],.14);
 assert.equal(r.probabilityDiagnostics.choiceIsArgmax,false);
 assert.deepEqual(r.probabilityDiagnostics.argmaxCandidates,['d31:c18']);
 assert.equal(r.latencyMs,fixture.receipt.latencyMs);assert.deepEqual(r.probabilities,fixture.receipt.body.answers.placement.probabilities);
});
test('all uploaded responses validate; accepted choices remain unchanged',()=>{
 let total=0,mismatches=0;
 for(const name of Object.keys(archive).filter(n=>n.endsWith('/responses.ndjson'))){
  const prefix=name.slice(0,-'responses.ndjson'.length),requests=new Map(lines(prefix+'requests.ndjson').map(r=>[r.key,r.request]));
  for(const receipt of lines(name)){const request=requests.get(receipt.key);assert.ok(receipt.key.endsWith(digest(request)));const r=validatedReceipt(receipt,request);assert.equal(r.choice,receipt.body.answers.placement.choice);total++;if(!r.probabilityDiagnostics.choiceIsArgmax)mismatches++;}
 }
 assert.equal(total,429);assert.equal(mismatches,1);
});
test('actual Windows metadata upgrades with 14 completed trials; engine changes rejected',()=>{
 const old=read('metadata.json');const sourceSha256=Object.fromEntries(Object.keys(old.sourceSha256).map(file=>[file,digest(fs.readFileSync(path.join(__dirname,'..',file),'utf8').replace(/\r?\n/g,'\r\n'))]));
 const current={...old,sourceSha256,signature:digest({config:old.config,sourceSha256})};
 const m=resumeMetadata(old,current,14);
 assert.equal(m.migrations.at(-1).completedTrialsRetained,14);assert.equal(m.startedAt,old.startedAt);
 assert.deepEqual(m.migrations.at(-1).previousSourceSha256,old.sourceSha256);
 assert.throws(()=>resumeMetadata(old,{...current,sourceSha256:{...sourceSha256,'util/placementworker.js':'changed'}},14),/different configuration/);
 assert.throws(()=>resumeMetadata(old,{...current,config:{...current.config,model:'different'}},14),/different configuration/);
});
test('actual interrupted geometry recovers all 32 saved choices without an API call',async()=>{
 const prefix='hard-03-seed-5/',job=read(prefix+'geometry.json'),e=createEngine(job.geometry,5);
 const receipts=new Map(lines(prefix+'responses.ndjson').map(r=>[r.key,r]));
 for(const r of lines(prefix+'choices.ndjson'))if(!receipts.has(r.key))receipts.set(r.key,r);
 let recovered=0,continuations=0,disagreements=0;
 const result=await e.evaluateGuided(e.ga.population[0],d=>{
  if(d.candidates.length===1)return d.candidates[0].id;
  const f=features(job.geometry,d);let rows=f.rows,round=0;
  while(rows.length>1){const reqs=requestsFor(f,rows,MODEL),winners=[];
   for(let group=0;group<reqs.length;group++){
    const request=reqs[group],ids=Object.keys(request.questions.placement.criteria);
    if(ids.length===1){winners.push(ids[0]);continue;}
    const key=d.id+':'+round+':'+group+':'+digest(request),receipt=receipts.get(key);
    if(!receipt){assert.ok(Number(d.id.slice(1))>=32,'Saved geometry/request diverged before recovery finished');continuations++;return d.selectedCandidateId;}
    const answer=validatedReceipt(receipt,request);recovered++;if(!answer.probabilityDiagnostics.choiceIsArgmax)disagreements++;winners.push(answer.choice);
   }
   rows=rows.filter(r=>winners.includes(r.id));round++;
  }
  return rows[0].id;
 });
 assert.equal(recovered,32);assert.equal(disagreements,1);assert.ok(continuations>0);
 assert.equal(e.validate(result.result).valid,true);
 // The unsaved suffix deliberately uses Classic only for this regression test;
 // it is not a new live Jev result and is never included in benchmark evidence.
});
