'use strict';
const assert=require('node:assert/strict');
const {rng}=require('../full/corpus.cjs');
const {bounds,rotate}=require('./engine.cjs');
const {MODEL,ENDPOINT,digest}=require('../offline.cjs');
// Frozen v2. Change version and output directory whenever questions/weights change.
const VERSION='search-proposal-scores-v2.0';
const SETTINGS={batchSize:4,prefixParts:16,fitSamples:3,completePerBatch:2,maxCalls:20,maxBodyBytes:60000,weights:{space:.45,hardParts:.35,order:.20}};
const round=n=>Math.round(n*10000)/10000;
function proposal(engine,seed,index){
 const r=rng((seed+Math.imul(index+1,7919))>>>0),mode=index%5;
 const parts=engine.parts.slice();
 const score=p=>mode===0?p.area:mode===1?Math.max(p.box.width,p.box.height):mode===2?p.concavity:mode===3?p.box.height/p.box.width:p.area;
 parts.sort((a,b)=>score(b)-score(a)||a.id-b.id);
 if(index>=5)for(let i=0;i<Math.max(2,parts.length*.10);i++){const a=Math.floor(r()*parts.length),b=Math.floor(r()*parts.length);[parts[a],parts[b]]=[parts[b],parts[a]];}
 const schedule=parts.map(p=>({id:p.id,rotation:p.allowed[index===0?0:Math.floor(r()*p.allowed.length)]}));
 return {id:'p'+index,schedule,orderRule:['area-first','longest-first','concavity-first','aspect-first','area-perturbed'][mode],digest:digest(schedule)};
}
function evidence(engine,p){
 const prefix=p.schedule.slice(0,SETTINGS.prefixParts),value=engine.evaluate(prefix,{probe:true});
 const placed=value.result.placements.at(-1)||[],remaining=p.schedule.slice(prefix.length),counts=new Map();
 for(const s of remaining){const part=engine.parts[s.id];if(!counts.has(part.shapeKey))counts.set(part.shapeKey,{part,quantity:0,firstRemainingPosition:remaining.indexOf(s)});counts.get(part.shapeKey).quantity++;}
 const families=[...counts.values()].sort((a,b)=>a.part.allowed.length-b.part.allowed.length||b.part.area-a.part.area);
 const extent=Math.max(0,...placed.flatMap(s=>rotate(engine.parts[s.id].envelope,s.rotation).map(v=>v.x+s.x)));
 const witnesses=families.slice(0,SETTINGS.fitSamples).map(({part,quantity,firstRemainingPosition})=>{
  const fittingRotations=part.allowed.filter(a=>engine.fitWitness(placed,part,a,extent));
  return {shape:part.source,quantity,firstRemainingPosition,area:round(part.area),concavity:round(part.concavity),allowedRotations:part.allowed,fittingRotations,
   observedFit:fittingRotations.length?'positive-area legal region found':'no positive-area region found in tested occupied strip'};
 });
 const occupiedArea=placed.reduce((s,p)=>s+engine.parts[p.id].area,0),compactness=extent?occupiedArea/(extent*engine.height):0;
 const fitFraction=witnesses.length?witnesses.filter(x=>x.fittingRotations.length).length/witnesses.length:1;
 const earlyFraction=witnesses.length?witnesses.filter(x=>x.firstRemainingPosition<24).length/witnesses.length:1;
 return {proposalId:p.id,orderRule:p.orderRule,probeParts:prefix.length,probeSheets:value.metrics.bins,probeUnplaced:value.metrics.unplaced,
  occupiedStripLength:round(extent),occupiedStripPackingFraction:round(compactness),remainingCount:remaining.length,
  remainingFamilies:families.length,fitFraction,earlyConstrainedFraction:earlyFraction,fitWitnesses:witnesses,
  nextParts:remaining.slice(0,12).map(x=>({shape:engine.parts[x.id].source,rotation:x.rotation,area:round(engine.parts[x.id].area)})),
  remainingShapeSummary:families.map(x=>({shape:x.part.source,quantity:x.quantity,area:round(x.part.area),width:round(x.part.box.width),height:round(x.part.box.height),concavity:round(x.part.concavity),allowedRotations:x.part.allowed})).slice(0,40),
  summaryTruncated:families.length>40};
}
function controlScore(e){return .45*Math.min(1,e.occupiedStripPackingFraction)+.35*e.fitFraction+.20*e.earlyConstrainedFraction-e.probeUnplaced;}
const LEVELS={
 space:['The partial nest leaves mostly fragmented or poorly matched space for the remaining shape mixture.','The partial nest leaves a mixture of useful openings and awkward residual space for the remaining shapes.','The partial nest leaves coherent usable openings well matched to the remaining shape mixture.'],
 hardParts:['The sampled constrained shapes have poor remaining opportunities and are likely to force substantial extra material.','Some sampled constrained shapes retain useful opportunities, but others are at risk of requiring extra material.','The sampled constrained shapes retain useful opportunities with little evidence of forced extra material.'],
 order:['The remaining sequence postpones constrained shapes while consuming their opportunities with easy shapes.','The remaining sequence partly addresses constrained shapes early, with some unresolved competition.','The remaining sequence addresses constrained shapes early and retains flexible filler shapes for later.']
};
function buildRequest(engine,rows,model=MODEL){
 const questions={};rows.forEach((row,i)=>{
  const path='`proposals['+i+']`';
  questions[row.proposalId+'_space']={type:'score',instructions:`For proposal ${row.proposalId} at ${path}, how usable is the residual space for its remaining shape mixture? Judge the packing consequences from supplied evidence. Fit witnesses describe actual geometry; do not recompute geometry or treat missing witnesses as proof of impossibility.`,criteria:LEVELS.space};
  questions[row.proposalId+'_hardParts']={type:'score',instructions:`For proposal ${row.proposalId} at ${path}, how well does this partial nest preserve opportunities for the sampled constrained remaining shapes? Assess future difficulty using their quantities and fit witnesses. This is a risk judgment, not a collision test.`,criteria:LEVELS.hardParts};
  questions[row.proposalId+'_order']={type:'score',instructions:`For proposal ${row.proposalId} at ${path}, how suitable is the remaining sequence for dealing with constrained shapes before their useful spaces are consumed? Use firstRemainingPosition and nextParts with the shape mixture.`,criteria:LEVELS.order};
 });
 const request={model,state:{version:VERSION,objective:engine.job.media.type==='roll'?'Place every copy and minimise consumed roll length at fixed width.':'Place every copy and minimise sheet count, then occupied extent.',
  units:'mm',media:engine.job.media,spacing:engine.job.spacing,partCount:engine.parts.length,
  evidenceLimits:'Exact short-prefix placements, not complete nests. Fit tests examine only three constrained remaining shape types in the occupied X strip of the last opened sheet, over all their allowed rotations. Positive witnesses are legal-region evidence; missing witnesses can miss boundary-only fits. Previous sheets and untested types are not assessed. Coordinate polygon dumps are intentionally omitted. Questions are independent; no other answer is available.',proposals:rows},questions};
 assert.ok(Buffer.byteLength(JSON.stringify(request))<=SETTINGS.maxBodyBytes,'Proposal request exceeds fixed body cap');return request;
}
function validateScores(body,request){
 assert.ok(typeof body?.model==='string'&&body.model,'Missing response model');
 assert.deepEqual(Object.keys(body.answers||{}).sort(),Object.keys(request.questions).sort(),'Answer keys differ from questions');
 const scores={},diagnostics={};
 for(const [id,q] of Object.entries(request.questions)){
  const a=body.answers[id],keys=q.criteria.map((_,i)=>String(i));assert.equal(a.type,'score');
  assert.ok(Number.isFinite(a.score)&&a.score>=0&&a.score<=q.criteria.length-1,'Invalid score');
  assert.ok(Number.isFinite(a.confidence)&&a.confidence>=0&&a.confidence<=1,'Invalid confidence');
  assert.deepEqual(Object.keys(a.probabilities||{}).sort(),keys);
  const ps=keys.map(k=>a.probabilities[k]);assert.ok(ps.every(p=>Number.isFinite(p)&&p>=0&&p<=1),'Invalid probability');
  const sum=ps.reduce((s,p)=>s+p,0),quantised=ps.every(p=>Math.abs(p*100-Math.round(p*100))<1e-8),roundable=quantised&&sum>0&&ps.reduce((s,p)=>s+Math.max(0,p-.005),0)<=1+1e-8&&ps.reduce((s,p)=>s+Math.min(1,p+.005),0)>=1-1e-8;
  assert.ok(Math.abs(sum-1)<=.001+1e-8||roundable,'Invalid probability normalisation');
  assert.deepEqual(Object.keys(a.legend||{}).sort(),keys,'Missing score legend');
  for(const k of keys)assert.equal(a.legend[k],q.criteria[Number(k)],'Score legend mismatch');
  // Preserve explicit service score, recording rounding/inconsistency instead of changing it.
  diagnostics[id]={probabilitySum:sum,scoreMinusReportedExpectation:a.score-ps.reduce((s,p,i)=>s+i*p,0)};
  scores[id]=a.score/(q.criteria.length-1);
 }
 for(const k of ['input_tokens','output_tokens'])assert.ok(Number.isInteger(body.usage?.[k])&&body.usage[k]>=0,'Invalid usage');
 const ranking=request.state.proposals.map(e=>({id:e.proposalId,score:Object.entries(SETTINGS.weights).reduce((s,[k,w])=>s+w*scores[e.proposalId+'_'+k],0)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 return {ranking,scores,diagnostics,model:body.model,usage:body.usage};
}
async function callScores(request,{apiKey,deadline,onReceipt,fetchImpl=fetch}){
 assert.ok(apiKey,'Missing local API key');const start=performance.now();
 for(let attempt=1;attempt<=3;attempt++){
  const remaining=Math.floor(deadline-performance.now());if(remaining<=0)throw new (require('./engine.cjs').Deadline)();
  let response;
  try{response=await fetchImpl(ENDPOINT,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify(request),signal:AbortSignal.timeout(Math.min(15000,remaining))});}
  catch(e){if(e.name==='TimeoutError'&&performance.now()>=deadline)throw new (require('./engine.cjs').Deadline)();throw new Error(e.name==='TimeoutError'?'Jev request timed out; trial marked failed':'Jev transport failed; trial marked failed');}
  if([429,529].includes(response.status)&&attempt<3){
   const h=response.headers.get('retry-after'),seconds=h===null?NaN:Number(h),parsed=Number.isFinite(seconds)?seconds*1000:Date.parse(h)-Date.now();const delay=Number.isFinite(parsed)?Math.max(0,parsed):500*2**attempt;
   await response.body?.cancel();if(performance.now()+delay>=deadline||delay>30000)throw new Error('Jev retry exceeds search budget');await new Promise(r=>setTimeout(r,delay));continue;
  }
  if(!response.ok)throw new Error('Jev HTTP '+response.status);
  let body;try{body=await response.json();}catch{throw new Error('Jev returned invalid JSON');}
  const receipt={body,latencyMs:performance.now()-start,attempts:attempt};await onReceipt(receipt);
  return {...validateScores(body,request),latencyMs:receipt.latencyMs,attempts:attempt};
 }
}
module.exports={VERSION,SETTINGS,LEVELS,proposal,evidence,controlScore,buildRequest,validateScores,callScores};
