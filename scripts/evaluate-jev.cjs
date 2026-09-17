#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {MODEL,PROMPT_VERSION,ENDPOINT,buildRequest,callJev,loadSnapshots,selectDecisions,digest} = require('../experiments/jev/offline.cjs');
const root = path.resolve(__dirname,'..');
async function main(argv) {
  const options = {input:path.join(root,'benchmarks/baselines/classic-initial.zip'),limit:20,model:MODEL,live:false};
  for(let i=0;i<argv.length;i++) {
    const arg = argv[i];
    if(arg === '--help') {
      console.log('node scripts/evaluate-jev.cjs [--live] [--input ZIP|DIRECTORY|JSON|NDJSON] [--limit N] [--model ID] [--out DIRECTORY]\nDefault: prepare 20 requests from the bundled best Classic snapshots; no API calls. --live requires TYPESAFE_API_KEY.');
      return;
    }
    if(arg === '--live') {options.live = true;continue;}
    if(!['--input','--limit','--model','--out'].includes(arg) || !argv[i+1]) throw new Error('Unknown/incomplete option: '+arg);
    const value = argv[++i];
    if(arg === '--input') options.input = path.resolve(value);
    if(arg === '--limit') options.limit = Number(value);
    if(arg === '--model') options.model = value;
    if(arg === '--out') options.out = path.resolve(value);
  }
  if(!Number.isSafeInteger(options.limit) || options.limit < 1) throw new Error('--limit must be a positive integer');
  if(options.live && !process.env.TYPESAFE_API_KEY?.trim()) throw new Error('Set TYPESAFE_API_KEY locally before live evaluation. No API requests were sent.');
  const snapshots = loadSnapshots(options.input);
  const selected = selectDecisions(snapshots,options.limit);
  if(!selected.length) throw new Error('No decisions have at least two candidates');
  // Build and validate the entire selected batch before any network call.
  const tasks = selected.map(({snapshot,decision,inputId,seed,source},i) => {
    const request = buildRequest(snapshot,decision,options.model);
    if(!decision.candidates.some(c => c.id === decision.selectedCandidateId)) throw new Error('Recorded Classic winner is missing');
    return {id:i,inputId,seed,source,evaluationId:snapshot.evaluationId,decisionId:decision.id,
      snapshotSha256:digest(snapshot),requestSha256:digest(request),classicCandidateId:decision.selectedCandidateId,
      request,decision};
  });
  const out = options.out || path.join(root,'jev-results',new Date().toISOString().replace(/[:.]/g,'-'));
  if(fs.existsSync(out) && fs.readdirSync(out).length) throw new Error('Output directory must be empty');
  fs.mkdirSync(out,{recursive:true});
  const write = (name,data) => fs.writeFileSync(path.join(out,name),JSON.stringify(data,null,2)+'\n');
  let revision = null;
  try {revision = execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();} catch {}
  const metadata = {schemaVersion:1,mode:options.live ? 'live' : 'dry-run',endpoint:ENDPOINT,model:options.model,promptVersion:PROMPT_VERSION,
    startedAt:new Date().toISOString(),repositoryRevision:revision,
    sourceSha256:Object.fromEntries(['experiments/jev/offline.cjs','scripts/evaluate-jev.cjs'].map(p => [p,digest(fs.readFileSync(path.join(root,p),'utf8'))])),
    snapshotCount:snapshots.length,eligibleDecisions:snapshots.reduce((n,r) => n+r.snapshot.decisions.filter(d => d.candidates.length >= 2).length,0),
    skippedZeroOrOneCandidate:snapshots.reduce((n,r) => n+r.snapshot.decisions.filter(d => d.candidates.length < 2).length,0),
    selectedDecisions:tasks.length,selection:'round-robin across input snapshots, in original decision order',
    interpretation:'Agreement and local feature deltas only. No changed-policy geometry replay or final-utilisation claim.'};
  write('metadata.json',metadata);
  fs.writeFileSync(path.join(out,'requests.ndjson'),tasks.map(({decision,...task}) => JSON.stringify(task)).join('\n')+'\n');
  console.log(`Prepared ${tasks.length} decisions from ${snapshots.length} snapshots (${tasks.reduce((n,t) => n+t.decision.candidates.length,0)} total candidate options).`);
  if(!options.live) {
    write('summary.json',{mode:'dry-run',apiRequests:0,preparedDecisions:tasks.length,completed:true});
    metadata.completed = true;write('metadata.json',metadata);
    console.log('Dry run complete: '+out+'\nNo API calls or model decisions were made.');
    return;
  }
  const results = [];
  try {
    for(const task of tasks) {
      const response = await callJev(task.request,{apiKey:process.env.TYPESAFE_API_KEY});
      const chosen = task.decision.candidates.find(c => c.id === response.choice);
      const classic = task.decision.candidates.find(c => c.id === task.classicCandidateId);
      const result = {id:task.id,inputId:task.inputId,seed:task.seed,evaluationId:task.evaluationId,decisionId:task.decisionId,
        requestSha256:task.requestSha256,snapshotSha256:task.snapshotSha256,classicCandidateId:task.classicCandidateId,
        ...response,agreesWithClassic:response.choice === task.classicCandidateId,
        localDelta:{width:chosen.width-classic.width,height:chosen.height-classic.height,boundingScore:chosen.score-classic.score}};
      results.push(result);
      fs.appendFileSync(path.join(out,'choices.ndjson'),JSON.stringify(result)+'\n');
      console.log(`${results.length}/${tasks.length}: ${task.inputId} ${task.decisionId} -> ${response.choice}; ${result.agreesWithClassic ? 'agrees' : 'differs'}; confidence ${response.confidence}`);
    }
    const agree = results.filter(r => r.agreesWithClassic).length;
    write('summary.json',{mode:'live',completed:true,decisions:results.length,apiAttempts:results.reduce((n,r) => n+r.attempts,0),
      agreements:agree,disagreements:results.length-agree,agreementRate:agree/results.length,
      models:[...new Set(results.map(r => r.model))],totalLatencyMs:results.reduce((n,r) => n+r.latencyMs,0),
      inputTokens:results.reduce((n,r) => n+r.usage.input_tokens,0),outputTokens:results.reduce((n,r) => n+r.usage.output_tokens,0),
      finalUtilisation:null,interpretation:metadata.interpretation});
    metadata.completed = true;metadata.finishedAt = new Date().toISOString();write('metadata.json',metadata);
    console.log('Offline Jev choices saved: '+out);
  } catch(error) {
    write('error.json',{message:error.message,completedDecisions:results.length,completed:false});
    throw error;
  }
}
if(require.main === module) main(process.argv.slice(2)).catch(error => {console.error(error.message);process.exitCode=1;});
module.exports = {main};
