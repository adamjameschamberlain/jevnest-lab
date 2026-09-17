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
API latency, token usage and complete runtime. VM setup, final validation and guided request/logging
overhead count. GA validates each improving incumbent; its validation cost is
recorded separately as well as included in total time. The score-loop timer includes bounding construction and candidate
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

## Completed local baseline

[Archived results](../results/full-classic-369cd4c/README.md): 100 trials and 779
complete layouts; Classic 49.68%, geometric control 49.84%, GA 50.87% mean
utilisation. Bounding/scoring was about 0.16% of native runtime. This archived
revision has a documented validation-timing asymmetry; the live runner now counts
validation for every policy. No full live Jev outcome has been measured here.

## Probability rounding and interrupted first trials

The adapter retains the API's reported probabilities unchanged. A sum outside
0.001 tolerance is accepted only if the values are on a two-decimal grid and
there exists a normalised distribution within their individual rounding bounds.
The selected ID, option set, finite values and ranges are still validated.
The explicit API choice is preserved when it disagrees with the reported maximum;
the discrepancy is recorded in `probabilityDiagnostics`, not silently corrected. `probabilityDiagnostics` records the sum and acceptance rule.
This handles rounding-compatible responses; it does not prove that rounding was
the cause of any particular failed response. Grossly invalid distributions stop.

Every parsed successful HTTP response is now saved to `responses.ndjson` before
validation. Rejected responses can therefore be inspected or revalidated offline
without buying the same response again. Previously rejected responses were not
saved and cannot be recovered retroactively. Accepted choices remain cached.

An interrupted first trial from revision `86e5aa7` upgrades automatically when
configuration and all geometry/request sources match and no trial has completed.
Both LF and Windows CRLF source hashes are supported. The previous hashes are
retained in metadata's migration history. Other changes still require a new run
directory. Decision traces are regenerated on resume, avoiding duplicate rows.

## Explicit choice versus reported probabilities

A real response in trial 15 selected `d31:c1` with probability 0.14 while reporting
0.15 for `d31:c18`. This contradicts the documented argmax relationship. The
benchmark follows the service's explicit legal `choice` and records
`choiceIsArgmax`, `choiceProbability`, `maxProbability` and `argmaxCandidates`.
It does not replace the selected ID, renormalise probabilities, or treat the
inconsistent probabilities as calibrated evidence. Geometry validation remains
unchanged. The raw response is retained.

Runs from revision `930dfc7` can migrate with completed trials: the API choice,
request representation and geometry remain unchanged, and the migration records
previous hashes plus the number of completed trials retained. It rejects any
configuration or geometry changes. The already-paid rejected response is recovered
from `responses.ndjson`, so it does not require a replacement API call.

Partial runs no longer display a bootstrap interval. The full live suite and at
least ten independent jobs are required before displaying that interval.
