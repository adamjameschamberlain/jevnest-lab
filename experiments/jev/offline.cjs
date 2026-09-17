'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {unzipSync} = require('fflate');
const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
const MODEL = 'jev-1.13.0';
const PROMPT_VERSION = 'placement-choice-v1';
const MAX_OPTIONS = 255;
const MAX_BODY_BYTES = 16384;
const INSTRUCTIONS = 'Which candidate placement is the best next packing step for the remaining parts? Choose exactly one supplied candidate. All candidates were enumerated by the geometry engine; do not decide collision validity or invent coordinates. Prefer a compact arrangement that leaves usable space for the remaining parts. Use the computed features and ranks; do not perform arithmetic. This is a local judgment from incomplete features, not a guarantee of the final nest. Candidate bin utilisation is identical within a decision and cannot distinguish its options.';
const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
function finite(n,name) {assert.ok(typeof n === 'number' && Number.isFinite(n),'Non-finite '+name);return n;}
function rank(values,value) {return [...new Set(values)].sort((a,b) => a-b).indexOf(value)+1;}
function buildRequest(snapshot,decision,model=MODEL) {
  assert.equal(snapshot.schemaVersion,1,'Unsupported snapshot schema');
  assert.ok(typeof model === 'string' && model.length,'Missing model');
  assert.ok(decision.candidates.length >= 2,'Choice requires at least two candidates');
  assert.ok(decision.candidates.length <= MAX_OPTIONS,'Choice exceeds 255 options; no candidates were pruned');
  assert.equal(new Set(decision.candidates.map(c => c.id)).size,decision.candidates.length,'Duplicate candidate IDs');
  const candidates = decision.candidates.map(c => {
    assert.ok(typeof c.id === 'string' && /^d\d+:c\d+$/.test(c.id),'Invalid candidate ID');
    assert.equal(c.partId,decision.partId,'Candidate part mismatch');
    assert.equal(c.rotation,decision.rotation,'Candidate rotation mismatch');
    const out = {id:c.id};
    for(const key of ['x','y','rotation','width','height','widthGrowth','heightGrowth','partArea','binUtilisation']) out[key] = finite(c[key],key);
    out.boundingScore = finite(c.score,'score');
    out.compactnessRank = rank(decision.candidates.map(c => c.score),c.score);
    out.widthGrowthRank = rank(decision.candidates.map(c => c.widthGrowth),c.widthGrowth);
    out.heightGrowthRank = rank(decision.candidates.map(c => c.heightGrowth),c.heightGrowth);
    out.widthEffect = c.widthGrowth <= 0 ? 'no width increase' : 'increases occupied width';
    out.heightEffect = c.heightGrowth <= 0 ? 'no height increase' : 'increases occupied height';
    return out;
  });
  // Explicit allowlist: never expose selected, selectedCandidateId, future results,
  // Classic policy names, or the final nest/fitness as model input.
  const request = {model,state:{
    representation:PROMPT_VERSION,
    coordinateSystem:'SVG user units; x right, y down; x/y translate the rotated source polygon',
    bin:{bounds:snapshot.bin.bounds,area:snapshot.bin.area},
    currentPart:{id:decision.partId,rotation:decision.rotation,area:decision.partArea},
    placedPartCount:decision.placedPartCount,currentBounds:decision.currentBounds,
    placedArea:decision.placedArea,
    placed:decision.placed.map(p => ({id:p.id,x:p.x,y:p.y,rotation:p.rotation})),
    remainingParts:decision.remaining.map(p => ({id:p.id,rotation:p.rotation,area:p.area})),
    remainingPartCount:decision.remaining.length,
    candidates,
    featureLimits:'No polygon outlines, contact lengths, cavity geometry or lookahead are included. Ranks are computed exactly in code; lower is better for that one feature, not necessarily for the final nest.'
  },questions:{placement:{type:'choice',instructions:INSTRUCTIONS,
    criteria:Object.fromEntries(candidates.map(c => [c.id,`Candidate ${c.id}: compactness rank ${c.compactnessRank}; width-growth rank ${c.widthGrowthRank}; height-growth rank ${c.heightGrowthRank}; ${c.widthEffect}; ${c.heightEffect}.`]))}}};
  assert.ok(Buffer.byteLength(JSON.stringify(request)) <= MAX_BODY_BYTES,'Request exceeds conservative 16 KiB cap; no candidates were pruned');
  return request;
}
function validateResponse(body,request) {
  assert.ok(body && typeof body.model === 'string' && body.model.length,'Missing response model');
  const answer = body.answers?.placement;
  assert.equal(answer?.type,'choice','Expected Choice response');
  const ids = Object.keys(request.questions.placement.criteria);
  assert.ok(ids.includes(answer.choice),'Returned candidate is outside the allowed set');
  assert.ok(answer.probabilities && typeof answer.probabilities === 'object','Missing probabilities');
  assert.deepEqual(Object.keys(answer.probabilities).sort(),ids.slice().sort(),'Probability keys differ from candidates');
  let sum = 0, max = 0;
  for(const probability of Object.values(answer.probabilities)) {
    finite(probability,'probability');
    assert.ok(probability >= 0 && probability <= 1,'Probability outside [0,1]');
    sum += probability; max = Math.max(max,probability);
  }
  // JSON probabilities can be quantised. Accept a non-unit sum only when
  // every value is on a 0.01 grid and some exactly normalised distribution
  // could round to these values. Keep the reported values; never renormalise
  // silently or use rounding to change the returned candidate.
  const values = Object.values(answer.probabilities);
  const epsilon = 1e-10;
  const lower = values.reduce((n,p) => n+Math.max(0,p-0.005),0);
  const upper = values.reduce((n,p) => n+Math.min(1,p+0.005),0);
  const withinTolerance = Math.abs(sum-1) <= 0.001+epsilon;
  const roundingCompatible = sum > 0 && values.every(p => Math.abs(p*100-Math.round(p*100)) <= epsilon)
    && lower <= 1+epsilon && upper >= 1-epsilon;
  assert.ok(withinTolerance || roundingCompatible,
    'Probabilities do not sum to one beyond rounding bounds (sum='+sum+', options='+ids.length+')');
  const probabilityDiagnostics = {sum,normalisation:withinTolerance ? 'within-tolerance' : 'compatible-with-2dp-rounding'};
  assert.ok(answer.probabilities[answer.choice]+1e-6 >= max,'Choice is not a highest-probability candidate');
  finite(answer.confidence,'confidence');
  assert.ok(answer.confidence >= 0 && answer.confidence <= 1,'Confidence outside [0,1]');
  for(const name of ['input_tokens','output_tokens']) assert.ok(Number.isInteger(body.usage?.[name]) && body.usage[name] >= 0,'Missing/invalid '+name);
  return {model:body.model,choice:answer.choice,probabilities:answer.probabilities,confidence:answer.confidence,usage:body.usage,probabilityDiagnostics};
}
async function callJev(request,{apiKey,fetchImpl=fetch,sleep=ms => new Promise(r => setTimeout(r,ms)),timeoutMs=15000,maxRetries=2,onResponse}={}) {
  assert.ok(typeof apiKey === 'string' && apiKey.trim(),'Set TYPESAFE_API_KEY locally before live evaluation');
  const start = performance.now();
  for(let attempt=0;;attempt++) {
    let response;
    try {
      response = await fetchImpl(ENDPOINT,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
        body:JSON.stringify(request),signal:AbortSignal.timeout(timeoutMs)});
    } catch(error) {
      // Do not print transport messages: custom agents/proxies can include headers.
      throw new Error(error.name === 'TimeoutError' ? 'Jev request timed out; no automatic replay' : 'Jev network request failed; no automatic replay');
    }
    if([429,529].includes(response.status) && attempt < maxRetries) {
      const retryAfter = response.headers.get('retry-after');
      const seconds = retryAfter === null ? NaN : Number(retryAfter);
      const hinted = Number.isFinite(seconds) ? seconds*1000 : Date.parse(retryAfter)-Date.now();
      const delay = Number.isFinite(hinted) ? Math.max(0,hinted) : 1000*2**attempt;
      if(delay > 30000) throw new Error('Jev requested a retry delay over 30 seconds; retry the run later');
      await response.body?.cancel();
      await sleep(delay);
      continue;
    }
    if(!response.ok) throw new Error('Jev HTTP '+response.status+'; stopped without a Classic fallback');
    let body;
    try {body = await response.json();} catch {throw new Error('Jev returned invalid JSON');}
    const receipt = {body,attempts:attempt+1,latencyMs:performance.now()-start};
    // Persist before validation, including rejected distributions, without any
    // request headers or credentials. This also allows later offline recovery.
    if(onResponse) await onResponse(receipt);
    return {...validateResponse(body,request),attempts:receipt.attempts,latencyMs:receipt.latencyMs};
  }
}
function loadSnapshots(input) {
  const resolved = path.resolve(input);
  if(resolved.endsWith('.zip')) {
    const files = unzipSync(fs.readFileSync(resolved),{filter:entry => entry.name.endsWith('/best-decisions.json')});
    return Object.entries(files).sort(([a],[b]) => a.localeCompare(b)).map(([name,data]) => {
      const label = name.split('/').at(-2), match = /^(.*)-seed-(\d+)$/.exec(label);
      return {source:name,inputId:match ? match[1] : label,seed:match ? Number(match[2]) : null,snapshot:JSON.parse(Buffer.from(data).toString('utf8'))};
    });
  }
  if(fs.statSync(resolved).isDirectory()) {
    const paths = fs.readdirSync(resolved,{withFileTypes:true}).filter(d => d.isDirectory()).map(d => path.join(resolved,d.name,'best-decisions.json')).filter(p => fs.existsSync(p));
    return paths.sort().flatMap(loadSnapshots);
  }
  if(resolved.endsWith('.ndjson')) return fs.readFileSync(resolved,'utf8').split(/\r?\n/).filter(Boolean).map((line,i) => ({source:resolved+':'+(i+1),...JSON.parse(line)}));
  const snapshot = JSON.parse(fs.readFileSync(resolved,'utf8'));
  const label = path.basename(path.dirname(resolved)), match = /^(.*)-seed-(\d+)$/.exec(label);
  return [{source:resolved,inputId:match ? match[1] : label,seed:match ? Number(match[2]) : null,snapshot}];
}
function selectDecisions(snapshots,limit) {
  assert.ok(snapshots.length,'No decision snapshots found');
  const queues = snapshots.map(record => {
    assert.equal(record.snapshot?.schemaVersion,1,'Unsupported/missing snapshot schema');
    return record.snapshot.decisions.filter(d => d.candidates.length >= 2).map(decision => ({...record,decision}));
  });
  const selected = [];
  // Breadth first across snapshots, then advance within each trace. No fitness-
  // or agreement-based filtering; same sample for dry/live runs.
  for(let offset=0;selected.length<limit;offset++) {
    let any = false;
    for(const queue of queues) {
      if(queue[offset] && selected.length < limit) {selected.push(queue[offset]);any=true;}
    }
    if(!any) break;
  }
  return selected;
}
module.exports = {ENDPOINT,MODEL,PROMPT_VERSION,MAX_OPTIONS,MAX_BODY_BYTES,buildRequest,validateResponse,callJev,loadSnapshots,selectDecisions,digest};
