# JevNest experiment plan

## Goal
Test whether a fast typed-decision model can improve SVGnest's true-shape nesting by steering search decisions while leaving all geometric validity deterministic.

## Core rule
Jev must never decide whether geometry is valid. SVGnest/Clipper/NFP logic remains authoritative for collision, containment, spacing, rotation legality, and final validation.

## Current baseline seam
The first experiment targets `util/placementworker.js`.

SVGnest currently:
1. Builds the legal placement region (`finalNfp`).
2. Enumerates vertices of that region as candidate placements.
3. Builds the bounding rectangle of already placed parts plus the candidate part.
4. Scores each candidate with:

```js
area = rectbounds.width * 2 + rectbounds.height;
```

5. Selects the candidate with the lowest score, using X as a tie-breaker.

This is the first decision policy to benchmark against Jev.

## Phase 0 - preserve baseline
Do not alter `master`.
All work goes on `experiment/jev-placement-policy`.

Record the existing behaviour before changing placement selection:
- input SVG/job identifier
- number of parts
- bin dimensions/area
- number of bins used
- total placed area
- material utilisation
- SVGnest fitness
- runtime
- placement order
- rotations

Use deterministic/repeatable test inputs where possible.

## Phase 1 - candidate instrumentation
For every candidate vertex considered during placement, capture a compact candidate state without changing the selected result.

Initial features:
- candidate id
- part id
- rotation
- x/y placement
- current placed-part count
- bounding width after candidate
- bounding height after candidate
- baseline SVGnest score (`width * 2 + height`)
- bounding width growth vs current nest
- bounding height growth vs current nest
- candidate part area
- bin utilisation after candidate

Later geometric features can include:
- shared/contact perimeter
- void area created
- void compactness
- edge proximity/contact
- cavity fill ratio
- remaining parts compatible with resulting cavities
- local concavity measures

The first instrumentation commit must preserve existing nesting output.

## Phase 2 - offline policy test
Before putting Jev inside the browser worker loop, export candidate-decision snapshots and evaluate them outside SVGnest.

For each decision snapshot:
- state = current nest summary + remaining-part summary + candidate feature list
- allowed output = one candidate ID only
- compare Jev's chosen candidate with SVGnest's baseline choice

Then replay decisions through exact geometry and measure final nest quality.

This keeps network/API latency and async behaviour out of the first algorithmic comparison.

## Phase 3 - Classic vs Jev benchmark
Run identical input sets under:

### Classic
Existing SVGnest candidate score.

### Jev policy
Jev selects among the precomputed legal candidates.

Primary metrics:
- utilisation
- number of bins
- runtime
- win/loss/tie rate vs Classic

Secondary metrics:
- bounding width
- dead-space characteristics
- number of failed/unplaceable parts
- decision latency
- Jev confidence/calibration if available

Do not treat one visually good nest as evidence. Use a repeatable benchmark corpus.

## Phase 4 - production-scale search-policy experiment

The user's subsequent instruction authorises this redesigned experiment after
the completed single-question baseline, even without a decisive Phase 3 win.
The original gate below is superseded by that instruction. Do not interpret the
small synthetic baseline as a verdict on production-scale Jev-guided search.
Possible later typed decisions:
- next part to place
- rotation ordering
- candidate pruning / top-K branch survival
- continue vs backtrack
- switch heuristic
- restart from best-known state

Long-term architecture:

```text
Exact geometry / NFP
        |
        v
Legal candidate generation
        |
        v
Feature extraction
        |
        v
Typed decision policy (Jev)
        |
        v
Search / branch selection
        |
        v
Exact geometry validation
        |
        v
Final nest
```

## Success criterion for the first real experiment
Jev is interesting only if it improves final nest quality often enough to offset added latency/cost.

The initial question is deliberately narrow:

> Given the same legal candidate placements SVGnest already generated, can Jev choose a better next placement than the existing `width * 2 + height` heuristic?

If the answer is no, stop or redesign the state representation. If yes, then test richer search-policy decisions.

## Inputs still needed
- Current Jev early-access/API/SDK documentation and examples.
- Authentication method (do not commit credentials).
- Choice/Score/Boolean schemas and limits.
- Rate/latency limits.
- Any batching or parallel-decision guidance.

Never commit an API key. Use environment variables/local secrets only.

## Implementation status — 17 September 2026

- Phase 1 capture and regression verification complete.
- Synthetic Classic SVG corpus complete: five inputs, two seeds, 20 evaluations
  per pass, with exact ordinary/captured parity. Reference outputs are archived in
  `benchmarks/baselines/classic-initial.zip`.
- Offline Jev adapter and real API batch complete: 20 choices, 19 agreements.
- Exact single-decision geometry replay implemented. Ten Classic best evaluations
  reproduced their saved browser placements and candidate traces. All layouts
  passed containment and overlap checks. The sole changed choice used 3 sheets
  instead of 2 (34.275% versus 51.4125% utilisation), with all parts placed.
- These were only the first two placements per evaluation, with no outline/cavity
  features. This is insufficient to judge general policy potential. No full Jev
  rollout or speed improvement has been demonstrated.
- Next: find later states with measurable improvement available through candidate
  replay, enrich the state with relevant geometric features, and compare policies
  on held-out jobs with total runtime accounted for.

See `experiments/jev/README.md` for the commands and current feature limitations.

## Full experiment runner

`npm.cmd run benchmark:jev` runs 100 matched trials on 20 fixed jobs containing
20–50 concave parts each. It compares native Classic, a deterministic geometric
control, stock SVGnest GA, and a complete sequential Jev rollout. Every changed
choice regenerates subsequent candidate geometry. Timings include model calls
and feature costs; equal-time comparisons use completed GA results only.

The runner prompts locally for a hidden key, checkpoints successful calls and
completed trials, and writes a full results ZIP. Live results remain unknown until
this command is run with the user's key. See `experiments/jev/full/README.md`.

Local full-suite baseline completed: 100 trials / 779 complete layouts, saved at
`experiments/jev/results/full-classic-369cd4c/`. Native bounding/scoring accounted
for about 0.16% of cold runtime. Full Jev outcomes remain pending a keyed live run.

## Completed live baseline and next-build requirements

The pending-live statements above describe historical stages. The uploaded
complete live run now contains 100 trials / 1,890 evaluated layouts. See
`experiments/jev/results/live-complete-100/README.md` and `audit.json`.
Jev versus equal-time GA: 5 sheet-count wins, 94 ties, 1 loss; +0.619 percentage
points mean utilisation. GA reaches the same sheet count earlier in all 95
trials where it reaches it. No speed benefit has been demonstrated.

The next build is a separate versioned benchmark, not another run of the same
policy with larger synthetic files. The user explicitly requires:

- Production-scale jobs of 100, 250 and 500 parts; repeated copies, mixed sizes,
  complex outlines, meaningful spacing and rotation restrictions. Separate sheet
  and fixed-width roll objectives. Support explicit hole semantics rather than
  silently treating holes as usable material or ignoring them.
- Actual production cut contours when available, published irregular-nesting
  reference cases with provenance/licence, and clearly labelled synthetic stress
  cases. Do not call synthetic jobs production evidence. Import and validate
  units, transforms, copies and contour topology; reject unsupported geometry.
- Development and held-out evaluation jobs split by source job/shape family,
  not merely by random seed or copy count. Freeze prompts, aggregation rules,
  scheduling policy and configuration before evaluating held-out jobs.
- Jev directs expensive search: candidate/branch priorities, ordering or search
  allocation at bounded decision points. It does not replace exact collision or
  fit tests. Avoid an unavoidable network round trip per placed part.
- Focused independent questions batched against a shared known state, with
  concrete candidate consequences and remaining-part fit evidence. Questions
  must identify their candidate/branch explicitly. No question may assume it
  knows another answer from the same call. Speculative branches need their own
  correctly regenerated geometry. Measure feature construction costs.
- Native Classic search, deterministic search with the same features, and
  Jev-guided search sharing geometry, candidate pools and resource limits.
  Include an ablation for the effect of the additional features without Jev.
- Predeclared time budgets and time-to-quality targets. Sheet count is primary
  for sheets; consumed length is primary for fixed-width rolls. Record secondary
  occupied extent/offcut measures so equal sheet counts do not hide changes.
- Identical concurrency limits and explicit cold/warm cache policy. Separate
  batch throughput from one-job latency. Count all preprocessing, geometry,
  feature extraction, model calls, retries, validation and scheduling overhead.
- Preserve full inputs, configurations, code/model versions, requests/responses,
  seeds, anytime incumbents, exact final validation and visual layouts. Report
  failures and incomplete runs; never silently drop them. Keep resumed latency
  reconstruction separate from uninterrupted live timings.
- Measure quality at equal wall time, time to equal quality, geometry/search
  evaluations avoided, latency distribution, tokens and actual applicable API
  cost. Analyse uncertainty by independent source job, not correlated seeds.

Success requires better validated packing at the same total time, or equivalent
packing sooner, at a declared acceptable cost. Parallel questions themselves
are an implementation capability, not evidence of a better nesting policy.

The v1 full runner does not satisfy these requirements. A separate v2 implementation
now exists under `experiments/jev/production`; see its README for precise scope.

## Production-scale v2 implementation

- Common lazy NFP engine with bounded reuse by normalised outline and rotation;
  original placement worker/Clipper/NFP algorithms retained. Clearance envelopes,
  margins, explicit per-shape rotation restrictions, sheet and real strip objectives.
- Four comparisons: adapted stock GA, unranked deterministic proposal stream,
  arithmetic ranking with the same short geometry probes, and Jev proposal ranking.
- One request contains 12 independent Score judgments for four proposals. Fixed
  score aggregation selects two full layout evaluations. No request per placed part.
- 84 bundled, provenance-tracked ESICUP-derived jobs: 14 source families × three
  part counts × two media types. Development/evaluation split by source family.
  These are adapted research jobs; actual customer print outlines remain needed.
- Strict explicit polygon JSON input. Unsupported holes, multipart contours,
  implicit transforms and unflattened curves are not silently approximated.
- Fixed wall-clock checkpoints, saved complete incumbents, measured geometry,
  features, API costs/tokens, raw receipts, failure reporting and source/input hashes.
  Interrupted trials do not replay cached responses as fresh latency measurements.
- Default live development run: `npm.cmd run benchmark:production -- --live`.
  18 jobs, seed 1, four methods, 30/120/300-second checkpoints; up to six nominal
  search hours and 360 requests. The completed v1 runner and results are preserved.

Implementation verification includes original-worker parity, nine focused tests,
all 84 input preparations, 12 timed non-model development runs, and a fully validated
500-part roll (~30 seconds for one initial layout on the build machine).
See `experiments/jev/production/verification/README.md`.
The new live model integration is not yet empirically verified; run it using the
credential on the user's PC, then assess development outcomes before freezing the
policy and spending on the 66-job held-out suite. A working typed API is not a
claim that the resulting search policy improves packing or runtime.


## Question-discovery bank (v1)

Added `experiments/jev/questions/QUESTIONS.md` and `bank.json`: 60 falsifiable hypotheses with paired casual/technical wording (120 Noul questions). Covers branch quality/cost, pair comparisons, probe depth, stopping/restarting, repair, part order, cavity decisions, reuse, resource allocation, job strategy and trust checks.

`questions:prepare`, `questions:collect`, and `questions:score` prepare bounded parallel request batches, retain real receipts, and score separately supplied measured labels. Existing four-job logs yield 16 pre-decision candidate cases and 160 applicable judgments in four requests, without geometry reruns. The other question families require additional evidence/interventions; those are specified, not silently simulated or claimed implemented. No question-bank live calls or speedup results exist yet. Current nesting policies are unchanged. See `experiments/jev/questions/README.md` for the experiment design, censoring, held-out evaluation, costs, and Windows commands.
