'use strict';
const fs=require('node:fs'),path=require('node:path');
const {compare}=require('./search.cjs');
const {rng}=require('../full/corpus.cjs');
const median=a=>{if(!a.length)return null;const b=a.slice().sort((a,b)=>a-b);return (b[Math.floor((b.length-1)/2)]+b[Math.floor(b.length/2)])/2;};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function report(out,metadata,records){
 const expected=metadata.expectedPolicyRuns,policies={},comparisons=[];
 for(const p of metadata.policies){const rows=records.filter(r=>r.policy===p);policies[p]={attempts:rows.length,failed:rows.filter(r=>r.status==='failed').length,noLayout:rows.filter(r=>!r.metrics).length,callCapped:rows.filter(r=>r.status==='call-cap').length,medianFirstValidMs:median(rows.filter(r=>r.firstValidMs!==null).map(r=>r.firstValidMs)),fullEvaluations:rows.reduce((s,r)=>s+r.evaluations,0),nfpGenerated:rows.reduce((s,r)=>s+(r.profile?.nfpGenerated||0),0),apiCalls:rows.reduce((s,r)=>s+r.calls,0),inputTokens:rows.reduce((s,r)=>s+r.inputTokens,0),outputTokens:rows.reduce((s,r)=>s+r.outputTokens,0)};}
 for(const j of records.filter(r=>r.policy==='jev'))for(const baseline of metadata.policies.filter(p=>p!=='jev')){
  const b=records.find(r=>r.job===j.job&&r.seed===j.seed&&r.policy===baseline);if(!b)continue;
  for(const seconds of metadata.config.budgets){
   const deadline=seconds*1000,ja=j.trace.filter(t=>t.elapsedMs<=deadline).at(-1),ba=b.trace.filter(t=>t.elapsedMs<=deadline).at(-1);
   const eligible=j.status!=='failed'&&b.status!=='failed';
   const outcome=!eligible?'failed-comparison':!ja&&!ba?'neither-finished':!ja?'loss-no-layout':!ba?'win-no-baseline':compare(ja.metrics,ba.metrics,j.media)<-1e-7?'win':compare(ja.metrics,ba.metrics,j.media)>1e-7?'loss':'tie';
   const timeToJev=ja?b.trace.find(t=>t.elapsedMs<=deadline&&compare(t.metrics,ja.metrics,j.media)<=1e-7)?.elapsedMs??null:null;
   const jValue=ja?(j.media==='roll'?ja.metrics.length:ja.metrics.bins):null,bValue=ba?(j.media==='roll'?ba.metrics.length:ba.metrics.bins):null;
   comparisons.push({job:j.job,family:j.family,seed:j.seed,media:j.media,parts:j.partCount,baseline,seconds,outcome,jevValue:jValue,baselineValue:bValue,
    primaryImprovement:jValue!==null&&bValue!==null?bValue-jValue:null,jevReachedItsTargetMs:ja?.elapsedMs??null,baselineTimeToJevQualityMs:timeToJev,
    jevFullEvaluations:j.evaluations,baselineFullEvaluations:b.evaluations,jevNfpGenerated:j.profile?.nfpGenerated,baselineNfpGenerated:b.profile?.nfpGenerated});
  }
 }
 const grouped={};for(const c of comparisons){const key=[c.baseline,c.media,c.parts,c.seconds].join('/');(grouped[key]??=[]).push(c);}
 const summaries=Object.entries(grouped).map(([group,rows])=>{
  const fam={};for(const r of rows)if(r.primaryImprovement!==null&&!r.outcome.startsWith('failed'))(fam[r.family]??=[]).push(r.primaryImprovement);
  const familyMeans=Object.values(fam).map(mean);let ci=null;
  if(records.length===expected&&rows.every(r=>!r.outcome.startsWith('failed'))&&familyMeans.length>=10){const random=rng(713),samples=Array.from({length:2000},()=>mean(familyMeans.map(()=>familyMeans[Math.floor(random()*familyMeans.length)]))).sort((a,b)=>a-b);ci=[samples[49],samples[1949]];}
  return {group,n:rows.length,independentFamilies:familyMeans.length,wins:rows.filter(r=>r.outcome.startsWith('win')).length,ties:rows.filter(r=>r.outcome==='tie').length,losses:rows.filter(r=>r.outcome.startsWith('loss')).length,incompleteOrFailed:rows.filter(r=>['failed-comparison','neither-finished'].includes(r.outcome)).length,meanPrimaryImprovement:mean(familyMeans),familyBootstrap95:ci};
 });
 const usage=Object.values(policies).reduce((o,p)=>({input:o.input+p.inputTokens,output:o.output+p.outputTokens}),{input:0,output:0});
 const cost=metadata.config.inputPrice!==null&&metadata.config.outputPrice!==null?(usage.input*metadata.config.inputPrice+usage.output*metadata.config.outputPrice)/1e6:null;
 const result={version:2,status:records.length===expected?'finished':'partial',live:metadata.config.live,expectedPolicyRuns:expected,recordedPolicyRuns:records.length,policies,summaries,comparisons,
  estimatedApiCost:cost,currency:cost===null?null:metadata.config.currency,
  limitations:['Public references are rescaled and have altered quantities/spacing; they are not actual print-production jobs.','Finite polygon precision; holes and curves must not be silently discarded. Input accepts explicit simple polygon jobs only.','The same proposal stream is used for unranked/control/Jev. GA is a separate search comparator.','Searches run sequentially with one CPU search thread and at most one API request in flight; questions within that request run in parallel at the service.','Failed trials remain visible and are excluded from quality claims, not silently treated as successful fallbacks.','Bootstrap requires a complete suite and at least ten source families in the comparison group.']};
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(result,null,2)+'\n');
 const lines=['job,seed,policy,status,parts,media,budgetMs,runtimeMs,firstValidMs,sheets,rollLengthMm,utilisation,fullEvaluations,nfpGenerated,apiMs,calls,inputTokens,outputTokens'];
 for(const r of records)lines.push([r.job,r.seed,r.policy,r.status,r.partCount,r.media,r.budgetMs,r.runtimeMs,r.firstValidMs,r.metrics?.bins,r.metrics?.length,r.metrics?.utilisation,r.evaluations,r.profile?.nfpGenerated,r.apiMs,r.calls,r.inputTokens,r.outputTokens].join(','));
 fs.writeFileSync(path.join(out,'summary.csv'),lines.join('\n')+'\n');
 fs.writeFileSync(path.join(out,'report.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Jev search-policy benchmark</title><style>body{font:16px system-ui;background:#13202d;color:#e9f0f7;margin:36px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #526374;padding:9px;text-align:left}a{color:#86c9ff}p{max-width:1000px;line-height:1.5}</style><h1>Jev search-policy benchmark</h1><p>${result.status}: ${records.length}/${expected} policy runs. ${metadata.config.live?'Live Jev enabled.':'No model calls; no conclusion about Jev.'}</p><p>Sheet quality: all parts placed, fewer sheets, then less occupied length. Roll quality: all parts placed, shorter consumed length. Comparisons use validated incumbents completed by each deadline.</p><table><tr><th>Baseline / media / parts / seconds</th><th>Jev wins</th><th>Ties</th><th>Losses</th><th>Failed/incomplete</th><th>Mean material saved</th></tr>${summaries.map(s=>`<tr><td>${esc(s.group)}</td><td>${s.wins}</td><td>${s.ties}</td><td>${s.losses}</td><td>${s.incompleteOrFailed}</td><td>${s.meanPrimaryImprovement?.toFixed(3)??'—'}</td></tr>`).join('')}</table><p>Material saved is sheets or millimetres, depending on media. Detailed time-to-quality and uncertainty: <a href="summary.json">summary.json</a>. <a href="summary.csv">Per-run CSV</a>.</p><h2>Final layouts</h2>${records.map(r=>`<p>${esc(r.job)} / seed ${r.seed} / ${esc(r.policy)}: ${esc(r.status)}${r.metrics?` — <a href="runs/${r.job}-s${r.seed}/${r.policy}/layout-1.svg">first sheet / roll</a>`:''}${r.error?' — '+esc(r.error):''}</p>`).join('')}<h2>Interpretation limits</h2><ul>${result.limitations.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></html>`);
 return result;
}
module.exports={report};
