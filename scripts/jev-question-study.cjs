#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const {compile,validate}=require('../experiments/jev/questions/pack.cjs');
const {ENDPOINT,digest}=require('../experiments/jev/offline.cjs');
const args=process.argv.slice(2),mode=args.shift(),opt={};
for(let i=0;i<args.length;i+=2){assert.ok(args[i].startsWith('--')&&args[i+1],'Expected --option value');opt[args[i].slice(2)]=args[i+1];}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
async function secret(){
 if(process.env.TYPESAFE_API_KEY?.trim())return process.env.TYPESAFE_API_KEY.trim();
 assert.ok(process.stdin.isTTY,'Run interactively for hidden API-key entry, or set TYPESAFE_API_KEY locally');
 require('node:readline').emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdin.resume();process.stdout.write('TypeSafe API key (hidden): ');
 return new Promise((resolve,reject)=>{let value='';const done=()=>{process.stdin.off('keypress',key);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');};function key(s,k){if(k?.ctrl&&k.name==='c'){done();reject(Error('Cancelled'));}else if(k?.name==='return'){done();value.trim()?resolve(value.trim()):reject(Error('Empty key'));}else if(k?.name==='backspace')value=value.slice(0,-1);else if(s&&!k?.ctrl)value+=s;}process.stdin.on('keypress',key);});
}
async function main(){
 if(mode==='prepare'){
  assert.ok(opt.cases&&opt.out,'prepare --cases cases.json --out directory');
  const study=compile(read(opt.cases),{families:opt.families?.split(','),styles:opt.styles?.split(',')});
  fs.mkdirSync(opt.out,{recursive:true});const dest=path.join(opt.out,'requests.json');
  if(fs.existsSync(dest))assert.equal(digest(read(dest)),digest(study),'Existing pack differs; use a new output directory');
  write(dest,study);console.log(`${study.questionCount} questions in ${study.packets.length} requests; ${study.skipped.length} skipped for missing evidence. No API calls.`);
 }else if(mode==='collect'){
  assert.ok(opt.pack&&opt.out,'collect --pack requests.json --out directory [--max-calls 4]');
  const study=read(opt.pack),limit=Number(opt['max-calls']||4);assert.ok(Number.isInteger(limit)&&limit>0&&limit<=100);
  fs.mkdirSync(opt.out,{recursive:true});const metadata={packHash:digest(study),endpoint:ENDPOINT,measurement:'Offline batched judgments. These latencies are not live nesting speedups.'},meta=path.join(opt.out,'metadata.json');
  if(fs.existsSync(meta))assert.deepEqual(read(meta),metadata,'Pack changed; use a new output directory');else write(meta,metadata);
  let apiKey,calls=0;
  for(const packet of study.packets){
   const base=path.join(opt.out,packet.key),rawFile=base+'.raw.json',answerFile=base+'.answers.json';
   if(fs.existsSync(answerFile))continue;
   let receipt;
   if(fs.existsSync(rawFile))receipt=read(rawFile);
   else{
    if(calls>=limit)break;
    apiKey??=await secret();calls++;const start=performance.now();let response;
    try{response=await fetch(ENDPOINT,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify(packet.request),signal:AbortSignal.timeout(30000)});}catch{write(base+'.error.json',{error:'Transport failure or timeout',elapsedMs:performance.now()-start});throw Error('Transport failure or timeout; stopped. No automatic retry.');}
    const text=await response.text();receipt={status:response.status,latencyMs:performance.now()-start,receivedAt:new Date().toISOString(),bodyText:text};write(rawFile,receipt);
   }
   assert.equal(receipt.status,200,'API returned HTTP '+receipt.status+'; raw response retained.');
   const body=JSON.parse(receipt.bodyText),values=validate(body,packet.request);
   write(answerFile,{key:packet.key,values,mapping:packet.mapping,latencyMs:receipt.latencyMs,model:body.model,usage:body.usage});
   console.log(`${packet.id}: ${Object.keys(values).length} answers, ${(receipt.latencyMs/1000).toFixed(2)}s`);
  }
  console.log(`${calls} new API requests. Saved answers resume without another charge; interrupted requests without receipts may have been billed.`);
 }else if(mode==='score'){
  assert.ok(opt.answers&&opt.labels&&opt.out,'score --answers directory --labels labels.json --out report.json');
  const labels=read(opt.labels),lookup=new Map();
  for(const l of labels){assert.ok(l.caseId&&l.hypothesis&&typeof l.value==='boolean'&&l.evidenceRef,'Label requires case, hypothesis, boolean value and outcome evidence reference');const k=l.caseId+'/'+l.hypothesis;assert.ok(!lookup.has(k),'Duplicate outcome label');lookup.set(k,l);}
  const groups={};let unlabelled=0;
  for(const f of fs.readdirSync(opt.answers).filter(f=>f.endsWith('.answers.json'))){const a=read(path.join(opt.answers,f));for(const [id,p] of Object.entries(a.values)){const m=a.mapping[id],l=lookup.get(m.caseId+'/'+m.hypothesis);if(!l){unlabelled++;continue;}const g=groups[m.questionId]??={n:0,brierSum:0,correct:0,positives:0,cases:[]};g.n++;g.brierSum+=(p-Number(l.value))**2;g.correct+=Number((p>=.5)===l.value);g.positives+=Number(l.value);g.cases.push(m.caseId);}}
  for(const g of Object.values(groups)){g.brier=g.brierSum/g.n;g.accuracy=g.correct/g.n;g.positiveRate=g.positives/g.n;delete g.brierSum;}
  write(opt.out,{groups,unlabelled,warning:'Descriptive prediction scores only. Questions with different labels/base rates are not comparable by raw accuracy. No speedup claim: measure paired policies, regret, evidence cost, API cost and geometry time on held-out families.'});
  console.log(`${Object.keys(groups).length} scored questions; ${unlabelled} answers lack measured labels.`);
 }else console.log('Modes: prepare --cases cases.json --out directory; collect --pack requests.json --out directory --max-calls 4; score --answers directory --labels labels.json --out report.json');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
