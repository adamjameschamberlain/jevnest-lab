# stopping

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## stop polishing a nest that has stopped improving

Jev chooses whether to end a search window from incumbent improvements, evaluation costs, and stagnation history.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_plateau_speed_2x** — Could we stop polishing a nest that has stopped improving and reach the same useful nesting quality in half the time?
- **stopping_plateau_speed_5x** — Could we stop polishing a nest that has stopped improving and cut the time to a useful nest by five times?
- **stopping_plateau_material** — If we stop polishing a nest that has stopped improving, could we use meaningfully less material in the same search time?
- **stopping_plateau_jev_value** — If we stop polishing a nest that has stopped improving, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_plateau_evidence_ready** — Do our current records contain enough information to tell Jev when to stop polishing a nest that has stopped improving?
- **stopping_plateau_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to stop polishing a nest that has stopped improving?
- **stopping_plateau_history_helps** — Would showing what has already worked and failed help Jev decide whether to stop polishing a nest that has stopped improving?
- **stopping_plateau_parallel_batch** — Can we ask about several independent opportunities to stop polishing a nest that has stopped improving together and make the whole search faster?
- **stopping_plateau_transfer** — If it helps to stop polishing a nest that has stopped improving here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_plateau_bad_failure** — Could a confident but wrong decision to stop polishing a nest that has stopped improving leave us with a seriously worse nest?

## quit when the next second is unlikely to pay

Jev predicts marginal material gain per additional second and chooses between stopping and another fixed window.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_marginal_return_speed_2x** — Could we quit when the next second is unlikely to pay and reach the same useful nesting quality in half the time?
- **stopping_marginal_return_speed_5x** — Could we quit when the next second is unlikely to pay and cut the time to a useful nest by five times?
- **stopping_marginal_return_material** — If we quit when the next second is unlikely to pay, could we use meaningfully less material in the same search time?
- **stopping_marginal_return_jev_value** — If we quit when the next second is unlikely to pay, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_marginal_return_evidence_ready** — Do our current records contain enough information to tell Jev when to quit when the next second is unlikely to pay?
- **stopping_marginal_return_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to quit when the next second is unlikely to pay?
- **stopping_marginal_return_history_helps** — Would showing what has already worked and failed help Jev decide whether to quit when the next second is unlikely to pay?
- **stopping_marginal_return_parallel_batch** — Can we ask about several independent opportunities to quit when the next second is unlikely to pay together and make the whole search faster?
- **stopping_marginal_return_transfer** — If it helps to quit when the next second is unlikely to pay here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_marginal_return_bad_failure** — Could a confident but wrong decision to quit when the next second is unlikely to pay leave us with a seriously worse nest?

## finish as soon as the result is useful enough

Jev predicts whether further search is worthwhile after an explicit production quality target is reached.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_target_satisfied_speed_2x** — Could we finish as soon as the result is useful enough and reach the same useful nesting quality in half the time?
- **stopping_target_satisfied_speed_5x** — Could we finish as soon as the result is useful enough and cut the time to a useful nest by five times?
- **stopping_target_satisfied_material** — If we finish as soon as the result is useful enough, could we use meaningfully less material in the same search time?
- **stopping_target_satisfied_jev_value** — If we finish as soon as the result is useful enough, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_target_satisfied_evidence_ready** — Do our current records contain enough information to tell Jev when to finish as soon as the result is useful enough?
- **stopping_target_satisfied_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to finish as soon as the result is useful enough?
- **stopping_target_satisfied_history_helps** — Would showing what has already worked and failed help Jev decide whether to finish as soon as the result is useful enough?
- **stopping_target_satisfied_parallel_batch** — Can we ask about several independent opportunities to finish as soon as the result is useful enough together and make the whole search faster?
- **stopping_target_satisfied_transfer** — If it helps to finish as soon as the result is useful enough here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_target_satisfied_bad_failure** — Could a confident but wrong decision to finish as soon as the result is useful enough leave us with a seriously worse nest?

## stop when there is hardly any room left to win

Jev uses a deterministic lower bound and search history to choose whether to continue; the bound itself is computed exactly.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_gap_bound_speed_2x** — Could we stop when there is hardly any room left to win and reach the same useful nesting quality in half the time?
- **stopping_gap_bound_speed_5x** — Could we stop when there is hardly any room left to win and cut the time to a useful nest by five times?
- **stopping_gap_bound_material** — If we stop when there is hardly any room left to win, could we use meaningfully less material in the same search time?
- **stopping_gap_bound_jev_value** — If we stop when there is hardly any room left to win, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_gap_bound_evidence_ready** — Do our current records contain enough information to tell Jev when to stop when there is hardly any room left to win?
- **stopping_gap_bound_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to stop when there is hardly any room left to win?
- **stopping_gap_bound_history_helps** — Would showing what has already worked and failed help Jev decide whether to stop when there is hardly any room left to win?
- **stopping_gap_bound_parallel_batch** — Can we ask about several independent opportunities to stop when there is hardly any room left to win together and make the whole search faster?
- **stopping_gap_bound_transfer** — If it helps to stop when there is hardly any room left to win here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_gap_bound_bad_failure** — Could a confident but wrong decision to stop when there is hardly any room left to win leave us with a seriously worse nest?

## avoid starting work that will finish after the deadline

Jev chooses which complete-layout attempts can repay their cost within the remaining wall-time budget.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_deadline_tail_speed_2x** — Could we avoid starting work that will finish after the deadline and reach the same useful nesting quality in half the time?
- **stopping_deadline_tail_speed_5x** — Could we avoid starting work that will finish after the deadline and cut the time to a useful nest by five times?
- **stopping_deadline_tail_material** — If we avoid starting work that will finish after the deadline, could we use meaningfully less material in the same search time?
- **stopping_deadline_tail_jev_value** — If we avoid starting work that will finish after the deadline, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_deadline_tail_evidence_ready** — Do our current records contain enough information to tell Jev when to avoid starting work that will finish after the deadline?
- **stopping_deadline_tail_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to avoid starting work that will finish after the deadline?
- **stopping_deadline_tail_history_helps** — Would showing what has already worked and failed help Jev decide whether to avoid starting work that will finish after the deadline?
- **stopping_deadline_tail_parallel_batch** — Can we ask about several independent opportunities to avoid starting work that will finish after the deadline together and make the whole search faster?
- **stopping_deadline_tail_transfer** — If it helps to avoid starting work that will finish after the deadline here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_deadline_tail_bad_failure** — Could a confident but wrong decision to avoid starting work that will finish after the deadline leave us with a seriously worse nest?

## stop retrying a family of moves that keeps failing

Jev suspends an operator family after its recent validated outcomes show little benefit.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_stale_family_speed_2x** — Could we stop retrying a family of moves that keeps failing and reach the same useful nesting quality in half the time?
- **stopping_stale_family_speed_5x** — Could we stop retrying a family of moves that keeps failing and cut the time to a useful nest by five times?
- **stopping_stale_family_material** — If we stop retrying a family of moves that keeps failing, could we use meaningfully less material in the same search time?
- **stopping_stale_family_jev_value** — If we stop retrying a family of moves that keeps failing, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_stale_family_evidence_ready** — Do our current records contain enough information to tell Jev when to stop retrying a family of moves that keeps failing?
- **stopping_stale_family_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to stop retrying a family of moves that keeps failing?
- **stopping_stale_family_history_helps** — Would showing what has already worked and failed help Jev decide whether to stop retrying a family of moves that keeps failing?
- **stopping_stale_family_parallel_batch** — Can we ask about several independent opportunities to stop retrying a family of moves that keeps failing together and make the whole search faster?
- **stopping_stale_family_transfer** — If it helps to stop retrying a family of moves that keeps failing here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_stale_family_bad_failure** — Could a confident but wrong decision to stop retrying a family of moves that keeps failing leave us with a seriously worse nest?

## ask whether to stop only at useful moments

Jev schedules the next stopping checkpoint using observed improvement intervals and decision overhead.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_periodic_check_speed_2x** — Could we ask whether to stop only at useful moments and reach the same useful nesting quality in half the time?
- **stopping_periodic_check_speed_5x** — Could we ask whether to stop only at useful moments and cut the time to a useful nest by five times?
- **stopping_periodic_check_material** — If we ask whether to stop only at useful moments, could we use meaningfully less material in the same search time?
- **stopping_periodic_check_jev_value** — If we ask whether to stop only at useful moments, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_periodic_check_evidence_ready** — Do our current records contain enough information to tell Jev when to ask whether to stop only at useful moments?
- **stopping_periodic_check_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to ask whether to stop only at useful moments?
- **stopping_periodic_check_history_helps** — Would showing what has already worked and failed help Jev decide whether to ask whether to stop only at useful moments?
- **stopping_periodic_check_parallel_batch** — Can we ask about several independent opportunities to ask whether to stop only at useful moments together and make the whole search faster?
- **stopping_periodic_check_transfer** — If it helps to ask whether to stop only at useful moments here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_periodic_check_bad_failure** — Could a confident but wrong decision to ask whether to stop only at useful moments leave us with a seriously worse nest?

## stop rearranging full sheets when only the last one matters

Jev freezes settled sheets and allocates remaining search to the final incomplete sheet, subject to full quality comparison.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_last_sheet_speed_2x** — Could we stop rearranging full sheets when only the last one matters and reach the same useful nesting quality in half the time?
- **stopping_last_sheet_speed_5x** — Could we stop rearranging full sheets when only the last one matters and cut the time to a useful nest by five times?
- **stopping_last_sheet_material** — If we stop rearranging full sheets when only the last one matters, could we use meaningfully less material in the same search time?
- **stopping_last_sheet_jev_value** — If we stop rearranging full sheets when only the last one matters, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_last_sheet_evidence_ready** — Do our current records contain enough information to tell Jev when to stop rearranging full sheets when only the last one matters?
- **stopping_last_sheet_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to stop rearranging full sheets when only the last one matters?
- **stopping_last_sheet_history_helps** — Would showing what has already worked and failed help Jev decide whether to stop rearranging full sheets when only the last one matters?
- **stopping_last_sheet_parallel_batch** — Can we ask about several independent opportunities to stop rearranging full sheets when only the last one matters together and make the whole search faster?
- **stopping_last_sheet_transfer** — If it helps to stop rearranging full sheets when only the last one matters here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_last_sheet_bad_failure** — Could a confident but wrong decision to stop rearranging full sheets when only the last one matters leave us with a seriously worse nest?

## spend another check only when stopping is genuinely uncertain

Jev routes uncertain stop decisions to a short exact continuation before committing to stop.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_stop_confidence_speed_2x** — Could we spend another check only when stopping is genuinely uncertain and reach the same useful nesting quality in half the time?
- **stopping_stop_confidence_speed_5x** — Could we spend another check only when stopping is genuinely uncertain and cut the time to a useful nest by five times?
- **stopping_stop_confidence_material** — If we spend another check only when stopping is genuinely uncertain, could we use meaningfully less material in the same search time?
- **stopping_stop_confidence_jev_value** — If we spend another check only when stopping is genuinely uncertain, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_stop_confidence_evidence_ready** — Do our current records contain enough information to tell Jev when to spend another check only when stopping is genuinely uncertain?
- **stopping_stop_confidence_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to spend another check only when stopping is genuinely uncertain?
- **stopping_stop_confidence_history_helps** — Would showing what has already worked and failed help Jev decide whether to spend another check only when stopping is genuinely uncertain?
- **stopping_stop_confidence_parallel_batch** — Can we ask about several independent opportunities to spend another check only when stopping is genuinely uncertain together and make the whole search faster?
- **stopping_stop_confidence_transfer** — If it helps to spend another check only when stopping is genuinely uncertain here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_stop_confidence_bad_failure** — Could a confident but wrong decision to spend another check only when stopping is genuinely uncertain leave us with a seriously worse nest?

## abandon branches that are heading for an avoidable extra sheet

Jev predicts an uncompetitive completion from a partial layout; rejected branches are audited and exact bounds remain separate.

**Evidence needed:** Checkpointed improvement and cost history; executable continuation windows and stopped-run targets.

- **stopping_completion_bound_speed_2x** — Could we abandon branches that are heading for an avoidable extra sheet and reach the same useful nesting quality in half the time?
- **stopping_completion_bound_speed_5x** — Could we abandon branches that are heading for an avoidable extra sheet and cut the time to a useful nest by five times?
- **stopping_completion_bound_material** — If we abandon branches that are heading for an avoidable extra sheet, could we use meaningfully less material in the same search time?
- **stopping_completion_bound_jev_value** — If we abandon branches that are heading for an avoidable extra sheet, would Jev make it faster than a cheap rule making those same decisions?
- **stopping_completion_bound_evidence_ready** — Do our current records contain enough information to tell Jev when to abandon branches that are heading for an avoidable extra sheet?
- **stopping_completion_bound_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to abandon branches that are heading for an avoidable extra sheet?
- **stopping_completion_bound_history_helps** — Would showing what has already worked and failed help Jev decide whether to abandon branches that are heading for an avoidable extra sheet?
- **stopping_completion_bound_parallel_batch** — Can we ask about several independent opportunities to abandon branches that are heading for an avoidable extra sheet together and make the whole search faster?
- **stopping_completion_bound_transfer** — If it helps to abandon branches that are heading for an avoidable extra sheet here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **stopping_completion_bound_bad_failure** — Could a confident but wrong decision to abandon branches that are heading for an avoidable extra sheet leave us with a seriously worse nest?

