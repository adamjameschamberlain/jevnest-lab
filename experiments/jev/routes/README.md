# 2,000 questions to find routes worth testing

**[Read all 2,000 questions](questions/INDEX.md).**

This expands the search to **200 proposed routes across 20 families**. Each route gets ten different questions about its potential, timing, information needs, and failure modes. This is 200 intervention ideas, not 2,000 independent algorithms or experiments. The earlier 120-question bank and its results remain separate.

## Ten questions per route

1. Could it reach the same useful layout quality twice as fast?
2. Could it reach that quality five times as fast?
3. Could it save meaningful material at equal search time?
4. Does **Jev itself** add speed beyond a cheap controller in the same new architecture?
5. Do our current records contain enough decision-time information?
6. Would asking before the expensive work beat asking after another probe?
7. Would showing prior successes and failures help?
8. Would batching independent decisions improve end-to-end time?
9. Would a frozen policy work on unfamiliar eligible shape families?
10. Could a confident wrong decision cause a materially bad result?

The questions use each route's specific casual description. Each also carries a precise yes-event. Thresholds such as 2×, 5×, 10% incremental speed, and 2% roll savings define research targets; they are not forecasts or promised gains.

## Broad routes

Stopping; restarts; branch pruning; part ordering; rotations; gaps; local repair; large-neighbourhood search; repeated patterns; cache reuse; geometry budgets; search portfolios; parallel workers; evidence timing; question design; decomposition; roll-specific methods; sheet-specific methods; robustness and transfer; production objectives.

Examples include solving a repeatable strip once, fixing only the roll tail, reusing exact search prefixes, removing a blocker that joins two useless gaps, letting different algorithms race, abandoning a stalled population, learning when to stop, and reserving fillers for late placement. Every route includes an explicit proposed Jev role; exact geometry remains authoritative.

## What this API run measures

**All 2,000 IDs are sent.** None is silently dropped because only old prefix snapshots happen to exist. The requests share a measured historical profile from the supplied production results and the proposed route definitions. Independent questions are batched into requests capped at 60 KB, following the TypeSafe multiple-question pattern: https://docs.typesafe.ai/primitives

These are **research-screening judgments**. Jev is being asked whether a specified route/event looks plausible and worth examining. It is not executing the routes, observing their outcomes, or proving a speedup. The profile explicitly says that exact contours, cavities, worker traces, cache traces and counterfactual action results are missing. Each route lists the additional evidence and implementation needed for an actual test.

This distinction is intentional: the earlier run only asked operational predictions for a small supported subset. Here we explore the entire route space immediately, then implement and measure selected routes. A high screening score is a suggestion for an experiment, not an experimental result. Large gains cannot be established by asking 2,000 times.

## Run all 2,000 against your real benchmark profile

These commands work in Command Prompt or PowerShell. From `C:\Users\adamc\jevnest-lab`:

```cmd
git pull --ff-only
npm.cmd run questions:routes -- --results jev-results/production-first-live --out jev-results/routes-2000
npm.cmd run questions:collect -- --pack jev-results/routes-2000/requests.json --out jev-results/routes-2000/answers --max-calls 100
npm.cmd run questions:routes:report -- --study jev-results/routes-2000
```

Paste the key only at the hidden prompt. If `TYPESAFE_API_KEY` is set locally, it is used automatically. The supplied four-job profile produces **37 requests containing exactly 2,000 questions**. The `100` argument is an upper limit on new requests per invocation, not 100 questions or a requirement to make 100 calls. Other profiles can change packet count; the preparation output reports it. If the reported packet count exceeds the limit, resume the same collection command until complete. Saved answers are reused.

The report command creates **`jev-results\routes-2000\results.zip`** directly; no PowerShell ZIP command is needed. Upload that ZIP for analysis. A partial run remains visibly partial, with every missing question ID listed.

No extra npm dependencies, no geometry reruns, and no changes to the live nesting loop are required for this screening run. No live calls for these 2,000 questions have been made in the development environment.

## Outputs

- `bank-2000.json`: all routes, question text and yes-events.
- `profile.json`: allowlisted historical observations used in every request.
- `coverage.json`: requested/packed IDs and the explicit count of zero performance-validated new routes.
- `requests.json`: exact pinned-model request packets and ID mappings.
- `answers/`: raw receipts, probabilities, usage and latency using the existing resumable collector.
- `route-screening.json`, `.csv`, `.md`: a 200-route by ten-question matrix with missing-answer reporting.
- `results.zip`: all study data for review.

The report orders rows by Jev's prediction that it adds value over the cheap controller. It does not combine unrelated probabilities into a made-up confidence score or declare a winner. Failure probability has adverse polarity; evidence readiness is not speed; batch benefit is not geometry parallelism. Compare the model's 5× and 2× judgments for consistency. Actual model probabilities have not been calibrated for these events.

## Turning suggestions into results

Choose a diverse small set of routes with potential payoff, including a simple non-model implementation of each. Freeze the objective, target quality, stopping rules, worker budget and timing points before testing. Implement the smallest real intervention and measure every alternative needed for the decision. Keep an audit sample of discarded options. Use actual contours and constraints, and include evidence preparation, API, scheduling, discarded compute and validation in runtime.

Promote a route only after it beats the matched cheap controller on untouched eligible job families. Keep wall time, CPU-seconds, time to first valid result, time to target, material use and failure rate separate. Seeds and repeated shapes are not independent families. A large screen creates selection bias; results on the profile used to choose a route are development results.

The bank is deterministically generated from the 200 authored entries in `routes.tsv` and ten lenses in `bank.cjs`. Regenerate the readable collection with:

```cmd
node scripts/jev-route-study.cjs docs --out experiments/jev/routes/questions
```
