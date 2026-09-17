# restarts

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## start again instead of digging the same hole

Jev chooses a fresh deterministic seed versus continuing the current search for an equal time window.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_restart_seed_speed_2x** — Could we start again instead of digging the same hole and reach the same useful nesting quality in half the time?
- **restarts_restart_seed_speed_5x** — Could we start again instead of digging the same hole and cut the time to a useful nest by five times?
- **restarts_restart_seed_material** — If we start again instead of digging the same hole, could we use meaningfully less material in the same search time?
- **restarts_restart_seed_jev_value** — If we start again instead of digging the same hole, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_restart_seed_evidence_ready** — Do our current records contain enough information to tell Jev when to start again instead of digging the same hole?
- **restarts_restart_seed_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to start again instead of digging the same hole?
- **restarts_restart_seed_history_helps** — Would showing what has already worked and failed help Jev decide whether to start again instead of digging the same hole?
- **restarts_restart_seed_parallel_batch** — Can we ask about several independent opportunities to start again instead of digging the same hole together and make the whole search faster?
- **restarts_restart_seed_transfer** — If it helps to start again instead of digging the same hole here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_restart_seed_bad_failure** — Could a confident but wrong decision to start again instead of digging the same hole leave us with a seriously worse nest?

## pick a restart that actually changes the search

Jev selects a restart schedule from candidates with measured geometric and ordering diversity.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_select_restart_speed_2x** — Could we pick a restart that actually changes the search and reach the same useful nesting quality in half the time?
- **restarts_select_restart_speed_5x** — Could we pick a restart that actually changes the search and cut the time to a useful nest by five times?
- **restarts_select_restart_material** — If we pick a restart that actually changes the search, could we use meaningfully less material in the same search time?
- **restarts_select_restart_jev_value** — If we pick a restart that actually changes the search, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_select_restart_evidence_ready** — Do our current records contain enough information to tell Jev when to pick a restart that actually changes the search?
- **restarts_select_restart_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to pick a restart that actually changes the search?
- **restarts_select_restart_history_helps** — Would showing what has already worked and failed help Jev decide whether to pick a restart that actually changes the search?
- **restarts_select_restart_parallel_batch** — Can we ask about several independent opportunities to pick a restart that actually changes the search together and make the whole search faster?
- **restarts_select_restart_transfer** — If it helps to pick a restart that actually changes the search here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_select_restart_bad_failure** — Could a confident but wrong decision to pick a restart that actually changes the search leave us with a seriously worse nest?

## give promising stalls longer and hopeless stalls less

Jev chooses continuation-window length from the current incumbent and recent search trajectory.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_stagnation_budget_speed_2x** — Could we give promising stalls longer and hopeless stalls less and reach the same useful nesting quality in half the time?
- **restarts_stagnation_budget_speed_5x** — Could we give promising stalls longer and hopeless stalls less and cut the time to a useful nest by five times?
- **restarts_stagnation_budget_material** — If we give promising stalls longer and hopeless stalls less, could we use meaningfully less material in the same search time?
- **restarts_stagnation_budget_jev_value** — If we give promising stalls longer and hopeless stalls less, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_stagnation_budget_evidence_ready** — Do our current records contain enough information to tell Jev when to give promising stalls longer and hopeless stalls less?
- **restarts_stagnation_budget_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to give promising stalls longer and hopeless stalls less?
- **restarts_stagnation_budget_history_helps** — Would showing what has already worked and failed help Jev decide whether to give promising stalls longer and hopeless stalls less?
- **restarts_stagnation_budget_parallel_batch** — Can we ask about several independent opportunities to give promising stalls longer and hopeless stalls less together and make the whole search faster?
- **restarts_stagnation_budget_transfer** — If it helps to give promising stalls longer and hopeless stalls less here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_stagnation_budget_bad_failure** — Could a confident but wrong decision to give promising stalls longer and hopeless stalls less leave us with a seriously worse nest?

## start over without throwing away the good bit

Jev selects a validated subset of the incumbent to preserve while restarting the remaining parts.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_keep_scaffold_speed_2x** — Could we start over without throwing away the good bit and reach the same useful nesting quality in half the time?
- **restarts_keep_scaffold_speed_5x** — Could we start over without throwing away the good bit and cut the time to a useful nest by five times?
- **restarts_keep_scaffold_material** — If we start over without throwing away the good bit, could we use meaningfully less material in the same search time?
- **restarts_keep_scaffold_jev_value** — If we start over without throwing away the good bit, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_keep_scaffold_evidence_ready** — Do our current records contain enough information to tell Jev when to start over without throwing away the good bit?
- **restarts_keep_scaffold_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to start over without throwing away the good bit?
- **restarts_keep_scaffold_history_helps** — Would showing what has already worked and failed help Jev decide whether to start over without throwing away the good bit?
- **restarts_keep_scaffold_parallel_batch** — Can we ask about several independent opportunities to start over without throwing away the good bit together and make the whole search faster?
- **restarts_keep_scaffold_transfer** — If it helps to start over without throwing away the good bit here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_keep_scaffold_bad_failure** — Could a confident but wrong decision to start over without throwing away the good bit leave us with a seriously worse nest?

## reset a population that is agreeing on the wrong answer

Jev triggers a GA population reset using diversity and improvement history.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_bad_generation_speed_2x** — Could we reset a population that is agreeing on the wrong answer and reach the same useful nesting quality in half the time?
- **restarts_bad_generation_speed_5x** — Could we reset a population that is agreeing on the wrong answer and cut the time to a useful nest by five times?
- **restarts_bad_generation_material** — If we reset a population that is agreeing on the wrong answer, could we use meaningfully less material in the same search time?
- **restarts_bad_generation_jev_value** — If we reset a population that is agreeing on the wrong answer, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_bad_generation_evidence_ready** — Do our current records contain enough information to tell Jev when to reset a population that is agreeing on the wrong answer?
- **restarts_bad_generation_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to reset a population that is agreeing on the wrong answer?
- **restarts_bad_generation_history_helps** — Would showing what has already worked and failed help Jev decide whether to reset a population that is agreeing on the wrong answer?
- **restarts_bad_generation_parallel_batch** — Can we ask about several independent opportunities to reset a population that is agreeing on the wrong answer together and make the whole search faster?
- **restarts_bad_generation_transfer** — If it helps to reset a population that is agreeing on the wrong answer here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_bad_generation_bad_failure** — Could a confident but wrong decision to reset a population that is agreeing on the wrong answer leave us with a seriously worse nest?

## change the ordering rule when the current one stops paying

Jev chooses the next part-order heuristic from measured results of earlier fixed windows.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_switch_order_speed_2x** — Could we change the ordering rule when the current one stops paying and reach the same useful nesting quality in half the time?
- **restarts_switch_order_speed_5x** — Could we change the ordering rule when the current one stops paying and cut the time to a useful nest by five times?
- **restarts_switch_order_material** — If we change the ordering rule when the current one stops paying, could we use meaningfully less material in the same search time?
- **restarts_switch_order_jev_value** — If we change the ordering rule when the current one stops paying, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_switch_order_evidence_ready** — Do our current records contain enough information to tell Jev when to change the ordering rule when the current one stops paying?
- **restarts_switch_order_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to change the ordering rule when the current one stops paying?
- **restarts_switch_order_history_helps** — Would showing what has already worked and failed help Jev decide whether to change the ordering rule when the current one stops paying?
- **restarts_switch_order_parallel_batch** — Can we ask about several independent opportunities to change the ordering rule when the current one stops paying together and make the whole search faster?
- **restarts_switch_order_transfer** — If it helps to change the ordering rule when the current one stops paying here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_switch_order_bad_failure** — Could a confident but wrong decision to change the ordering rule when the current one stops paying leave us with a seriously worse nest?

## change rotation strategy when reordering is getting nowhere

Jev switches between permitted orientation-search strategies using outcome history.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_switch_rotation_speed_2x** — Could we change rotation strategy when reordering is getting nowhere and reach the same useful nesting quality in half the time?
- **restarts_switch_rotation_speed_5x** — Could we change rotation strategy when reordering is getting nowhere and cut the time to a useful nest by five times?
- **restarts_switch_rotation_material** — If we change rotation strategy when reordering is getting nowhere, could we use meaningfully less material in the same search time?
- **restarts_switch_rotation_jev_value** — If we change rotation strategy when reordering is getting nowhere, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_switch_rotation_evidence_ready** — Do our current records contain enough information to tell Jev when to change rotation strategy when reordering is getting nowhere?
- **restarts_switch_rotation_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to change rotation strategy when reordering is getting nowhere?
- **restarts_switch_rotation_history_helps** — Would showing what has already worked and failed help Jev decide whether to change rotation strategy when reordering is getting nowhere?
- **restarts_switch_rotation_parallel_batch** — Can we ask about several independent opportunities to change rotation strategy when reordering is getting nowhere together and make the whole search faster?
- **restarts_switch_rotation_transfer** — If it helps to change rotation strategy when reordering is getting nowhere here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_switch_rotation_bad_failure** — Could a confident but wrong decision to change rotation strategy when reordering is getting nowhere leave us with a seriously worse nest?

## remember useful abandoned starts

Jev selects a previously saved exact search checkpoint for a fresh bounded continuation.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_restart_pool_speed_2x** — Could we remember useful abandoned starts and reach the same useful nesting quality in half the time?
- **restarts_restart_pool_speed_5x** — Could we remember useful abandoned starts and cut the time to a useful nest by five times?
- **restarts_restart_pool_material** — If we remember useful abandoned starts, could we use meaningfully less material in the same search time?
- **restarts_restart_pool_jev_value** — If we remember useful abandoned starts, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_restart_pool_evidence_ready** — Do our current records contain enough information to tell Jev when to remember useful abandoned starts?
- **restarts_restart_pool_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to remember useful abandoned starts?
- **restarts_restart_pool_history_helps** — Would showing what has already worked and failed help Jev decide whether to remember useful abandoned starts?
- **restarts_restart_pool_parallel_batch** — Can we ask about several independent opportunities to remember useful abandoned starts together and make the whole search faster?
- **restarts_restart_pool_transfer** — If it helps to remember useful abandoned starts here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_restart_pool_bad_failure** — Could a confident but wrong decision to remember useful abandoned starts leave us with a seriously worse nest?

## restart only the region causing the trouble

Jev identifies a recorded failure region and chooses local restart versus whole-layout restart.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_failure_restart_speed_2x** — Could we restart only the region causing the trouble and reach the same useful nesting quality in half the time?
- **restarts_failure_restart_speed_5x** — Could we restart only the region causing the trouble and cut the time to a useful nest by five times?
- **restarts_failure_restart_material** — If we restart only the region causing the trouble, could we use meaningfully less material in the same search time?
- **restarts_failure_restart_jev_value** — If we restart only the region causing the trouble, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_failure_restart_evidence_ready** — Do our current records contain enough information to tell Jev when to restart only the region causing the trouble?
- **restarts_failure_restart_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to restart only the region causing the trouble?
- **restarts_failure_restart_history_helps** — Would showing what has already worked and failed help Jev decide whether to restart only the region causing the trouble?
- **restarts_failure_restart_parallel_batch** — Can we ask about several independent opportunities to restart only the region causing the trouble together and make the whole search faster?
- **restarts_failure_restart_transfer** — If it helps to restart only the region causing the trouble here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_failure_restart_bad_failure** — Could a confident but wrong decision to restart only the region causing the trouble leave us with a seriously worse nest?

## avoid a restart that spends the whole remaining budget warming up

Jev evaluates restart setup cost against the remaining deadline before choosing a restart plan.

**Evidence needed:** Exact restart and resume states; matched continuation/restart outcomes and setup times.

- **restarts_deadline_restart_speed_2x** — Could we avoid a restart that spends the whole remaining budget warming up and reach the same useful nesting quality in half the time?
- **restarts_deadline_restart_speed_5x** — Could we avoid a restart that spends the whole remaining budget warming up and cut the time to a useful nest by five times?
- **restarts_deadline_restart_material** — If we avoid a restart that spends the whole remaining budget warming up, could we use meaningfully less material in the same search time?
- **restarts_deadline_restart_jev_value** — If we avoid a restart that spends the whole remaining budget warming up, would Jev make it faster than a cheap rule making those same decisions?
- **restarts_deadline_restart_evidence_ready** — Do our current records contain enough information to tell Jev when to avoid a restart that spends the whole remaining budget warming up?
- **restarts_deadline_restart_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to avoid a restart that spends the whole remaining budget warming up?
- **restarts_deadline_restart_history_helps** — Would showing what has already worked and failed help Jev decide whether to avoid a restart that spends the whole remaining budget warming up?
- **restarts_deadline_restart_parallel_batch** — Can we ask about several independent opportunities to avoid a restart that spends the whole remaining budget warming up together and make the whole search faster?
- **restarts_deadline_restart_transfer** — If it helps to avoid a restart that spends the whole remaining budget warming up here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **restarts_deadline_restart_bad_failure** — Could a confident but wrong decision to avoid a restart that spends the whole remaining budget warming up leave us with a seriously worse nest?

