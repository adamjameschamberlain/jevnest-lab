#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {zipSync,unzipSync}=require('fflate');
const {routes,questions,LENSES,buildPack,VERSION}=require('../experiments/jev/routes/bank.cjs');
const {digest}=require('../experiments/jev/offline.cjs');
const argv=process.argv.slice(2),mode=argv.shift(),opts={};for(let i=0;i<argv.length;i+=2){assert.ok(argv[i]?.startsWith('--')&&argv[i+1],'Expected --option value');opts[argv[i].slice(2)]=argv[i+1];}
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
function sourceFiles(source){
 if(!fs.statSync(source).isDirectory())return unzipSync(fs.readFileSync(source),{filter:f=>f.name==='metadata.json'||f.name.endsWith('/result.json')});
 const files={};files['metadata.json']=fs.readFileSync(path.join(source,'metadata.json'));
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name==='result.json')files[path.relative(source,p).split(path.sep).join('/')]=fs.readFileSync(p);}}walk(path.join(source,'runs'));return files;
}
function profileFrom(source){
 const files=sourceFiles(source),parse=n=>JSON.parse(Buffer.from(files[n]).toString('utf8')),meta=parse('metadata.json');assert.equal(meta.version,2,'Requires production benchmark v2');
 const observedRuns=Object.keys(files).filter(n=>n.endsWith('/result.json')).sort().map(n=>{const r=parse(n);return {job:r.job,family:r.family,parts:r.partCount,media:r.media,policy:r.policy,status:r.status,budgetMs:r.budgetMs,runtimeMs:r.runtimeMs,firstValidMs:r.firstValidMs,metrics:r.metrics,evaluations:r.evaluations,modelCalls:r.calls,apiMs:r.apiMs,featureMs:r.featureMs,nfpMs:r.profile?.nfpMs,validationMs:r.profile?.validationMs,incumbentChanges:r.trace?.length};});
 assert.ok(observedRuns.length,'No completed policy records');
 return {source:'User production benchmark v2. Historical aggregate measurements, not new route outcomes.',sourceDigest:digest({metadata:meta,observedRuns}),machine:meta.machine,resources:meta.resources,observedRuns,
  objective:'Priority is less end-to-end time to the same useful valid layout quality. Also explore material improvements at equal time. Use the best declared non-model comparator and a separate cheap controller inside each proposed architecture.',
  limitations:['Source cases are rescaled public references, not customer production jobs.','Runs are limited development observations; seeds, copies and related jobs are correlated.','NFP time is only part of geometry cost; do not treat it as total geometric search time.','This profile contains aggregates, not contours, cavities, execution checkpoints, cache traces or actual counterfactual interventions.','Some routes apply only to sheets, only to rolls, or to production data not supplied here.','No novel route has measured performance in this screening pack.']};
}
function document(out){
 fs.mkdirSync(out,{recursive:true});const rr=routes(),qq=questions(),families=[...new Set(rr.map(r=>r.family))];
 const index=['# 2,000 questions for Jev route discovery','','200 distinct proposed routes × 10 distinct research questions = 2,000 questions. These are route-screening questions, not 2,000 independent experiments.','','All routes include an explicit Jev role. Their speedup must be separated from improvements due to a new deterministic algorithm, caching or more workers.','',...families.map((f,i)=>`${i+1}. [${f.replaceAll('_',' ')}](${f}.md) — 10 routes, 100 questions.`),'','The runnable pack includes every question ID. Missing operational evidence is recorded in each route; model opinions do not fill that evidence gap. See ../README.md for running instructions.'];
 fs.writeFileSync(path.join(out,'INDEX.md'),index.join('\n')+'\n');
 for(const family of families){const lines=['# '+family.replaceAll('_',' '),'', '100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.',''];
  for(const r of rr.filter(r=>r.family===family)){lines.push('## '+r.hook,'',r.intervention,'','**Evidence needed:** '+r.requiredStudyEvidence,'');for(const q of qq.filter(q=>q.routeId===r.routeId))lines.push(`- **${q.id}** — ${q.question}`);lines.push('');}
  fs.writeFileSync(path.join(out,family+'.md'),lines.join('\n')+'\n');}
}
function main(){
 if(mode==='prepare'){
  assert.ok(opts.results&&opts.out,'prepare --results production-results-directory-or-zip --out directory');
  const profile=profileFrom(opts.results),pack=buildPack(profile);fs.mkdirSync(opts.out,{recursive:true});const file=path.join(opts.out,'requests.json');
  if(fs.existsSync(file))assert.equal(digest(json(file)),digest(pack),'Study changed; choose a new output directory');
  write(file,pack);write(path.join(opts.out,'profile.json'),profile);write(path.join(opts.out,'bank-2000.json'),{version:VERSION,routes:routes(),lenses:LENSES.map(({ask,...x})=>x),questions:questions()});write(path.join(opts.out,'coverage.json'),pack.coverage);
  console.log(`ALL ${pack.questionCount}/2000 questions packed into ${pack.packets.length} requests. 200 routes; 20 families; 10 questions per route. No silent filtering. Research screening only; no new nesting runs or API calls.`);
 }else if(mode==='docs'){
  assert.ok(opts.out,'docs --out directory');document(opts.out);console.log('Wrote all 2000 questions.');
 }else if(mode==='report'){
  assert.ok(opts.study,'report --study directory');const dir=opts.study,pack=json(path.join(dir,'requests.json')),answerDir=path.join(dir,'answers');assert.equal(pack.version,VERSION);
  assert.equal(json(path.join(answerDir,'metadata.json')).packHash,digest(pack),'Answers belong to another pack');
  const matrix=new Map(routes().map(r=>[r.routeId,{...r,judgments:{}}])),missing=[];let latencyMs=0,inputTokens=0,outputTokens=0;
  for(const p of pack.packets){const f=path.join(answerDir,p.key+'.answers.json');if(!fs.existsSync(f)){missing.push(...Object.keys(p.request.questions));continue;}const a=json(f);assert.equal(a.key,p.key);assert.deepEqual(Object.keys(a.values).sort(),Object.keys(p.request.questions).sort());latencyMs+=a.latencyMs;inputTokens+=a.usage.input_tokens;outputTokens+=a.usage.output_tokens;
   for(const [id,v] of Object.entries(a.values)){assert.ok(Number.isFinite(v)&&v>=0&&v<=1);const m=p.mapping[id];matrix.get(m.routeId).judgments[m.lens]=v;}}
  const records=[...matrix.values()],ordered=records.slice().sort((a,b)=>(b.judgments.jev_value??-1)-(a.judgments.jev_value??-1)||a.routeId.localeCompare(b.routeId));
  write(path.join(dir,'route-screening.json'),{version:VERSION,mode:'research_route_screening',answered:2000-missing.length,missingQuestionIds:missing,apiLatencyMs:latencyMs,inputTokens,outputTokens,measuredSpeedups:[],routes:records,warning:'Sorting is by the model judgment of incremental Jev value, not measured performance. Do not treat the maximum among 200 routes as proof. Read adverse-event, evidence-readiness and transfer judgments separately.'});
  const header=['route','family','intervention',...LENSES.map(x=>x.id)];const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
  fs.writeFileSync(path.join(dir,'route-screening.csv'),[header,...ordered.map(r=>[r.routeId,r.family,r.intervention,...LENSES.map(l=>r.judgments[l.id]??'')])].map(row=>row.map(quote).join(',')).join('\n')+'\n');
  const lines=['# Research route screening — model judgments, not measured wins','',`Answered ${2000-missing.length}/2000 questions. API latency summed across recorded packets: ${(latencyMs/1000).toFixed(2)} s.`,`Usage: ${inputTokens} input tokens, ${outputTokens} output tokens.`, '','Ordered by the model judgment that Jev adds value over a cheap controller inside the same architecture. No combined confidence score or demonstrated speedup is implied.','', '| Route | Jev adds value | 2× speed | 5× speed | Evidence ready | Bad failure |','|---|---:|---:|---:|---:|---:|',...ordered.map(r=>`| ${r.routeId} | ${['jev_value','speed_2x','speed_5x','evidence_ready','bad_failure'].map(k=>r.judgments[k]===undefined?'missing':r.judgments[k].toFixed(2)).join(' | ')} |`)];
  fs.writeFileSync(path.join(dir,'route-screening.md'),lines.join('\n')+'\n');
  const zip={};function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name!=='results.zip')zip[path.relative(dir,p).split(path.sep).join('/')]=fs.readFileSync(p);}}walk(dir);fs.writeFileSync(path.join(dir,'results.zip'),zipSync(zip,{level:6}));
  console.log(`${2000-missing.length}/2000 answered. Report and results.zip saved in ${dir}. No performance winners declared.`);
 }else throw Error('Use prepare, docs or report.');
}
if(require.main===module){try{main();}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={profileFrom,document};
