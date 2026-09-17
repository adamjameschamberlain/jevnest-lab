'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const bank=require('../experiments/jev/questions/bank.json');
const {compile,validate}=require('../experiments/jev/questions/pack.cjs');
const fixture=()=>({id:'case1',applicableHypotheses:['branch_quality_beat_best'],evidence:{subject:{id:'p1'},incumbent:{bins:3},objective:{target:2},completionProtocol:{deadlineMs:10000}}});
test('60 distinct hypotheses with paired wording and unchanged outcome definitions',()=>{
 assert.equal(bank.questions.length,120);assert.equal(new Set(bank.questions.map(q=>q.id)).size,120);
 const h=bank.questions.reduce((a,q)=>{(a[q.hypothesis]??=[]).push(q);return a;},{});assert.equal(Object.keys(h).length,60);
 for(const rows of Object.values(h)){assert.deepEqual(rows.map(q=>q.style).sort(),['casual','technical']);assert.equal(rows[0].labelDefinition,rows[1].labelDefinition);assert.ok(rows[0].requires.length>=4);}
});
test('unknown outcomes never become input; missing evidence skips rather than invents',()=>{
 const c=fixture();c.labels={hidden:true};c.evidence.unused={secret:'not sent'};
 const pack=compile([c]);assert.equal(pack.questionCount,2);assert.equal(pack.packets[0].request.state.cases[0].evidence.unused,undefined);assert.ok(!JSON.stringify(pack.packets).includes('hidden'));
 c.evidence.subject.outcomes={winner:true};assert.throws(()=>compile([c]),/forbidden/);delete c.evidence.subject.outcomes;delete c.evidence.incumbent;
 const skipped=compile([c]);assert.equal(skipped.questionCount,0);assert.equal(skipped.skipped.length,2);
});
test('bounded packets preserve every question, with stable resume identities',()=>{
 const c=fixture();c.applicableHypotheses=bank.questions.filter(q=>q.family==='branch_quality').map(q=>q.hypothesis);
 const a=compile([c],{maxBytes:3000});assert.ok(a.packets.length>1);assert.equal(a.questionCount,10);
 for(const p of a.packets)assert.ok(Buffer.byteLength(JSON.stringify(p.request))<=3000);
 assert.deepEqual(a,compile([c],{maxBytes:3000}));assert.throws(()=>compile([c,c]),/duplicate/);
});
test('Noul answers require complete bounded numeric probabilities and usage',()=>{
 const req=compile([fixture()]).packets[0].request,body={model:'jev-1.13.0',answers:Object.fromEntries(Object.keys(req.questions).map(k=>[k,{type:'noul',noul:.7}])),usage:{input_tokens:10,output_tokens:5}};
 assert.equal(Object.keys(validate(body,req)).length,2);body.answers[Object.keys(body.answers)[0]].noul=1.1;assert.throws(()=>validate(body,req),/Invalid Noul/);
});

test('multiple cases share a request without conflating question identity',()=>{
 const a=fixture(),b=fixture();b.id='case2';
 const pack=compile([a,b]);assert.equal(pack.packets.length,1);assert.equal(pack.questionCount,4);
 const p=pack.packets[0];assert.equal(p.request.state.cases.length,2);
 const mapping=Object.values(p.mapping);assert.equal(new Set(mapping.map(m=>m.questionId)).size,2);assert.equal(new Set(mapping.map(m=>m.caseId)).size,2);
 assert.ok(Object.values(p.request.questions).some(q=>q.instructions.includes('cases[1].evidence.subject')));
});
