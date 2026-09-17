'use strict';
const fs=require('node:fs'),path=require('node:path');
const {performance}=require('node:perf_hooks');
const {createEngine,Deadline}=require('./engine.cjs');
const {proposal,evidence,controlScore,buildRequest,callScores,SETTINGS}=require('./policy.cjs');
const {renderSheets}=require('../replay.cjs');
const {digest}=require('../offline.cjs');
const compare=(a,b,type)=>a.unplaced-b.unplaced||(type==='roll'?a.length-b.length:a.bins-b.bins)||a.occupiedLength-b.occupiedLength;
function scalar(m,type,engine){return type==='roll'?m.unplaced*(engine.width+2*engine.job.margin+1)+m.length:m.unplaced*(engine.parts.length+2)+m.bins+m.occupiedLength/(engine.width*engine.parts.length+1);}
async function runSearch(job,{policy,seed,budgetMs,dir,apiKey,model,maxCalls=SETTINGS.maxCalls,fetchImpl,onProgress=()=>{}}){
 const started=performance.now(),deadline=started+budgetMs;let engine,best=null,bestId=null,trace=[],error=null,deadlineHit=false,apiMs=0,calls=0,receipts=0,inputTokens=0,outputTokens=0,featureMs=0,round=0,evaluations=0,proposalsSeen=0;
 const append=(name,value)=>fs.appendFileSync(path.join(dir,name),JSON.stringify(value)+'\n');
 const elapsed=()=>performance.now()-started;
 function consider(p,value){
  evaluations++;
  if(!best||compare(value.metrics,best.metrics,job.media.type)<-1e-7){
   value.validation=engine.validate(value); // Validation must finish inside deadline.
   if(elapsed()>budgetMs)throw new Deadline();
   best=value;bestId=p.id;
   const event={elapsedMs:elapsed(),evaluation:evaluations,proposalId:p.id,metrics:value.metrics};trace.push(event);
   append('incumbents.ndjson',{...event,result:value.result,schedule:value.schedule});
  }
  append('evaluations.ndjson',{proposalId:p.id,digest:p.digest,elapsedMs:elapsed(),metrics:value.metrics});
  onProgress({evaluations,elapsedMs:elapsed(),best:best?.metrics});
 }
 try{
  engine=createEngine(job,{deadline,seed});
  const initial=proposal(engine,seed,0);consider(initial,engine.evaluate(initial.schedule));
  if(policy==='classic-ga'){
   const ga=engine.makeGa();
   while(true){
    engine.check();let individual=ga.population.find(p=>!p.fitness);if(!individual){ga.generation();individual=ga.population[1];}
    const schedule=engine.gaSchedule(individual);individual.rotation=schedule.map(p=>p.rotation);
    const p={id:'ga'+evaluations,schedule,digest:digest(schedule)},v=engine.evaluate(schedule);individual.fitness=scalar(v.metrics,job.media.type,engine);consider(p,v);
   }
  }else{
   while(true){
    engine.check();
    if(policy==='jev'&&calls>=maxCalls)break;
    const batch=Array.from({length:SETTINGS.batchSize},(_,i)=>proposal(engine,seed,1+round*SETTINGS.batchSize+i));
    proposalsSeen+=batch.length;
    append('proposals.ndjson',{round,elapsedMs:elapsed(),proposals:batch});
    let selected;
    if(policy==='unranked')selected=batch; // Same deterministic proposal stream, no feature expense.
    else{
     const start=performance.now(),rows=batch.map(p=>evidence(engine,p));featureMs+=performance.now()-start;
     append('features.ndjson',{round,elapsedMs:elapsed(),rows});
     if(policy==='jev'){
      // A call cap ends the policy explicitly; never silently substitutes the control.
      if(calls>=maxCalls)break;
      // Do not start a network round trip with less than one second remaining.
      if(deadline-performance.now()<1000){deadlineHit=true;break;}
      const request=buildRequest(engine,rows,model),key=digest(request);append('requests.ndjson',{round,key,elapsedMs:elapsed(),request});
      calls++;
      const apiStart=performance.now();let answer;
      try{answer=await callScores(request,{apiKey,deadline,fetchImpl,onReceipt:receipt=>{
       receipts++;inputTokens+=receipt.body?.usage?.input_tokens||0;outputTokens+=receipt.body?.usage?.output_tokens||0;
       append('responses.ndjson',{round,key,...receipt});
      }});}finally{apiMs+=performance.now()-apiStart;}
      engine.check();append('rankings.ndjson',{round,key,...answer});
      selected=answer.ranking.slice(0,SETTINGS.completePerBatch).map(r=>batch.find(p=>p.id===r.id));
     }else if(policy==='control')selected=rows.slice().sort((a,b)=>controlScore(b)-controlScore(a)||a.proposalId.localeCompare(b.proposalId)).slice(0,SETTINGS.completePerBatch).map(r=>batch.find(p=>p.id===r.proposalId));
     else throw new Error('Unknown policy '+policy);
    }
    for(const p of selected){engine.check();consider(p,engine.evaluate(p.schedule));}
    round++;
   }
  }
 }catch(e){if(e instanceof Deadline||e.name==='Deadline')deadlineHit=true;else error=e.message;}
 const runtimeMs=elapsed();
 // Rendering/export is measured separately and is never credited as an earlier incumbent.
 const exportStart=performance.now();
 if(best){
  const geometry=structuredClone(engine.renderGeometry);
  const w=job.media.type==='roll'?best.metrics.length:job.media.width,h=job.media.type==='roll'?job.media.width:job.media.height;
  geometry.bin.points=[{x:0,y:0},{x:0,y:h},{x:w,y:h},{x:w,y:0}];
  const physical={...best.result,placements:best.result.placements.map(b=>b.map(p=>({...p,x:p.x+job.margin,y:p.y+job.margin})))};
  const views=renderSheets(physical,geometry);views.forEach((s,i)=>fs.writeFileSync(path.join(dir,'layout-'+(i+1)+'.svg'),s));
  fs.writeFileSync(path.join(dir,'best.json'),JSON.stringify(best,null,2)+'\n');
 }
 const record={policy,seed,job:job.id,family:job.provenance.family,media:job.media.type,split:job.split,partCount:engine?.parts.length??job.parts.reduce((s,p)=>s+p.quantity,0),budgetMs,runtimeMs,exportMs:elapsed()-runtimeMs,
  status:error?'failed':!best?'no-complete-layout':calls>=maxCalls&&policy==='jev'&&!deadlineHit?'call-cap':'complete',error,deadlineHit,bestId,metrics:best?.metrics??null,
  firstValidMs:trace[0]?.elapsedMs??null,trace,profile:engine?.profile??null,featureMs,apiMs,calls,receipts,requestsWithoutUsage:calls-receipts,inputTokens,outputTokens,evaluations,proposalsSeen,rounds:round,
  note:'Coordinates in best.json are relative to the inset media origin; SVGs add the declared margin. Cold cache per policy; persistent bounded shape/rotation cache within policy. Deadline includes setup, probes, features, API, logging and validation. Only completed validated incumbents count. Export time is separately recorded.'};
 fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify(record,null,2)+'\n');return record;
}
module.exports={runSearch,compare};
