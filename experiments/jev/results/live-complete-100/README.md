# Completed single-question Jev baseline

100 matched trials, 20 synthetic jobs × 5 seeds, 20–50 parts; completed on
17 September 2026 on an Intel i5-9400F / Windows / Node 24.17.0.

## Result

| Policy | Mean sheet utilisation | Median complete runtime |
|---|---:|---:|
| Classic single pass | 49.6833% | 1.682 s |
| Deterministic fragmentation/contact control | 49.8388% | 1.736 s |
| Classic GA, final recorded budget | 51.0219% | 12.010 s |
| Jev single sequential rollout | 51.6410% | 11.270 s |

**The runtime column is not a speedup comparison.** GA continued searching to its
budget even after matching Jev. Only GA evaluations completed by the Jev deadline
enter the equal-time comparison.

- Jev versus equal-time GA, using all-parts-placed then sheet count: **5 wins,
  94 ties, 1 loss**. Five wins each save one sheet; the loss consumes one extra.
- Mean utilisation improvement: **0.619 percentage points**. The job-clustered
  95% bootstrap interval is **0 to 1.392 points**. This is a small observed signal,
  not established general superiority. All wins occur on just three jobs.
- On the 95 trials where GA reached Jev's sheet count, GA reached it earlier in
  **all 95**. Median paired times: **1.526 s GA versus 11.025 s Jev**; median
  per-trial slowdown **6.23×**. The five unmatched Jev wins are excluded from
  that speed statistic, not counted as losses or infinite runtimes.
- The 94 ties mean equal sheet count, not identical placement or occupied width.
  Adding original SVGnest fitness as a secondary comparison gives **14 Jev wins,
  0 ties, 86 losses** at the Jev deadline (1e-9 fitness tolerance).
- Against single-pass Classic, Jev saves sheets in 13 trials and ties in 87.
  That does not demonstrate a speed advantage against an optimising baseline.
- All 400 saved final policy layouts were revalidated; every part was placed.
  The run evaluated 1,890 complete layouts including GA intermediate evaluations.
- 3,500 accepted API calls; 15,089,598 input and 511,368 output tokens.
  Recorded API time is 946.899 s of 1,186.313 s total Jev time: **79.82%**.
  Token counts are not a currency-cost estimate.

## Provenance and audit

Original user upload: `results(1).zip`, 6,033,359 bytes.
SHA-256: `4dc99d94f4925f37aebf41f51827da7ea02d09b9e986daaad88c43003e5e32c1`.
The complete original archive remains the attached source; the exact original
summary and metadata are retained here. `audit.json` records independently
recomputed trace comparisons and revalidation using the existing geometry
validator. Reproduce it without any model calls:

```powershell
node scripts/audit-full-results.cjs "C:\path\results(1).zip" audit.json
```

Two trials reconstruct timings from cached paid calls: hard-01/seed-1 (13 calls)
and hard-03/seed-5 (32 calls). Excluding those trials leaves the overall median
Jev runtime unchanged. The archive's error.json records the earlier interruption;
it does not mean the completed run failed. Metadata preserves both response
validation migrations, and records completion at 12:44:07 UTC.

## What this establishes

This sequential single-Choice placement implementation has no demonstrated
speed advantage. It occasionally improves sheet count. It does not test parallel
factor judgments, search-budget allocation, variable part order/rotation under
Jev, rolls, or production workloads of hundreds of parts.

Native scoring/bounding consumed 0.145% of this run's Classic cold runtime.
That figure applies to this implementation and corpus. It is not a claim that
production nesting search is cheap. The next experiment must measure whether
Jev avoids expensive search work and repays its full integration overhead.
