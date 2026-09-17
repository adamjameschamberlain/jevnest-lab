# parallel workers

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## give workers different useful jobs

Jev allocates a fixed number of geometry workers among independent strategies.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_worker_split_speed_2x** — Could we give workers different useful jobs and reach the same useful nesting quality in half the time?
- **parallel_workers_worker_split_speed_5x** — Could we give workers different useful jobs and cut the time to a useful nest by five times?
- **parallel_workers_worker_split_material** — If we give workers different useful jobs, could we use meaningfully less material in the same search time?
- **parallel_workers_worker_split_jev_value** — If we give workers different useful jobs, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_worker_split_evidence_ready** — Do our current records contain enough information to tell Jev when to give workers different useful jobs?
- **parallel_workers_worker_split_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to give workers different useful jobs?
- **parallel_workers_worker_split_history_helps** — Would showing what has already worked and failed help Jev decide whether to give workers different useful jobs?
- **parallel_workers_worker_split_parallel_batch** — Can we ask about several independent opportunities to give workers different useful jobs together and make the whole search faster?
- **parallel_workers_worker_split_transfer** — If it helps to give workers different useful jobs here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_worker_split_bad_failure** — Could a confident but wrong decision to give workers different useful jobs leave us with a seriously worse nest?

## stop workers repeating the same search

Jev detects likely redundancy from compact worker histories and proposes a diversified allocation.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_duplicate_workers_speed_2x** — Could we stop workers repeating the same search and reach the same useful nesting quality in half the time?
- **parallel_workers_duplicate_workers_speed_5x** — Could we stop workers repeating the same search and cut the time to a useful nest by five times?
- **parallel_workers_duplicate_workers_material** — If we stop workers repeating the same search, could we use meaningfully less material in the same search time?
- **parallel_workers_duplicate_workers_jev_value** — If we stop workers repeating the same search, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_duplicate_workers_evidence_ready** — Do our current records contain enough information to tell Jev when to stop workers repeating the same search?
- **parallel_workers_duplicate_workers_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to stop workers repeating the same search?
- **parallel_workers_duplicate_workers_history_helps** — Would showing what has already worked and failed help Jev decide whether to stop workers repeating the same search?
- **parallel_workers_duplicate_workers_parallel_batch** — Can we ask about several independent opportunities to stop workers repeating the same search together and make the whole search faster?
- **parallel_workers_duplicate_workers_transfer** — If it helps to stop workers repeating the same search here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_duplicate_workers_bad_failure** — Could a confident but wrong decision to stop workers repeating the same search leave us with a seriously worse nest?

## keep geometry busy while waiting for the model

Jev ranks speculative tasks in advance; independent workers execute them during API waits and wasted work is charged.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_speculate_wait_speed_2x** — Could we keep geometry busy while waiting for the model and reach the same useful nesting quality in half the time?
- **parallel_workers_speculate_wait_speed_5x** — Could we keep geometry busy while waiting for the model and cut the time to a useful nest by five times?
- **parallel_workers_speculate_wait_material** — If we keep geometry busy while waiting for the model, could we use meaningfully less material in the same search time?
- **parallel_workers_speculate_wait_jev_value** — If we keep geometry busy while waiting for the model, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_speculate_wait_evidence_ready** — Do our current records contain enough information to tell Jev when to keep geometry busy while waiting for the model?
- **parallel_workers_speculate_wait_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to keep geometry busy while waiting for the model?
- **parallel_workers_speculate_wait_history_helps** — Would showing what has already worked and failed help Jev decide whether to keep geometry busy while waiting for the model?
- **parallel_workers_speculate_wait_parallel_batch** — Can we ask about several independent opportunities to keep geometry busy while waiting for the model together and make the whole search faster?
- **parallel_workers_speculate_wait_transfer** — If it helps to keep geometry busy while waiting for the model here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_speculate_wait_bad_failure** — Could a confident but wrong decision to keep geometry busy while waiting for the model leave us with a seriously worse nest?

## stop a slow worker when its result is unlikely to matter

Jev nominates an interruptible task for cancellation while preserving all completed valid incumbents.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_straggler_cancel_speed_2x** — Could we stop a slow worker when its result is unlikely to matter and reach the same useful nesting quality in half the time?
- **parallel_workers_straggler_cancel_speed_5x** — Could we stop a slow worker when its result is unlikely to matter and cut the time to a useful nest by five times?
- **parallel_workers_straggler_cancel_material** — If we stop a slow worker when its result is unlikely to matter, could we use meaningfully less material in the same search time?
- **parallel_workers_straggler_cancel_jev_value** — If we stop a slow worker when its result is unlikely to matter, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_straggler_cancel_evidence_ready** — Do our current records contain enough information to tell Jev when to stop a slow worker when its result is unlikely to matter?
- **parallel_workers_straggler_cancel_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to stop a slow worker when its result is unlikely to matter?
- **parallel_workers_straggler_cancel_history_helps** — Would showing what has already worked and failed help Jev decide whether to stop a slow worker when its result is unlikely to matter?
- **parallel_workers_straggler_cancel_parallel_batch** — Can we ask about several independent opportunities to stop a slow worker when its result is unlikely to matter together and make the whole search faster?
- **parallel_workers_straggler_cancel_transfer** — If it helps to stop a slow worker when its result is unlikely to matter here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_straggler_cancel_bad_failure** — Could a confident but wrong decision to stop a slow worker when its result is unlikely to matter leave us with a seriously worse nest?

## move spare compute to the branch that can use it

Jev prioritises queued independent tasks for idle workers based on measured costs and possible gain.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_work_stealing_speed_2x** — Could we move spare compute to the branch that can use it and reach the same useful nesting quality in half the time?
- **parallel_workers_work_stealing_speed_5x** — Could we move spare compute to the branch that can use it and cut the time to a useful nest by five times?
- **parallel_workers_work_stealing_material** — If we move spare compute to the branch that can use it, could we use meaningfully less material in the same search time?
- **parallel_workers_work_stealing_jev_value** — If we move spare compute to the branch that can use it, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_work_stealing_evidence_ready** — Do our current records contain enough information to tell Jev when to move spare compute to the branch that can use it?
- **parallel_workers_work_stealing_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to move spare compute to the branch that can use it?
- **parallel_workers_work_stealing_history_helps** — Would showing what has already worked and failed help Jev decide whether to move spare compute to the branch that can use it?
- **parallel_workers_work_stealing_parallel_batch** — Can we ask about several independent opportunities to move spare compute to the branch that can use it together and make the whole search faster?
- **parallel_workers_work_stealing_transfer** — If it helps to move spare compute to the branch that can use it here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_work_stealing_bad_failure** — Could a confident but wrong decision to move spare compute to the branch that can use it leave us with a seriously worse nest?

## share the useful discoveries without synchronising constantly

Jev chooses when to broadcast incumbent or pattern updates among workers under measured communication costs.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_shared_incumbent_speed_2x** — Could we share the useful discoveries without synchronising constantly and reach the same useful nesting quality in half the time?
- **parallel_workers_shared_incumbent_speed_5x** — Could we share the useful discoveries without synchronising constantly and cut the time to a useful nest by five times?
- **parallel_workers_shared_incumbent_material** — If we share the useful discoveries without synchronising constantly, could we use meaningfully less material in the same search time?
- **parallel_workers_shared_incumbent_jev_value** — If we share the useful discoveries without synchronising constantly, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_shared_incumbent_evidence_ready** — Do our current records contain enough information to tell Jev when to share the useful discoveries without synchronising constantly?
- **parallel_workers_shared_incumbent_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to share the useful discoveries without synchronising constantly?
- **parallel_workers_shared_incumbent_history_helps** — Would showing what has already worked and failed help Jev decide whether to share the useful discoveries without synchronising constantly?
- **parallel_workers_shared_incumbent_parallel_batch** — Can we ask about several independent opportunities to share the useful discoveries without synchronising constantly together and make the whole search faster?
- **parallel_workers_shared_incumbent_transfer** — If it helps to share the useful discoveries without synchronising constantly here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_shared_incumbent_bad_failure** — Could a confident but wrong decision to share the useful discoveries without synchronising constantly leave us with a seriously worse nest?

## ask about enough candidates to keep workers fed

Jev selects the proposal batch size given actual API latency and geometry throughput.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_batch_size_speed_2x** — Could we ask about enough candidates to keep workers fed and reach the same useful nesting quality in half the time?
- **parallel_workers_batch_size_speed_5x** — Could we ask about enough candidates to keep workers fed and cut the time to a useful nest by five times?
- **parallel_workers_batch_size_material** — If we ask about enough candidates to keep workers fed, could we use meaningfully less material in the same search time?
- **parallel_workers_batch_size_jev_value** — If we ask about enough candidates to keep workers fed, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_batch_size_evidence_ready** — Do our current records contain enough information to tell Jev when to ask about enough candidates to keep workers fed?
- **parallel_workers_batch_size_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to ask about enough candidates to keep workers fed?
- **parallel_workers_batch_size_history_helps** — Would showing what has already worked and failed help Jev decide whether to ask about enough candidates to keep workers fed?
- **parallel_workers_batch_size_parallel_batch** — Can we ask about several independent opportunities to ask about enough candidates to keep workers fed together and make the whole search faster?
- **parallel_workers_batch_size_transfer** — If it helps to ask about enough candidates to keep workers fed here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_batch_size_bad_failure** — Could a confident but wrong decision to ask about enough candidates to keep workers fed leave us with a seriously worse nest?

## spend the next slot on computation or another model judgment

Jev selects between supplied CPU and inference tasks under an explicit fixed resource budget.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_cpu_vs_api_speed_2x** — Could we spend the next slot on computation or another model judgment and reach the same useful nesting quality in half the time?
- **parallel_workers_cpu_vs_api_speed_5x** — Could we spend the next slot on computation or another model judgment and cut the time to a useful nest by five times?
- **parallel_workers_cpu_vs_api_material** — If we spend the next slot on computation or another model judgment, could we use meaningfully less material in the same search time?
- **parallel_workers_cpu_vs_api_jev_value** — If we spend the next slot on computation or another model judgment, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_cpu_vs_api_evidence_ready** — Do our current records contain enough information to tell Jev when to spend the next slot on computation or another model judgment?
- **parallel_workers_cpu_vs_api_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to spend the next slot on computation or another model judgment?
- **parallel_workers_cpu_vs_api_history_helps** — Would showing what has already worked and failed help Jev decide whether to spend the next slot on computation or another model judgment?
- **parallel_workers_cpu_vs_api_parallel_batch** — Can we ask about several independent opportunities to spend the next slot on computation or another model judgment together and make the whole search faster?
- **parallel_workers_cpu_vs_api_transfer** — If it helps to spend the next slot on computation or another model judgment here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_cpu_vs_api_bad_failure** — Could a confident but wrong decision to spend the next slot on computation or another model judgment leave us with a seriously worse nest?

## avoid parallelism that fights over the same resources

Jev chooses concurrency from observed CPU, memory, cache, and latency contention measurements.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_contention_speed_2x** — Could we avoid parallelism that fights over the same resources and reach the same useful nesting quality in half the time?
- **parallel_workers_contention_speed_5x** — Could we avoid parallelism that fights over the same resources and cut the time to a useful nest by five times?
- **parallel_workers_contention_material** — If we avoid parallelism that fights over the same resources, could we use meaningfully less material in the same search time?
- **parallel_workers_contention_jev_value** — If we avoid parallelism that fights over the same resources, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_contention_evidence_ready** — Do our current records contain enough information to tell Jev when to avoid parallelism that fights over the same resources?
- **parallel_workers_contention_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to avoid parallelism that fights over the same resources?
- **parallel_workers_contention_history_helps** — Would showing what has already worked and failed help Jev decide whether to avoid parallelism that fights over the same resources?
- **parallel_workers_contention_parallel_batch** — Can we ask about several independent opportunities to avoid parallelism that fights over the same resources together and make the whole search faster?
- **parallel_workers_contention_transfer** — If it helps to avoid parallelism that fights over the same resources here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_contention_bad_failure** — Could a confident but wrong decision to avoid parallelism that fights over the same resources leave us with a seriously worse nest?

## let several methods race to a useful answer

Jev selects a fixed-worker portfolio that terminates once an exact validated target is reached.

**Evidence needed:** Actual worker scheduler, CPU and memory contention traces, task dependencies and wall/CPU costs.

- **parallel_workers_deadline_race_speed_2x** — Could we let several methods race to a useful answer and reach the same useful nesting quality in half the time?
- **parallel_workers_deadline_race_speed_5x** — Could we let several methods race to a useful answer and cut the time to a useful nest by five times?
- **parallel_workers_deadline_race_material** — If we let several methods race to a useful answer, could we use meaningfully less material in the same search time?
- **parallel_workers_deadline_race_jev_value** — If we let several methods race to a useful answer, would Jev make it faster than a cheap rule making those same decisions?
- **parallel_workers_deadline_race_evidence_ready** — Do our current records contain enough information to tell Jev when to let several methods race to a useful answer?
- **parallel_workers_deadline_race_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to let several methods race to a useful answer?
- **parallel_workers_deadline_race_history_helps** — Would showing what has already worked and failed help Jev decide whether to let several methods race to a useful answer?
- **parallel_workers_deadline_race_parallel_batch** — Can we ask about several independent opportunities to let several methods race to a useful answer together and make the whole search faster?
- **parallel_workers_deadline_race_transfer** — If it helps to let several methods race to a useful answer here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **parallel_workers_deadline_race_bad_failure** — Could a confident but wrong decision to let several methods race to a useful answer leave us with a seriously worse nest?

