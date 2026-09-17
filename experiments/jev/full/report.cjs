'use strict';
const fs=require('node:fs'),path=require('node:path');
const {rng}=require('./corpus.cjs');
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const median=a=>{const v=a.slice().sort((a,b)=>a-b);return v.length ? (v[Math.floor((v.length-1)/2)]+v[Math.floor(v.length/2)])/2 : null;};
const quality=(a,b)=>a.unplaced-b.unplaced||a.bins-b.bins;
function aggregate(out,metadata) {
 const files=fs.readdirSync(path.join(out,'trials')).filter(f=>f.endsWith('.json'));
 const trials=files.map(f=>JSON.parse(fs.readFileSync(path.join(out,'trials',f)))).sort((a,b)=>a.index-b.index);
 const live=trials.filter(t=>t.jev),policies={};
 for(const name of ['classic','contact','ga','jev']) {
  const rows=trials.filter(t=>t[name]).map(t=>t[name]);if(!rows.length)continue;
  policies[name]={n:rows.length,meanUtilisation:mean(rows.map(r=>r.metrics.utilisation)),meanBins:mean(rows.map(r=>r.metrics.bins)),medianRuntimeMs:median(rows.map(r=>r.runtimeMs)),allValid:rows.every(r=>r.validation.valid)};
 }
 const pairs=live.filter(t=>t.ga.atJevBudget).map(t=>({job:t.job,seed:t.seed,outcome:quality(t.jev.metrics,t.ga.atJevBudget.metrics),utilisationDeltaPoints:100*(t.jev.metrics.utilisation-t.ga.atJevBudget.metrics.utilisation),
   jevRuntimeMs:t.jev.runtimeMs,classicGaTimeToJevQualityMs:t.ga.timeToJevQualityMs,apiMs:t.jev.apiMs,calls:t.jev.calls}));
 const perJob=Object.values(Object.groupBy ? Object.groupBy(pairs,p=>p.job) : pairs.reduce((o,p)=>((o[p.job]??=[]).push(p),o),{})).map(rows=>mean(rows.map(r=>r.utilisationDeltaPoints)));
 let ci=null;
 if(live.length===metadata.expectedTrials && perJob.length>=10) {const random=rng(99),samples=Array.from({length:2000},()=>mean(perJob.map(()=>perJob[Math.floor(random()*perJob.length)]))).sort((a,b)=>a-b);ci=[samples[49],samples[1949]];}
 const totalScore=trials.reduce((s,t)=>s+t.classic.profile.scoreLoopsMs,0),totalClassic=trials.reduce((s,t)=>s+t.classic.runtimeMs,0);
 const summary={status:live.length===metadata.expectedTrials?'complete-live-comparison':live.length?'partial-live-comparison':'classic-only-no-model-conclusion',expectedTrials:metadata.expectedTrials,completedTrials:trials.length,
  completedNests:trials.reduce((s,t)=>s+2+t.ga.evaluations+(t.jev?1:0),0),policies,
  profiling:{classicMeanNfpMs:mean(trials.map(t=>t.classic.profile.nfpMs)),classicMeanScoreLoopMs:mean(trials.map(t=>t.classic.profile.scoreLoopsMs)),
    classicMeanEvaluationMs:mean(trials.map(t=>t.classic.profile.evaluationMs)),scoreLoopShareOfColdRuntime:totalScore/totalClassic,
    theoreticalSpeedupRemovingWholeScoreLoop:totalClassic/(totalClassic-totalScore),note:'Score loop includes bounding-box construction and comparison. Jev still needs candidate features, so this zero-cost removal ceiling is optimistic. Runtime includes VM setup; GA is stock algorithm in Node, without browser worker parallelism.'},
  pairedAgainstGaAtJevBudget:{n:pairs.length,wins:pairs.filter(p=>p.outcome<0).length,ties:pairs.filter(p=>p.outcome===0).length,losses:pairs.filter(p=>p.outcome>0).length,meanUtilisationDeltaPoints:mean(pairs.map(p=>p.utilisationDeltaPoints)),jobClusterBootstrap95Percent:ci,intervalStatus:ci?'available':'Requires the complete live suite and at least 10 independent jobs',
   fasterToSameQuality:pairs.filter(p=>p.classicGaTimeToJevQualityMs!==null&&p.jevRuntimeMs<p.classicGaTimeToJevQualityMs).length,
   gaDidNotReachJevQuality:pairs.filter(p=>p.classicGaTimeToJevQualityMs===null).length},
  proceedDecision:live.length!==metadata.expectedTrials?'INCOMPLETE: no proceed/stop conclusion until the full live suite finishes.':ci&&ci[0]>0?'Promising quality signal against equal-time GA; confirm on real production jobs before proceeding.':'No established equal-time quality advantage on this suite; inspect runtime-to-quality and failure cases before further investment.',
  limitations:['Synthetic concave polygons, 90-degree rotations, zero spacing, no holes. Not evidence on all production jobs.','Full Jev rollout changes placement selection only; order and rotations match Classic first evaluation. GA may change both.','Candidate feature extraction and original score computation remain costs of the Jev policy.','API timeout/failure stops rather than silently substituting Classic. Successful calls are cached for resume; resumed timing reconstructs original API latency.','Any GA evaluation finishing after a deadline is excluded from that deadline comparison.'],pairs};
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');
 const csv=['job,seed,policy,bins,unplaced,utilisation,runtimeMs,nfpMs,scoreLoopsMs,apiMs'];
 for(const t of trials) for(const p of ['classic','contact','ga','jev']) if(t[p]){const r=t[p];csv.push([t.job,t.seed,p,r.metrics.bins,r.metrics.unplaced,r.metrics.utilisation,r.runtimeMs,r.profile?.nfpMs??'',r.profile?.scoreLoopsMs??'',r.apiMs??0].join(','));}
 fs.writeFileSync(path.join(out,'summary.csv'),csv.join('\n')+'\n');
 const pct=x=>x==null?'pending':(x*100).toFixed(2)+'%',ms=x=>x==null?'pending':(x/1000).toFixed(3)+' s';
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Complete nesting policy experiment</title><style>body{font:16px system-ui;background:#121c27;color:#eaf0f7;max-width:1100px;margin:40px auto;padding:0 20px}p,li{line-height:1.6}table{width:100%;border-collapse:collapse}td,th{padding:12px;text-align:left;border-bottom:1px solid #536171}a{color:#87caff}.pending{color:#f5bf61}</style><h1>Complete nesting policy experiment</h1><p class="pending">${summary.status}: ${trials.length}/${metadata.expectedTrials} trials; ${summary.completedNests} complete layouts evaluated.</p><p>${summary.proceedDecision}</p><table><tr><th>Policy</th><th>Runs</th><th>Mean utilisation</th><th>Mean sheets</th><th>Median runtime</th></tr>${Object.entries(policies).map(([p,r])=>`<tr><td>${p}</td><td>${r.n}</td><td>${pct(r.meanUtilisation)}</td><td>${r.meanBins.toFixed(2)}</td><td>${ms(r.medianRuntimeMs)}</td></tr>`).join('')}</table><p>GA row is its final best result at its recorded search budget; equal-time Jev comparisons below use only GA layouts completed by Jev's deadline.</p><h2>Where Classic spends time</h2><p>Mean NFP generation ${ms(summary.profiling.classicMeanNfpMs)}; mean bounding/scoring loop ${ms(summary.profiling.classicMeanScoreLoopMs)}; mean full evaluation ${ms(summary.profiling.classicMeanEvaluationMs)}. Removing the entire score loop for free gives at most ${summary.profiling.theoreticalSpeedupRemovingWholeScoreLoop.toFixed(3)}× aggregate cold-runtime speedup.</p><h2>Jev versus equal-time GA</h2><p>${summary.pairedAgainstGaAtJevBudget.wins} wins / ${summary.pairedAgainstGaAtJevBudget.ties} ties / ${summary.pairedAgainstGaAtJevBudget.losses} losses; ${pairs.length} matched trials. Positive utilisation difference favours Jev.</p><p>Mean difference: ${summary.pairedAgainstGaAtJevBudget.meanUtilisationDeltaPoints?.toFixed(3)??'pending'} percentage points. 95% job-cluster bootstrap interval: ${ci?ci.map(v=>v.toFixed(3)).join(' to '):'pending'}.</p><ul>${summary.limitations.map(x=>`<li>${x}</li>`).join('')}</ul><p><a href="summary.json">Full summary</a> · <a href="summary.csv">CSV</a> · <a href="metadata.json">Configuration and provenance</a></p></html>`;
 fs.writeFileSync(path.join(out,'report.html'),html);return summary;
}
module.exports={aggregate,quality};
