# Initial Classic baseline

Download/extract `classic-initial.zip` and open `classic-initial/report.html`.
The archive contains all inputs, parsed geometry, final SVG layouts, traces and
candidate snapshots. The CSV and metadata are also available beside the archive
for inspection without extracting it.

Collected 17 September 2026 with the checked-in runner and corpus:

- 5 SVG cases, seeds 1 and 42, 20 evaluations per pass.
- 400 evaluated nests across ordinary and captured passes.
- 2,566 captured decisions and 15,136 candidate placements.
- All ordinary/captured evaluation results matched exactly.
- All final layouts passed polygon containment and overlap checks.
- The overflow fixture deliberately left one oversized part unplaced.

This run used Chromium 153 via `CHROMIUM_EXECUTABLE_PATH` because the standard
Playwright browser download was unavailable in the execution environment. The
normal setup command installs Playwright's bundled Chromium. Browser/machine
versions and source hashes are in the metadata; timings are illustrative individual
measurements, not stable cross-machine speed comparisons.

The metadata records the pre-existing Git HEAD plus `workingTreeDirty: true`:
the runner and fixtures were tested before being committed. The recorded SHA-256
source hashes identify the exact tested code. Verify them against this checkout,
then generate a new baseline on your own machine with `npm run benchmark`.
