# First 14 full live trials (interrupted at trial 15)

This is the unmodified uploaded archive from the Windows run using revision
`930dfc7`. All 14 completed final layouts passed geometric validation. The input
ZIP and original summary/metadata are preserved, including the original error.

- Jev versus equal-time GA: 1 win, 12 ties, 1 loss; mean utilisation difference 0 pp.
- Both Jev and GA averaged 51.539% utilisation on these 14 trials.
- GA reached Jev's final quality earlier in 13 cases; it did not reach the quality
  of Jev's better result in the other case within its allotted run.
- Median Jev total time: 10.833 s. Do not interpret the GA final search runtime
  (median 12.010 s) as its time needed to match Jev: GA was deliberately kept
  running to the budget. Per-trial time-to-quality is in the raw results.
- First trial includes 13 cached calls with reconstructed API timing.
- The uploaded archive contains 429 raw responses across completed and interrupted
  trials, with one disagreement between explicit choice and reported argmax.

The stopped response selected d31:c1 (0.14) over reported argmax d31:c18 (0.15).
The current adapter preserves that explicit legal choice, records the discrepancy
and resumes the paid response offline. It does not substitute a different ID.

These are only three distinct shape jobs, with the third missing its fifth seed.
This partial result does not establish a general speed or quality advantage. The
original summary's [0,0] bootstrap interval is degenerate and not useful evidence
of certainty; the current report suppresses intervals on partial suites.
