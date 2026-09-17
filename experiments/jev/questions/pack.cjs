'use strict';
const assert=require('node:assert/strict');
const bank=require('./bank.json');
const {MODEL,digest}=require('../offline.cjs');
const forbidden=/^(outcomes?|labels?|answers?|future|groundTruth|referenceResult|finalResult)$/i;
function inspect(value){
 if(Array.isArray(value)){value.forEach(inspect);return;}
 if(value&&typeof value==='object')for(const [key,v] of Object.entries(value)){assert.ok(!forbidden.test(key),'Outcome field is forbidden in evidence: '+key);inspect(v);}
}
function compile(cases,{families=null,styles=['casual','technical'],maxBytes=60000}={}){
 assert.ok(Array.isArray(cases)&&cases.length,'No cases');
 assert.ok(styles.length&&styles.every(x=>['casual','technical'].includes(x)),'Unknown wording style');
 if(families)assert.ok(families.length&&families.every(f=>bank.questions.some(q=>q.family===f)),'Unknown family');
 assert.ok(Number.isInteger(maxBytes)&&maxBytes>=2000&&maxBytes<=60000);
 const skipped=[],packets=[];let serial=0;
 const ids=new Set();
 let request={model:MODEL,state:{cases:[]},questions:{}},mapping={};
 function flush(){if(!Object.keys(request.questions).length)return;packets.push({id:'request-'+(++serial),request,mapping,key:digest(request)});request={model:MODEL,state:{cases:[]},questions:{}};mapping={};}
 for(const [caseIndex,c] of cases.entries()){
  assert.ok(typeof c.id==='string'&&c.id&&!ids.has(c.id),'Missing/duplicate case ID');ids.add(c.id);
  assert.ok(c.evidence&&c.applicableHypotheses?.length,'Case must explicitly declare applicable hypotheses');inspect(c.evidence);
  for(const h of c.applicableHypotheses)assert.ok(bank.questions.some(q=>q.hypothesis===h),'Unknown hypothesis '+h);
  for(const q of bank.questions){
   if(!styles.includes(q.style)||(families&&!families.includes(q.family))||!c.applicableHypotheses.includes(q.hypothesis))continue;
   const missing=q.requires.filter(k=>c.evidence[k]===undefined||c.evidence[k]===null);
   if(missing.length){skipped.push({caseId:c.id,questionId:q.id,missing});continue;}
   const id='c'+caseIndex+'_'+q.id;
   function add(){
    let index=request.state.cases.findIndex(x=>x.id===c.id);
    if(index<0){index=request.state.cases.length;request.state.cases.push({id:c.id,evidence:{}});}
    const evidence=request.state.cases[index].evidence;
    for(const k of q.requires)evidence[k]=c.evidence[k];
    request.questions[id]={type:'noul',instructions:`${q.question} Judge only case ${c.id}, using ${q.requires.map(k=>'`cases['+index+'].evidence.'+k+'`').join(', ')}. Operational meaning of yes: ${q.labelDefinition} Predict from the information available at this checkpoint. Unknown future outcomes are not supplied. Do not invent geometry, execution results, or a proof of validity. Missing positive-area fit witnesses do not prove that no fit exists. Other answers in this request are not available to you.`};
    mapping[id]={questionId:q.id,caseId:c.id,hypothesis:q.hypothesis,style:q.style,family:q.family};
   }
   const old=structuredClone(request),oldMap={...mapping};add();
   if(Buffer.byteLength(JSON.stringify(request))>maxBytes){request=old;mapping=oldMap;flush();add();assert.ok(Buffer.byteLength(JSON.stringify(request))<=maxBytes,'Single question and its evidence exceed request cap');}
  }
 }
 flush();
 return {version:bank.version,bankHash:digest(bank),packets,skipped,questionCount:packets.reduce((s,p)=>s+Object.keys(p.request.questions).length,0)};
}
function validate(body,request){
 assert.ok(typeof body?.model==='string'&&body.model,'Missing response model');
 assert.deepEqual(Object.keys(body.answers||{}).sort(),Object.keys(request.questions).sort(),'Question/answer mismatch');
 const values={};for(const [id,a] of Object.entries(body.answers)){assert.equal(a.type,'noul');assert.ok(Number.isFinite(a.noul)&&a.noul>=0&&a.noul<=1,'Invalid Noul');values[id]=a.noul;}
 for(const k of ['input_tokens','output_tokens'])assert.ok(Number.isInteger(body.usage?.[k])&&body.usage[k]>=0,'Invalid usage');
 return values;
}
module.exports={compile,validate,inspect};
