# large neighbourhood

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## pull out the right amount of the nest

Jev chooses the removal fraction for a large-neighbourhood search step.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_destroy_size_speed_2x** — Could we pull out the right amount of the nest and reach the same useful nesting quality in half the time?
- **large_neighbourhood_destroy_size_speed_5x** — Could we pull out the right amount of the nest and cut the time to a useful nest by five times?
- **large_neighbourhood_destroy_size_material** — If we pull out the right amount of the nest, could we use meaningfully less material in the same search time?
- **large_neighbourhood_destroy_size_jev_value** — If we pull out the right amount of the nest, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_destroy_size_evidence_ready** — Do our current records contain enough information to tell Jev when to pull out the right amount of the nest?
- **large_neighbourhood_destroy_size_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to pull out the right amount of the nest?
- **large_neighbourhood_destroy_size_history_helps** — Would showing what has already worked and failed help Jev decide whether to pull out the right amount of the nest?
- **large_neighbourhood_destroy_size_parallel_batch** — Can we ask about several independent opportunities to pull out the right amount of the nest together and make the whole search faster?
- **large_neighbourhood_destroy_size_transfer** — If it helps to pull out the right amount of the nest here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_destroy_size_bad_failure** — Could a confident but wrong decision to pull out the right amount of the nest leave us with a seriously worse nest?

## remove parts by shape difficulty rather than at random

Jev selects a shape-based removal set under a fixed reinsertion budget.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_destroy_shape_speed_2x** — Could we remove parts by shape difficulty rather than at random and reach the same useful nesting quality in half the time?
- **large_neighbourhood_destroy_shape_speed_5x** — Could we remove parts by shape difficulty rather than at random and cut the time to a useful nest by five times?
- **large_neighbourhood_destroy_shape_material** — If we remove parts by shape difficulty rather than at random, could we use meaningfully less material in the same search time?
- **large_neighbourhood_destroy_shape_jev_value** — If we remove parts by shape difficulty rather than at random, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_destroy_shape_evidence_ready** — Do our current records contain enough information to tell Jev when to remove parts by shape difficulty rather than at random?
- **large_neighbourhood_destroy_shape_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to remove parts by shape difficulty rather than at random?
- **large_neighbourhood_destroy_shape_history_helps** — Would showing what has already worked and failed help Jev decide whether to remove parts by shape difficulty rather than at random?
- **large_neighbourhood_destroy_shape_parallel_batch** — Can we ask about several independent opportunities to remove parts by shape difficulty rather than at random together and make the whole search faster?
- **large_neighbourhood_destroy_shape_transfer** — If it helps to remove parts by shape difficulty rather than at random here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_destroy_shape_bad_failure** — Could a confident but wrong decision to remove parts by shape difficulty rather than at random leave us with a seriously worse nest?

## remove the geometric region causing the waste

Jev chooses a spatial region for removal using residual area and adjacency evidence.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_destroy_region_speed_2x** — Could we remove the geometric region causing the waste and reach the same useful nesting quality in half the time?
- **large_neighbourhood_destroy_region_speed_5x** — Could we remove the geometric region causing the waste and cut the time to a useful nest by five times?
- **large_neighbourhood_destroy_region_material** — If we remove the geometric region causing the waste, could we use meaningfully less material in the same search time?
- **large_neighbourhood_destroy_region_jev_value** — If we remove the geometric region causing the waste, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_destroy_region_evidence_ready** — Do our current records contain enough information to tell Jev when to remove the geometric region causing the waste?
- **large_neighbourhood_destroy_region_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to remove the geometric region causing the waste?
- **large_neighbourhood_destroy_region_history_helps** — Would showing what has already worked and failed help Jev decide whether to remove the geometric region causing the waste?
- **large_neighbourhood_destroy_region_parallel_batch** — Can we ask about several independent opportunities to remove the geometric region causing the waste together and make the whole search faster?
- **large_neighbourhood_destroy_region_transfer** — If it helps to remove the geometric region causing the waste here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_destroy_region_bad_failure** — Could a confident but wrong decision to remove the geometric region causing the waste leave us with a seriously worse nest?

## try to empty the weakest sheet

Jev selects a sheet whose parts will be redistributed by exact placement under a fixed deadline.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_destroy_sheet_speed_2x** — Could we try to empty the weakest sheet and reach the same useful nesting quality in half the time?
- **large_neighbourhood_destroy_sheet_speed_5x** — Could we try to empty the weakest sheet and cut the time to a useful nest by five times?
- **large_neighbourhood_destroy_sheet_material** — If we try to empty the weakest sheet, could we use meaningfully less material in the same search time?
- **large_neighbourhood_destroy_sheet_jev_value** — If we try to empty the weakest sheet, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_destroy_sheet_evidence_ready** — Do our current records contain enough information to tell Jev when to try to empty the weakest sheet?
- **large_neighbourhood_destroy_sheet_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to try to empty the weakest sheet?
- **large_neighbourhood_destroy_sheet_history_helps** — Would showing what has already worked and failed help Jev decide whether to try to empty the weakest sheet?
- **large_neighbourhood_destroy_sheet_parallel_batch** — Can we ask about several independent opportunities to try to empty the weakest sheet together and make the whole search faster?
- **large_neighbourhood_destroy_sheet_transfer** — If it helps to try to empty the weakest sheet here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_destroy_sheet_bad_failure** — Could a confident but wrong decision to try to empty the weakest sheet leave us with a seriously worse nest?

## trade parts between sheets to eliminate one

Jev selects cross-sheet exchange candidates for exact full-layout repair.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_cross_sheet_speed_2x** — Could we trade parts between sheets to eliminate one and reach the same useful nesting quality in half the time?
- **large_neighbourhood_cross_sheet_speed_5x** — Could we trade parts between sheets to eliminate one and cut the time to a useful nest by five times?
- **large_neighbourhood_cross_sheet_material** — If we trade parts between sheets to eliminate one, could we use meaningfully less material in the same search time?
- **large_neighbourhood_cross_sheet_jev_value** — If we trade parts between sheets to eliminate one, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_cross_sheet_evidence_ready** — Do our current records contain enough information to tell Jev when to trade parts between sheets to eliminate one?
- **large_neighbourhood_cross_sheet_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to trade parts between sheets to eliminate one?
- **large_neighbourhood_cross_sheet_history_helps** — Would showing what has already worked and failed help Jev decide whether to trade parts between sheets to eliminate one?
- **large_neighbourhood_cross_sheet_parallel_batch** — Can we ask about several independent opportunities to trade parts between sheets to eliminate one together and make the whole search faster?
- **large_neighbourhood_cross_sheet_transfer** — If it helps to trade parts between sheets to eliminate one here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_cross_sheet_bad_failure** — Could a confident but wrong decision to trade parts between sheets to eliminate one leave us with a seriously worse nest?

## choose a short chain of moves that frees useful space

Jev selects among explicit bounded relocation chains, with every intermediate placement checked exactly.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_chain_move_speed_2x** — Could we choose a short chain of moves that frees useful space and reach the same useful nesting quality in half the time?
- **large_neighbourhood_chain_move_speed_5x** — Could we choose a short chain of moves that frees useful space and cut the time to a useful nest by five times?
- **large_neighbourhood_chain_move_material** — If we choose a short chain of moves that frees useful space, could we use meaningfully less material in the same search time?
- **large_neighbourhood_chain_move_jev_value** — If we choose a short chain of moves that frees useful space, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_chain_move_evidence_ready** — Do our current records contain enough information to tell Jev when to choose a short chain of moves that frees useful space?
- **large_neighbourhood_chain_move_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to choose a short chain of moves that frees useful space?
- **large_neighbourhood_chain_move_history_helps** — Would showing what has already worked and failed help Jev decide whether to choose a short chain of moves that frees useful space?
- **large_neighbourhood_chain_move_parallel_batch** — Can we ask about several independent opportunities to choose a short chain of moves that frees useful space together and make the whole search faster?
- **large_neighbourhood_chain_move_transfer** — If it helps to choose a short chain of moves that frees useful space here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_chain_move_bad_failure** — Could a confident but wrong decision to choose a short chain of moves that frees useful space leave us with a seriously worse nest?

## change the mix of big repair operators as the job evolves

Jev allocates trials among preimplemented destroy-and-repair operators from their measured recent outcomes.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_operator_mix_speed_2x** — Could we change the mix of big repair operators as the job evolves and reach the same useful nesting quality in half the time?
- **large_neighbourhood_operator_mix_speed_5x** — Could we change the mix of big repair operators as the job evolves and cut the time to a useful nest by five times?
- **large_neighbourhood_operator_mix_material** — If we change the mix of big repair operators as the job evolves, could we use meaningfully less material in the same search time?
- **large_neighbourhood_operator_mix_jev_value** — If we change the mix of big repair operators as the job evolves, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_operator_mix_evidence_ready** — Do our current records contain enough information to tell Jev when to change the mix of big repair operators as the job evolves?
- **large_neighbourhood_operator_mix_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to change the mix of big repair operators as the job evolves?
- **large_neighbourhood_operator_mix_history_helps** — Would showing what has already worked and failed help Jev decide whether to change the mix of big repair operators as the job evolves?
- **large_neighbourhood_operator_mix_parallel_batch** — Can we ask about several independent opportunities to change the mix of big repair operators as the job evolves together and make the whole search faster?
- **large_neighbourhood_operator_mix_transfer** — If it helps to change the mix of big repair operators as the job evolves here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_operator_mix_bad_failure** — Could a confident but wrong decision to change the mix of big repair operators as the job evolves leave us with a seriously worse nest?

## choose a disruptive repair instead of a full restart

Jev compares a supplied large-neighbourhood action with an equal-budget fresh restart.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_repair_restart_speed_2x** — Could we choose a disruptive repair instead of a full restart and reach the same useful nesting quality in half the time?
- **large_neighbourhood_repair_restart_speed_5x** — Could we choose a disruptive repair instead of a full restart and cut the time to a useful nest by five times?
- **large_neighbourhood_repair_restart_material** — If we choose a disruptive repair instead of a full restart, could we use meaningfully less material in the same search time?
- **large_neighbourhood_repair_restart_jev_value** — If we choose a disruptive repair instead of a full restart, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_repair_restart_evidence_ready** — Do our current records contain enough information to tell Jev when to choose a disruptive repair instead of a full restart?
- **large_neighbourhood_repair_restart_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to choose a disruptive repair instead of a full restart?
- **large_neighbourhood_repair_restart_history_helps** — Would showing what has already worked and failed help Jev decide whether to choose a disruptive repair instead of a full restart?
- **large_neighbourhood_repair_restart_parallel_batch** — Can we ask about several independent opportunities to choose a disruptive repair instead of a full restart together and make the whole search faster?
- **large_neighbourhood_repair_restart_transfer** — If it helps to choose a disruptive repair instead of a full restart here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_repair_restart_bad_failure** — Could a confident but wrong decision to choose a disruptive repair instead of a full restart leave us with a seriously worse nest?

## keep several good structures while rebuilding the rest

Jev chooses non-overlapping validated sublayouts to preserve during a large reconstruction.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_retain_elites_speed_2x** — Could we keep several good structures while rebuilding the rest and reach the same useful nesting quality in half the time?
- **large_neighbourhood_retain_elites_speed_5x** — Could we keep several good structures while rebuilding the rest and cut the time to a useful nest by five times?
- **large_neighbourhood_retain_elites_material** — If we keep several good structures while rebuilding the rest, could we use meaningfully less material in the same search time?
- **large_neighbourhood_retain_elites_jev_value** — If we keep several good structures while rebuilding the rest, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_retain_elites_evidence_ready** — Do our current records contain enough information to tell Jev when to keep several good structures while rebuilding the rest?
- **large_neighbourhood_retain_elites_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to keep several good structures while rebuilding the rest?
- **large_neighbourhood_retain_elites_history_helps** — Would showing what has already worked and failed help Jev decide whether to keep several good structures while rebuilding the rest?
- **large_neighbourhood_retain_elites_parallel_batch** — Can we ask about several independent opportunities to keep several good structures while rebuilding the rest together and make the whole search faster?
- **large_neighbourhood_retain_elites_transfer** — If it helps to keep several good structures while rebuilding the rest here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_retain_elites_bad_failure** — Could a confident but wrong decision to keep several good structures while rebuilding the rest leave us with a seriously worse nest?

## accept a different layout when it opens future options

Jev chooses between equal-material validated layouts using a bounded follow-up search comparison.

**Evidence needed:** Checkpointable layouts, implemented removal/reinsertion operators and matched repair results.

- **large_neighbourhood_adaptive_accept_speed_2x** — Could we accept a different layout when it opens future options and reach the same useful nesting quality in half the time?
- **large_neighbourhood_adaptive_accept_speed_5x** — Could we accept a different layout when it opens future options and cut the time to a useful nest by five times?
- **large_neighbourhood_adaptive_accept_material** — If we accept a different layout when it opens future options, could we use meaningfully less material in the same search time?
- **large_neighbourhood_adaptive_accept_jev_value** — If we accept a different layout when it opens future options, would Jev make it faster than a cheap rule making those same decisions?
- **large_neighbourhood_adaptive_accept_evidence_ready** — Do our current records contain enough information to tell Jev when to accept a different layout when it opens future options?
- **large_neighbourhood_adaptive_accept_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to accept a different layout when it opens future options?
- **large_neighbourhood_adaptive_accept_history_helps** — Would showing what has already worked and failed help Jev decide whether to accept a different layout when it opens future options?
- **large_neighbourhood_adaptive_accept_parallel_batch** — Can we ask about several independent opportunities to accept a different layout when it opens future options together and make the whole search faster?
- **large_neighbourhood_adaptive_accept_transfer** — If it helps to accept a different layout when it opens future options here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **large_neighbourhood_adaptive_accept_bad_failure** — Could a confident but wrong decision to accept a different layout when it opens future options leave us with a seriously worse nest?

