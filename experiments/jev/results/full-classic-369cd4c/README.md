# Full local Classic benchmark

100 matched trials, 20 fixed concave jobs, five seeds, 20–50 parts per job.
779 complete layouts evaluated. All saved final layouts passed validation.

| Policy | Mean utilisation | Median runtime |
|---|---:|---:|
| Classic single pass | 49.6833% | 1.1893 s |
| Geometric control | 49.8388% | 1.2256 s |
| Classic GA | 50.8668% | 2.2558 s |

No live Jev calls were made in this run. These results cannot answer whether Jev
improves quality per time budget. Native scoring/bounding averaged 2.4035 ms per
complete nest (0.1592% of aggregate cold runtime); NFP generation averaged 1.4557 s.

Source revision: `369cd4cc7204df861aa72116b7eb8cde8c213edb`.
The ZIP contains all trial results, layouts, inputs, metadata and GA progress.
Source hashes, machine details and exact configuration are in metadata.json.
Timing note for this archived revision: GA incumbent validation was timed; other
policies validated after their timers. This slightly favours guided policies; the
current live runner counts validation in every policy and records its cost.

Run the full live comparison using `npm.cmd run benchmark:jev` on the experiment
branch. Its report compares GA results completed by Jev's full runtime and records
when GA first matches Jev quality.
