'use strict';
const assert=require('node:assert/strict');
const {digest,validateResponse}=require('../offline.cjs');
// Exact pre-fix revision 86e5aa7, both Git LF and Windows CRLF checkouts.
const previous={
 'experiments/jev/offline.cjs':['d12e2c1c27b6142f373368b9cf103de8a34ae1c946fc46364d85fc53d654cc5a','3a6b8b390969f8195b113b523575dcbad5aa5a7d3f65182f1b31d203a8798ec8'],
 'scripts/full-jev-benchmark.cjs':['ba180814ca94a1b26e9ff135c17ac035af6a8b79e30ea0fcdab203e3de665777','91ff6e2462eff08a66ae51f29a89fcfc431675a668f1ab0f21312d46dd8cdc0b'],
 'experiments/jev/full/report.cjs':['92fcc416c7825dfd13c312807391bd96a6bb3da9ec2a8a3022350628d50b500c','dd8e4ab317e463d0563311236c1c65da0921c4b419a89913cd4a373820557139']
};
// Exact revision 930dfc7. Every previously accepted choice remains unchanged;
// completed trials can be retained while the rejected raw receipt is recovered.
const choicePrevious={
 'experiments/jev/offline.cjs':['18b9010e8f055fa3a53594c25bc42d437dfc925b3bc600e0fd7e693e56f7dd61','eefacab699243c7ad482df86fb20505d73dae53f65b96ebab4bff0e98858e7b0'],
 'experiments/jev/full/resume.cjs':['03e11c33fbf8ea354c0608595b0f0ddd8157076df65d17e77522d68ea58f6dc4','df76c47a304c298b592d5f4e89b6a96a1981fd957b2e7a3474ce0876aa69c933'],
 'experiments/jev/full/report.cjs':previous['experiments/jev/full/report.cjs']
};
function resumeMetadata(old,current,completedTrials) {
 assert.equal(old.machine.node,current.machine.node,'Resume requires same Node version');
 if(old.signature===current.signature)return old;
 const error='Output belongs to a different configuration or source version; choose a new --out';
 assert.equal(old.signature,digest({config:old.config,sourceSha256:old.sourceSha256}),error);
 assert.equal(digest(old.config),digest(current.config),error);
 const choiceFix=Object.entries(choicePrevious).every(([p,hashes])=>hashes.includes(old.sourceSha256[p]));
 if(choiceFix){
  assert.deepEqual(Object.keys(old.sourceSha256).sort(),Object.keys(current.sourceSha256).sort(),error);
  for(const [file,sha] of Object.entries(old.sourceSha256))
   if(sha!==current.sourceSha256[file])assert.ok(choicePrevious[file]?.includes(sha),error);
  return {...current,startedAt:old.startedAt,migrations:[...(old.migrations||[]),{
   reason:'Preserve explicit API choice and log probability disagreement. Accepted choices, requests and geometry unchanged; completed trials retained.',
   completedTrialsRetained:completedTrials,at:new Date().toISOString(),previousSignature:old.signature,previousSourceSha256:old.sourceSha256
  }]};
 }
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
module.exports={resumeMetadata,validatedReceipt,previous,choicePrevious};
