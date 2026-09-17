'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const {routes,questions,buildPack}=require('../experiments/jev/routes/bank.cjs');
const {digest}=require('../experiments/jev/offline.cjs');
const profile={source:'Test fixture, not experimental data',observedRuns:[{job:'fixture',policy:'control',runtimeMs:1000}],limitations:['No geometry or new intervention results supplied.']};
test('exactly 2000 unique questions, 200 routes, twenty balanced families',()=>{
 const rr=routes(),qq=questions();assert.equal(rr.length,200);assert.equal(qq.length,2000);assert.equal(new Set(qq.map(q=>q.id)).size,2000);assert.equal(new Set(qq.map(q=>q.question)).size,2000);
 const f=new Map();for(const r of rr)f.set(r.family,(f.get(r.family)||0)+1);assert.equal(f.size,20);assert.ok([...f.values()].every(n=>n===10));
 for(const r of rr)assert.equal(qq.filter(q=>q.routeId===r.routeId).length,10);
});
test('all IDs reach bounded requests, correct route references, no implicit filtering',()=>{
 const pack=buildPack(profile,{maxBytes:12000});assert.equal(pack.coverage.packed,2000);assert.deepEqual(pack.coverage.missingQuestionIds,[]);assert.equal(pack.coverage.performanceValidatedRoutes,0);assert.equal(pack.skipped.length,0);
 const seen=new Set();for(const p of pack.packets){assert.ok(Buffer.byteLength(JSON.stringify(p.request))<=12000);assert.equal(p.key,digest(p.request));for(const [id,q] of Object.entries(p.request.questions)){assert.ok(!seen.has(id));seen.add(id);const match=q.instructions.match(/`routes\[(\d+)\]`/);assert.ok(match);assert.equal(p.request.state.routes[Number(match[1])].routeId,p.mapping[id].routeId);}}
 assert.equal(seen.size,2000);assert.deepEqual(pack,buildPack(profile,{maxBytes:12000}));
});
test('profile is required; oversized evidence fails visibly',()=>{
 assert.throws(()=>buildPack({source:'empty',observedRuns:[]}),/profile/);
 assert.throws(()=>buildPack({...profile,oversized:'x'.repeat(70000)}),/exceed/);
});
test('partial reporting keeps missing IDs visible and creates ZIP without claiming speedups',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jev-routes-'));try{
  const pack=buildPack(profile);fs.writeFileSync(path.join(dir,'requests.json'),JSON.stringify(pack));fs.mkdirSync(path.join(dir,'answers'));fs.writeFileSync(path.join(dir,'answers/metadata.json'),JSON.stringify({packHash:digest(pack)}));
  const p=pack.packets[0];fs.writeFileSync(path.join(dir,'answers',p.key+'.answers.json'),JSON.stringify({key:p.key,values:Object.fromEntries(Object.keys(p.request.questions).map(k=>[k,.5])),latencyMs:1,usage:{input_tokens:1,output_tokens:1}}));
  const result=cp.spawnSync(process.execPath,[path.join(__dirname,'../scripts/jev-route-study.cjs'),'report','--study',dir],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(fs.readFileSync(path.join(dir,'route-screening.json')));assert.equal(report.answered,Object.keys(p.request.questions).length);assert.equal(report.missingQuestionIds.length,2000-report.answered);assert.deepEqual(report.measuredSpeedups,[]);assert.ok(fs.existsSync(path.join(dir,'results.zip')));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
