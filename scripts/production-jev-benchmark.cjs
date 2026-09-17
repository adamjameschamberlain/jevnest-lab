#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {zipSync}=require('fflate');
const {digest,MODEL,ENDPOINT}=require('../experiments/jev/offline.cjs');
const {validateJob}=require('../experiments/jev/production/engine.cjs');
const {VERSION,SETTINGS}=require('../experiments/jev/production/policy.cjs');
const {runSearch}=require('../experiments/jev/production/search.cjs');
const {report}=require('../experiments/jev/production/report.cjs');
const root=path.resolve(__dirname,'..'),corpus=path.join(root,'experiments/jev/production/corpus');
const config={live:false,suite:'development',seeds:[1],budgets:[30,120,300],jobs:null,manifest:null,out:null,model:MODEL,maxCalls:20,inputPrice:null,outputPrice:null,currency:'USD'};
for(let i=2;i<process.argv.length;i++){
 const key=process.argv[i];if(key==='--live'){config.live=true;continue;}if(key==='--help'){
  console.log('npm.cmd run benchmark:production -- --live [--suite development|evaluation] [--jobs shirts-sheet-100,shirts-roll-100] [--seeds 1,2,3] [--budgets 30,60,180] [--manifest my-manifest.json] [--out directory] [--max-calls 20] [--input-price price-per-million --output-price price-per-million --currency USD]');process.exit(0);
 }
 const v=process.argv[++i];assert.ok(v,'Missing '+key);
 const keyMap={'--suite':'suite','--out':'out','--model':'model','--manifest':'manifest','--currency':'currency'};
 if(keyMap[key])config[keyMap[key]]=v;
 else if(key==='--jobs')config.jobs=v.split(',');
 else if(key==='--seeds')config.seeds=v.split(',').map(Number);
 else if(key==='--budgets')config.budgets=v.split(',').map(Number);
 else if(key==='--max-calls')config.maxCalls=Number(v);
 else if(key==='--input-price')config.inputPrice=Number(v);
 else if(key==='--output-price')config.outputPrice=Number(v);
 else throw new Error('Unknown option '+key);
}
assert.ok(['development','evaluation'].includes(config.suite));
assert.ok(config.seeds.length&&new Set(config.seeds).size===config.seeds.length&&config.seeds.every(x=>Number.isInteger(x)&&x>=0&&x<2**32));
assert.ok(config.budgets.length&&new Set(config.budgets).size===config.budgets.length&&config.budgets.every(x=>Number.isFinite(x)&&x>0&&x<=3600));config.budgets.sort((a,b)=>a-b);
assert.ok(Number.isInteger(config.maxCalls)&&config.maxCalls>=1&&config.maxCalls<=100);
for(const key of ['inputPrice','outputPrice'])assert.ok(config[key]===null||(Number.isFinite(config[key])&&config[key]>=0));
assert.equal(config.inputPrice===null,config.outputPrice===null,'Supply both token prices or neither');
assert.ok(config.currency.length<=8);
const out=path.resolve(root,config.out??`jev-results/production-${config.live?'live':'classic'}-${config.suite}`);
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
async function secret(){
 if(process.env.TYPESAFE_API_KEY?.trim())return process.env.TYPESAFE_API_KEY.trim();
 assert.ok(process.stdin.isTTY,'Set TYPESAFE_API_KEY locally or use an interactive terminal');
 const readline=require('node:readline');readline.emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdin.resume();process.stdout.write('TypeSafe API key (hidden): ');
 return new Promise((resolve,reject)=>{let value='';const done=()=>{process.stdin.off('keypress',onKey);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');};
 const onKey=(s,k)=>{if(k?.ctrl&&k.name==='c'){done();reject(new Error('Cancelled'));}else if(k?.name==='return'){done();value.trim()?resolve(value.trim()):reject(new Error('Empty key'));}else if(k?.name==='backspace')value=value.slice(0,-1);else if(s&&!k?.ctrl)value+=s;};process.stdin.on('keypress',onKey);});
}
function pack(){const files={};function visit(d){for(const ent of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,ent.name);if(ent.isDirectory())visit(p);else if(ent.name!=='results.zip'&&!ent.name.endsWith('.tmp'))files[path.relative(out,p).split(path.sep).join('/')]=fs.readFileSync(p);}}visit(out);fs.writeFileSync(path.join(out,'results.zip'),zipSync(files,{level:6}));}
async function main(){
 const manifestPath=config.manifest?path.resolve(config.manifest):path.join(corpus,'manifest.json'),manifest=JSON.parse(fs.readFileSync(manifestPath));assert.equal(manifest.version,2);
 const families=new Map();for(const e of manifest.jobs){assert.ok(!families.has(e.family)||families.get(e.family)===e.split,'Family leaked across development/evaluation split');families.set(e.family,e.split);}
 const entries=manifest.jobs.filter(e=>e.split===config.suite&&(!config.jobs||config.jobs.includes(e.id)));
 assert.ok(entries.length,'No selected jobs');if(config.jobs)assert.equal(entries.length,config.jobs.length,'Unknown job ID or wrong split');
 const jobs=entries.map(e=>{const p=path.resolve(path.dirname(manifestPath),e.file),job=JSON.parse(fs.readFileSync(p));validateJob(job);assert.equal(job.id,e.id);assert.equal(job.split,e.split);assert.equal(job.provenance.family,e.family);return job;});
 const policies=['classic-ga','unranked','control',...(config.live?['jev']:[])];
 const sources=['svgnest.js','util/placementworker.js','util/geometryutil.js','util/clipper.js','benchmarks/runner.js','experiments/jev/replay.cjs','experiments/jev/full/corpus.cjs','experiments/jev/offline.cjs','experiments/jev/production/engine.cjs','experiments/jev/production/policy.cjs','experiments/jev/production/search.cjs','experiments/jev/production/report.cjs','scripts/production-jev-benchmark.cjs'];
 const sourceHashes=Object.fromEntries(sources.map(p=>[p,digest(fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n'))]));
 const signature=digest({config:{...config,out:undefined,manifest:undefined},sourceHashes,jobs,settings:SETTINGS});
 const metadata={version:2,signature,policyVersion:VERSION,settings:SETTINGS,config:{...config,out:undefined},policies,expectedPolicyRuns:jobs.length*config.seeds.length*policies.length,
  sourceHashes,inputHashes:Object.fromEntries(jobs.map(j=>[j.id,digest(j)])),endpoint:ENDPOINT,startedAt:new Date().toISOString(),machine:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length},resources:{searchThreads:1,inFlightRequests:1,nfpCacheEntries:30000},
  timing:'Independent cold engine per policy. Setup and all search costs timed. SVG/report/ZIP export recorded separately. No response-cache timing reconstruction. Interrupted policies require a fresh uninterrupted attempt; completed policies are retained.',
  primary:'All parts placed; sheets: sheet count then sum occupied X extents; rolls: consumed X length at fixed cross-web width. Only fully validated incumbents by each deadline count.'};
 fs.mkdirSync(out,{recursive:true});const metaFile=path.join(out,'metadata.json');
 if(fs.existsSync(metaFile)){const previous=JSON.parse(fs.readFileSync(metaFile));assert.equal(signature,previous.signature,'Code/config/input changed; use a new output directory');metadata.startedAt=previous.startedAt;}
 write(metaFile,metadata);fs.mkdirSync(path.join(out,'inputs'),{recursive:true});for(const j of jobs)write(path.join(out,'inputs',j.id+'.json'),j);
 const budgetMs=config.budgets.at(-1)*1000;
 console.log(`${config.live?'LIVE':'CLASSIC'} search benchmark: ${jobs.length} jobs, ${config.seeds.length} seeds, ${policies.length} policies; ${budgetMs/1000}s per policy.`);
 console.log(`Nominal search time ${(metadata.expectedPolicyRuns*budgetMs/3600000).toFixed(2)} hours plus export. Max ${jobs.length*config.seeds.length*config.maxCalls} Jev requests if live. Results: ${out}`);
 const records=[];let index=0,apiKey;
 if(config.live&&jobs.some(job=>config.seeds.some(seed=>!fs.existsSync(path.join(out,'runs',job.id+'-s'+seed,'jev','result.json')))))apiKey=await secret();
 for(const job of jobs)for(const seed of config.seeds){
  // First live trial exercises the actual model integration promptly; then rotate order.
  const offset=(index+++(config.live?policies.length-1:0))%policies.length,order=policies.slice(offset).concat(policies.slice(0,offset));
  for(const policy of order){
   const dir=path.join(out,'runs',job.id+'-s'+seed,policy),file=path.join(dir,'result.json');
   if(fs.existsSync(file)){const saved=JSON.parse(fs.readFileSync(file));records.push(saved);console.log(`${job.id} seed ${seed} ${policy}: saved (${saved.status})`);if(saved.status==='failed'){report(out,metadata,records);throw new Error('A recorded failed policy blocks resume; preserve it and use a new output directory after resolving the cause.');}continue;}
   if(fs.existsSync(dir)&&fs.readdirSync(dir).length){const archived=dir+'-interrupted-'+Date.now();fs.renameSync(dir,archived);console.log('Preserved interrupted policy attempt:',path.basename(archived));}
   fs.mkdirSync(dir,{recursive:true});
   if(policy==='jev'&&!apiKey)apiKey=await secret();
   console.log(`[${records.length+1}/${metadata.expectedPolicyRuns}] ${job.id}, seed ${seed}, ${policy}`);let lastLog=performance.now();
   const record=await runSearch(job,{policy,seed,budgetMs,dir,apiKey,model:config.model,maxCalls:config.maxCalls,onProgress:p=>{if(performance.now()-lastLog>=15000){console.log(`  ${(p.elapsedMs/1000).toFixed(0)}s, ${p.evaluations} complete evaluations, ${job.media.type==='roll'?p.best.length.toFixed(1)+' mm':p.best.bins+' sheets'}`);lastLog=performance.now();}}});
   records.push(record);report(out,metadata,records);
   console.log(`  ${record.status}: ${record.metrics?(job.media.type==='roll'?record.metrics.length.toFixed(1)+' mm':record.metrics.bins+' sheets'):'no completed layout'}, ${record.evaluations} evaluations, ${record.calls} model calls${record.error?'; '+record.error:''}`);
   if(record.status==='failed'&&policy==='jev'){pack();throw new Error('Live policy failed; raw responses retained. Resolve the failure before spending on further trials.');}
  }
 }
 metadata.finishedAt=new Date().toISOString();write(metaFile,metadata);report(out,metadata,records);pack();console.log('Finished. Upload '+path.join(out,'results.zip'));
}
main().catch(e=>{console.error('Stopped:',e.message);if(fs.existsSync(out)){write(path.join(out,'last-error.json'),{message:e.message,at:new Date().toISOString()});try{pack();}catch{}}process.exitCode=1;});
