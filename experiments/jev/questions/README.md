# Question discovery: what is worth asking Jev, and when?

This is a **question bank and offline data-collection harness**, not a demonstrated nesting improvement or a new live nesting policy. The existing geometry engine and live benchmarks are unchanged.

- [QUESTIONS.md](QUESTIONS.md): all **120 questions**, 60 hypotheses, casual/technical pairs.
- [bank.json](bank.json): versioned machine-readable questions, evidence requirements, timing, and outcome definitions.
- `pack.cjs`: explicit evidence selection, missing-evidence skips, independent questions batched into requests capped at 60 KB.
- `scripts/jev-question-study.cjs`: prepare requests, collect real Noul answers, score against separately supplied measured labels.
- `scripts/prepare-jev-question-cases.cjs`: reuse the first pre-decision snapshot from each job in existing production results. It does not run geometry or call the API.

The current logs support five branch-quality hypotheses (ten wording variants) per candidate. They **do not** support the other 55 hypotheses. The bank describes the additional snapshots/interventions needed; those interventions are not implemented by this harness. No paid calls have been made to test this bank.

## Where to look first

| Priority | Intervention | Potential saving | Evidence and action needed |
|---|---|---|---|
| 1 | Reject slow, unproductive branches | Avoid whole expensive completions | Prefix evidence, measured completion costs, all candidate outcomes |
| 1 | Stop or restart stalled search | Avoid minutes with no useful improvement | Checkpoint history; matched continuation and restart windows |
| 1 | Reuse patterns and repeated blocks | Avoid repeated search and geometry | Actual repeated-part geometry; executable template/recompute alternatives |
| 2 | Choose a targeted repair | Spend seconds on the useful change | Local geometry; explicit swap/rotate/repack alternatives |
| 2 | Change part ordering or protect a cavity | Avoid downstream repair or extra material | Remaining contours and quantities; executable competing actions |
| 2 | Allocate search workers | Reduce wall time at fixed resources | Histories, worker limits, executable portfolios, contention measurements |
| 3 | Ask earlier/later, or buy another probe | Reduce decision cost without losing quality | Same branch snapshots at multiple stages; measured evidence-generation costs |
| Diagnostic | Trust, wording, option-order sensitivity | Detect weak or misleading judgments | Controlled evidence ablations and permutations |

These are hypotheses, not expected effect sizes. A large space of prompts increases the chance of finding a lucky result. Freeze the selected questions and thresholds before testing new shape families.

## How the questions are different

Casual prompts are deliberate: “Are we just burning time now?”, “Do these two belong together?”, “Have we basically solved this bit already?”, “Is this cheap-looking move painting us into a corner?”

Each has a technical wording with the **same yes-condition**. An operational definition follows the natural question so “worth it” cannot silently mean a different target on each job. This first bank tests changes to the question wording while holding that definition fixed; it does not test completely unconstrained casual prompts. Do not tell the model to find a breakthrough or suggest the desired answer.

All questions use Noul, a yes-probability, to make these outcome predictions comparable within a hypothesis. No threshold is treated as calibrated until checked against measured outcomes. Both wordings see the same evidence and are asked independently. Complementary questions, such as “stop now” and “one more round”, also expose inconsistencies.

TypeSafe documents that independent questions sharing state can run in parallel inside one request. The collector batches across cases as well as questions; every instruction explicitly identifies its case and evidence paths. Questions cannot read one another's answers. Request size and actual latency are measured; model-side parallelism does not mean geometry workers run in parallel.

Documentation: https://docs.typesafe.ai/primitives

## Research design

1. **Choose the action and outcome before asking.** Specify the fixed incumbent, constraints, target, material threshold, time horizon, tie rule, and executable alternatives. On sheets, distinguish fewer sheets from cosmetic compactness. On rolls, specify the minimum meaningful length saving.
2. **Record only information available at the decision.** Try a cheap initial snapshot, then 10%, 25%, 50% and 75% completion, plus stagnation checkpoints where appropriate. Those fractions are research conditions, not recommended production defaults. Charge the cost of reaching each snapshot. Do not credit savings on work already spent producing evidence.
3. **Separate wording from information.** Compare casual and technical questions with identical information. Independently compare summaries, actual contours/cavity descriptions, and summaries plus search history. Geometry representations must be supported and validated; textual polygon data is not automatically useful to a model. Do not smuggle future results into “features”.
4. **Measure every alternative in each selected small batch**, including rejected ones. Retain exact schedule/action identity, seed, constraints, valid geometry, objective, CPU and wall time. A timeout is not proof that a branch is bad; retain censoring. Cheap geometry bounds remain deterministic checks, not model predictions.
5. **Measure decisions, not just answer accuracy.** Track time-to-target, missed winners, regret relative to the best completed candidate, rejected compute, and net time saved after evidence/API/scheduling costs. Report material loss explicitly. A classifier that rejects everything can look accurate while discarding the only worthwhile candidate.
6. **Use a fixed control.** Compare against the existing arithmetic rule, a random selector with the same keep-rate, no filtering, and the best possible selector given measured outcomes. If even that best-possible selector cannot repay evidence and API costs, stop pursuing that decision point.
7. **Select on development families, confirm on untouched families.** Repeated copies, seeds, wordings, and checkpoints are correlated observations. Report uncertainty at the original shape-family level. Do not call the best of 120 exploratory scores a confirmed winner. Also vary job mix, actual customer contours, and sheet/roll objectives.
8. **Only then deploy a small policy.** Evaluate the chosen few questions under equal wall time and worker counts. Keep a defined audit fraction of model-rejected branches to detect missed opportunities. Never let a model bypass exact collision, containment, spacing, or rotation checks.

Stopping, caching, repair, and worker-allocation questions need actual counterfactual action runs. A yes/no answer alone supplies no evidence of time saved. Likewise, a staged replay that reuses a prefix requires a correct checkpoint/resume engine; this harness does not implement one or claim its savings.

## Reuse your completed run without rerunning it

From PowerShell in `C:\Users\adamc\jevnest-lab`:

```powershell
node scripts/prepare-jev-question-cases.cjs jev-results/production-first-live jev-results/question-study/cases.json
npm.cmd run questions:prepare -- --cases jev-results/question-study/cases.json --out jev-results/question-study/pack
```

For the uploaded four-job run this produces **16 candidate cases, 160 judgments, in four requests**: five applicable hypotheses × two wordings × four candidates × four jobs. This is a retrospective development pack, not an independent validation set. The minimum material gain is explicitly set to one sheet or 10 mm of roll length for this pack; change it in a new cases file to suit a real production target.

When ready to purchase those actual predictions:

```powershell
npm.cmd run questions:collect -- --pack jev-results/question-study/pack/requests.json --out jev-results/question-study/answers --max-calls 4
```

The key is entered at a hidden local prompt, or read from `TYPESAFE_API_KEY`. Do not paste a key into a command or chat. Raw successful responses are saved before validation. Completed answers and saved receipts are reused on resume, but these cached latencies are never presented as fresh live timing. The cap counts new requests in that invocation. A request lost before its receipt was saved may already have been billed. Failed receipts stop the run for inspection; no automatic retries or hidden fallback answers.

The four requests do **not** cover the entire question bank; the other questions need their specified states and actions. Use `--families branch_quality,branch_cost` or `--styles casual` with `questions:prepare` to choose an experiment. Every case must explicitly name its `applicableHypotheses`; required evidence is checked at the top-level field boundary. The experiment author must validate the meaning, completeness, nested thresholds and timestamp provenance of those fields. The compiler cannot establish those facts from arbitrary JSON.

## Labels and scoring

Keep measured outcomes out of `cases.json`. Provide a separate `labels.json`:

```json
[
  {
    "caseId": "a-real-case-id",
    "hypothesis": "branch_quality_beat_best",
    "value": true,
    "evidenceRef": "path/to/validated-completion-record.json"
  }
]
```

This illustrates the schema, not a measured result. Omit labels that are not yet measured or are censored; never convert unknown to false. Both wordings join to the same case/hypothesis outcome. `evidenceRef` records provenance; the scoring script does not independently verify that referenced geometry or label. Audit those records before interpreting scores.

```powershell
npm.cmd run questions:score -- --answers jev-results/question-study/answers --labels labels.json --out jev-results/question-study/prediction-scores.json
```

This reports Brier score and accuracy at a fixed 0.5 threshold per question, plus unlabelled counts. It deliberately makes **no automatic speedup claim**. Different hypotheses have different base rates; compare wording within the same hypothesis and cases. Net saved time, regret, calibration plots, family-level uncertainty, and counterfactual execution require the separately measured study data.

## Files for review

The generated files contain requests and measured receipts, not secret headers. Before sharing, review job data for customer information. All original benchmark outputs remain intact; nothing here changes the nesting heuristic.
