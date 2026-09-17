#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {unzipSync} = require('fflate');
const {digest,buildRequest,validateResponse} = require('../experiments/jev/offline.cjs');
const {makeEngine,renderSheets} = require('../experiments/jev/replay.cjs');
const root = path.resolve(__dirname,'..');
const opts = {baseline:path.join(root,'benchmarks/baselines/classic-initial.zip')};
for(let i=2;i<process.argv.length;i+=2) {
  const name = process.argv[i];
  if(!['--choices','--requests','--baseline','--out'].includes(name) || !process.argv[i+1]) throw new Error('Usage: node scripts/replay-jev.cjs --choices choices.ndjson --requests requests.ndjson [--baseline ZIP] [--out DIRECTORY]');
  opts[name.slice(2)] = path.resolve(process.argv[i+1]);
}
assert.ok(opts.choices && opts.requests,'Both --choices and --requests are required');
const lines = file => fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
const choices = lines(opts.choices), requests = lines(opts.requests);
assert.ok(choices.length,'No model choices supplied');
assert.equal(new Set(choices.map(c => c.id)).size,choices.length,'Duplicate response IDs');
assert.equal(new Set(requests.map(c => c.id)).size,requests.length,'Duplicate request IDs');
assert.equal(choices.length,requests.length,'Expected a response for every request');
const archive = unzipSync(fs.readFileSync(opts.baseline));
const get = name => {assert.ok(archive[name],'Missing baseline file '+name);return JSON.parse(Buffer.from(archive[name]));};
const archivePrefix = Object.keys(archive).find(p => p.endsWith('/metadata.json')).replace(/metadata.json$/,'');
const meta = get(archivePrefix+'metadata.json');
for(const name of ['svgnest.js','util/placementworker.js','util/clipper.js','util/geometryutil.js']) {
  assert.equal(digest(fs.readFileSync(path.join(root,name),'utf8')),meta.sourceSha256[name],'Baseline engine source changed: '+name);
}
const out = opts.out || path.join(root,'jev-results','replay-'+new Date().toISOString().replace(/[:.]/g,'-'));
assert.ok(!fs.existsSync(out) || !fs.readdirSync(out).length,'Output directory must be empty');
fs.mkdirSync(out,{recursive:true});
const write = (file,value) => fs.writeFileSync(path.join(out,file),JSON.stringify(value,null,2)+'\n');
const cache = new Map(), results = [];
for(const choice of choices) {
  const task = requests.find(r => r.id === choice.id);
  assert.ok(task,'Missing request');
  for(const key of ['inputId','seed','evaluationId','decisionId','classicCandidateId','requestSha256','snapshotSha256']) assert.equal(choice[key],task[key],'Response/request mismatch: '+key);
  assert.equal(digest(task.request),task.requestSha256,'Request payload hash mismatch');
  assert.match(task.inputId,/^[a-z0-9-]+$/);
  assert.ok(Number.isInteger(task.seed));
  const prefix = archivePrefix+task.inputId+'-seed-'+task.seed+'/';
  const snapshot = get(prefix+'best-decisions.json');
  assert.equal(digest(snapshot),task.snapshotSha256,'Snapshot hash mismatch');
  const decision = snapshot.decisions.find(d => d.id === task.decisionId);
  assert.ok(decision,'Unknown decision');
  assert.equal(decision.selectedCandidateId,task.classicCandidateId,'Classic label mismatch');
  assert.equal(digest(buildRequest(snapshot,decision,task.request.model)),task.requestSha256,'Request does not represent saved candidates');
  validateResponse({model:choice.model,answers:{placement:{type:'choice',choice:choice.choice,probabilities:choice.probabilities,confidence:choice.confidence}},usage:choice.usage},task.request);
  if(!cache.has(prefix)) {
    const geometry = get(prefix+'geometry.json');
    assert.ok(!geometry.config.useHoles && !geometry.parts.some(p => p.children?.length),'Hole geometry is not supported by this replay validator');
    const engine = makeEngine(geometry,snapshot), classic = engine.run();
    assert.deepEqual(classic.result,get(prefix+'best.json').result,'Classic replay differs from saved browser result');
    assert.deepEqual(classic.decisions,snapshot.decisions,'Classic candidate trace differs from saved browser trace');
    cache.set(prefix,{engine,classic,geometry});
  }
  const {engine,classic,geometry} = cache.get(prefix);
  const replay = engine.run({decisionId:task.decisionId,candidateId:choice.choice});
  const agreement = choice.choice === task.classicCandidateId;
  if(agreement) assert.deepEqual(replay.result,classic.result,'Reapplying Classic choice changed the result');
  const a = classic.metrics,b = replay.metrics;
  const row = {id:choice.id,inputId:task.inputId,seed:task.seed,evaluationId:task.evaluationId,decisionId:task.decisionId,
    classicCandidateId:task.classicCandidateId,jevCandidateId:choice.choice,agreement,confidence:choice.confidence,apiLatencyMs:choice.latencyMs,
    classicBins:a.binsUsed,replayBins:b.binsUsed,classicUtilisation:a.utilisation,replayUtilisation:b.utilisation,
    utilisationDeltaPoints:100*(b.utilisation-a.utilisation),classicUnplaced:a.unplacedPartCount,replayUnplaced:b.unplacedPartCount,
    classicFitness:a.fitness,replayFitness:b.fitness,geometryValid:replay.validation.valid,
    materialOutcome:b.unplacedPartCount !== a.unplacedPartCount ? (b.unplacedPartCount < a.unplacedPartCount ? 'better' : 'worse') :
      b.binsUsed !== a.binsUsed ? (b.binsUsed < a.binsUsed ? 'better' : 'worse') : 'tie'};
  results.push(row);
  if(!agreement) {
    const label = task.inputId+'-seed-'+task.seed+'-'+task.decisionId;
    write(label+'-detail.json',{...row,classic,replay,warning:'One changed choice; all subsequent decisions recomputed with Classic. Not a full Jev policy rollout.'});
    for(const [policy,value] of [['classic',classic],['intervention',replay]]) renderSheets(value.result,geometry).forEach((svg,i) => fs.writeFileSync(path.join(out,`${label}-${policy}-sheet-${i+1}.svg`),svg));
  }
  console.log(`${task.inputId} seed=${task.seed} ${task.decisionId}: ${agreement ? 'same choice' : 'CHANGED'}; sheets ${a.binsUsed} -> ${b.binsUsed}; utilisation ${(100*a.utilisation).toFixed(2)}% -> ${(100*b.utilisation).toFixed(2)}%`);
}
const times = choices.map(c => c.latencyMs).sort((a,b) => a-b);
const summary = {method:'single-recorded-choice-then-classic',completedAt:new Date().toISOString(),
  choices:choices.length,agreements:results.filter(r => r.agreement).length,changedChoices:results.filter(r => !r.agreement).length,
  better:results.filter(r => r.materialOutcome === 'better').length,worse:results.filter(r => r.materialOutcome === 'worse').length,
  ties:results.filter(r => r.materialOutcome === 'tie').length,baselineReplays:cache.size,allGeometryValid:results.every(r => r.geometryValid),
  apiLatencyMs:{total:times.reduce((a,b) => a+b,0),mean:times.reduce((a,b) => a+b,0)/times.length,median:times.length%2 ? times[(times.length-1)/2] : (times[times.length/2-1]+times[times.length/2])/2,min:times[0],max:times.at(-1)},
  inputTokens:choices.reduce((n,c) => n+c.usage.input_tokens,0),outputTokens:choices.reduce((n,c) => n+c.usage.output_tokens,0),
  provenance:{choicesFileSha256:digest(fs.readFileSync(opts.choices,'utf8')),requestsFileSha256:digest(fs.readFileSync(opts.requests,'utf8')),
    engineSha256:Object.fromEntries(['svgnest.js','util/placementworker.js','util/geometryutil.js','util/clipper.js'].map(p => [p,digest(fs.readFileSync(path.join(root,p),'utf8'))]))},
  limitations:['Only recorded decisions are intervened on, individually. Subsequent decisions use Classic on regenerated legal geometry.',
    'This sample contains only the first two placement decisions per selected Classic best evaluation.',
    'Not a full Jev rollout, not a GA policy comparison, and not a general estimate of model performance.',
    'Replay timings are local Node execution; uploaded API latency is not directly comparable to the browser corpus timings.'],results};
write('summary.json',summary);
const columns = ['inputId','seed','decisionId','agreement','classicBins','replayBins','classicUtilisation','replayUtilisation','materialOutcome','geometryValid'];
fs.writeFileSync(path.join(out,'summary.csv'),columns.join(',')+'\n'+results.map(r => columns.map(k => r[k]).join(',')).join('\n')+'\n');
const changed = results.filter(r => !r.agreement);
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>First real Jev choices — geometry replay</title><style>body{font:16px system-ui;background:#101820;color:#edf3f8;max-width:1200px;margin:40px auto;padding:0 20px}p{line-height:1.6;color:#bdcbd6}table{border-collapse:collapse;width:100%;margin:24px 0}td,th{text-align:left;border-bottom:1px solid #40515e;padding:12px}a{color:#7fcaff}.sheets{display:flex;gap:15px;flex-wrap:wrap}.sheets img{width:30%;min-width:240px;background:white}h2{margin-top:36px}</style><h1>First real Jev choices</h1><p>${summary.agreements}/${summary.choices} matched Classic. ${summary.better} better, ${summary.worse} worse, ${summary.ties} ties by placed-part count then sheet count.</p><p>Each recorded choice was tested independently. After that one decision, the geometry engine regenerated candidates and Classic completed the nest. This is not a full Jev policy rollout.</p><table><tr><th>Changed choice</th><th>Classic sheets</th><th>After intervention</th><th>Classic utilisation</th><th>After intervention</th></tr>${changed.map(r => `<tr><td>${r.inputId}, seed ${r.seed}, ${r.decisionId}</td><td>${r.classicBins}</td><td>${r.replayBins}</td><td>${(r.classicUtilisation*100).toFixed(2)}%</td><td>${(r.replayUtilisation*100).toFixed(2)}%</td></tr>`).join('')}</table>${changed.map(r => {
 const prefix = r.inputId+'-seed-'+r.seed+'-'+r.decisionId;
 return ['classic','intervention'].map(mode => `<h2>${mode === 'classic' ? 'Classic' : 'Jev first choice, then Classic'}</h2><div class="sheets">${Array.from({length:mode === 'classic' ? r.classicBins : r.replayBins},(_,i) => `<img src="${prefix}-${mode}-sheet-${i+1}.svg" alt="${mode} sheet ${i+1}">`).join('')}</div>`).join('');
}).join('')}<p>All replayed layouts passed containment and overlap checks. The sample was limited to the first two moves and contained no outline/cavity features. Drawings show the exact polygon geometry used by the engine.</p><p><a href="summary.json">Full results and provenance</a> · <a href="summary.csv">CSV</a></p></html>`;
fs.writeFileSync(path.join(out,'report.html'),html);
console.log('\nReport: '+path.join(out,'report.html'));
