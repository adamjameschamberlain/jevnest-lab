# question design

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## ask which option wins rather than whether each looks good

Jev answers a direct pairwise choice with explicit targets, then candidates are compared by a fixed tournament rule.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_direct_pair_speed_2x** — Could we ask which option wins rather than whether each looks good and reach the same useful nesting quality in half the time?
- **question_design_direct_pair_speed_5x** — Could we ask which option wins rather than whether each looks good and cut the time to a useful nest by five times?
- **question_design_direct_pair_material** — If we ask which option wins rather than whether each looks good, could we use meaningfully less material in the same search time?
- **question_design_direct_pair_jev_value** — If we ask which option wins rather than whether each looks good, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_direct_pair_evidence_ready** — Do our current records contain enough information to tell Jev when to ask which option wins rather than whether each looks good?
- **question_design_direct_pair_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to ask which option wins rather than whether each looks good?
- **question_design_direct_pair_history_helps** — Would showing what has already worked and failed help Jev decide whether to ask which option wins rather than whether each looks good?
- **question_design_direct_pair_parallel_batch** — Can we ask about several independent opportunities to ask which option wins rather than whether each looks good together and make the whole search faster?
- **question_design_direct_pair_transfer** — If it helps to ask which option wins rather than whether each looks good here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_direct_pair_bad_failure** — Could a confident but wrong decision to ask which option wins rather than whether each looks good leave us with a seriously worse nest?

## ask how costly it would be to skip this option

Jev predicts whether discarding a candidate would miss a defined material or time improvement.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_regret_question_speed_2x** — Could we ask how costly it would be to skip this option and reach the same useful nesting quality in half the time?
- **question_design_regret_question_speed_5x** — Could we ask how costly it would be to skip this option and cut the time to a useful nest by five times?
- **question_design_regret_question_material** — If we ask how costly it would be to skip this option, could we use meaningfully less material in the same search time?
- **question_design_regret_question_jev_value** — If we ask how costly it would be to skip this option, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_regret_question_evidence_ready** — Do our current records contain enough information to tell Jev when to ask how costly it would be to skip this option?
- **question_design_regret_question_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to ask how costly it would be to skip this option?
- **question_design_regret_question_history_helps** — Would showing what has already worked and failed help Jev decide whether to ask how costly it would be to skip this option?
- **question_design_regret_question_parallel_batch** — Can we ask about several independent opportunities to ask how costly it would be to skip this option together and make the whole search faster?
- **question_design_regret_question_transfer** — If it helps to ask how costly it would be to skip this option here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_regret_question_bad_failure** — Could a confident but wrong decision to ask how costly it would be to skip this option leave us with a seriously worse nest?

## ask what could make the obvious favourite lose

Jev judges supplied concrete failure hypotheses for the cheap rule's favourite before deciding on extra evaluation.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_falsify_favourite_speed_2x** — Could we ask what could make the obvious favourite lose and reach the same useful nesting quality in half the time?
- **question_design_falsify_favourite_speed_5x** — Could we ask what could make the obvious favourite lose and cut the time to a useful nest by five times?
- **question_design_falsify_favourite_material** — If we ask what could make the obvious favourite lose, could we use meaningfully less material in the same search time?
- **question_design_falsify_favourite_jev_value** — If we ask what could make the obvious favourite lose, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_falsify_favourite_evidence_ready** — Do our current records contain enough information to tell Jev when to ask what could make the obvious favourite lose?
- **question_design_falsify_favourite_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to ask what could make the obvious favourite lose?
- **question_design_falsify_favourite_history_helps** — Would showing what has already worked and failed help Jev decide whether to ask what could make the obvious favourite lose?
- **question_design_falsify_favourite_parallel_batch** — Can we ask about several independent opportunities to ask what could make the obvious favourite lose together and make the whole search faster?
- **question_design_falsify_favourite_transfer** — If it helps to ask what could make the obvious favourite lose here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_falsify_favourite_bad_failure** — Could a confident but wrong decision to ask what could make the obvious favourite lose leave us with a seriously worse nest?

## ask about time and quality separately

Jev supplies independent outcome and runtime judgments combined by a frozen, evaluated decision rule.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_separate_cost_quality_speed_2x** — Could we ask about time and quality separately and reach the same useful nesting quality in half the time?
- **question_design_separate_cost_quality_speed_5x** — Could we ask about time and quality separately and cut the time to a useful nest by five times?
- **question_design_separate_cost_quality_material** — If we ask about time and quality separately, could we use meaningfully less material in the same search time?
- **question_design_separate_cost_quality_jev_value** — If we ask about time and quality separately, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_separate_cost_quality_evidence_ready** — Do our current records contain enough information to tell Jev when to ask about time and quality separately?
- **question_design_separate_cost_quality_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to ask about time and quality separately?
- **question_design_separate_cost_quality_history_helps** — Would showing what has already worked and failed help Jev decide whether to ask about time and quality separately?
- **question_design_separate_cost_quality_parallel_batch** — Can we ask about several independent opportunities to ask about time and quality separately together and make the whole search faster?
- **question_design_separate_cost_quality_transfer** — If it helps to ask about time and quality separately here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_separate_cost_quality_bad_failure** — Could a confident but wrong decision to ask about time and quality separately leave us with a seriously worse nest?

## ask about the improvement instead of absolute goodness

Jev predicts a candidate's gain relative to the current incumbent at an explicit deadline.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_relative_delta_speed_2x** — Could we ask about the improvement instead of absolute goodness and reach the same useful nesting quality in half the time?
- **question_design_relative_delta_speed_5x** — Could we ask about the improvement instead of absolute goodness and cut the time to a useful nest by five times?
- **question_design_relative_delta_material** — If we ask about the improvement instead of absolute goodness, could we use meaningfully less material in the same search time?
- **question_design_relative_delta_jev_value** — If we ask about the improvement instead of absolute goodness, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_relative_delta_evidence_ready** — Do our current records contain enough information to tell Jev when to ask about the improvement instead of absolute goodness?
- **question_design_relative_delta_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to ask about the improvement instead of absolute goodness?
- **question_design_relative_delta_history_helps** — Would showing what has already worked and failed help Jev decide whether to ask about the improvement instead of absolute goodness?
- **question_design_relative_delta_parallel_batch** — Can we ask about several independent opportunities to ask about the improvement instead of absolute goodness together and make the whole search faster?
- **question_design_relative_delta_transfer** — If it helps to ask about the improvement instead of absolute goodness here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_relative_delta_bad_failure** — Could a confident but wrong decision to ask about the improvement instead of absolute goodness leave us with a seriously worse nest?

## let the question sound like an experienced operator

Jev receives a concise casual question with a fixed shared objective, compared with equivalent technical wording.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_casual_only_speed_2x** — Could we let the question sound like an experienced operator and reach the same useful nesting quality in half the time?
- **question_design_casual_only_speed_5x** — Could we let the question sound like an experienced operator and cut the time to a useful nest by five times?
- **question_design_casual_only_material** — If we let the question sound like an experienced operator, could we use meaningfully less material in the same search time?
- **question_design_casual_only_jev_value** — If we let the question sound like an experienced operator, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_casual_only_evidence_ready** — Do our current records contain enough information to tell Jev when to let the question sound like an experienced operator?
- **question_design_casual_only_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to let the question sound like an experienced operator?
- **question_design_casual_only_history_helps** — Would showing what has already worked and failed help Jev decide whether to let the question sound like an experienced operator?
- **question_design_casual_only_parallel_batch** — Can we ask about several independent opportunities to let the question sound like an experienced operator together and make the whole search faster?
- **question_design_casual_only_transfer** — If it helps to let the question sound like an experienced operator here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_casual_only_bad_failure** — Could a confident but wrong decision to let the question sound like an experienced operator leave us with a seriously worse nest?

## ask whether this is a waste of time

Jev predicts an explicit bad-outcome event instead of its positive complement, with disagreement measured against outcomes.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_negative_framing_speed_2x** — Could we ask whether this is a waste of time and reach the same useful nesting quality in half the time?
- **question_design_negative_framing_speed_5x** — Could we ask whether this is a waste of time and cut the time to a useful nest by five times?
- **question_design_negative_framing_material** — If we ask whether this is a waste of time, could we use meaningfully less material in the same search time?
- **question_design_negative_framing_jev_value** — If we ask whether this is a waste of time, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_negative_framing_evidence_ready** — Do our current records contain enough information to tell Jev when to ask whether this is a waste of time?
- **question_design_negative_framing_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to ask whether this is a waste of time?
- **question_design_negative_framing_history_helps** — Would showing what has already worked and failed help Jev decide whether to ask whether this is a waste of time?
- **question_design_negative_framing_parallel_batch** — Can we ask about several independent opportunities to ask whether this is a waste of time together and make the whole search faster?
- **question_design_negative_framing_transfer** — If it helps to ask whether this is a waste of time here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_negative_framing_bad_failure** — Could a confident but wrong decision to ask whether this is a waste of time leave us with a seriously worse nest?

## let the model admit when the cheap rule should decide

Jev selects an explicit defer option, evaluated for useful coverage and errors on the remaining decisions.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_abstention_speed_2x** — Could we let the model admit when the cheap rule should decide and reach the same useful nesting quality in half the time?
- **question_design_abstention_speed_5x** — Could we let the model admit when the cheap rule should decide and cut the time to a useful nest by five times?
- **question_design_abstention_material** — If we let the model admit when the cheap rule should decide, could we use meaningfully less material in the same search time?
- **question_design_abstention_jev_value** — If we let the model admit when the cheap rule should decide, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_abstention_evidence_ready** — Do our current records contain enough information to tell Jev when to let the model admit when the cheap rule should decide?
- **question_design_abstention_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to let the model admit when the cheap rule should decide?
- **question_design_abstention_history_helps** — Would showing what has already worked and failed help Jev decide whether to let the model admit when the cheap rule should decide?
- **question_design_abstention_parallel_batch** — Can we ask about several independent opportunities to let the model admit when the cheap rule should decide together and make the whole search faster?
- **question_design_abstention_transfer** — If it helps to let the model admit when the cheap rule should decide here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_abstention_bad_failure** — Could a confident but wrong decision to let the model admit when the cheap rule should decide leave us with a seriously worse nest?

## show a few real successes and failures from different jobs

Jev receives a fixed development-only set of labelled examples before answering held-out job decisions.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_few_shot_outcomes_speed_2x** — Could we show a few real successes and failures from different jobs and reach the same useful nesting quality in half the time?
- **question_design_few_shot_outcomes_speed_5x** — Could we show a few real successes and failures from different jobs and cut the time to a useful nest by five times?
- **question_design_few_shot_outcomes_material** — If we show a few real successes and failures from different jobs, could we use meaningfully less material in the same search time?
- **question_design_few_shot_outcomes_jev_value** — If we show a few real successes and failures from different jobs, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_few_shot_outcomes_evidence_ready** — Do our current records contain enough information to tell Jev when to show a few real successes and failures from different jobs?
- **question_design_few_shot_outcomes_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to show a few real successes and failures from different jobs?
- **question_design_few_shot_outcomes_history_helps** — Would showing what has already worked and failed help Jev decide whether to show a few real successes and failures from different jobs?
- **question_design_few_shot_outcomes_parallel_batch** — Can we ask about several independent opportunities to show a few real successes and failures from different jobs together and make the whole search faster?
- **question_design_few_shot_outcomes_transfer** — If it helps to show a few real successes and failures from different jobs here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_few_shot_outcomes_bad_failure** — Could a confident but wrong decision to show a few real successes and failures from different jobs leave us with a seriously worse nest?

## hide labels that might steer the answer

Jev ranks anonymised candidates with rotated presentation order, testing sensitivity without changing their geometry.

**Evidence needed:** Matched decision states, fixed targets, measured labels and controlled wording or representation variants.

- **question_design_blind_identifiers_speed_2x** — Could we hide labels that might steer the answer and reach the same useful nesting quality in half the time?
- **question_design_blind_identifiers_speed_5x** — Could we hide labels that might steer the answer and cut the time to a useful nest by five times?
- **question_design_blind_identifiers_material** — If we hide labels that might steer the answer, could we use meaningfully less material in the same search time?
- **question_design_blind_identifiers_jev_value** — If we hide labels that might steer the answer, would Jev make it faster than a cheap rule making those same decisions?
- **question_design_blind_identifiers_evidence_ready** — Do our current records contain enough information to tell Jev when to hide labels that might steer the answer?
- **question_design_blind_identifiers_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to hide labels that might steer the answer?
- **question_design_blind_identifiers_history_helps** — Would showing what has already worked and failed help Jev decide whether to hide labels that might steer the answer?
- **question_design_blind_identifiers_parallel_batch** — Can we ask about several independent opportunities to hide labels that might steer the answer together and make the whole search faster?
- **question_design_blind_identifiers_transfer** — If it helps to hide labels that might steer the answer here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **question_design_blind_identifiers_bad_failure** — Could a confident but wrong decision to hide labels that might steer the answer leave us with a seriously worse nest?

