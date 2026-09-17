# Run the Classic SVG corpus

The command opens headless Chromium, imports actual SVGs through SVGnest's parser,
selects the specified sheet, and runs the original genetic algorithm and real Web
Workers. No production geometry or placement code is replaced.

## Windows / PowerShell

Open a terminal in your `jevnest-lab` folder. First-time setup:

```powershell
git switch experiment/jev-placement-policy
git pull --ff-only
npm.cmd ci
npm.cmd run benchmark:setup
```

Node.js 20 or newer is required. `npm.cmd` avoids PowerShell's `npm.ps1` execution
policy issue. Setup downloads Chromium once. Then run the whole corpus:

```powershell
npm.cmd run benchmark
```

On macOS/Linux, use `npm` instead of `npm.cmd`. On Linux, Chromium may also require
system libraries: `npx playwright install --with-deps chromium` installs them on
supported distributions. If you deliberately use an existing Chromium binary, set
`CHROMIUM_EXECUTABLE_PATH` to its full path; the actual browser version is recorded.

The command prints progress and the exact path to `report.html`. Open that file
in your browser. Outputs go to a new timestamped folder under `benchmark-results/`
by default. No local server needs to be started manually, and no Jev key is needed.

For a quicker five-case smoke run:

```powershell
npm.cmd run benchmark -- --evaluations 2 --seed 1
```

For a specific case or a larger search budget:

```powershell
npm.cmd run benchmark -- --case concave --evaluations 100 --seed 1,42,100 --out benchmark-results/concave-100
```

`--out` must be absent, nonexistent or empty; the runner refuses to overwrite an
existing result set. `--timeout-ms 180000` controls the timeout for each pass of a
single case/seed pair. Errors exit nonzero and write `error.json`; partial reports
are not a completed baseline. Completion is recorded in `metadata.json`.

## What's in the initial corpus

| Case | Sheet | Parts | Purpose |
| --- | --- | --- | --- |
| rectangles | 100 × 80 | 18 | Repeated sizes, rotations and multiple sheets |
| irregular | 100 × 80 | 12 | Nonrectangular convex outlines |
| concave | 100 × 80 | 12 | L-shaped parts and interlocking opportunities |
| mixed-curves | 100 × 80 | 14 | Rectangles, circles, ellipses, paths and Bézier curves |
| overflow | 70 × 55 | 8 | Multiple sheets, with one deliberately oversized part |

Dimensions are SVG user units. The SVG sheet is the element `id="sheet"`. Source
parts are separated outside that rectangle, so SVGnest does not interpret the
initial drawing as overlapping or nested part contours. These are synthetic test
files, not evidence of production performance. Spacing is zero and holes are off.

Defaults are in `corpus/manifest.json`: **20 evaluations, seeds 1 and 42**, four
rotation choices, population size 10, mutation rate 10, curve tolerance 0.3 and a
maximum of four simultaneous NFP workers. That is ten case/seed pairs, each run
once without candidate capture and once with it: 400 evaluations in total.

## What each run verifies

For each SVG and seed, the runner starts fresh browser contexts for both passes,
sets the same deterministic PRNG, and stops at exactly the specified number of
completed evaluations. The passes alternate order between pairs. It asserts:

- every evaluated part order, rotation, placement, fitness and unplaced list is
  identical with capture disabled and enabled;
- the expected number of parts survives actual SVG import;
- the final unplaced count matches the manifest (one only in `overflow`);
- bin area matches the declared sheet;
- final parts remain inside their bins and have no positive-area overlaps,
  using Clipper intersection/difference checks at an area tolerance of 0.0001;
- every part is accounted for, real Workers ran, and capture utilisation agrees
  with independently summed final polygon area.

The ordinary pass does not enable candidate logging. A harness observer still
collects compact per-evaluation results to verify parity; it is not a zero-overhead
profiler. The normal SVGnest 100 ms scheduler and SVG rendering are preserved.

## Saved outputs

At the top level:

- `report.html`: readable comparison table and links to layouts.
- `summary.csv` / `summary.json`: utilisation, bins, counts, fitness, runtimes,
  decisions, candidates and verification results.
- `metadata.json`: seeds, budgets, configuration, PRNG, input and source SHA-256
  hashes, Git revision/dirty flag, browser/Node versions and machine information.

In each `CASE-seed-N` folder:

- `input.svg`: the exact input used.
- `layout-1.svg`, etc.: all sheets of the best Classic result, using SVGnest's
  original SVG export method.
- `best.json`: best placements/order/rotations, metrics and geometry validation.
- `geometry.json`: the actual parsed/preprocessed polygons with part/source IDs,
  bin and worker settings; original SVG plus source hashes support later replay.
- `classic-trace.json` / `capture-trace.json`: every evaluated order and result.
- `decisions.ndjson`: one JSON record per captured evaluation, including every
  candidate decision snapshot. Each line has the input ID and seed.
- `best-decisions.json`: the candidate snapshots for the winning evaluation.

New generated runs are ignored by Git. A reference run is preserved separately
under `baselines/`, with complete outputs in a ZIP. Extract the ZIP and open its
`report.html`; use your own run for timings on your machine.

## Interpreting the baseline

Utilisation = placed outer-polygon area / (used bins × sheet area). The curved
shapes use the parser's polygon approximation. An unplaced part contributes no
area, so always read utilisation together with placed counts. The overflow case
is deliberately incomplete and is a correctness fixture, not a quality success.

`Classic` and `With capture` in the report use exactly the same selection policy.
This is **not** a Classic-versus-Jev comparison. Capture adds candidate features
and serialization. The reported wall times include scheduler waits, rendering and
capture; summed evaluation times exclude scheduler waits and the harness's output
copying/rendering. Final geometry checks run after timing. The capture snapshot's
own worker timing is also preserved, with the semantics documented in
`PLACEMENT_INSTRUMENTATION.md`.

Each configuration has only one measured pass per mode/seed, with no warmup or
repeated timing sample. Cache/JIT/CPU variability can make the captured pass appear
faster. Do not interpret those differences as a speedup or a precise overhead
estimate. Seeds and evaluation budgets make the decisions reproducible; times are
machine-dependent. The exact browser and source hashes matter too.

For a future policy comparison, regenerate legal candidates after any changed
placement. Later candidate IDs from the Classic trace cannot be replayed blindly
once the geometric state diverges.

## Add representative production cases

Add an SVG beside the existing corpus files and a manifest entry with a unique
`id`, `file`, `binId`, `sheet`, `expectedParts` and `expectedUnplaced`. Ensure the
sheet and initial parts are separated and that contours represent individual
parts. Start with a short run and inspect the exported layout and counts. This
runner uses SVGnest's existing import rules; it is not an artwork preflight tool.
