'use strict';
// Fixed synthetic holdout suite: 20 distinct jobs, 20–50 deeply concave parts.
const assert = require('node:assert/strict');
function rng(seed) {let s=seed>>>0;return () => ((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function area(p) {return Math.abs(p.reduce((a,v,i)=>{const w=p[(i+1)%p.length];return a+v.x*w.y-w.x*v.y;},0)/2);}
function shape(kind,w,h,r) {
  const a=Math.round(w*(.2+r()*.15)),b=Math.round(h*(.2+r()*.15));
  let p;
  if(kind===0) p=[[0,0],[w,0],[w,b],[a,b],[a,h],[0,h]]; // L
  if(kind===1) p=[[0,0],[w,0],[w,h],[w-a,h],[w-a,b],[a,b],[a,h],[0,h]]; // U
  if(kind===2) p=[[0,0],[w,0],[w,b],[a,b],[a,h-b],[w,h-b],[w,h],[0,h]]; // C
  if(kind===3) p=[[0,0],[w,0],[w,b],[w-a,b],[w-a,h],[a,h],[a,b],[0,b]]; // T
  if(kind===4) p=[[0,0],[w-a,0],[w-a,h-b],[w,h-b],[w,h],[a,h],[a,b],[0,b]]; // Z
  if(kind===5) { // alternating deep radial notches; simple polygon, no holes
    p=Array.from({length:16},(_,i)=>{const angle=i*Math.PI/8,rad=i%2 ? .25+r()*.1 : .5;return [w/2+w*rad*Math.cos(angle),h/2+h*rad*Math.sin(angle)];});
  }
  return p.map(([x,y])=>({x:Math.round(x*1000)/1000,y:Math.round(y*1000)/1000}));
}
function makeJob(index) {
  const r=rng(7331+index*7919),count=[20,30,40,50][index%4];
  const parts=Array.from({length:count},(_,id)=>{
    const kind=(index%5===0 ? id%3 : Math.floor(r()*6));
    const points=shape(kind,24+Math.floor(r()*40),25+Math.floor(r()*42),r);
    return {id,source:id,points,children:[],family:['L','U','C','T','Z','star'][kind],area:area(points)};
  });
  const total=parts.reduce((s,p)=>s+p.area,0);
  // 1.4–2.1 sheets is the area lower bound, deliberately demanding dense layouts.
  const width=150,height=Math.round(total/(width*(1.4+(index%4)*.23)));
  assert.ok(height>70);
  return {id:'hard-'+String(index+1).padStart(2,'0'),generatorSeed:7331+index*7919,
    geometry:{bin:{id:-1,points:[{x:0,y:0},{x:0,y:height},{x:width,y:height},{x:width,y:0}],children:[]},parts,
    config:{clipperScale:10000000,curveTolerance:.3,spacing:0,rotations:4,populationSize:10,mutationRate:10,useHoles:false,exploreConcave:false}},
    totalArea:total,areaLowerBound:Math.ceil(total/(width*height))};
}
function svg(job) {
  const {bin,parts}=job.geometry;const h=bin.points[1].y;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ${Math.max(h,Math.ceil(parts.length/6)*85)}"><rect id="bin" width="150" height="${h}" fill="none" stroke="black"/>${parts.map((p,i)=>`<polygon id="part-${p.id}" transform="translate(${170+i%6*70} ${Math.floor(i/6)*85})" points="${p.points.map(v=>`${v.x},${v.y}`).join(' ')}" fill="#77aacc" stroke="#234"/>`).join('')}</svg>`;
}
module.exports={rng,area,makeJob,svg};
