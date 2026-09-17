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

## Phase 4 - expand decision surface only if Phase 3 wins
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
