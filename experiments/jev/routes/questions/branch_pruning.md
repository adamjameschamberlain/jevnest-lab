# branch pruning

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## throw away bad starts before completing them

Jev ranks candidate schedules using a measured inexpensive prefix and selects a subset for full completion.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_cheap_prefix_speed_2x** — Could we throw away bad starts before completing them and reach the same useful nesting quality in half the time?
- **branch_pruning_cheap_prefix_speed_5x** — Could we throw away bad starts before completing them and cut the time to a useful nest by five times?
- **branch_pruning_cheap_prefix_material** — If we throw away bad starts before completing them, could we use meaningfully less material in the same search time?
- **branch_pruning_cheap_prefix_jev_value** — If we throw away bad starts before completing them, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_cheap_prefix_evidence_ready** — Do our current records contain enough information to tell Jev when to throw away bad starts before completing them?
- **branch_pruning_cheap_prefix_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to throw away bad starts before completing them?
- **branch_pruning_cheap_prefix_history_helps** — Would showing what has already worked and failed help Jev decide whether to throw away bad starts before completing them?
- **branch_pruning_cheap_prefix_parallel_batch** — Can we ask about several independent opportunities to throw away bad starts before completing them together and make the whole search faster?
- **branch_pruning_cheap_prefix_transfer** — If it helps to throw away bad starts before completing them here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_cheap_prefix_bad_failure** — Could a confident but wrong decision to throw away bad starts before completing them leave us with a seriously worse nest?

## look a little deeper only where it changes the choice

Jev chooses whether each candidate needs another prefix depth before being kept or discarded.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_multi_depth_speed_2x** — Could we look a little deeper only where it changes the choice and reach the same useful nesting quality in half the time?
- **branch_pruning_multi_depth_speed_5x** — Could we look a little deeper only where it changes the choice and cut the time to a useful nest by five times?
- **branch_pruning_multi_depth_material** — If we look a little deeper only where it changes the choice, could we use meaningfully less material in the same search time?
- **branch_pruning_multi_depth_jev_value** — If we look a little deeper only where it changes the choice, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_multi_depth_evidence_ready** — Do our current records contain enough information to tell Jev when to look a little deeper only where it changes the choice?
- **branch_pruning_multi_depth_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to look a little deeper only where it changes the choice?
- **branch_pruning_multi_depth_history_helps** — Would showing what has already worked and failed help Jev decide whether to look a little deeper only where it changes the choice?
- **branch_pruning_multi_depth_parallel_batch** — Can we ask about several independent opportunities to look a little deeper only where it changes the choice together and make the whole search faster?
- **branch_pruning_multi_depth_transfer** — If it helps to look a little deeper only where it changes the choice here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_multi_depth_bad_failure** — Could a confident but wrong decision to look a little deeper only where it changes the choice leave us with a seriously worse nest?

## compare two live options directly

Jev chooses between two candidates using the same incumbent, constraints, and evidence rather than independent absolute scores.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_pairwise_speed_2x** — Could we compare two live options directly and reach the same useful nesting quality in half the time?
- **branch_pruning_pairwise_speed_5x** — Could we compare two live options directly and cut the time to a useful nest by five times?
- **branch_pruning_pairwise_material** — If we compare two live options directly, could we use meaningfully less material in the same search time?
- **branch_pruning_pairwise_jev_value** — If we compare two live options directly, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_pairwise_evidence_ready** — Do our current records contain enough information to tell Jev when to compare two live options directly?
- **branch_pruning_pairwise_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to compare two live options directly?
- **branch_pruning_pairwise_history_helps** — Would showing what has already worked and failed help Jev decide whether to compare two live options directly?
- **branch_pruning_pairwise_parallel_batch** — Can we ask about several independent opportunities to compare two live options directly together and make the whole search faster?
- **branch_pruning_pairwise_transfer** — If it helps to compare two live options directly here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_pairwise_bad_failure** — Could a confident but wrong decision to compare two live options directly leave us with a seriously worse nest?

## judge against what we already have

Jev predicts improvement relative to the current valid incumbent instead of generic compactness.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_relative_best_speed_2x** — Could we judge against what we already have and reach the same useful nesting quality in half the time?
- **branch_pruning_relative_best_speed_5x** — Could we judge against what we already have and cut the time to a useful nest by five times?
- **branch_pruning_relative_best_material** — If we judge against what we already have, could we use meaningfully less material in the same search time?
- **branch_pruning_relative_best_jev_value** — If we judge against what we already have, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_relative_best_evidence_ready** — Do our current records contain enough information to tell Jev when to judge against what we already have?
- **branch_pruning_relative_best_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to judge against what we already have?
- **branch_pruning_relative_best_history_helps** — Would showing what has already worked and failed help Jev decide whether to judge against what we already have?
- **branch_pruning_relative_best_parallel_batch** — Can we ask about several independent opportunities to judge against what we already have together and make the whole search faster?
- **branch_pruning_relative_best_transfer** — If it helps to judge against what we already have here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_relative_best_bad_failure** — Could a confident but wrong decision to judge against what we already have leave us with a seriously worse nest?

## avoid completing several versions of the same idea

Jev groups similar search proposals and chooses representative candidates for expensive completion.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_reject_redundant_speed_2x** — Could we avoid completing several versions of the same idea and reach the same useful nesting quality in half the time?
- **branch_pruning_reject_redundant_speed_5x** — Could we avoid completing several versions of the same idea and cut the time to a useful nest by five times?
- **branch_pruning_reject_redundant_material** — If we avoid completing several versions of the same idea, could we use meaningfully less material in the same search time?
- **branch_pruning_reject_redundant_jev_value** — If we avoid completing several versions of the same idea, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_reject_redundant_evidence_ready** — Do our current records contain enough information to tell Jev when to avoid completing several versions of the same idea?
- **branch_pruning_reject_redundant_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to avoid completing several versions of the same idea?
- **branch_pruning_reject_redundant_history_helps** — Would showing what has already worked and failed help Jev decide whether to avoid completing several versions of the same idea?
- **branch_pruning_reject_redundant_parallel_batch** — Can we ask about several independent opportunities to avoid completing several versions of the same idea together and make the whole search faster?
- **branch_pruning_reject_redundant_transfer** — If it helps to avoid completing several versions of the same idea here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_reject_redundant_bad_failure** — Could a confident but wrong decision to avoid completing several versions of the same idea leave us with a seriously worse nest?

## keep an odd-looking branch that might be the escape route

Jev retains one geometrically different candidate alongside the candidates preferred by the cheap score.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_keep_outlier_speed_2x** — Could we keep an odd-looking branch that might be the escape route and reach the same useful nesting quality in half the time?
- **branch_pruning_keep_outlier_speed_5x** — Could we keep an odd-looking branch that might be the escape route and cut the time to a useful nest by five times?
- **branch_pruning_keep_outlier_material** — If we keep an odd-looking branch that might be the escape route, could we use meaningfully less material in the same search time?
- **branch_pruning_keep_outlier_jev_value** — If we keep an odd-looking branch that might be the escape route, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_keep_outlier_evidence_ready** — Do our current records contain enough information to tell Jev when to keep an odd-looking branch that might be the escape route?
- **branch_pruning_keep_outlier_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to keep an odd-looking branch that might be the escape route?
- **branch_pruning_keep_outlier_history_helps** — Would showing what has already worked and failed help Jev decide whether to keep an odd-looking branch that might be the escape route?
- **branch_pruning_keep_outlier_parallel_batch** — Can we ask about several independent opportunities to keep an odd-looking branch that might be the escape route together and make the whole search faster?
- **branch_pruning_keep_outlier_transfer** — If it helps to keep an odd-looking branch that might be the escape route here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_keep_outlier_bad_failure** — Could a confident but wrong decision to keep an odd-looking branch that might be the escape route leave us with a seriously worse nest?

## spot the ugly ending behind a pretty beginning

Jev uses remaining-part composition and exact gap evidence to predict downstream completion quality.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_tail_predict_speed_2x** — Could we spot the ugly ending behind a pretty beginning and reach the same useful nesting quality in half the time?
- **branch_pruning_tail_predict_speed_5x** — Could we spot the ugly ending behind a pretty beginning and cut the time to a useful nest by five times?
- **branch_pruning_tail_predict_material** — If we spot the ugly ending behind a pretty beginning, could we use meaningfully less material in the same search time?
- **branch_pruning_tail_predict_jev_value** — If we spot the ugly ending behind a pretty beginning, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_tail_predict_evidence_ready** — Do our current records contain enough information to tell Jev when to spot the ugly ending behind a pretty beginning?
- **branch_pruning_tail_predict_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to spot the ugly ending behind a pretty beginning?
- **branch_pruning_tail_predict_history_helps** — Would showing what has already worked and failed help Jev decide whether to spot the ugly ending behind a pretty beginning?
- **branch_pruning_tail_predict_parallel_batch** — Can we ask about several independent opportunities to spot the ugly ending behind a pretty beginning together and make the whole search faster?
- **branch_pruning_tail_predict_transfer** — If it helps to spot the ugly ending behind a pretty beginning here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_tail_predict_bad_failure** — Could a confident but wrong decision to spot the ugly ending behind a pretty beginning leave us with a seriously worse nest?

## finish the useful cheap candidates first

Jev ranks candidates by expected quality gain and measured completion cost rather than quality alone.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_cost_aware_rank_speed_2x** — Could we finish the useful cheap candidates first and reach the same useful nesting quality in half the time?
- **branch_pruning_cost_aware_rank_speed_5x** — Could we finish the useful cheap candidates first and cut the time to a useful nest by five times?
- **branch_pruning_cost_aware_rank_material** — If we finish the useful cheap candidates first, could we use meaningfully less material in the same search time?
- **branch_pruning_cost_aware_rank_jev_value** — If we finish the useful cheap candidates first, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_cost_aware_rank_evidence_ready** — Do our current records contain enough information to tell Jev when to finish the useful cheap candidates first?
- **branch_pruning_cost_aware_rank_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to finish the useful cheap candidates first?
- **branch_pruning_cost_aware_rank_history_helps** — Would showing what has already worked and failed help Jev decide whether to finish the useful cheap candidates first?
- **branch_pruning_cost_aware_rank_parallel_batch** — Can we ask about several independent opportunities to finish the useful cheap candidates first together and make the whole search faster?
- **branch_pruning_cost_aware_rank_transfer** — If it helps to finish the useful cheap candidates first here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_cost_aware_rank_bad_failure** — Could a confident but wrong decision to finish the useful cheap candidates first leave us with a seriously worse nest?

## keep fewer branches when the choice looks clear

Jev chooses how many candidates survive a batch, with a fixed audit fraction of rejected branches.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_adaptive_keep_speed_2x** — Could we keep fewer branches when the choice looks clear and reach the same useful nesting quality in half the time?
- **branch_pruning_adaptive_keep_speed_5x** — Could we keep fewer branches when the choice looks clear and cut the time to a useful nest by five times?
- **branch_pruning_adaptive_keep_material** — If we keep fewer branches when the choice looks clear, could we use meaningfully less material in the same search time?
- **branch_pruning_adaptive_keep_jev_value** — If we keep fewer branches when the choice looks clear, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_adaptive_keep_evidence_ready** — Do our current records contain enough information to tell Jev when to keep fewer branches when the choice looks clear?
- **branch_pruning_adaptive_keep_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to keep fewer branches when the choice looks clear?
- **branch_pruning_adaptive_keep_history_helps** — Would showing what has already worked and failed help Jev decide whether to keep fewer branches when the choice looks clear?
- **branch_pruning_adaptive_keep_parallel_batch** — Can we ask about several independent opportunities to keep fewer branches when the choice looks clear together and make the whole search faster?
- **branch_pruning_adaptive_keep_transfer** — If it helps to keep fewer branches when the choice looks clear here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_adaptive_keep_bad_failure** — Could a confident but wrong decision to keep fewer branches when the choice looks clear leave us with a seriously worse nest?

## look twice at the candidate the cheap rule dislikes

Jev nominates a cheap-rule rejection for a bounded exact completion to seek missed improvements.

**Evidence needed:** Candidate schedules, staged prefix observations, full outcomes of rejected candidates and cost attribution.

- **branch_pruning_counterexample_speed_2x** — Could we look twice at the candidate the cheap rule dislikes and reach the same useful nesting quality in half the time?
- **branch_pruning_counterexample_speed_5x** — Could we look twice at the candidate the cheap rule dislikes and cut the time to a useful nest by five times?
- **branch_pruning_counterexample_material** — If we look twice at the candidate the cheap rule dislikes, could we use meaningfully less material in the same search time?
- **branch_pruning_counterexample_jev_value** — If we look twice at the candidate the cheap rule dislikes, would Jev make it faster than a cheap rule making those same decisions?
- **branch_pruning_counterexample_evidence_ready** — Do our current records contain enough information to tell Jev when to look twice at the candidate the cheap rule dislikes?
- **branch_pruning_counterexample_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to look twice at the candidate the cheap rule dislikes?
- **branch_pruning_counterexample_history_helps** — Would showing what has already worked and failed help Jev decide whether to look twice at the candidate the cheap rule dislikes?
- **branch_pruning_counterexample_parallel_batch** — Can we ask about several independent opportunities to look twice at the candidate the cheap rule dislikes together and make the whole search faster?
- **branch_pruning_counterexample_transfer** — If it helps to look twice at the candidate the cheap rule dislikes here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **branch_pruning_counterexample_bad_failure** — Could a confident but wrong decision to look twice at the candidate the cheap rule dislikes leave us with a seriously worse nest?

