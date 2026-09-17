// No dependencies. The preserved Git revision is the oracle, not a copied heuristic.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {performance} = require('node:perf_hooks');
const root = path.resolve(__dirname, '..');
const baseline = 'd977198';
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const old = name => execFileSync('git', ['show', `${baseline}:${name}`], {cwd: root, encoding:'utf8'});
const originalWorker = old('util/placementworker.js');
const originalNest = old('svgnest.js');
const workerSource = read('util/placementworker.js');
const nestSource = read('svgnest.js');
const plain = value => JSON.parse(JSON.stringify(value));
function rng(seed) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
}
function context(worker = workerSource, seed = 1) {
  const c = vm.createContext({console: {log(){}}, performance,
    navigator: {userAgent:'chrome', appName:'Netscape'}});
  vm.runInContext('var self = this; var window = this; var global = {};', c);
  for (const file of ['util/clipper.js', 'util/geometryutil.js']) vm.runInContext(read(file), c);
  vm.runInContext(worker, c);
  c.MathRandom = rng(seed);
  vm.runInContext('Math.random = MathRandom;', c);
  return c;
}
function polygon(points, id, rotation = 0) {
  return Object.assign(points.map(([x,y]) => ({x,y})), {id, source:id, rotation});
}
function rect(w,h,id,rotation = 0) {
  return polygon([[0,0],[0,h],[w,h],[w,0]],id,rotation);
}
function normalize(c, p) {
  if(c.GeometryUtil.polygonArea(p) > 0) p.reverse();
  return p;
}
const config = {clipperScale:10000000, curveTolerance:0.3, spacing:0, rotations:4,
  populationSize:10, mutationRate:10, useHoles:false, exploreConcave:false};

// Use real launchWorkers, NFP generation, Clipper, GA, and placement selection.
// Only transport and the SVG display are replaced. Like Parallel, compile the
// callback from its source with a JSON-serialized environment and cloned input.
function integration(fixture, capture, original = false, seed = 1, evaluations = 1, observer = null) {
  const source = original ? originalWorker : workerSource;
  const c = context(source, seed);
  const outputs = [], snapshots = [], scoredBounds = [];
  c.Parallel = class {
    constructor(data, options) { this.data = data; this.options = options; }
    require() { return this; }
    map(fn) {
      const worker = context(source);
      worker.global.env = plain(this.options.env);
      if(this.options.env.self) {
        const bounds = [];
        scoredBounds.push(bounds);
        const getBounds = worker.GeometryUtil.getPolygonBounds;
        worker.GeometryUtil.getPolygonBounds = points => {
          const result = getBounds(points);
          bounds.push(plain(result));
          return result;
        };
      }
      const callback = vm.runInContext(`(${fn.toString()})`, worker);
      const values = this.data.map(d => structuredClone(callback(structuredClone(d))));
      if(this.options.env.self) outputs.push(values[0]);
      return {then: resolve => resolve(values)};
    }
  };
  c.SvgParser = {config(){}};
  vm.runInContext(original ? originalNest : nestSource, c);
  c.SvgNest.applyPlacement = () => [];
  c.SvgNest.onPlacementEvaluation = snapshot => { snapshots.push(snapshot); if(observer) observer(snapshot); };
  const cfg = {...config, captureCandidates:capture};
  const bin = normalize(c, rect(fixture.width || 100, fixture.height || 80, -1));
  const tree = structuredClone(fixture.parts).map(p => normalize(c,p));
  for(let i=0; i<evaluations; i++) c.SvgNest.launchWorkers(tree, bin, cfg, () => {}, () => {});
  assert.equal(outputs.length,evaluations, 'every evaluation completed');
  return {outputs, snapshots, scoredBounds, c, tree};
}
function withoutLog(result) {
  const copy = structuredClone(result);
  delete copy.instrumentation;
  return copy;
}
function near(actual, expected) {
  assert.ok(Math.abs(actual-expected) < 1e-7, `${actual} != ${expected}`);
}
let decisions = 0, candidates = 0, ties = 0;
function validate(result, c, parts) {
  const log = result.instrumentation;
  assert.ok(log);
  assert.deepEqual(plain(log), plain(structuredClone(log)), 'JSON exportable');
  const ids = new Set();
  const selected = [];
  for(const d of log.decisions) {
    decisions++;
    assert.equal(d.placedPartCount, d.placed.length);
    let winner = null;
    for(const candidate of d.candidates) {
      candidates++;
      assert.ok(!ids.has(candidate.id)); ids.add(candidate.id);
      if(parts) {
        const points = d.placed.concat([{id:d.partId, rotation:d.rotation, x:candidate.x, y:candidate.y}]).flatMap(p =>
          c.rotatePolygon(parts.find(part => part.id === p.id),p.rotation).map(v => ({x:v.x+p.x,y:v.y+p.y})));
        near(candidate.width,Math.max(...points.map(p => p.x))-Math.min(...points.map(p => p.x)));
        near(candidate.height,Math.max(...points.map(p => p.y))-Math.min(...points.map(p => p.y)));
      }
      near(candidate.score, 2*candidate.width+candidate.height);
      near(candidate.widthGrowth, candidate.width-d.currentBounds.width);
      near(candidate.heightGrowth, candidate.height-d.currentBounds.height);
      near(candidate.binUtilisation, (d.placedArea+d.partArea)/result.area);
      assert.equal(candidate.partId,d.partId);
      assert.equal(candidate.rotation,d.rotation);
      assert.equal(candidate.selected, candidate.id === d.selectedCandidateId);
      const first = d.placedPartCount === 0;
      assert.equal(candidate.selectionScore, first ? candidate.x : candidate.score);
      if(winner && (first ? candidate.x === winner.x : c.GeometryUtil.almostEqual(candidate.score,winner.score))) ties++;
      if(!winner || (first ? candidate.x < winner.x :
        candidate.score < winner.score || (c.GeometryUtil.almostEqual(candidate.score,winner.score) && candidate.x < winner.x))) winner = candidate;
    }
    assert.equal(d.selectedCandidateId, winner ? winner.id : null);
    assert.equal(d.candidates.filter(x => x.selected).length, winner ? 1 : 0);
    if(winner) {
      selected.push(winner);
      const placement = result.placements[d.binIndex].find(p => p.id === d.partId);
      assert.ok(placement);
      assert.equal(placement.x,winner.x); assert.equal(placement.y,winner.y);
      assert.equal(placement.rotation,winner.rotation);
    }
  }
  const m = log.metrics;
  assert.equal(m.placedPartCount, result.placements.flat().length);
  assert.equal(m.unplacedPartCount, result.paths.length);
  assert.equal(m.binsUsed,result.placements.length);
  assert.equal(m.fitness,result.fitness);
  near(m.placedArea, selected.reduce((sum,c) => sum+c.partArea,0));
  if(m.binsUsed) near(m.utilisation, m.placedArea/(m.binsUsed*result.area));
  else assert.equal(m.utilisation,null);
  assert.ok(Number.isFinite(m.placementRuntimeMs) && m.placementRuntimeMs >= 0);
}
const fixtures = [
  {name:'empty', parts:[]},
  {name:'first-part-ties', parts:[rect(20,10,0)]},
  {name:'rectangles', parts:[rect(30,20,0),rect(20,25,1),rect(40,10,2),rect(20,20,3)]},
  {name:'multiple-bins', width:40, height:35, parts:[rect(28,25,0),rect(29,24,1),rect(30,26,2)]},
  {name:'unplaceable', parts:[rect(200,200,0),rect(20,10,1),rect(10,15,2)]},
  {name:'all-unplaceable', parts:[rect(200,200,0)]},
  {name:'concave', parts:[polygon([[0,0],[40,0],[40,10],[10,10],[10,40],[0,40]],0),
    polygon([[0,0],[30,0],[15,25]],1),rect(12,28,2),rect(18,16,3)]}
];
for(let seed=1; seed<=16; seed++) {
  const rand = rng(seed);
  fixtures.push({name:`seed-${seed}`, parts:Array.from({length:8}, (_,i) =>
    i%3 ? rect(8+Math.floor(rand()*50),8+Math.floor(rand()*35),i) :
    polygon([[0,0],[12+rand()*25,0],[9+rand()*12,20+rand()*15],[0,12]],i))});
}
for(const fixture of fixtures) {
  const seed = 718;
  const count = fixture.name === 'rectangles' ? 12 : 1; // crosses a GA generation
  const original = integration(fixture,false,true,seed,count);
  const disabled = integration(fixture,false,false,seed,count);
  const enabled = integration(fixture,true,false,seed,count);
  assert.equal(enabled.snapshots.length,count);
  for(let i=0; i<count; i++) {
    assert.deepEqual(disabled.outputs[i], original.outputs[i], `${fixture.name}: disabled vs original`);
    assert.deepEqual(withoutLog(enabled.outputs[i]),original.outputs[i], `${fixture.name}: enabled vs original`);
    validate(enabled.outputs[i],enabled.c,enabled.tree);
    const loggedBounds = enabled.outputs[i].instrumentation.decisions.filter(d => d.placedPartCount > 0)
      .flatMap(d => d.candidates.map(c => ({width:c.width,height:c.height})));
    assert.deepEqual(loggedBounds,original.scoredBounds[i].map(b => ({width:b.width,height:b.height})),
      'every bounding-box candidate in the original worker is captured in order');
    assert.equal(enabled.snapshots[i].evaluationId,i);
  }
  assert.equal(disabled.snapshots.length,0);
  const copy = enabled.c.SvgNest.getLastPlacementEvaluation();
  copy.decisions.length = 0;
  assert.equal(enabled.c.SvgNest.getLastPlacementEvaluation().decisions.length,enabled.outputs.at(-1).instrumentation.decisions.length);
  console.log(`PASS ${fixture.name} (${count} evaluation${count === 1 ? '' : 's'})`);
}

// Direct seam cases not normally produced by valid SVG input.
function direct(source, input, capture, serialized = true) {
  const c = context(source);
  const cfg = {...config, captureCandidates:capture};
  const w = new c.PlacementWorker(input.bin, input.paths,[],[],cfg,input.cache);
  c.global.env = serialized ? plain({self:w}) : {self:w};
  const fn = vm.runInContext(`(${w.placePaths.toString()})`,c);
  const before = structuredClone(input);
  const output = structuredClone(fn(structuredClone(input.paths)));
  assert.deepEqual(input,before,'caller inputs unchanged');
  return {output,c};
}
function inner(id,rotation=0) { return JSON.stringify({A:-1,B:id,inside:true,Arotation:0,Brotation:rotation}); }
function outer(a,b) { return JSON.stringify({A:a,B:b,inside:false,Arotation:0,Brotation:0}); }
const bin = rect(100,80,-1);
const disconnected = {bin, paths:[rect(20,10,0,90)],cache:{
  [inner(0,90)]:[[{x:20,y:40},{x:10,y:60},{x:10,y:20}],[{x:30,y:10},{x:40,y:10},{x:30,y:20}]]}};
const missing = {bin, paths:[rect(20,10,0),rect(20,10,1)],cache:{
  [inner(0)]:[rect(80,70)], [inner(1)]:[rect(80,70)]}};
const tiny = {bin, paths:[rect(20,10,0),rect(1,1,1)],cache:{
  [inner(0)]:[rect(80,70)], [inner(1)]:[rect(1,1)], [outer(0,1)]:[polygon([[50,50],[50,60],[60,60],[60,50]])]}};
for(const [name,input] of Object.entries({disconnected,missing,tiny,missingBin:{bin:null,paths:[],cache:{}}})) {
  const a = direct(originalWorker,input,false);
  for(const capture of [false,true]) {
    const b = direct(workerSource,input,capture);
    assert.deepEqual(b.output && withoutLog(b.output),a.output,name);
    if(capture && b.output) validate(b.output,b.c);
  }
  console.log(`PASS ${name}`);
}
const first = direct(workerSource,disconnected,true).output.instrumentation.decisions[0];
assert.equal(first.candidates.length,6,'every inner-NFP vertex logged without deduplication');
assert.equal(first.selectedCandidateId,'d0:c1','equal X keeps first encountered, not smallest Y');
assert.ok(direct(workerSource,tiny,true).output.instrumentation.decisions.some(d => !d.candidates.length && d.selectedCandidateId === null));
assert.ok(ties > 0,'tie-breaking was exercised');
const faultyObserver = integration(fixtures[2],true,false,718,2,snapshot => {
  snapshot.decisions.length = 0;
  throw new Error('test observer error');
});
assert.equal(faultyObserver.c.SvgNest.working,false);
assert.ok(faultyObserver.c.SvgNest.getLastPlacementEvaluation().decisions.length > 0);
const api = faultyObserver.c.SvgNest;
assert.equal(api.config().captureCandidates,false,'default is disabled');
api.config({captureCandidates:true});
assert.equal(api.config().captureCandidates,true);
assert.equal(api.getLastPlacementEvaluation(),null,'config resets snapshot');
api.config({captureCandidates:false});
assert.equal(api.config().captureCandidates,false);
console.log('PASS observer isolation and config API');
console.log(`Verified ${decisions} decisions and ${candidates} candidates (${ties} tie comparisons).`);
