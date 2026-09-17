'use strict';
// Build a static, offline input catalogue. This does not run or inspect nesting outcomes.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../experiments/jev/production/corpus');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const families=[...new Set(manifest.jobs.map(j=>j.family))];
const cards=families.map(family=>{
 const items=manifest.jobs.filter(j=>j.family===family),job=JSON.parse(fs.readFileSync(path.join(root,items[0].file))),cols=5;
 const tiles=job.parts.map((p,i)=>{
  const xs=p.points.map(v=>v[0]),ys=p.points.map(v=>v[1]),minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX,h=Math.max(...ys)-minY,scale=Math.min(125/w,95/h);
  return `<g transform="translate(${(i%cols)*160} ${Math.floor(i/cols)*140})"><rect width="152" height="132" rx="8" fill="#223345"/><g transform="translate(12 10) scale(${scale}) translate(${-minX} ${-minY})"><polygon points="${p.points.map(v=>v.join(',')).join(' ')}" fill="#72bbd5"/></g><text x="9" y="119" fill="#fff" font-size="11">${esc(p.key)} · ${w.toFixed(0)} × ${h.toFixed(0)} mm</text></g>`;
 }).join('');
 return `<section><h2>${esc(family)} <small>${esc(job.split)}</small></h2><p>${esc(job.provenance.description)}</p><svg role="img" aria-label="Input outlines for ${esc(family)}" viewBox="0 0 800 ${Math.ceil(job.parts.length/cols)*140}">${tiles}</svg><p>Each thumbnail fits its own box; sizes are labelled. These are input contours, not nesting results.</p><p>${items.map(j=>`<a href="${esc(j.file)}">${j.parts} parts · ${j.media}</a>`).join(' · ')}</p><p><a href="sources/${family}.xml">Original contours and problem</a> · <a href="sources/${family}-readme.txt">Source reference</a></p></section>`;
}).join('');
fs.writeFileSync(path.join(root,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>JevNest reference corpus</title><style>body{max-width:1000px;margin:36px auto;padding:0 20px;background:#142130;color:#e8edf5;font:16px system-ui}p{line-height:1.55}a{color:#91d2ef}section{padding:24px 0;border-top:1px solid #536273}small{color:#f8c971;font-size:16px}svg{width:100%;max-width:800px}</style><h1>Search-policy benchmark inputs</h1><p>84 adapted jobs from 14 published ESICUP families: 100, 250 and 500 copies on sheets and rolls. Geometry is rescaled; quantity, spacing and media changes are recorded in each JSON. These are not customer print-production files or unmodified reference instances.</p><p>Development: shirts, albano, blaz. Other source families are held out for evaluation. <a href="sources/LICENSE">CC0 licence</a> · <a href="manifest.json">Manifest</a>.</p>${cards}</html>`);
console.log(path.join(root,'index.html'));
