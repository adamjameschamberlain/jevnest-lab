# Full concave nesting experiment

Run from `experiment/jev-placement-policy` on Windows:

```powershell
git pull --ff-only
npm.cmd ci
npm.cmd run benchmark:jev
```

The command prompts for the TypeSafe key without displaying it, unless
`TYPESAFE_API_KEY` is already set. It does not save the key. Leave it running; this
is **100 complete paired trials**, not 100 isolated decisions. Expect thousands
of actual API requests. Each completed trial prints its sheet counts.

Upload **`jev-results/full-live/results.zip`** when it finishes. Open
`jev-results/full-live/report.html` for the report. On failure the command saves a
partial report and ZIP; repeat the same command to resume using successful saved
responses. Completed trials are skipped. Configuration/source changes require a
new `--out` directory. Do not edit a running experiment's source files.

## What is compared

- **Classic:** SVGnest's unchanged minimum-X / `2*width+height` placement policy,
  one complete nest with its initial area-sorted order and seeded rotations.
- **Geometric control:** a deterministic rule using approximate free-space
  fragmentation, bounding score and edge contact. This helps identify an effect
  that simple geometry features explain without a model.
- **Classic GA:** the actual SVGnest genetic algorithm, extracted without edits,
  changing order and rotations. A 2-second minimum time budget per trial;
  in the live experiment it continues at least as long as the full Jev nest.
- **Jev:** a complete sequential nest from the same initial order/rotations.
  Every decision with multiple candidates invokes the model. Each choice changes
  the actual geometry and all following legal candidates. Single-option decisions
  need no model. There is no fallback to Classic for API failures.

The 20 fixed synthetic jobs contain 20, 30, 40 or 50 concave L/U/C/T/Z/star parts,
with varying aspect ratios and deep notches. Five seeds give 100 matched trials;
GA adds further complete layouts until its time budget is exhausted. These are difficult synthetic jobs, not
production artwork or a claim of globally optimal geometry. Each fixture's area
lower bound is recorded. Inputs, polygon outlines and all final layouts are saved.
All methods use 90-degree rotations, no spacing and no holes.

Jev receives the rotated outlines of the current, placed and remaining parts,
exact legal coordinates and bounding scores, exact collinear edge-contact length,
and a 20x20 occupancy grid with approximate free-region metrics. Narrow gaps can
be missed by the grid. Geometric validity always stays with SVGnest/Clipper.
Every candidate is offered. If a request exceeds 255 choices or the conservative
16 KiB local body limit, deterministic ordered groups are queried, then their
winners compete. Grouping is recorded and is a limitation of the selection policy.

## Timing and fair comparisons

All policies run in the same Node process, with independent cold VM/NFP caches.
The engine reuses original NFP code, original worker code and original GA code.
The original one-cycle NFP cache policy is preserved across GA evaluations.
Browser scheduling/rendering and WebWorker parallelism are excluded from every
method. Do not compare these absolute times with the earlier browser benchmark.

The report measures NFP generation, bounding/scoring loops, feature generation,
API latency, token usage and complete runtime. VM setup and guided request/logging
overhead count. The score-loop timer includes bounding construction and candidate
comparison; it is deliberately broader than the arithmetic `2*width+height`.
Native Classic runs with candidate capture off. Guided policies pay for capture,
features and the original bounding calculations they consume. Jev does not bypass
these calculations, so a benefit must arise through quality/search, not pretending
these costs disappeared.

The equal-time comparison uses only GA results completed **by Jev's full runtime**.
An evaluation finishing after that cutoff is excluded. The report also records
when GA first matched or exceeded Jev's final quality. If GA has not reached it,
that observation is censored, not an invented speedup ratio. GA best-so-far traces
are retained for other runtime budgets. The aggregate GA row is its final search
result, which can be later than the equal-time cutoff.

When a partial Jev trial resumes, cached API latency is added to newly measured
CPU time. Such a trial has `timingReconstructed:true`: its runtime is an estimate
from actual call timings, not a new uninterrupted wall-clock measurement. The
original API outputs, latencies, requests and hashes are preserved.

## Evidence and decision

Primary quality is fewer unplaced parts, then fewer sheets. Report utilisation,
fitness, win/tie/loss counts, invalid geometry, runtime and tokens separately.
The 95% interval bootstraps jobs as clusters, so five seeds of one job are not
mistaken for five independent shape distributions. The generated report stays
explicitly incomplete until every live trial finishes.

A positive equal-time quality interval is a reason to test production jobs; it is
not proof of a general improvement. No quality advantage means this candidate
selection experiment has not earned further investment on this evidence. A fast
model call alone is not evidence: Classic's score may be much cheaper than the
geometry and multi-layout search.

Artifacts include `metadata.json` (source hashes, machine, protocol),
`trials/*.json` (layouts, timings, GA traces, validations), per-trial geometry/SVGs,
exact `requests.ndjson`, validated `choices.ndjson`, all decision snapshots,
`summary.json`, CSV, HTML, and a shareable ZIP. Keep the full ZIP for reproducibility.

Run only the real local baselines, without any API calls:

```powershell
npm.cmd run benchmark:full
```

Optional parameters: `--jobs 1..20`, `--seeds 1,2,3,4,5`, `--seconds 2`,
`--min-evaluations 1`, `--model ID`, `--out DIRECTORY`. Reduced runs are exploratory
and cannot replace the default suite. Tests cover browser-baseline replay parity,
unchanged native/profiled/generator output, full 50-part changed-state progression,
complete bounded requests, valid geometry, and seeded stock GA parity.

```powershell
npm.cmd run test:jev-full
```
