'use strict';
// Read-only audit of a completed v1 archive. No API calls or nesting searches.
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {unzipSync} = require('fflate');
const {createEngine} = require('../experiments/jev/full/engine.cjs');
const [archive, output] = process.argv.slice(2);
assert.ok(archive, 'Usage: node scripts/audit-full-results.cjs results.zip [audit.json]');
const bytes = fs.readFileSync(archive);
const files = unzipSync(bytes, {filter: entry => entry.name.endsWith('.json')});
const json = name => JSON.parse(Buffer.from(files[name]).toString('utf8'));
const metadata = json('metadata.json'), summary = json('summary.json');
const trials = Object.keys(files).filter(n => /^trials\/[^/]+\.json$/.test(n)).map(json);
const median = xs => {const a = xs.slice().sort((a,b) => a-b); return (a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2;};
const quality = (a,b) => Math.sign(a.unplaced-b.unplaced || a.bins-b.bins);
const tally = (o, cmp) => o[cmp < 0 ? 'wins' : cmp > 0 ? 'losses' : 'ties']++;
const newTally = () => ({wins:0, ties:0, losses:0});
assert.equal(trials.length, metadata.expectedTrials);
assert.equal(new Set(trials.map(t => `${t.job}:${t.seed}`)).size, trials.length);
const counts = newTally(), secondary = newTally(), versusClassic = newTally();
const pairs = [], changed = [], reconstructed = [], jobs = new Set();
const usage = {calls:0, inputTokens:0, outputTokens:0, decisions:0};
let validations = 0, apiMs = 0, jevMs = 0;
for (const t of trials) {
  jobs.add(t.job);
  const geometry = json(`${t.job}-seed-${t.seed}/geometry.json`).geometry;
  assert.equal(geometry.parts.length, t.partCount);
  const engine = createEngine(geometry, t.seed);
  for (const p of ['classic','contact','ga','jev']) {
    assert.ok(t[p].validation.valid);
    const result = t[p].result, placements = result.placements.flat();
    assert.equal(new Set(placements.map(p => p.id)).size, placements.length);
    assert.equal(result.unplaced.length, 0);
    assert.equal(placements.length, geometry.parts.length);
    assert.ok(engine.validate(result).valid);
    validations++;
  }
  const j = t.jev, g = t.ga, target = j.metrics;
  const completed = g.trace.filter(r => r.elapsedMs <= j.runtimeMs);
  assert.ok(completed.length);
  const atDeadline = completed.at(-1);
  assert.deepEqual(atDeadline, g.atJevBudget);
  const firstMatch = g.trace.find(r => quality(r.metrics,target) <= 0)?.elapsedMs ?? null;
  assert.equal(firstMatch, g.timeToJevQualityMs);
  tally(counts, quality(target, atDeadline.metrics));
  tally(versusClassic, quality(target, t.classic.metrics));
  const difference = target.fitness-atDeadline.metrics.fitness;
  tally(secondary, quality(target, atDeadline.metrics) || (Math.abs(difference)>1e-9 ? Math.sign(difference) : 0));
  if (firstMatch !== null) pairs.push({gaMs:firstMatch, jevMs:j.runtimeMs});
  if (target.bins !== atDeadline.metrics.bins) changed.push({job:t.job, seed:t.seed, jevBins:target.bins, gaBins:atDeadline.metrics.bins});
  if (j.timingReconstructed) reconstructed.push({job:t.job, seed:t.seed, cachedCalls:j.cachedCalls});
  usage.calls += j.calls; usage.inputTokens += j.inputTokens;
  usage.outputTokens += j.outputTokens; usage.decisions += j.decisionCount;
  apiMs += j.apiMs; jevMs += j.runtimeMs;
}
for (const key of ['wins','ties','losses']) assert.equal(counts[key], summary.pairedAgainstGaAtJevBudget[key]);
const audit = {
  archiveSha256:crypto.createHash('sha256').update(bytes).digest('hex'),
  trials:trials.length, distinctJobs:jobs.size, finalLayoutsRevalidated:validations,
  allPartsPlaced:true, equalTimeSheetCount:counts, versusClassicSheetCount:versusClassic,
  withSvgNestFitnessTiebreak:secondary,
  timeToSameSheetCount:{comparableTrials:pairs.length,
    gaEarlier:pairs.filter(p=>p.gaMs<p.jevMs).length,
    jevEarlier:pairs.filter(p=>p.jevMs<p.gaMs).length,
    gaDidNotReachWithinRecordedRun:trials.length-pairs.length,
    medianGaMs:median(pairs.map(p=>p.gaMs)), medianJevMs:median(pairs.map(p=>p.jevMs)),
    medianPairedJevOverGa:median(pairs.map(p=>p.jevMs/p.gaMs))},
  usage, totalApiMs:apiMs, totalJevMs:jevMs, apiRuntimeShare:apiMs/jevMs,
  changedSheetCounts:changed, reconstructedTrials:reconstructed,
  notes:[
    'Time-to-quality here means all parts placed with no more sheets; it does not require equal occupied width.',
    'Secondary fitness comparison uses the original SVGnest scalar fitness with 1e-9 tie tolerance.',
    'Revalidation uses the existing authoritative geometry validator, not a separate geometry implementation.',
    'Archive error.json is historical when 100 trials and finishedAt are present.',
    'Token totals cover accepted calls; no currency cost is inferred without the applicable pricing.'
  ]
};
const text = JSON.stringify(audit,null,2)+'\n';
if (output) fs.writeFileSync(output,text);
process.stdout.write(text);
