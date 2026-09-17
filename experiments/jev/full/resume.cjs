'use strict';
const assert=require('node:assert/strict');
const {digest,validateResponse}=require('../offline.cjs');
// Exact pre-fix revision 86e5aa7, both Git LF and Windows CRLF checkouts.
const previous={
 'experiments/jev/offline.cjs':['d12e2c1c27b6142f373368b9cf103de8a34ae1c946fc46364d85fc53d654cc5a','3a6b8b390969f8195b113b523575dcbad5aa5a7d3f65182f1b31d203a8798ec8'],
 'scripts/full-jev-benchmark.cjs':['ba180814ca94a1b26e9ff135c17ac035af6a8b79e30ea0fcdab203e3de665777','91ff6e2462eff08a66ae51f29a89fcfc431675a668f1ab0f21312d46dd8cdc0b']
};
function resumeMetadata(old,current,completedTrials) {
 assert.equal(old.machine.node,current.machine.node,'Resume requires same Node version');
 if(old.signature===current.signature)return old;
 const error='Output belongs to a different configuration or source version; choose a new --out';
 assert.equal(old.signature,digest({config:old.config,sourceSha256:old.sourceSha256}),error);
 assert.equal(digest(old.config),digest(current.config),error);
 assert.equal(completedTrials,0,'This validation-fix migration only supports runs with no completed trials; choose a new --out');
 const added=Object.keys(current.sourceSha256).filter(p=>!(p in old.sourceSha256));
 assert.deepEqual(added,['experiments/jev/full/resume.cjs'],error);
 for(const [file,sha] of Object.entries(old.sourceSha256)) {
  assert.ok(file in current.sourceSha256,error);
  if(sha!==current.sourceSha256[file])assert.ok(previous[file]?.includes(sha),error);
 }
 for(const file of Object.keys(previous))assert.ok(previous[file].includes(old.sourceSha256[file]),error);
 return {...current,startedAt:old.startedAt,migrations:[...(old.migrations||[]),{
  reason:'Bounded probability-rounding validation fix; geometry, requests and policy unchanged. No completed trials existed.',
  at:new Date().toISOString(),previousSignature:old.signature,previousSourceSha256:old.sourceSha256
 }]};
}
function validatedReceipt(receipt,request) {
 const body=receipt.body||{model:receipt.model,answers:{placement:{type:'choice',choice:receipt.choice,probabilities:receipt.probabilities,confidence:receipt.confidence}},usage:receipt.usage};
 assert.ok(Number.isFinite(receipt.latencyMs)&&receipt.latencyMs>=0,'Invalid cached latency');
 assert.ok(Number.isInteger(receipt.attempts)&&receipt.attempts>=1,'Invalid cached attempt count');
 return {key:receipt.key,...validateResponse(body,request),attempts:receipt.attempts,latencyMs:receipt.latencyMs};
}
module.exports={resumeMetadata,validatedReceipt,previous};
