'use strict';
const {area}=require('./corpus.cjs');
const {MODEL}=require('../offline.cjs');
const round=x=>Math.round(x*1e4)/1e4;
function rotate(points,degrees) {const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return points.map(p=>({x:p.x*c-p.y*s,y:p.x*s+p.y*c}));}
function inside(p,poly) {let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++) {const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x) hit=!hit;}return hit;}
function edges(poly) {return poly.map((a,i)=>[a,poly[(i+1)%poly.length]]);}
function contact(poly,otherEdges) {
  let total=0;
  for(const [a,b] of edges(poly)) {const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(!len)continue;
    for(const [c,d] of otherEdges) {
      if(Math.abs(dx*(c.y-a.y)-dy*(c.x-a.x))>len*1e-3||Math.abs(dx*(d.y-a.y)-dy*(d.x-a.x))>len*1e-3)continue;
      const u=((c.x-a.x)*dx+(c.y-a.y)*dy)/len,v=((d.x-a.x)*dx+(d.y-a.y)*dy)/len;
      total+=Math.max(0,Math.min(len,Math.max(u,v))-Math.max(0,Math.min(u,v)));
    }
  }return total;
}
function components(mask,n) {const seen=new Uint8Array(mask.length);let count=0,largest=0,tiny=0;
  for(let i=0;i<mask.length;i++) {if(mask[i]||seen[i])continue;count++;let size=0;const queue=[i];seen[i]=1;
    for(let k=0;k<queue.length;k++) {const u=queue[k];size++;const x=u%n,y=Math.floor(u/n);for(const v of [x?u-1:-1,x<n-1?u+1:-1,y?u-n:-1,y<n-1?u+n:-1])if(v>=0&&!mask[v]&&!seen[v]){seen[v]=1;queue.push(v);}}
    largest=Math.max(largest,size);if(size<=2)tiny+=size;
  }return {count,largest,tiny};
}
function features(geometry,d) {
  const n=20,width=geometry.bin.points[2].x,height=geometry.bin.points[1].y;
  const byId=new Map(geometry.parts.map(p=>[p.id,p]));
  const placed=d.placed.map(p=>rotate(byId.get(p.id).points,p.rotation).map(v=>({x:v.x+p.x,y:v.y+p.y})));
  const part=rotate(byId.get(d.partId).points,d.rotation),otherEdges=[...edges(geometry.bin.points),...placed.flatMap(edges)];
  const cells=Array.from({length:n*n},(_,i)=>({x:(i%n+.5)*width/n,y:(Math.floor(i/n)+.5)*height/n}));
  const base=cells.map(v=>placed.some(p=>inside(v,p))?1:0),cellArea=width*height/(n*n);
  const rows=d.candidates.map(c=>{
    const poly=part.map(v=>({x:v.x+c.x,y:v.y+c.y})),mask=base.map((b,i)=>b||inside(cells[i],poly)?1:0),regions=components(mask,n);
    return {id:c.id,x:c.x,y:c.y,width:c.width,height:c.height,boundingScore:c.score,
      contactLength:contact(poly,otherEdges),freeRegions:regions.count,largestFreeRegionArea:regions.largest*cellArea,tinyFreeArea:regions.tiny*cellArea};
  });
  return {rows,state:{representation:'full-concave-v1',units:'SVG units, x right and y down. Polygon coordinates already rotated; candidate x/y is translation.',
    sheet:[width,height],binIndex:d.binIndex,currentPartId:d.partId,
    currentPart:part.map(p=>[round(p.x),round(p.y)]),
    placed:placed.map(p=>p.map(v=>[round(v.x),round(v.y)])),
    remaining:d.remaining.filter(p=>p.id!==d.partId).map(p=>({id:p.id,area:round(p.area),outline:rotate(byId.get(p.id).points,p.rotation).map(v=>[round(v.x),round(v.y)])})),
    freeSpaceGrid:base.reduce((out,v,i)=>{if(i%n===0)out.push('');out[out.length-1]+=v?'#':'.';return out;},[]),
    gridLegend:'20x20 cell-centre samples. # occupied, . free. Approximate: narrow gaps and small cavities can be missed. Region metrics are approximate, not fit guarantees.',
    candidateColumns:['id','x','y','width','height','boundingScore','contactLength','freeRegions','largestFreeRegionArea','tinyFreeArea']}};
}
function requestsFor(f,rows=f.rows,model=MODEL) {
  const instructions='Choose the legal placement most likely to minimise final sheet count for ALL remaining parts, then occupied width. Every option is geometrically legal. Preserve usable space for the actual remaining outlines; consider interlocking concavities, contact length, compactness and fragmentation together. A lower bounding score is only a greedy proxy and may be worse long term. Grid-derived metrics are approximate. Do not judge geometric validity or invent coordinates. Pick exactly one supplied ID.';
  function request(batch) {return {model,state:{...f.state,candidates:batch.map(r=>f.state.candidateColumns.map(k=>typeof r[k]==='number'?round(r[k]):r[k]))},questions:{placement:{type:'choice',instructions,criteria:Object.fromEntries(batch.map(r=>[r.id,'Place at candidate '+r.id+'; see its feature row and the shared geometry.']))}}};}
  const groups=[];let batch=[];
  for(const row of rows) {
    const next=[...batch,row];
    if(next.length>255||Buffer.byteLength(JSON.stringify(request(next)))>16384) {if(!batch.length)throw new Error('Geometry alone exceeds request size cap');groups.push(request(batch));batch=[row];}
    else batch=next;
  }
  if(batch.length) {const r=request(batch);if(Buffer.byteLength(JSON.stringify(r))>16384)throw new Error('Geometry exceeds request size cap');groups.push(r);}
  return groups;
}
function contactChoice(f) {return f.rows.slice().sort((a,b)=>a.freeRegions-b.freeRegions||a.tinyFreeArea-b.tinyFreeArea||a.boundingScore-b.boundingScore||b.contactLength-a.contactLength||a.x-b.x)[0].id;}
module.exports={features,requestsFor,contactChoice};
