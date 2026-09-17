# Production-scale search-policy experiment (v2)

This is a new experiment, separate from the completed sequential-placement v1
baseline. It tests whether Jev can allocate expensive search more effectively.
It is not a claim that Jev understands geometry or improves production nesting.

## Architecture

All policies first produce the same deterministic initial layout. Thereafter:

1. Generate a reproducible stream of candidate part orders and allowed rotations.
   The stream is independent of Jev's answers and identical for the unranked,
   deterministic-control and Jev methods.
2. For each of four proposals, nest its first 16 parts through the real geometry
   engine. Calculate packing extent, remaining shape quantities and restrictions.
3. For three constrained remaining shape types, compute legal-region fit witnesses
   inside the occupied strip of the last opened sheet, across permitted rotations.
   This is a bounded geometry probe, not a complete search of all remaining parts.
4. Ask Jev three independent Score questions per proposal **in one HTTP request**:
   residual-space usefulness, difficult-part opportunity preservation, and remaining
   order suitability. Every question explicitly references its proposal in the state.
5. Combine normalised scores with fixed weights 0.45 / 0.35 / 0.20. Complete the
   two highest-ranked proposals through deterministic placement and validate them.
6. Keep the best validated layout and repeat until the time or API-call budget ends.

There is no API call per placed part. The model ranks search proposals; original
SVGnest placement arithmetic still chooses legal positions during each rollout.
This is a multi-start proposal-ranking experiment, not beam search, learned NFPs,
or a claim to implement every possible Jev search policy.

`policy.cjs` contains all questions, descriptive levels, weights and limits. These
are initial hypotheses, not tuned or proven weights. Do not change them after
looking at held-out evaluation results. Freeze a revision before that evaluation.

## Geometry and scale

The versioned engine uses the original SVGnest placement worker, NFP callback,
Clipper and validation code. It generates NFPs lazily and reuses them by actual
normalised outline plus orientation rather than copy ID. The 30,000-entry LRU
cache is cold at the start of each policy and retained within that policy. All
four policies receive this implementation, so cache improvements are not credited
to Jev. The original browser code and v1 benchmark are unchanged.

- Units: millimetres. Explicit copies and allowed rotations per shape.
- Spacing: each outline gets half-spacing clearance via a Clipper miter envelope.
  The clearance envelopes are used for both nesting and final validation.
- Margin: an additional inset applied to media. Thus the actual outline has at
  least the declared margin plus half-spacing at the media edge.
- Sheets: place all copies, minimise sheet count, then sum of occupied X extents.
- Rolls: fixed cross-web width in Y, feed direction X, minimise consumed X length.
  A finite conservative length bound guarantees room for a row of all parts.
  This is not a series of fixed-size sheets masquerading as a roll.
- Holes, multipart shapes, unflattened curves and implicit transforms are not
  supported by this importer. Holes and transforms are explicitly rejected. Supply
  simple, closed polygon outlines in JSON; omit the repeated closing vertex.
  No overlap/fit decision is delegated to the model.

## Files and provenance

The bundled manifest contains **84 adapted reference jobs**: 14 ESICUP source
families × 100/250/500 parts × sheet/roll. Source revision, original SHA-256,
original copy quantities, unit scale and modifications are embedded in each job.
The repository's CC0 licence and original reference notes accompany the contours.
Precomputed upstream NFPs and supplied solutions are deliberately excluded.

These are public irregular-nesting references, including textile and artificial
instances, uniformly rescaled to a 1600 mm source strip width. Counts are resampled
proportionally; 3 mm spacing and a 10 mm margin are added. They are **not customer
print jobs and not unmodified instances for comparison with published optima**.
Actual print-production outlines are still needed before making a print-production
performance claim.

Development families: shirts, albano, blaz (18 jobs).
Evaluation families: swim, shapes, mao, dagli, dighe, fu, han, jakobs, marques,
poly, trousers (66 jobs). All counts, media and seeds of a source family stay on
one side of the split. Input/topology validation is allowed on both sides;
policy tuning must use development outcomes only.

The prebuilt JSON files run directly; Python and internet access are not required
for corpus setup. `scripts/build-production-corpus.py` is only for reproducibly
refreshing the pinned ESICUP imports.

For customer jobs, copy the structure of `corpus/jobs/shirts-sheet-100.json`.
Use `provenance.kind: "customer-production"` and a source-family identifier shared
by all variants of the same original job. A custom manifest follows the bundled
`manifest.json` schema and can be passed via `--manifest`.
Do not mark customer-derived instances as public-reference data. Input geometry
summaries are sent to TypeSafe in live mode; use jobs you are authorised to send.

## Comparators

- **classic-ga:** original SVGnest genetic search, using the shared v2 geometry
  engine. Forbidden per-part rotations are repaired to the first allowed rotation;
  the fitness objective is adapted to sheet/roll metrics. It is not an unchanged
  upstream performance measurement.
- **unranked:** complete every proposal in the common deterministic stream. No
  probe/features/model overhead. Tests whether screening is useful at all.
- **control:** identical short probes and fit evidence to Jev; fixed arithmetic
  ranks proposals by compactness, sampled fit fraction and early constrained parts.
- **jev:** identical proposals and features; the parallel model scores rank them.

Each run has one search CPU thread and at most one HTTP request in flight.
Question parallelism happens inside that request at the service. Trial ordering
rotates among the methods. Do not compare batch throughput against single-job
latency or credit unequal CPU resources to Jev.

## Running

From the repository in Windows PowerShell, use `npm.cmd`, not `npm`:

```powershell
git pull --ff-only
npm.cmd ci
npm.cmd run benchmark:production -- --live
```

The key is prompted locally with hidden input, or read from `TYPESAFE_API_KEY`.
It is never written to the result files. Without `--live` only the three
non-model comparators run; that is not a Jev result.

Default: development split, seed 1, checkpoints 30/120/300 seconds, 300-second maximum
per policy and 20 requests per Jev policy. Nominal search budget is six hours for
18 jobs × four methods, plus exports; call-capped methods may finish earlier.
A verified 500-part roll took about 30 seconds for one initial nest on the build
machine. Such jobs need minutes to give either method useful search opportunities.
Choose adequate budgets based on development completion rates before freezing
held-out evaluation. A short budget yielding no complete layout is reported as
such, not silently extended or excluded.

The same development run with an explicit output directory:

```powershell
npm.cmd run benchmark:production -- --live --budgets 30,120,300 --out jev-results/production-development-300s
```

That is at most six nominal search hours for the full development split. To run
specific real cases rather than the whole split, use `--jobs` with comma-separated
IDs, for example `shirts-sheet-100,shirts-roll-500,albano-sheet-500,blaz-roll-250`.

After choosing and freezing the policy on development results, held-out evaluation:

```powershell
npm.cmd run benchmark:production -- --live --suite evaluation --seeds 1,2,3 --budgets 30,120,300 --out jev-results/production-evaluation-300s
```

This is a substantial run: 66 jobs × 3 seeds × four methods × 300 seconds, up to
66 nominal search hours, with at most 3,960 Jev requests. Start it only after the
live development results justify that expense. The command prints the nominal
runtime and request ceiling before it starts. Larger call ceilings can be set with
`--max-calls`, up to 100 per policy; record changes before evaluation.

Resume with the same command. Completed policies are retained. Interrupted
policies are archived and rerun with fresh wall-clock timing; their paid requests
are preserved but not replayed as if they were fresh performance measurements.
A recorded failed policy remains visible and blocks automatic continuation; resolve
the cause and use a new output directory. Changed code, settings or inputs require
a new output directory. Do not delete errors to manufacture a clean comparison.

## What is measured

- Validated quality at each fixed deadline, first complete-layout time, and time
  for each baseline to reach Jev's quality (including occupied extent as a tie-break).
- Full evaluations, probe evaluations, actual NFP generation versus cache hits,
  fit tests, validation time, feature/probe time, API latency, requests and tokens.
- End-to-end search time includes engine setup, geometry, proposals, probes,
  features, model/retry waits, logs and validation. SVG/report/ZIP exports are
  outside the search budget; per-policy export time is recorded separately.
- Only fully validated incumbents finished by the deadline count. A geometry
  operation can overrun the deadline before the next checkpoint; no result from
  that overrun is admitted. Actual elapsed time remains recorded.
- No cached-response latency reconstruction in this version. Failures and
  no-complete-layout outcomes remain visible in the report.
- Monetary estimates require your actual per-million token prices:
  `--input-price ... --output-price ... --currency USD`. Otherwise cost is unknown.
  Requests without a returned usage receipt can incur unreported charges.
- Uncertainty is clustered by source family, not correlated seeds/counts/media.
  Confidence intervals require at least ten families and a complete comparison.

Every output contains frozen inputs, source hashes, configuration, machine details,
proposal schedules, feature evidence, requests, raw responses before validation,
combined rankings, anytime incumbents, final geometry, SVGs, CSV, JSON, HTML and
`results.zip`. An error does not silently switch the model to the Classic policy.

## Evidence required to proceed

Proceed only if a frozen policy improves validated packing at equal total search
wall time, or reaches equivalent quality sooner, at acceptable API cost, across
held-out families. Check the improvement against both the arithmetic control and
unranked search. Inspect failures and actual production files before generalising.
The current tests verify machinery; they do not establish that Jev scores predict
better nesting outcomes. That requires the live results.

API design sources, checked 17 September 2026:
- https://docs.typesafe.ai/primitives
- https://docs.typesafe.ai/primitives/score
- https://docs.typesafe.ai/api
- https://docs.typesafe.ai/cookbooks/rerank_typesafe
- https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
- https://github.com/ESICUP/datasets
