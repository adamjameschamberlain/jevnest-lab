# First Jev question study: observed outcomes

The uploaded study contains 160 Noul answers: 16 candidate states × 5 hypotheses × 2 wordings. It does not test the other 55 hypotheses in the question bank. Four jobs represent three source families, with one seed and a 16-part prefix. This is development data.

## Main findings

- All ten question variants prefer the same candidate as the arithmetic control on each of the four jobs, using maximum yes-probability for improvement questions and minimum yes-probability for the bad-tail question.
- These common first choices are the best of the four completed candidates on two jobs, and lose on both roll jobs.
- Three previously unobserved candidates were completed locally with the frozen production geometry engine and a 120-second deadline. All completed and passed geometry validation; their local runtimes are not Windows benchmark timings.
- There is no observed question-dependent improvement in the first candidate selected, and no measured live nesting speedup from this offline study.

| Job | Every variant and control chooses | Best completed candidate | Chosen outcome | Best outcome |
|---|---|---|---|---|
| Albano, 500, sheets | p4 | p4 | 33 sheets | 33 sheets |
| Blaz, 250, roll | p1 | p3 | 28.073247 m | 27.674302 m |
| Shirts, 500, roll | p4 | p2 | 13.457446 m | 13.406814 m |
| Shirts, 100, sheets | p1 | p1 | 2 sheets, 2781.167634 mm summed occupied extent | same |

## Probabilities and wording

Ten of sixteen candidates beat their starting incumbent under the declared comparator. For `beat_best`, casual wording assigns every candidate less than 0.5; technical wording assigns only one more than 0.5. A naive 0.5 filter would reject all ten improving candidates with casual wording, or nine with technical wording. These probabilities are not suitable as unvalidated pruning thresholds.

Casual versus technical wording changes the yes-probability by 0.03275 on average, at most 0.15. Six of eighty paired judgments cross the fixed 0.5 decision threshold. No top-ranked candidate changes between wordings. One response per wording does not separate wording effects from response variation.

The casual bad-tail wording gets 12/16 binary outcomes right versus 8/16 for its technical version. That is an exploratory difference on sixteen correlated states, not evidence of a reliable prompt winner. It would still incorrectly flag three genuinely improving candidates as bad at the 0.5 threshold.

The three targets `save_material`, `small_win` and `hit_target` are equivalent for these supplied targets, so their predictions test paraphrase consistency, not three independent decisions. Brier scores and threshold counts for all ten variants are in `audit.json`.

## API and provenance

Four requests took 3.2412411 seconds in aggregate recorded API latency. Usage: 57,798 input tokens and 4,044 output tokens. This is batched offline prediction latency, not a measured nesting speedup or per-decision deployment cost. Monetary cost is unknown without the account rate.

`audit.json` records archive SHA-256 hashes, all answers, quality metrics, labels and descriptive statistics. `additional-completions.json` retains the three new measured outcomes, validation results and proposal digests. Original proposals were matched by digest across policy runs; observed duplicate outcomes agreed exactly. The original thirteen outcomes come from saved complete evaluations; not every non-incumbent has a separate saved geometry validation. The three new completions each have explicit successful validation.

No additional paid model calls were made for this audit. Missing outcomes were obtained by executing the supplied fixed schedules, not by treating model predictions as labels. This audit does not establish that deeper geometry evidence, stopping/restarting, reuse, or another model would help; those remain untested.
