# search portfolio

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## know when a quick ordinary heuristic is enough

Jev chooses a fixed-budget greedy or GA strategy using job features and historical validated results.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_ga_or_greedy_speed_2x** — Could we know when a quick ordinary heuristic is enough and reach the same useful nesting quality in half the time?
- **search_portfolio_ga_or_greedy_speed_5x** — Could we know when a quick ordinary heuristic is enough and cut the time to a useful nest by five times?
- **search_portfolio_ga_or_greedy_material** — If we know when a quick ordinary heuristic is enough, could we use meaningfully less material in the same search time?
- **search_portfolio_ga_or_greedy_jev_value** — If we know when a quick ordinary heuristic is enough, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_ga_or_greedy_evidence_ready** — Do our current records contain enough information to tell Jev when to know when a quick ordinary heuristic is enough?
- **search_portfolio_ga_or_greedy_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to know when a quick ordinary heuristic is enough?
- **search_portfolio_ga_or_greedy_history_helps** — Would showing what has already worked and failed help Jev decide whether to know when a quick ordinary heuristic is enough?
- **search_portfolio_ga_or_greedy_parallel_batch** — Can we ask about several independent opportunities to know when a quick ordinary heuristic is enough together and make the whole search faster?
- **search_portfolio_ga_or_greedy_transfer** — If it helps to know when a quick ordinary heuristic is enough here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_ga_or_greedy_bad_failure** — Could a confident but wrong decision to know when a quick ordinary heuristic is enough leave us with a seriously worse nest?

## keep just enough alternatives alive

Jev chooses the width of a beam search from measured diversity, cost, and incumbent quality.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_beam_width_speed_2x** — Could we keep just enough alternatives alive and reach the same useful nesting quality in half the time?
- **search_portfolio_beam_width_speed_5x** — Could we keep just enough alternatives alive and cut the time to a useful nest by five times?
- **search_portfolio_beam_width_material** — If we keep just enough alternatives alive, could we use meaningfully less material in the same search time?
- **search_portfolio_beam_width_jev_value** — If we keep just enough alternatives alive, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_beam_width_evidence_ready** — Do our current records contain enough information to tell Jev when to keep just enough alternatives alive?
- **search_portfolio_beam_width_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to keep just enough alternatives alive?
- **search_portfolio_beam_width_history_helps** — Would showing what has already worked and failed help Jev decide whether to keep just enough alternatives alive?
- **search_portfolio_beam_width_parallel_batch** — Can we ask about several independent opportunities to keep just enough alternatives alive together and make the whole search faster?
- **search_portfolio_beam_width_transfer** — If it helps to keep just enough alternatives alive here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_beam_width_bad_failure** — Could a confident but wrong decision to keep just enough alternatives alive leave us with a seriously worse nest?

## avoid making the genetic population larger than useful

Jev selects GA population size under a fixed wall-time and memory budget.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_population_size_speed_2x** — Could we avoid making the genetic population larger than useful and reach the same useful nesting quality in half the time?
- **search_portfolio_population_size_speed_5x** — Could we avoid making the genetic population larger than useful and cut the time to a useful nest by five times?
- **search_portfolio_population_size_material** — If we avoid making the genetic population larger than useful, could we use meaningfully less material in the same search time?
- **search_portfolio_population_size_jev_value** — If we avoid making the genetic population larger than useful, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_population_size_evidence_ready** — Do our current records contain enough information to tell Jev when to avoid making the genetic population larger than useful?
- **search_portfolio_population_size_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to avoid making the genetic population larger than useful?
- **search_portfolio_population_size_history_helps** — Would showing what has already worked and failed help Jev decide whether to avoid making the genetic population larger than useful?
- **search_portfolio_population_size_parallel_batch** — Can we ask about several independent opportunities to avoid making the genetic population larger than useful together and make the whole search faster?
- **search_portfolio_population_size_transfer** — If it helps to avoid making the genetic population larger than useful here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_population_size_bad_failure** — Could a confident but wrong decision to avoid making the genetic population larger than useful leave us with a seriously worse nest?

## shake the search harder only when it needs it

Jev selects mutation strength from recent population diversity and objective improvements.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_mutation_strength_speed_2x** — Could we shake the search harder only when it needs it and reach the same useful nesting quality in half the time?
- **search_portfolio_mutation_strength_speed_5x** — Could we shake the search harder only when it needs it and cut the time to a useful nest by five times?
- **search_portfolio_mutation_strength_material** — If we shake the search harder only when it needs it, could we use meaningfully less material in the same search time?
- **search_portfolio_mutation_strength_jev_value** — If we shake the search harder only when it needs it, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_mutation_strength_evidence_ready** — Do our current records contain enough information to tell Jev when to shake the search harder only when it needs it?
- **search_portfolio_mutation_strength_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to shake the search harder only when it needs it?
- **search_portfolio_mutation_strength_history_helps** — Would showing what has already worked and failed help Jev decide whether to shake the search harder only when it needs it?
- **search_portfolio_mutation_strength_parallel_batch** — Can we ask about several independent opportunities to shake the search harder only when it needs it together and make the whole search faster?
- **search_portfolio_mutation_strength_transfer** — If it helps to shake the search harder only when it needs it here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_mutation_strength_bad_failure** — Could a confident but wrong decision to shake the search harder only when it needs it leave us with a seriously worse nest?

## combine parents that bring different useful structures

Jev ranks eligible parent pairs for a deterministic crossover and exact offspring evaluation.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_crossover_pair_speed_2x** — Could we combine parents that bring different useful structures and reach the same useful nesting quality in half the time?
- **search_portfolio_crossover_pair_speed_5x** — Could we combine parents that bring different useful structures and cut the time to a useful nest by five times?
- **search_portfolio_crossover_pair_material** — If we combine parents that bring different useful structures, could we use meaningfully less material in the same search time?
- **search_portfolio_crossover_pair_jev_value** — If we combine parents that bring different useful structures, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_crossover_pair_evidence_ready** — Do our current records contain enough information to tell Jev when to combine parents that bring different useful structures?
- **search_portfolio_crossover_pair_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to combine parents that bring different useful structures?
- **search_portfolio_crossover_pair_history_helps** — Would showing what has already worked and failed help Jev decide whether to combine parents that bring different useful structures?
- **search_portfolio_crossover_pair_parallel_batch** — Can we ask about several independent opportunities to combine parents that bring different useful structures together and make the whole search faster?
- **search_portfolio_crossover_pair_transfer** — If it helps to combine parents that bring different useful structures here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_crossover_pair_bad_failure** — Could a confident but wrong decision to combine parents that bring different useful structures leave us with a seriously worse nest?

## put more attempts into the operators that suit this job

Jev allocates operator trials from measured reward and cost histories, compared against a cheap bandit controller.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_operator_bandit_speed_2x** — Could we put more attempts into the operators that suit this job and reach the same useful nesting quality in half the time?
- **search_portfolio_operator_bandit_speed_5x** — Could we put more attempts into the operators that suit this job and cut the time to a useful nest by five times?
- **search_portfolio_operator_bandit_material** — If we put more attempts into the operators that suit this job, could we use meaningfully less material in the same search time?
- **search_portfolio_operator_bandit_jev_value** — If we put more attempts into the operators that suit this job, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_operator_bandit_evidence_ready** — Do our current records contain enough information to tell Jev when to put more attempts into the operators that suit this job?
- **search_portfolio_operator_bandit_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to put more attempts into the operators that suit this job?
- **search_portfolio_operator_bandit_history_helps** — Would showing what has already worked and failed help Jev decide whether to put more attempts into the operators that suit this job?
- **search_portfolio_operator_bandit_parallel_batch** — Can we ask about several independent opportunities to put more attempts into the operators that suit this job together and make the whole search faster?
- **search_portfolio_operator_bandit_transfer** — If it helps to put more attempts into the operators that suit this job here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_operator_bandit_bad_failure** — Could a confident but wrong decision to put more attempts into the operators that suit this job leave us with a seriously worse nest?

## switch methods when another one is likely to take over

Jev reallocates a fixed search budget among greedy, GA, beam, and repair methods at measured checkpoints.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_portfolio_switch_speed_2x** — Could we switch methods when another one is likely to take over and reach the same useful nesting quality in half the time?
- **search_portfolio_portfolio_switch_speed_5x** — Could we switch methods when another one is likely to take over and cut the time to a useful nest by five times?
- **search_portfolio_portfolio_switch_material** — If we switch methods when another one is likely to take over, could we use meaningfully less material in the same search time?
- **search_portfolio_portfolio_switch_jev_value** — If we switch methods when another one is likely to take over, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_portfolio_switch_evidence_ready** — Do our current records contain enough information to tell Jev when to switch methods when another one is likely to take over?
- **search_portfolio_portfolio_switch_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to switch methods when another one is likely to take over?
- **search_portfolio_portfolio_switch_history_helps** — Would showing what has already worked and failed help Jev decide whether to switch methods when another one is likely to take over?
- **search_portfolio_portfolio_switch_parallel_batch** — Can we ask about several independent opportunities to switch methods when another one is likely to take over together and make the whole search faster?
- **search_portfolio_portfolio_switch_transfer** — If it helps to switch methods when another one is likely to take over here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_portfolio_switch_bad_failure** — Could a confident but wrong decision to switch methods when another one is likely to take over leave us with a seriously worse nest?

## stop cycling without banning useful moves for too long

Jev selects a tabu-search tenure from repeated-state and improvement histories.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_tabu_tenure_speed_2x** — Could we stop cycling without banning useful moves for too long and reach the same useful nesting quality in half the time?
- **search_portfolio_tabu_tenure_speed_5x** — Could we stop cycling without banning useful moves for too long and cut the time to a useful nest by five times?
- **search_portfolio_tabu_tenure_material** — If we stop cycling without banning useful moves for too long, could we use meaningfully less material in the same search time?
- **search_portfolio_tabu_tenure_jev_value** — If we stop cycling without banning useful moves for too long, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_tabu_tenure_evidence_ready** — Do our current records contain enough information to tell Jev when to stop cycling without banning useful moves for too long?
- **search_portfolio_tabu_tenure_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to stop cycling without banning useful moves for too long?
- **search_portfolio_tabu_tenure_history_helps** — Would showing what has already worked and failed help Jev decide whether to stop cycling without banning useful moves for too long?
- **search_portfolio_tabu_tenure_parallel_batch** — Can we ask about several independent opportunities to stop cycling without banning useful moves for too long together and make the whole search faster?
- **search_portfolio_tabu_tenure_transfer** — If it helps to stop cycling without banning useful moves for too long here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_tabu_tenure_bad_failure** — Could a confident but wrong decision to stop cycling without banning useful moves for too long leave us with a seriously worse nest?

## allow escape moves at the moments they might help

Jev adjusts a preimplemented annealing schedule while retaining the best valid incumbent.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_annealing_schedule_speed_2x** — Could we allow escape moves at the moments they might help and reach the same useful nesting quality in half the time?
- **search_portfolio_annealing_schedule_speed_5x** — Could we allow escape moves at the moments they might help and cut the time to a useful nest by five times?
- **search_portfolio_annealing_schedule_material** — If we allow escape moves at the moments they might help, could we use meaningfully less material in the same search time?
- **search_portfolio_annealing_schedule_jev_value** — If we allow escape moves at the moments they might help, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_annealing_schedule_evidence_ready** — Do our current records contain enough information to tell Jev when to allow escape moves at the moments they might help?
- **search_portfolio_annealing_schedule_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to allow escape moves at the moments they might help?
- **search_portfolio_annealing_schedule_history_helps** — Would showing what has already worked and failed help Jev decide whether to allow escape moves at the moments they might help?
- **search_portfolio_annealing_schedule_parallel_batch** — Can we ask about several independent opportunities to allow escape moves at the moments they might help together and make the whole search faster?
- **search_portfolio_annealing_schedule_transfer** — If it helps to allow escape moves at the moments they might help here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_annealing_schedule_bad_failure** — Could a confident but wrong decision to allow escape moves at the moments they might help leave us with a seriously worse nest?

## start from seeds that cover different possibilities

Jev selects initial deterministic schedules to maximise useful diversity under the same start-up budget.

**Evidence needed:** Implemented alternative algorithms and operators; matched-budget outcome histories.

- **search_portfolio_seed_selection_speed_2x** — Could we start from seeds that cover different possibilities and reach the same useful nesting quality in half the time?
- **search_portfolio_seed_selection_speed_5x** — Could we start from seeds that cover different possibilities and cut the time to a useful nest by five times?
- **search_portfolio_seed_selection_material** — If we start from seeds that cover different possibilities, could we use meaningfully less material in the same search time?
- **search_portfolio_seed_selection_jev_value** — If we start from seeds that cover different possibilities, would Jev make it faster than a cheap rule making those same decisions?
- **search_portfolio_seed_selection_evidence_ready** — Do our current records contain enough information to tell Jev when to start from seeds that cover different possibilities?
- **search_portfolio_seed_selection_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to start from seeds that cover different possibilities?
- **search_portfolio_seed_selection_history_helps** — Would showing what has already worked and failed help Jev decide whether to start from seeds that cover different possibilities?
- **search_portfolio_seed_selection_parallel_batch** — Can we ask about several independent opportunities to start from seeds that cover different possibilities together and make the whole search faster?
- **search_portfolio_seed_selection_transfer** — If it helps to start from seeds that cover different possibilities here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **search_portfolio_seed_selection_bad_failure** — Could a confident but wrong decision to start from seeds that cover different possibilities leave us with a seriously worse nest?

