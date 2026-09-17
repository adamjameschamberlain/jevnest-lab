'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {MODEL,digest}=require('../offline.cjs');
const VERSION='route-discovery-2000-v1';
const LENSES=[
 {id:'speed_2x',title:'Twice as fast',ask:h=>`Could we ${h} and reach the same useful nesting quality in half the time?`,event:'A completed implementation reaches the fixed target valid layout quality in at most half the wall time of the best declared existing non-model baseline. Include setup, evidence, API waits, discarded work and validation. Fixed worker count. This is a hypothesis about a future experiment, not an observed result.'},
 {id:'speed_5x',title:'Five times as fast',ask:h=>`Could we ${h} and cut the time to a useful nest by five times?`,event:'The implemented route reaches the fixed target valid layout quality in at most one fifth of the wall time of the best declared existing non-model baseline, under matched workers and all end-to-end costs. Predict this event without assuming a breakthrough exists.'},
 {id:'material',title:'More material saved',ask:h=>`If we ${h}, could we use meaningfully less material in the same search time?`,event:'At the same wall-time and worker budget, the implemented route removes at least one whole sheet for fixed-size sheet jobs, or reduces consumed roll length by at least 2 percent at fixed width, relative to the best declared non-model baseline. All required parts and production constraints remain satisfied.'},
 {id:'jev_value',title:'Does Jev add value?',ask:h=>`If we ${h}, would Jev make it faster than a cheap rule making those same decisions?`,event:'Within the same newly implemented architecture, the Jev controller reaches the fixed quality target at least 10 percent sooner than a tuned deterministic or bandit controller, including all costs. Improvements from caching, parallel workers or a new algorithm alone do not meet this condition.'},
 {id:'evidence_ready',title:'Enough information?',ask:h=>`Do our current records contain enough information to tell Jev when to ${h}?`,event:'The supplied historical records contain decision-time observations sufficient to build a concrete application-state test of this route, without inventing contours, histories, interventions or counterfactual outcomes. This is an evidence-readiness judgment; it is not permission to substitute research opinions for measured outcomes.'},
 {id:'ask_early',title:'Ask earlier?',ask:h=>`Would asking Jev before the expensive work be the better moment to decide whether to ${h}?`,event:'An early invocation, before route-specific expensive work begins, beats a later invocation after one additional fixed evidence probe in end-to-end time to the same quality. Both invocation points and the probe must be specified and tested using the same implementation.'},
 {id:'history_helps',title:'Learn from this search?',ask:h=>`Would showing what has already worked and failed help Jev decide whether to ${h}?`,event:'Adding only search outcomes observed before the decision reduces time to the fixed quality target by at least 10 percent versus the same question and controller without that history, including the cost of collecting and encoding history. Future outcomes remain withheld.'},
 {id:'parallel_batch',title:'Batch judgments?',ask:h=>`Can we ask about several independent opportunities to ${h} together and make the whole search faster?`,event:'Batching up to sixteen available independent route decisions in one API request reduces end-to-end time to the same quality versus issuing those decisions sequentially. Include waiting to form the batch, stale state, API latency, worker contention and unused answers. No answer may depend on another answer in the same batch.'},
 {id:'transfer',title:'Works beyond one family?',ask:h=>`If it helps to ${h} here, is that likely to survive on unfamiliar jobs with different shapes and quantities?`,event:'A frozen controller for this route achieves at least 10 percent lower time to the same quality in at least 75 percent of untouched eligible shape families, under a fixed evaluation protocol. Treat repeated copies, seeds and prompts from a family as correlated. Restrict sheet-only or roll-only routes to eligible media.'},
 {id:'bad_failure',title:'What could go wrong?',ask:h=>`Could a confident but wrong decision to ${h} leave us with a seriously worse nest?`,event:'Under the declared fallback, at least one model-guided action on a held-out eligible family increases required sheet count or roll length by more than 2 percent at the same budget versus the cheap controller, or fails to return a valid layout when that controller succeeds. This is an adverse-event prediction; a higher value is not a benefit score.'}
];
const FAMILY_NEEDS={
 stopping:'Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.',
 restarts:'Exact restart and resume states; matched continuation/restart outcomes and setup times.',
 branch_pruning:'Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.',
 part_order:'Remaining contours, quantities and constraints; executable competing orders and complete outcomes.',
 rotations:'Allowed angles, exact orientation trials, context-dependent fit evidence and measured costs.',
 gaps:'Actual residual-region geometry, remaining contours and executable legal placement alternatives.',
 local_repair:'Exact layout adjacency, nominated repair actions and complete validated repair outcomes.',
 large_neighbourhood:'Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.',
 repeated_patterns:'Repeated-family contours, exact pattern construction and validation, quantities and residual search outcomes.',
 cache_reuse:'Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.',
 geometry_budget:'Operation-level geometry profiles, interruptible implementations and exact acceptance checks.',
 search_portfolio:'Implemented alternative algorithms and operators; matched-budget outcome histories.',
 parallel_workers:'Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.',
 evidence_timing:'Time-stamped evidence at alternative checkpoints; measured probe cost and paired outcomes.',
 question_design:'Matched decision states, fixed targets, measured labels and controlled wording or representation variants.',
 job_decomposition:'Executable partitions and merges, cross-group interaction geometry and complete objective outcomes.',
 roll_specific:'Exact roll-frontier states, committed boundaries, allowed alterations and validated continuation outcomes.',
 sheet_specific:'Exact multi-sheet layouts, executable reassignment or repair actions and whole-job material outcomes.',
 robustness_transfer:'Untouched eligible families, declared perturbations, frozen controller and measured transfer performance.',
 production_objectives:'Real production targets, deadlines, compatibility and commitment rules plus measured process costs.'
};
function routes(){
 const lines=fs.readFileSync(path.join(__dirname,'routes.tsv'),'utf8').trim().split('\n');const headers=lines.shift().split('\t');
 const rows=lines.map(line=>Object.fromEntries(line.split('\t').map((s,i)=>[headers[i],s])));
 assert.equal(rows.length,200);assert.equal(new Set(rows.map(r=>r.family+'_'+r.id)).size,200);
 for(const r of rows){assert.ok(FAMILY_NEEDS[r.family]);assert.ok(r.hook&&r.intervention);}
 return rows.map(r=>({...r,routeId:r.family+'_'+r.id,requiredStudyEvidence:FAMILY_NEEDS[r.family],implementationStatus:'Proposed route. This pack does not execute or validate the intervention.'}));
}
function questions(){return routes().flatMap(r=>LENSES.map(l=>({id:r.routeId+'_'+l.id,routeId:r.routeId,family:r.family,lens:l.id,type:'noul',question:l.ask(r.hook),event:l.event})));}
function buildPack(profile,{maxBytes=60000}={}){
 assert.ok(profile?.source&&profile?.observedRuns?.length,'A measured production profile is required');
 assert.ok(Number.isInteger(maxBytes)&&maxBytes>=10000&&maxBytes<=60000);
 const allRoutes=routes(),bank=questions();assert.equal(bank.length,2000);
 const packetList=[];let request,mapping;
 const reset=()=>{request={model:MODEL,state:{mode:'research_route_screening',profile,limits:'These are judgments about proposed research routes. No new route has been implemented or benchmarked by this request. Do not mistake proposal text or prior model probabilities for measured performance. Judge each complete event independently. Unsupported events may be uncertain; the observations are limited to the supplied jobs.',routes:[]},questions:{}};mapping={};};
 const flush=()=>{if(Object.keys(request.questions).length)packetList.push({id:'request-'+(packetList.length+1),key:digest(request),request,mapping});reset();};reset();
 for(const q of bank){
  function add(){let i=request.state.routes.findIndex(r=>r.routeId===q.routeId);if(i<0){i=request.state.routes.length;request.state.routes.push(allRoutes.find(r=>r.routeId===q.routeId));}
   request.questions[q.id]={type:'noul',instructions:`${q.question} For route ${q.routeId}, use \`routes[${i}]\` and \`profile\`. The precise yes-event is: ${q.event} Give an informed research prediction from available evidence; this is not a claim that the event has been measured. Do not infer success just because this route is proposed. All layouts must satisfy exact geometry and the original constraints.`};
   mapping[q.id]={questionId:q.id,caseId:VERSION,hypothesis:q.id,routeId:q.routeId,family:q.family,lens:q.lens,style:'route_specific',researchOnly:true};}
  const previous=structuredClone(request),previousMap={...mapping};add();
  if(Buffer.byteLength(JSON.stringify(request))>maxBytes){request=previous;mapping=previousMap;flush();add();assert.ok(Buffer.byteLength(JSON.stringify(request))<=maxBytes,'Profile and single question exceed packet cap');}
 }
 flush();
 const ids=packetList.flatMap(p=>Object.keys(p.request.questions));assert.equal(ids.length,2000);assert.equal(new Set(ids).size,2000);
 return {version:VERSION,mode:'research_route_screening',bankHash:digest({allRoutes,questions:bank}),profileHash:digest(profile),packets:packetList,skipped:[],questionCount:ids.length,coverage:{routes:200,families:20,lenses:10,requested:2000,packed:ids.length,missingQuestionIds:bank.map(q=>q.id).filter(id=>!ids.includes(id)),performanceValidatedRoutes:0},interpretation:'All 2000 are research judgments. Application-state prediction and performance tests require the additional evidence and executable interventions listed per route.'};
}
module.exports={VERSION,LENSES,routes,questions,buildPack};
