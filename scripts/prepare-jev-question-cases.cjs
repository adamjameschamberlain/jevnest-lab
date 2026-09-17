#!/usr/bin/env node
'use strict';
// Reuse pre-decision evidence only. Completed outcomes stay in the original archive.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {unzipSync}=require('fflate');
const source=process.argv[2],output=process.argv[3];assert.ok(source&&output,'Usage: node scripts/prepare-jev-question-cases.cjs results.zip-or-directory cases.json');
let files;
if(fs.statSync(source).isDirectory()){
 files={};function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.json')||e.name.endsWith('.ndjson'))files[path.relative(source,p).split(path.sep).join('/')]=fs.readFileSync(p);}}walk(source);
}else files=unzipSync(fs.readFileSync(source),{filter:f=>/\.(json|ndjson)$/.test(f.name)});
const json=n=>JSON.parse(Buffer.from(files[n]).toString('utf8'));
const lines=n=>Buffer.from(files[n]||[]).toString('utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
assert.equal(json('metadata.json').version,2,'Needs production benchmark v2');
const cases=[];
for(const name of Object.keys(files).filter(n=>n.endsWith('/jev/requests.ndjson')).sort()){
 const request=lines(name)[0];if(!request)continue;
 const prefix=name.slice(0,-'requests.ndjson'.length),job=json(prefix+'result.json').job;
 const history=lines(prefix+'incumbents.ndjson').filter(x=>x.elapsedMs<=request.elapsedMs),incumbent=history.at(-1);assert.ok(incumbent,'No prior incumbent');
 const state=request.request.state,type=state.media.type;
 for(const subject of state.proposals){
  const amount=type==='sheet'?1:10;
  cases.push({id:job+'-'+subject.proposalId+'-prefix16',applicableHypotheses:['beat_best','save_material','small_win','hit_target','avoid_bad_tail'].map(x=>'branch_quality_'+x),evidence:{
   subject,incumbent:{metrics:incumbent.metrics,observedAtMs:incumbent.elapsedMs},
   objective:{media:state.media,units:'mm',partCount:state.partCount,spacing:state.spacing,comparator:type==='sheet'?'All parts validly placed; fewer sheets, then smaller sum of occupied X extents.':'All parts validly placed; smaller consumed roll length.',
    materialThreshold:amount,minimumUsefulGain:amount,minimumUsefulGainDefinition:type==='sheet'?'At least one fewer sheet; secondary compactness is insufficient.':'At least 10 mm shorter roll; same width.',
    target:type==='sheet'?{maxSheets:incumbent.metrics.bins-1,unplaced:0}:{maxRollLengthMm:incumbent.metrics.length-10,unplaced:0}},
   completionProtocol:{deadlineMs:120000,description:'Fresh full completion of this fixed proposal schedule with the frozen v2 geometry engine; no new search or model selection. Quality outcomes only. The uploaded run may not have completed every proposal; missing outcomes stay unknown.',evidenceLimits:state.evidenceLimits},
  }});
 }
}
assert.ok(cases.length,'No saved live question snapshots');
fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});assert.ok(!fs.existsSync(output),'Use a new cases filename; never overwrite edited research cases');fs.writeFileSync(output,JSON.stringify(cases,null,2)+'\n');console.log(`${cases.length} cases. Only branch-quality hypotheses have sufficient evidence. No outcomes copied, geometry run or API call made.`);
