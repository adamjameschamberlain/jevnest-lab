#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const manifestPath = path.join(root,'benchmarks/corpus/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const args = process.argv.slice(2);
const options = {evaluations:manifest.defaults.evaluations,seeds:manifest.defaults.seeds,timeoutMs:180000};
for(let i=0;i<args.length;i++) {
  const arg = args[i];
  if(arg === '--help') {
    console.log('Classic SVG corpus: node scripts/run-corpus.cjs [--evaluations N] [--seed N[,N]] [--case ID] [--out DIRECTORY] [--timeout-ms N]\nDefault: five SVGs, seeds 1 and 42, 20 evaluations per pass, logging off/on.');
    process.exit(0);
  }
  if(!['--evaluations','--seed','--case','--out','--timeout-ms'].includes(arg) || !args[i+1]) throw new Error('Unknown/incomplete option: '+arg);
  const value = args[++i];
  if(arg === '--evaluations') options.evaluations = Number(value);
  if(arg === '--seed') options.seeds = value.split(',').map(Number);
  if(arg === '--case') options.caseId = value;
  if(arg === '--out') options.out = value;
  if(arg === '--timeout-ms') options.timeoutMs = Number(value);
}
assert.ok(Number.isInteger(options.evaluations) && options.evaluations > 0,'evaluations must be a positive integer');
assert.ok(Number.isInteger(options.timeoutMs) && options.timeoutMs > 0,'timeout must be a positive integer');
assert.ok(options.seeds.every(n => Number.isInteger(n) && n >= 0 && n <= 0xffffffff),'seeds must be uint32 integers');
options.seeds = [...new Set(options.seeds)];
const cases = manifest.cases.filter(c => !options.caseId || c.id === options.caseId);
assert.ok(cases.length,'Unknown corpus case: '+options.caseId);
for(const c of cases) assert.match(c.id,/^[a-z0-9-]+$/);
const out = path.resolve(options.out || path.join(root,'benchmark-results',new Date().toISOString().replace(/[:.]/g,'-')));
if(fs.existsSync(out) && fs.readdirSync(out).length) throw new Error('Output directory must be empty: '+out);
fs.mkdirSync(out,{recursive:true});
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const json = (file,value) => fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
function git(...args) {try {return execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();} catch {return null;}}
const sources = ['svgnest.js','svgparser.js','util/placementworker.js','util/geometryutil.js','util/clipper.js',
  'util/parallel.js','util/json.js','util/eval.js','util/pathsegpolyfill.js','util/matrix.js','util/domparser.js',
  'benchmarks/runner.html','benchmarks/runner.js','scripts/run-corpus.cjs','benchmarks/corpus/manifest.json'];
const metadata = {schemaVersion:1,policy:'classic',startedAt:new Date().toISOString(),
  repositoryRevision:git('rev-parse','HEAD'),workingTreeDirty:Boolean(git('status','--porcelain')),
  sourceSha256:Object.fromEntries(sources.map(p => [p,hash(fs.readFileSync(path.join(root,p)))])),
  seedAlgorithm:'LCG uint32: state = 1664525 * state + 1013904223; random = state / 2^32',
  evaluations:options.evaluations,seeds:options.seeds,maxWorkers:manifest.defaults.maxWorkers,
  config:manifest.defaults.config,platform:process.platform,arch:process.arch,node:process.version,
  cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length,
  timing:'Two measured cold-page passes per case/seed; alternating order. No warmup or repeated timing samples. Wall time includes 100ms scheduling, rendering and capture. Evaluation sums exclude scheduling waits and adapter export. Validation runs after timing.',
  areaConvention:'worker outer polygons, including spacing offsets; no hole subtraction. Corpus uses spacing=0 and no holes.',
  corpus:cases.map(c => ({...c,sha256:hash(fs.readFileSync(path.join(root,'benchmarks/corpus',c.file)))}))};
json(path.join(out,'metadata.json'),metadata);
function escape(s) {return String(s).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function writeReports(rows) {
  json(path.join(out,'summary.json'),rows);
  const columns = ['case','seed','evaluations','parts','placed','unplaced','bins','utilisation','fitness','classicWallMs','captureWallMs','classicEvaluationMs','captureEvaluationMs','decisions','candidates','identical','geometryValid'];
  fs.writeFileSync(path.join(out,'summary.csv'),columns.join(',')+'\n'+rows.map(r => columns.map(c => r[c] ?? '').join(',')).join('\n')+'\n');
  const body = rows.map(r => `<tr><td><a href="${r.directory}/best.json">${escape(r.case)}</a></td><td>${r.seed}</td><td>${r.bins}</td><td>${(100*r.utilisation).toFixed(2)}%</td><td>${r.placed}/${r.parts}</td><td>${(r.classicWallMs/1000).toFixed(2)} s</td><td>${(r.captureWallMs/1000).toFixed(2)} s</td><td>${r.candidates.toLocaleString()}</td><td>${r.identical && r.geometryValid ? 'PASS' : 'FAIL'}</td><td>${Array.from({length:r.bins},(_,i) => `<a href="${r.directory}/layout-${i+1}.svg">Sheet ${i+1}</a>`).join(' · ')}</td></tr>`).join('\n');
  fs.writeFileSync(path.join(out,'report.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Classic SVGnest baseline</title><style>body{font:15px system-ui;background:#101820;color:#e9eef2;margin:40px}h1{font-size:28px}p{max-width:1000px;line-height:1.6;color:#aebfcc}table{border-collapse:collapse;width:100%;margin-top:30px}td,th{text-align:left;padding:13px 10px;border-bottom:1px solid #30404e}th{color:#aebfcc}a{color:#72c5ff}.table{overflow:auto}</style><h1>Classic SVGnest baseline</h1><p>${rows.length} completed case/seed pairs · ${options.evaluations} evaluations per pass · identical seeds and evaluation budgets with capture off/on. Synthetic shapes; this is an initial baseline, not evidence of a Jev improvement.</p><p>Utilisation measures placed outer-polygon area / total sheet area. Check the placed count: the overflow case deliberately includes an oversized part. Times are individual measurements on this machine and include browser scheduling; they are not stable performance estimates.</p><div class="table"><table><thead><tr><th>Case</th><th>Seed</th><th>Sheets</th><th>Utilisation</th><th>Placed</th><th>Classic</th><th>With capture</th><th>Candidates</th><th>Checks</th><th>Layouts</th></tr></thead><tbody>${body}</tbody></table></div><p><a href="summary.csv">CSV summary</a> · <a href="summary.json">JSON summary</a> · <a href="metadata.json">Configuration and provenance</a></p></html>`);
}
async function main() {
  let chromium;
  try {({chromium} = require('playwright'));} catch {throw new Error('Install dependencies first: npm.cmd ci (Windows) or npm ci');}
  const server = http.createServer((req,res) => {
    try {
      const url = new URL(req.url,'http://localhost');
      let relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      if(relative === 'benchmark.html') relative = 'benchmarks/runner.html';
      // Serve only the runner and the original engine files, never arbitrary repo files.
      if(!sources.includes(relative)) {res.writeHead(404);res.end();return;}
      res.setHeader('Content-Type',relative.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8');
      res.setHeader('Cache-Control','no-store');
      res.end(fs.readFileSync(path.join(root,relative)));
    } catch {res.writeHead(400);res.end();}
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH || undefined});
    metadata.browser = await browser.version();
    metadata.playwright = require('playwright/package.json').version;
    json(path.join(out,'metadata.json'),metadata);
    const rows = [];
    let pairIndex = 0;
    for(const fixture of cases) for(const seed of options.seeds) {
      const id = `${fixture.id}-seed-${seed}`;
      const directory = path.join(out,id);
      fs.mkdirSync(directory);
      const svg = fs.readFileSync(path.join(root,'benchmarks/corpus',fixture.file),'utf8');
      fs.writeFileSync(path.join(directory,'input.svg'),svg);
      const runs = {};
      const order = pairIndex++ % 2 ? [true,false] : [false,true];
      for(const capture of order) {
        const label = capture ? 'capture' : 'classic';
        process.stdout.write(`${id} ${label}: ${options.evaluations} evaluations... `);
        const context = await browser.newContext();
        try {
          await context.addInitScript(() => {
            window.benchmarkWorkerCount = 0;
            const NativeWorker = window.Worker;
            window.Worker = class extends NativeWorker {
              constructor(...args) {super(...args);window.benchmarkWorkerCount++;}
            };
          });
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror',e => errors.push(e.message));
          await page.goto(`http://127.0.0.1:${server.address().port}/benchmark.html`);
          const job = {...options,svg,seed,capture,binId:fixture.binId,config:manifest.defaults.config,maxWorkers:manifest.defaults.maxWorkers};
          runs[label] = await page.evaluate(job => window.runClassicCorpusCase(job),job);
          assert.equal(errors.length,0,errors.join('\n'));
          assert.ok(runs[label].workerCount > 0,'Real Web Workers must be used');
          assert.equal(runs[label].records.length,options.evaluations);
          json(path.join(directory,`${label}-trace.json`),runs[label].records.map(({snapshot,...record}) => record));
          if(capture) fs.writeFileSync(path.join(directory,'decisions.ndjson'),runs[label].records.map(r => JSON.stringify({inputId:fixture.id,seed,snapshot:r.snapshot})).join('\n')+'\n');
          console.log(`${(runs[label].wallRuntimeMs/1000).toFixed(2)} s`);
        } finally {await context.close();}
      }
      const {classic,capture} = runs;
      const choices = run => run.records.map(r => ({inputOrder:r.inputOrder,result:r.result}));
      assert.deepEqual(choices(classic),choices(capture),`${id}: capture changed an evaluated result`);
      assert.deepEqual(classic.best.result,capture.best.result,`${id}: best results differ`);
      assert.equal(classic.geometry.parts.length,fixture.expectedParts,`${id}: SVG part count changed during import`);
      assert.equal(classic.best.result.unplaced.length,fixture.expectedUnplaced,`${id}: unexpected unplaced parts`);
      assert.equal(classic.best.result.area,fixture.sheet.width*fixture.sheet.height,'sheet area mismatch');
      assert.ok(classic.validation.valid,JSON.stringify(classic.validation));
      assert.ok(capture.validation.valid,JSON.stringify(capture.validation));
      const partArea = id => Math.abs(classic.geometry.parts.find(p => p.id === id).points.reduce((a,p,i,points) => {
        const q = points[(i+1)%points.length]; return a+p.x*q.y-q.x*p.y;
      },0)/2);
      const placedArea = classic.best.result.placements.flat().reduce((sum,p) => sum+partArea(p.id),0);
      const bins = classic.best.result.placements.length;
      const utilisation = bins ? placedArea/(bins*classic.best.result.area) : null;
      const bestSnapshot = capture.records[classic.best.evaluation].snapshot;
      assert.ok(Math.abs(utilisation-bestSnapshot.metrics.utilisation) < 1e-7,'utilisation mismatch');
      const decisions = capture.records.reduce((sum,r) => sum+r.snapshot.decisions.length,0);
      const candidates = capture.records.reduce((sum,r) => sum+r.snapshot.decisions.reduce((n,d) => n+d.candidates.length,0),0);
      const row = {case:fixture.id,seed,evaluations:options.evaluations,parts:fixture.expectedParts,
        placed:classic.best.result.placements.flat().length,unplaced:classic.best.result.unplaced.length,
        bins,placedArea,utilisation,fitness:classic.best.result.fitness,bestEvaluation:classic.best.evaluation,
        classicWallMs:classic.wallRuntimeMs,captureWallMs:capture.wallRuntimeMs,
        classicEvaluationMs:classic.records.reduce((sum,r) => sum+r.evaluationRuntimeMs,0),
        captureEvaluationMs:capture.records.reduce((sum,r) => sum+r.evaluationRuntimeMs,0),
        decisions,candidates,identical:true,geometryValid:true,passOrder:order.map(c => c ? 'capture' : 'classic'),directory:id};
      json(path.join(directory,'best.json'),{...row,result:classic.best.result,validation:classic.validation});
      json(path.join(directory,'geometry.json'),classic.geometry);
      json(path.join(directory,'best-decisions.json'),bestSnapshot);
      classic.best.svgs.forEach((svg,i) => fs.writeFileSync(path.join(directory,`layout-${i+1}.svg`),svg));
      rows.push(row);
      writeReports(rows);
      console.log(`  PASS ${row.placed}/${row.parts} parts, ${bins} sheet(s), ${(100*utilisation).toFixed(2)}% utilisation; ${candidates} candidates`);
    }
    metadata.finishedAt = new Date().toISOString();
    metadata.completed = true;
    json(path.join(out,'metadata.json'),metadata);
    console.log(`\nClassic baseline complete: ${path.join(out,'report.html')}`);
  } finally {
    if(browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => {
  json(path.join(out,'error.json'),{message:error.message,stack:error.stack});
  console.error('\nBenchmark failed:',error.message);
  if(/Executable doesn't exist|browserType.launch/.test(error.message)) console.error('Install Chromium: npm.cmd run benchmark:setup (Windows) or npm run benchmark:setup');
  process.exitCode = 1;
});
