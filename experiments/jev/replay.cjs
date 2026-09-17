'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {performance} = require('node:perf_hooks');
const root = path.resolve(__dirname,'../..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const plain = value => JSON.parse(JSON.stringify(value));

// Extract the original NFP callback, rather than reimplementing its geometry.
function nfpFunction(source) {
  const start = '\t\t\tp.map(function(pair){';
  const end = '\t\t\t}).then(function(generatedNfp){';
  assert.equal(source.split(start).length,2,'NFP callback seam changed');
  assert.equal(source.split(end).length,2,'NFP callback seam changed');
  return '(function(pair){'+source.split(start)[1].split(end)[0]+'})';
}
function overrideSource(source) {
  const seam = 'if(capture){ finishDecision(decision); }';
  assert.equal(source.split(seam).length,3,'Expected exactly two placement decision seams');
  // Only this isolated VM copy changes. The browser worker file stays untouched.
  return source.split(seam).join(`if(capture){
    if(global.env.override && decision.id === global.env.override.decisionId){
      global.env.checkDecision(decision);
      var replayCandidate = decision.candidates.filter(function(c){ return c.id === global.env.override.candidateId; })[0];
      if(!replayCandidate) throw new Error('Override candidate is absent');
      position = {x:replayCandidate.x, y:replayCandidate.y, id:path.id, rotation:path.rotation};
      if(placed.length){ position.nfp = combinedNfp; minwidth = replayCandidate.width; }
      decision.selectedCandidateId = replayCandidate.id;
      global.env.overrideApplied++;
    }
    finishDecision(decision);
  }`);
}
function hydrate(part) {
  const points = part.points.map(p => ({x:p.x,y:p.y}));
  Object.assign(points,{id:part.id,source:part.source});
  if(part.children?.length) points.children = part.children.map(hydrate);
  return points;
}
function makeEngine(geometry,snapshot) {
  const context = vm.createContext({console:{log(){}},performance,navigator:{userAgent:'chrome',appName:'Netscape'}});
  vm.runInContext('var self=this; var window=this; var global={};',context);
  for(const file of ['util/clipper.js','util/geometryutil.js','util/placementworker.js','benchmarks/runner.js']) vm.runInContext(read(file),context);
  const bin = hydrate(geometry.bin);
  const parts = snapshot.inputParts.map(p => {
    const shape = geometry.parts.find(g => g.id === p.id);
    assert.ok(shape,'Missing baseline geometry for part '+p.id);
    return Object.assign(hydrate(shape),{rotation:p.rotation});
  });
  const config = {...geometry.config,captureCandidates:true};
  context.global.env = {searchEdges:config.exploreConcave,useHoles:config.useHoles};
  const generate = vm.runInContext(nfpFunction(read('svgnest.js')),context);
  const cache = {};
  const started = performance.now();
  for(let i=0;i<parts.length;i++) {
    const B = parts[i];
    const pairs = [{A:bin,B,key:{A:-1,B:B.id,inside:true,Arotation:0,Brotation:B.rotation}}];
    for(let j=0;j<i;j++) pairs.push({A:parts[j],B,key:{A:parts[j].id,B:B.id,inside:false,Arotation:parts[j].rotation,Brotation:B.rotation}});
    for(const pair of pairs) {
      const nfp = generate(pair);
      if(nfp) cache[JSON.stringify(nfp.key)] = nfp.value;
    }
  }
  const nfpRuntimeMs = performance.now()-started;
  function run(override=null) {
    const worker = new context.PlacementWorker(bin,parts,[],[],config,structuredClone(cache));
    context.global.env = {self:worker,override,overrideApplied:0,checkDecision:actual => {
      const expected = snapshot.decisions.find(d => d.id === override.decisionId);
      assert.ok(expected,'Unknown source decision');
      const normalize = d => {const copy = plain(d); copy.candidates = copy.candidates.map(({selected,...c}) => c); return copy;};
      assert.deepEqual(normalize(actual),normalize(expected),'Geometry/state diverged before requested intervention');
    }};
    const fn = override ? vm.runInContext('('+overrideSource(worker.placePaths.toString())+')',context) : worker.placePaths;
    const began = performance.now();
    const result = fn(structuredClone(parts));
    const placementRuntimeMs = performance.now()-began;
    if(override) assert.equal(context.global.env.overrideApplied,1,'Override must apply exactly once');
    const output = plain({fitness:result.fitness,area:result.area,placements:result.instrumentation.placements,
      unplaced:result.paths.map(p => ({id:p.id,rotation:p.rotation}))});
    const validation = plain(context.validateGeometry(output,geometry));
    assert.ok(validation.valid,JSON.stringify(validation.violations));
    const trace = plain(result.instrumentation);
    if(override) trace.policy = 'single-recorded-choice-then-classic';
    return {result:output,metrics:trace.metrics,decisions:trace.decisions,validation,nfpRuntimeMs,placementRuntimeMs};
  }
  return {run};
}
function renderSheets(result,geometry) {
  const colors = ['#3478be','#e79d36','#4da786','#b65b79','#7d6cc4'];
  const b = geometry.bin.points;
  const minX = Math.min(...b.map(p => p.x)), minY = Math.min(...b.map(p => p.y));
  const width = Math.max(...b.map(p => p.x))-minX, height = Math.max(...b.map(p => p.y))-minY;
  return result.placements.map(bin => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="800" height="${800*height/width}"><polygon points="${b.map(p => `${p.x},${p.y}`).join(' ')}" fill="#f5f7fa" stroke="#526071" stroke-width="0.25"/>${bin.map(p => {
    const shape = geometry.parts.find(g => g.id === p.id);
    return `<g transform="translate(${p.x} ${p.y}) rotate(${p.rotation})"><polygon points="${shape.points.map(v => `${v.x},${v.y}`).join(' ')}" fill="${colors[p.id%colors.length]}" stroke="#263646" stroke-width="0.25"><title>Part ${p.id}</title></polygon></g>`;
  }).join('')}</svg>`);
}
module.exports = {makeEngine,renderSheets};
