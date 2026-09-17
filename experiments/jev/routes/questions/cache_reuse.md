# cache reuse

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## calculate the shape pairs we will probably need next

Jev shortlists exact NFP cache keys to precompute while search proceeds; unused work is charged.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_nfp_prefetch_speed_2x** — Could we calculate the shape pairs we will probably need next and reach the same useful nesting quality in half the time?
- **cache_reuse_nfp_prefetch_speed_5x** — Could we calculate the shape pairs we will probably need next and cut the time to a useful nest by five times?
- **cache_reuse_nfp_prefetch_material** — If we calculate the shape pairs we will probably need next, could we use meaningfully less material in the same search time?
- **cache_reuse_nfp_prefetch_jev_value** — If we calculate the shape pairs we will probably need next, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_nfp_prefetch_evidence_ready** — Do our current records contain enough information to tell Jev when to calculate the shape pairs we will probably need next?
- **cache_reuse_nfp_prefetch_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to calculate the shape pairs we will probably need next?
- **cache_reuse_nfp_prefetch_history_helps** — Would showing what has already worked and failed help Jev decide whether to calculate the shape pairs we will probably need next?
- **cache_reuse_nfp_prefetch_parallel_batch** — Can we ask about several independent opportunities to calculate the shape pairs we will probably need next together and make the whole search faster?
- **cache_reuse_nfp_prefetch_transfer** — If it helps to calculate the shape pairs we will probably need next here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_nfp_prefetch_bad_failure** — Could a confident but wrong decision to calculate the shape pairs we will probably need next leave us with a seriously worse nest?

## keep expensive geometry that is likely to be reused

Jev chooses cache-retention priorities from exact keys, recurrence history, and compute cost.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_nfp_retention_speed_2x** — Could we keep expensive geometry that is likely to be reused and reach the same useful nesting quality in half the time?
- **cache_reuse_nfp_retention_speed_5x** — Could we keep expensive geometry that is likely to be reused and cut the time to a useful nest by five times?
- **cache_reuse_nfp_retention_material** — If we keep expensive geometry that is likely to be reused, could we use meaningfully less material in the same search time?
- **cache_reuse_nfp_retention_jev_value** — If we keep expensive geometry that is likely to be reused, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_nfp_retention_evidence_ready** — Do our current records contain enough information to tell Jev when to keep expensive geometry that is likely to be reused?
- **cache_reuse_nfp_retention_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to keep expensive geometry that is likely to be reused?
- **cache_reuse_nfp_retention_history_helps** — Would showing what has already worked and failed help Jev decide whether to keep expensive geometry that is likely to be reused?
- **cache_reuse_nfp_retention_parallel_batch** — Can we ask about several independent opportunities to keep expensive geometry that is likely to be reused together and make the whole search faster?
- **cache_reuse_nfp_retention_transfer** — If it helps to keep expensive geometry that is likely to be reused here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_nfp_retention_bad_failure** — Could a confident but wrong decision to keep expensive geometry that is likely to be reused leave us with a seriously worse nest?

## do not rebuild a common prefix for every candidate

Jev groups proposals by reusable prefixes; an exact checkpoint engine verifies identity before resuming.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_prefix_reuse_speed_2x** — Could we do not rebuild a common prefix for every candidate and reach the same useful nesting quality in half the time?
- **cache_reuse_prefix_reuse_speed_5x** — Could we do not rebuild a common prefix for every candidate and cut the time to a useful nest by five times?
- **cache_reuse_prefix_reuse_material** — If we do not rebuild a common prefix for every candidate, could we use meaningfully less material in the same search time?
- **cache_reuse_prefix_reuse_jev_value** — If we do not rebuild a common prefix for every candidate, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_prefix_reuse_evidence_ready** — Do our current records contain enough information to tell Jev when to do not rebuild a common prefix for every candidate?
- **cache_reuse_prefix_reuse_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to do not rebuild a common prefix for every candidate?
- **cache_reuse_prefix_reuse_history_helps** — Would showing what has already worked and failed help Jev decide whether to do not rebuild a common prefix for every candidate?
- **cache_reuse_prefix_reuse_parallel_batch** — Can we ask about several independent opportunities to do not rebuild a common prefix for every candidate together and make the whole search faster?
- **cache_reuse_prefix_reuse_transfer** — If it helps to do not rebuild a common prefix for every candidate here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_prefix_reuse_bad_failure** — Could a confident but wrong decision to do not rebuild a common prefix for every candidate leave us with a seriously worse nest?

## remember exact failed fits so we do not ask again

Jev prioritises which negative geometric results to retain; reuse requires deterministic state and key equality.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_failed_fit_cache_speed_2x** — Could we remember exact failed fits so we do not ask again and reach the same useful nesting quality in half the time?
- **cache_reuse_failed_fit_cache_speed_5x** — Could we remember exact failed fits so we do not ask again and cut the time to a useful nest by five times?
- **cache_reuse_failed_fit_cache_material** — If we remember exact failed fits so we do not ask again, could we use meaningfully less material in the same search time?
- **cache_reuse_failed_fit_cache_jev_value** — If we remember exact failed fits so we do not ask again, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_failed_fit_cache_evidence_ready** — Do our current records contain enough information to tell Jev when to remember exact failed fits so we do not ask again?
- **cache_reuse_failed_fit_cache_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to remember exact failed fits so we do not ask again?
- **cache_reuse_failed_fit_cache_history_helps** — Would showing what has already worked and failed help Jev decide whether to remember exact failed fits so we do not ask again?
- **cache_reuse_failed_fit_cache_parallel_batch** — Can we ask about several independent opportunities to remember exact failed fits so we do not ask again together and make the whole search faster?
- **cache_reuse_failed_fit_cache_transfer** — If it helps to remember exact failed fits so we do not ask again here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_failed_fit_cache_bad_failure** — Could a confident but wrong decision to remember exact failed fits so we do not ask again leave us with a seriously worse nest?

## reuse a good partial layout when a job comes back

Jev selects stored sublayouts for exact compatibility and validity checks on a new job.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_partial_layout_library_speed_2x** — Could we reuse a good partial layout when a job comes back and reach the same useful nesting quality in half the time?
- **cache_reuse_partial_layout_library_speed_5x** — Could we reuse a good partial layout when a job comes back and cut the time to a useful nest by five times?
- **cache_reuse_partial_layout_library_material** — If we reuse a good partial layout when a job comes back, could we use meaningfully less material in the same search time?
- **cache_reuse_partial_layout_library_jev_value** — If we reuse a good partial layout when a job comes back, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_partial_layout_library_evidence_ready** — Do our current records contain enough information to tell Jev when to reuse a good partial layout when a job comes back?
- **cache_reuse_partial_layout_library_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to reuse a good partial layout when a job comes back?
- **cache_reuse_partial_layout_library_history_helps** — Would showing what has already worked and failed help Jev decide whether to reuse a good partial layout when a job comes back?
- **cache_reuse_partial_layout_library_parallel_batch** — Can we ask about several independent opportunities to reuse a good partial layout when a job comes back together and make the whole search faster?
- **cache_reuse_partial_layout_library_transfer** — If it helps to reuse a good partial layout when a job comes back here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_partial_layout_library_bad_failure** — Could a confident but wrong decision to reuse a good partial layout when a job comes back leave us with a seriously worse nest?

## start the search from useful previous populations

Jev selects a stored schedule population using job similarity before repairing and validating it.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_warm_population_speed_2x** — Could we start the search from useful previous populations and reach the same useful nesting quality in half the time?
- **cache_reuse_warm_population_speed_5x** — Could we start the search from useful previous populations and cut the time to a useful nest by five times?
- **cache_reuse_warm_population_material** — If we start the search from useful previous populations, could we use meaningfully less material in the same search time?
- **cache_reuse_warm_population_jev_value** — If we start the search from useful previous populations, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_warm_population_evidence_ready** — Do our current records contain enough information to tell Jev when to start the search from useful previous populations?
- **cache_reuse_warm_population_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to start the search from useful previous populations?
- **cache_reuse_warm_population_history_helps** — Would showing what has already worked and failed help Jev decide whether to start the search from useful previous populations?
- **cache_reuse_warm_population_parallel_batch** — Can we ask about several independent opportunities to start the search from useful previous populations together and make the whole search faster?
- **cache_reuse_warm_population_transfer** — If it helps to start the search from useful previous populations here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_warm_population_bad_failure** — Could a confident but wrong decision to start the search from useful previous populations leave us with a seriously worse nest?

## add the extra copies without starting from scratch

Jev chooses between incremental extension of a validated nest and full renesting after quantity changes.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_incremental_quantity_speed_2x** — Could we add the extra copies without starting from scratch and reach the same useful nesting quality in half the time?
- **cache_reuse_incremental_quantity_speed_5x** — Could we add the extra copies without starting from scratch and cut the time to a useful nest by five times?
- **cache_reuse_incremental_quantity_material** — If we add the extra copies without starting from scratch, could we use meaningfully less material in the same search time?
- **cache_reuse_incremental_quantity_jev_value** — If we add the extra copies without starting from scratch, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_incremental_quantity_evidence_ready** — Do our current records contain enough information to tell Jev when to add the extra copies without starting from scratch?
- **cache_reuse_incremental_quantity_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to add the extra copies without starting from scratch?
- **cache_reuse_incremental_quantity_history_helps** — Would showing what has already worked and failed help Jev decide whether to add the extra copies without starting from scratch?
- **cache_reuse_incremental_quantity_parallel_batch** — Can we ask about several independent opportunities to add the extra copies without starting from scratch together and make the whole search faster?
- **cache_reuse_incremental_quantity_transfer** — If it helps to add the extra copies without starting from scratch here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_incremental_quantity_bad_failure** — Could a confident but wrong decision to add the extra copies without starting from scratch leave us with a seriously worse nest?

## remove cancelled copies without rebuilding everything

Jev chooses a local repair plan after deletions while preserving exact placements where possible.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_incremental_delete_speed_2x** — Could we remove cancelled copies without rebuilding everything and reach the same useful nesting quality in half the time?
- **cache_reuse_incremental_delete_speed_5x** — Could we remove cancelled copies without rebuilding everything and cut the time to a useful nest by five times?
- **cache_reuse_incremental_delete_material** — If we remove cancelled copies without rebuilding everything, could we use meaningfully less material in the same search time?
- **cache_reuse_incremental_delete_jev_value** — If we remove cancelled copies without rebuilding everything, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_incremental_delete_evidence_ready** — Do our current records contain enough information to tell Jev when to remove cancelled copies without rebuilding everything?
- **cache_reuse_incremental_delete_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to remove cancelled copies without rebuilding everything?
- **cache_reuse_incremental_delete_history_helps** — Would showing what has already worked and failed help Jev decide whether to remove cancelled copies without rebuilding everything?
- **cache_reuse_incremental_delete_parallel_batch** — Can we ask about several independent opportunities to remove cancelled copies without rebuilding everything together and make the whole search faster?
- **cache_reuse_incremental_delete_transfer** — If it helps to remove cancelled copies without rebuilding everything here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_incremental_delete_bad_failure** — Could a confident but wrong decision to remove cancelled copies without rebuilding everything leave us with a seriously worse nest?

## adapt a previous nest to a new usable width

Jev chooses between exact repair of a previous layout and a fresh search after media-width changes.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_media_change_speed_2x** — Could we adapt a previous nest to a new usable width and reach the same useful nesting quality in half the time?
- **cache_reuse_media_change_speed_5x** — Could we adapt a previous nest to a new usable width and cut the time to a useful nest by five times?
- **cache_reuse_media_change_material** — If we adapt a previous nest to a new usable width, could we use meaningfully less material in the same search time?
- **cache_reuse_media_change_jev_value** — If we adapt a previous nest to a new usable width, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_media_change_evidence_ready** — Do our current records contain enough information to tell Jev when to adapt a previous nest to a new usable width?
- **cache_reuse_media_change_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to adapt a previous nest to a new usable width?
- **cache_reuse_media_change_history_helps** — Would showing what has already worked and failed help Jev decide whether to adapt a previous nest to a new usable width?
- **cache_reuse_media_change_parallel_batch** — Can we ask about several independent opportunities to adapt a previous nest to a new usable width together and make the whole search faster?
- **cache_reuse_media_change_transfer** — If it helps to adapt a previous nest to a new usable width here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_media_change_bad_failure** — Could a confident but wrong decision to adapt a previous nest to a new usable width leave us with a seriously worse nest?

## avoid paying for a clever cache decision when LRU is enough

Jev decides when a cheap deterministic cache policy should handle the workload without further model decisions.

**Evidence needed:** Exact cache/checkpoint keys, recurrence and reuse costs; verified compatibility and invalidation rules.

- **cache_reuse_cache_bypass_speed_2x** — Could we avoid paying for a clever cache decision when LRU is enough and reach the same useful nesting quality in half the time?
- **cache_reuse_cache_bypass_speed_5x** — Could we avoid paying for a clever cache decision when LRU is enough and cut the time to a useful nest by five times?
- **cache_reuse_cache_bypass_material** — If we avoid paying for a clever cache decision when LRU is enough, could we use meaningfully less material in the same search time?
- **cache_reuse_cache_bypass_jev_value** — If we avoid paying for a clever cache decision when LRU is enough, would Jev make it faster than a cheap rule making those same decisions?
- **cache_reuse_cache_bypass_evidence_ready** — Do our current records contain enough information to tell Jev when to avoid paying for a clever cache decision when LRU is enough?
- **cache_reuse_cache_bypass_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to avoid paying for a clever cache decision when LRU is enough?
- **cache_reuse_cache_bypass_history_helps** — Would showing what has already worked and failed help Jev decide whether to avoid paying for a clever cache decision when LRU is enough?
- **cache_reuse_cache_bypass_parallel_batch** — Can we ask about several independent opportunities to avoid paying for a clever cache decision when LRU is enough together and make the whole search faster?
- **cache_reuse_cache_bypass_transfer** — If it helps to avoid paying for a clever cache decision when LRU is enough here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **cache_reuse_cache_bypass_bad_failure** — Could a confident but wrong decision to avoid paying for a clever cache decision when LRU is enough leave us with a seriously worse nest?

