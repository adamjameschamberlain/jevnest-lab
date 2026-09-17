'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {buildRequest,validateResponse,callJev,loadSnapshots,selectDecisions,ENDPOINT,MODEL} = require('../experiments/jev/offline.cjs');
const input = path.join(__dirname,'../benchmarks/baselines/classic-initial.zip');
const snapshots = loadSnapshots(input);
const selection = selectDecisions(snapshots,20);
const {snapshot,decision} = selection[0];
const request = buildRequest(snapshot,decision);
function response(choice = decision.candidates[0].id) {
  return {model:MODEL,answers:{placement:{type:'choice',choice,confidence:1,
    probabilities:Object.fromEntries(decision.candidates.map(c => [c.id,c.id === choice ? 1 : 0]))}},
    usage:{input_tokens:123,output_tokens:4}};
}
test('load shipped corpus and sample breadth-first deterministically',() => {
  assert.equal(snapshots.length,10);
  assert.equal(selection.length,20);
  assert.equal(new Set(selection.slice(0,10).map(r => r.source)).size,10);
  assert.deepEqual(selectDecisions(snapshots,20),selection);
});
test('every selected request includes every candidate and excludes winner/future labels',() => {
  for(const entry of selection) {
    const body = buildRequest(entry.snapshot,entry.decision);
    assert.deepEqual(Object.keys(body.questions.placement.criteria),entry.decision.candidates.map(c => c.id));
    const serialized = JSON.stringify(body);
    for(const forbidden of ['selectedCandidateId','"selected"','"fitness"','"isBest"','minimum-x-first-encountered']) assert.ok(!serialized.includes(forbidden),forbidden);
    assert.equal(body.state.remainingPartCount,entry.decision.remaining.length);
  }
  const copy = structuredClone(decision);
  copy.selectedCandidateId = 'not-a-real-winner';
  copy.candidates.forEach(c => c.selected = !c.selected);
  assert.deepEqual(buildRequest(snapshot,copy),request,'winner changes cannot change the API payload');
});
test('numeric ranks are computed in code',() => {
  const copy = structuredClone(decision);
  copy.candidates = copy.candidates.slice(0,3);
  copy.candidates.forEach((c,i) => c.score = [10,2,10][i]);
  assert.deepEqual(buildRequest(snapshot,copy).state.candidates.map(c => c.compactnessRank),[2,1,2]);
});
test('reject oversized/invalid candidate sets without pruning',() => {
  const copy = structuredClone(decision);
  copy.candidates = Array.from({length:256},(_,i) => ({...decision.candidates[0],id:'d0:c'+i}));
  assert.throws(() => buildRequest(snapshot,copy),/255/);
  assert.throws(() => buildRequest(snapshot,{...decision,candidates:[decision.candidates[0]]}),/at least two/);
  assert.throws(() => buildRequest(snapshot,{...decision,candidates:[decision.candidates[0],decision.candidates[0]]}),/Duplicate/);
  const invalid = structuredClone(decision); invalid.candidates[0].x = NaN;
  assert.throws(() => buildRequest(snapshot,invalid),/Non-finite/);
});
test('only legal candidate IDs with complete sane distributions are accepted',() => {
  const valid = response();
  assert.equal(validateResponse(valid,request).choice,decision.candidates[0].id);
  const unknown = response('invented');assert.throws(() => validateResponse(unknown,request),/outside the allowed/);
  const missing = response();delete missing.answers.placement.probabilities[decision.candidates[1].id];
  assert.throws(() => validateResponse(missing,request),/Probability keys/);
  const sum = response();sum.answers.placement.probabilities[decision.candidates[0].id] = 0.5;
  assert.throws(() => validateResponse(sum,request),/sum/);
  const confidence = response();confidence.answers.placement.confidence = 2;
  assert.throws(() => validateResponse(confidence,request),/Confidence/);
  const wrongMax = response();wrongMax.answers.placement.choice = decision.candidates[1].id;
  assert.throws(() => validateResponse(wrongMax,request),/highest-probability/);
});
test('HTTP request uses documented schema and bounded rate-limit retry',async () => {
  let calls = 0;
  const sleeps = [];
  const result = await callJev(request,{apiKey:'unit-test-token',sleep:async ms => sleeps.push(ms),fetchImpl:async (url,options) => {
    calls++;
    assert.equal(url,ENDPOINT);
    assert.equal(options.redirect,'error');
    assert.equal(options.headers.Authorization,'Bearer unit-test-token');
    assert.deepEqual(JSON.parse(options.body),request);
    if(calls === 1) return new Response('',{status:429,headers:{'retry-after':'2'}});
    return new Response(JSON.stringify(response()),{status:200});
  }});
  assert.equal(result.attempts,2);
  assert.deepEqual(sleeps,[2000]);
  assert.ok(result.latencyMs >= 0);
});
test('fail closed on authentication, malformed response, timeout and long retry hints',async () => {
  await assert.rejects(callJev(request,{apiKey:''}),/TYPESAFE_API_KEY/);
  let calls = 0;
  await assert.rejects(callJev(request,{apiKey:'x',fetchImpl:async () => {calls++;return new Response('secret-should-not-appear',{status:401});}}),/HTTP 401/);
  assert.equal(calls,1);
  await assert.rejects(callJev(request,{apiKey:'x',fetchImpl:async () => new Response('{broken',{status:200})}),/invalid JSON/);
  await assert.rejects(callJev(request,{apiKey:'x',fetchImpl:async () => {throw new DOMException('secret','TimeoutError');}}),/timed out/);
  await assert.rejects(callJev(request,{apiKey:'x',fetchImpl:async () => new Response('',{status:529,headers:{'retry-after':'300'}})}),/over 30/);
});
test('CLI dry-run writes real requests without a key; live mode fails before network',() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'jev-offline-'));
  try {
    const env = {...process.env};delete env.TYPESAFE_API_KEY;
    const command = path.join(__dirname,'../scripts/evaluate-jev.cjs');
    const result = spawnSync(process.execPath,[command,'--limit','20','--out',path.join(dir,'dry')],{env,encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    const summary = JSON.parse(fs.readFileSync(path.join(dir,'dry/summary.json')));
    assert.equal(summary.apiRequests,0);assert.equal(summary.preparedDecisions,20);
    const live = spawnSync(process.execPath,[command,'--live','--out',path.join(dir,'live')],{env,encoding:'utf8'});
    assert.notEqual(live.status,0);assert.match(live.stderr,/TYPESAFE_API_KEY/);
    assert.equal(fs.existsSync(path.join(dir,'live')),false);
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});

test('accept bounded rounding without changing the choice or reported probabilities',() => {
  function sample(values){const ids=values.map((_,i)=>'c'+i);return {request:{questions:{placement:{criteria:Object.fromEntries(ids.map(id=>[id,id]))}}},body:{model:MODEL,answers:{placement:{type:'choice',choice:ids[values.indexOf(Math.max(...values))],probabilities:Object.fromEntries(ids.map((id,i)=>[id,values[i]])),confidence:0.1}},usage:{input_tokens:1,output_tokens:1}}};}
  for(const values of [[.33,.33,.33],[.17,.17,.17,.17,.16,.17],[.49,.49,.01],Array(40).fill(.03),Array(80).fill(.01)]) {
    const {request,body}=sample(values),r=validateResponse(body,request);
    assert.equal(r.choice,body.answers.placement.choice);
    assert.deepEqual(r.probabilities,body.answers.placement.probabilities);
    assert.equal(r.probabilityDiagnostics.normalisation,'compatible-with-2dp-rounding');
  }
  for(const values of [[.5,0,0,0],[.34,.34,.34],[.2,.2],[0,0,0],[.335,.335,.335],[1,1],Array(110).fill(.02)]) {
    const {request,body}=sample(values);assert.throws(()=>validateResponse(body,request),/sum/);
  }
});
test('persist rejected response before validation without headers or credentials',async()=>{
 const bad=response();bad.answers.placement.probabilities[decision.candidates[0].id]=.5;
 const receipts=[];
 await assert.rejects(callJev(request,{apiKey:'test-private-key',fetchImpl:async()=>new Response(JSON.stringify(bad)),onResponse:r=>receipts.push(r)}),/sum=0.5/);
 assert.equal(receipts.length,1);assert.deepEqual(receipts[0].body,bad);
 assert.ok(receipts[0].latencyMs>=0);assert.equal(receipts[0].attempts,1);
 assert.ok(!JSON.stringify(receipts).includes('test-private-key'));
});
