# Implementation verification — no live Jev result

The 12 recorded non-model policy runs use four development jobs: 100-part sheets,
500-part rolls, 500-part sheets and 250-part rolls. This was a 15-second deadline
exercise, **not a production-performance conclusion or prompt-tuning dataset**.
Nine runs returned validated complete layouts; the three 500-part roll runs
correctly reported no complete layout within 15 seconds. No policy failed.

A subsequent complete initial layout of the 500-part shirts roll took 29.802 s:
all 500 parts placed on one roll, consumed length 13,930.948 mm, 76.646% utilisation.
All 125,250 validation checks passed. This is one geometry validation, not an
optimisation-quality comparison. It motivated the final 30/120/300-second default
checkpoints. It is not evidence that Jev is faster.

The metadata retains source hashes for the 15-second exercise, which preceded the
final default-budget and minor deadline/resume guards. The geometry implementation
was verified against original SVGnest across several orders/rotations. All 84
bundled jobs pass input preparation; held-out outcomes were not used for tuning.

Nine focused production tests cover geometry parity/cache reuse, spacing and
rotations, unsupported topology, fit witnesses, roll length, batched Score shape,
API failure retention, end-to-end ranking with an injected response, deadline
exclusion and failed-comparison reporting. Existing v1 full-engine and placement
instrumentation regression suites also passed. CLI completion/resume was checked
without model calls. Injected responses are software tests, not Jev evidence.

The new live Score integration still requires execution with the user's local
TypeSafe credential. No key is present in this workspace or these records.
