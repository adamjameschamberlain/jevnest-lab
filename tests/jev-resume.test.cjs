'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {digest,MODEL}=require('../experiments/jev/offline.cjs');
const {resumeMetadata,validatedReceipt,previous}=require('../experiments/jev/full/resume.cjs');
function metadata(sourceSha256,config={live:true,jobs:20}) {return {sourceSha256,config,signature:digest({config,sourceSha256}),machine:{node:process.version},startedAt:'saved-start'};}
for(const newline of [0,1])test('resume known pre-fix interrupted run, newline variant '+newline,()=>{
 const before={'engine.cjs':'same',...Object.fromEntries(Object.entries(previous).map(([p,v])=>[p,v[newline]]))};
 const after={...before,...Object.fromEntries(Object.keys(previous).map(p=>[p,'updated'])),'experiments/jev/full/resume.cjs':'new'};
 const old=metadata(before),current=metadata(after),m=resumeMetadata(old,current,0);
 assert.equal(m.signature,current.signature);assert.equal(m.startedAt,'saved-start');assert.deepEqual(m.migrations[0].previousSourceSha256,before);
 assert.equal(resumeMetadata(m,current,5),m);
 assert.throws(()=>resumeMetadata(old,current,1),/no completed trials/);
 assert.throws(()=>resumeMetadata(old,metadata({...after,'engine.cjs':'modified'}),0),/different configuration/);
 assert.throws(()=>resumeMetadata(old,metadata(after,{live:true,jobs:2}),0),/different configuration/);
 assert.throws(()=>resumeMetadata(metadata({...before,'scripts/full-jev-benchmark.cjs':'unknown'}),current,0),/different configuration/);
});
test('raw receipt recovers a rounded response offline and retains original timing',()=>{
 const request={questions:{placement:{criteria:{a:'a',b:'b',c:'c'}}}};
 const receipt={key:'matching-request-hash',attempts:1,latencyMs:250,body:{model:MODEL,answers:{placement:{type:'choice',choice:'b',probabilities:{a:.33,b:.33,c:.33},confidence:0}},usage:{input_tokens:10,output_tokens:5}}};
 const r=validatedReceipt(receipt,request);assert.equal(r.choice,'b');assert.equal(r.latencyMs,250);assert.equal(r.key,receipt.key);
 assert.equal(r.probabilityDiagnostics.normalisation,'compatible-with-2dp-rounding');assert.deepEqual(validatedReceipt(r,request),r);
 assert.throws(()=>validatedReceipt({...r,choice:'invented'},request),/outside the allowed/);
});
test('full CLI upgrades interrupted metadata and resumes accepted calls without resending them',()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jev-resume-regression-')),out=path.join(dir,'out'),hook=path.join(dir,'fetch.cjs'),count=path.join(dir,'calls');
 try {
  fs.writeFileSync(hook,`const fs=require('node:fs');let n=0;global.fetch=async(url,options)=>{n++;fs.appendFileSync(process.env.TEST_CALLS,'call\\n');if(process.env.TEST_STOP==='yes'&&n>3)throw new Error('test interruption');const request=JSON.parse(options.body),ids=Object.keys(request.questions.placement.criteria),rounded=Math.round(100/ids.length)/100;const probabilities=Object.fromEntries(ids.map((id,i)=>[id,process.env.TEST_STOP==='yes'?(i===0?1:0):rounded]));return new Response(JSON.stringify({model:'test-fixture',answers:{placement:{type:'choice',choice:ids[0],confidence:0,probabilities}},usage:{input_tokens:1,output_tokens:1}}));};`);
  const args=['--require',hook,'scripts/full-jev-benchmark.cjs','--live','--jobs','1','--seeds','1','--seconds','0.001','--min-evaluations','1','--out',out];
  const env={...process.env,TYPESAFE_API_KEY:'test-only-no-real-key',TEST_CALLS:count,TEST_STOP:'yes'};
  const first=spawnSync(process.execPath,args,{env,encoding:'utf8'});assert.equal(first.status,1,first.stderr);
  const choicesFile=path.join(out,'hard-01-seed-1/choices.ndjson');const accepted=fs.readFileSync(choicesFile,'utf8').trim().split('\n');assert.equal(accepted.length,3);
  const metadataFile=path.join(out,'metadata.json'),m=JSON.parse(fs.readFileSync(metadataFile));
  for(const [file,hashes] of Object.entries(previous))m.sourceSha256[file]=hashes[0];delete m.sourceSha256['experiments/jev/full/resume.cjs'];m.signature=digest({config:m.config,sourceSha256:m.sourceSha256});fs.writeFileSync(metadataFile,JSON.stringify(m));
  fs.writeFileSync(count,'');
  const second=spawnSync(process.execPath,args,{env:{...env,TEST_STOP:'no'},encoding:'utf8'});assert.equal(second.status,0,second.stderr);
  assert.match(second.stdout,/resuming saved requests/);
  const t=JSON.parse(fs.readFileSync(path.join(out,'trials/hard-01-seed-1.json')));
  assert.equal(t.jev.cachedCalls,3);assert.equal(fs.readFileSync(count,'utf8').trim().split('\n').length,t.jev.calls-3);
  assert.equal(fs.readFileSync(choicesFile,'utf8').trim().split('\n').length,t.jev.calls);
  assert.equal(fs.readFileSync(path.join(out,'hard-01-seed-1/decisions.ndjson'),'utf8').trim().split('\n').length,t.jev.decisionCount);
  assert.equal(t.jev.validation.valid,true);assert.equal(JSON.parse(fs.readFileSync(metadataFile)).migrations.length,1);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
