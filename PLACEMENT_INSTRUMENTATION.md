# Phase 1: Classic placement capture

For the automated SVG corpus, run `npm run benchmark` after setup. See
[the benchmark guide](benchmarks/README.md). The console workflow below remains
available for manually inspecting an individual SVG.

Candidate capture is opt-in. It observes the existing decisions; it does not
change the geometry, candidate order, rotations, comparisons, tie-breaking,
fitness calculation, or placement objects. No Jev dependency or network call is
introduced. With capture disabled, the worker returns its original result shape.

## Capture a run in the existing SVGnest page

Load an SVG and select its bin normally. Before pressing Start, run this in the
browser console (changing configuration resets the current search as usual):

```js
var classicRun = {
  inputId: 'replace-with-your-svg-filename.svg',
  startedAt: new Date().toISOString(),
  evaluationLimit: 50,
  evaluations: []
};
SvgNest.config({captureCandidates: true});
SvgNest.onPlacementEvaluation = function(snapshot) {
  classicRun.evaluations.push(snapshot);
  if (classicRun.evaluations.length >= classicRun.evaluationLimit) {
    SvgNest.stop();
    classicRun.finishedAt = new Date().toISOString();
  }
};
```

Start nesting normally. This observer stops scheduling work after 50 completed
evaluations. Once `classicRun.finishedAt` is set, download the capture:

```js
saveAs(new Blob([JSON.stringify(classicRun, null, 2)], {
  type: 'application/json'
}), 'classic-placement-decisions.json');
```

`stop()` does not cancel an in-flight worker and immediately clears `working`,
so `working === false` alone is not a completion signal after manually stopping.
The observer above stops at an evaluation boundary. `saveAs` is already included
by the existing page. Keep the original SVG alongside
the JSON: snapshots contain summaries, not the complete source geometry/NFP cache.
The collection above deliberately retains every evaluation and can consume a lot
of memory on large or long runs. Export short runs or supply your own streaming
observer. SVGnest itself retains only the last evaluation and existing best result.

For a single evaluation, use `SvgNest.getLastPlacementEvaluation()`. This returns
an independent JSON-safe copy, or `null` before a captured evaluation completes.
The observer also receives a copy; modifying it cannot change placements, and
observer exceptions are caught. The hook fires for **every evaluated individual**,
including evaluations that do not improve the best result.

Disable capture before starting another search with:

```js
SvgNest.onPlacementEvaluation = null;
SvgNest.config({captureCandidates: false});
```

## Snapshot semantics (schema version 1)

- `evaluationId`: monotonically increasing within this SvgNest instance. Qualify
  it with your run/input ID when combining exports.
- `isBest`: whether this evaluation became the incumbent best at completion.
- `inputParts`: input order, IDs, source indices, assigned rotations and areas.
- `bin`: worker bin bounds and area; `config`: worker configuration.
- `decisions`: candidate sets in encounter order, indexed by bin and part.
- `placements`: final per-bin placement order, part IDs, translations and rotations.
- `metrics`: part/placed/unplaced counts, bins used, placed area, utilisation,
  original SVGnest fitness, placement runtime and evaluation runtime.

Each decision records the already placed parts, their current bounding rectangle
and area, and the remaining parts (including the current part and any previously
skipped parts). Candidate IDs such as `d3:c7` are unique within an evaluation.
They are stable for identical inputs, NFP vertex order and engine behavior; they
are not universal geometry identifiers.

Every candidate contains:

| Field | Meaning |
| --- | --- |
| `id`, `partId`, `rotation` | Candidate identity, part identity, assigned angle in degrees |
| `x`, `y` | Translation of the rotated part, exactly as used in the placement result |
| `polygonIndex`, `vertexIndex` | Origin in the enumerated NFP regions |
| `width`, `height` | Bounding rectangle of all placed parts plus this candidate |
| `score` | `width * 2 + height` (a weighted length, not an area or overall fitness) |
| `selectionScore` | X for the first part; `score` for subsequent parts |
| `widthGrowth`, `heightGrowth` | Change from the current bin's placed-part bounds |
| `partArea`, `binUtilisation` | Outer polygon area and resulting bin area fraction |
| `selected` | Whether the unchanged Classic comparison ultimately selected it |

The winning ID is also recorded as `selectedCandidateId` on the decision. The
winner is captured at the actual assignment in the original comparison branch,
not reconstructed by sorting the candidate list.

**First placement:** enumerate the bin's inner-NFP vertices; select the smallest X,
keeping the first encountered candidate when X ties. `score` is descriptive here;
it is not used by Classic for this decision.

**Subsequent placements:** enumerate exactly the final-NFP vertices that Classic
passes to its scoring loop, after its existing Clipper cleaning and area filters.
The unchanged comparison is:

```js
minarea === null || area < minarea ||
  (GeometryUtil.almostEqual(minarea, area) &&
    (minx === null || shiftvector.x < minx))
```

Do not replace this with a generic sort: the tolerance and encounter order matter.
Duplicates are retained. Rotations are assigned upstream by the genetic algorithm;
this capture does not enumerate other rotations or every continuous legal XY
position. It observes the engine's candidate set, not an independent proof of
geometric validity. If all surviving regions fail the existing final area filter,
the decision has an empty candidate list and a null winner. Parts skipped before
candidate enumeration do not produce decisions; final unplaced counts are logged.

## Metrics and future baseline work

Areas follow the current worker's outer polygons, after spacing offsets, without
subtracting holes. Utilisation is a fraction of the total area of occupied bins,
not occupied bounding-box area. It is `null` when no bins are occupied. These are
engine-convention metrics, not a new physical material accounting method.

`placementRuntimeMs` measures the placement call, including capture overhead,
but excludes NFP generation and worker transport. `evaluationRuntimeMs` covers
`launchWorkers` through result/display processing, including NFP computation,
worker transport and capture; it excludes observer/export work. Neither is the
entire multi-generation search runtime. Cached NFPs also affect evaluation timing.

Capturing has time and memory costs. Behavior preservation means equal results
for equal evaluated individuals, not equal runtime. A fixed wall-clock search may
therefore complete fewer evaluations with capture enabled. For the Classic corpus,
keep original SVGs, engine revision/configuration, input IDs, random seeds or exact
orders/rotations, and equal evaluation budgets. Measure ordinary and instrumented
runtime separately. No performance or Jev quality claim is made by this commit.

Changing one placement changes later legal regions. A future offline replay must
regenerate later candidate sets through the geometry engine; it cannot blindly
chain candidate IDs from a divergent Classic trace.

## Regression checks

Run with Node.js 18+ and Git from the repository root:

```sh
node tests/placement-instrumentation.test.cjs
```

The test compares the complete original result objects against revision `d977198`,
with capture disabled and enabled. It runs real GA, NFP generation, Clipper and
placement code, replacing transport/display with a synchronous test adapter. The
adapter recompiles serialized worker functions with JSON environments and cloned
inputs, catching accidental reliance on outer closures. It checks every scored
candidate against bounding calls observed in the original worker, independently
checks candidate bounds, and verifies winners, metrics and observer isolation.

Coverage includes first-part ties, later ties, concave shapes, rotations, multiple
bins, missing NFPs, rejected tiny regions, unplaceable/empty inputs, sixteen seeded
mixed-shape cases, and twelve consecutive evaluations crossing a GA generation.
The baseline commit must be present in the clone. These are geometry/worker
regression checks, not a browser SVG-import benchmark or a production corpus.
