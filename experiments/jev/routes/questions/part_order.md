# part order

100 questions: 10 proposed routes, each examined from 10 angles. All answers are exploratory judgments until measured.

## get the awkward parts out of the way

Jev prioritises parts with few permitted orientations or few measured feasible placement regions.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_constrained_first_speed_2x** — Could we get the awkward parts out of the way and reach the same useful nesting quality in half the time?
- **part_order_constrained_first_speed_5x** — Could we get the awkward parts out of the way and cut the time to a useful nest by five times?
- **part_order_constrained_first_material** — If we get the awkward parts out of the way, could we use meaningfully less material in the same search time?
- **part_order_constrained_first_jev_value** — If we get the awkward parts out of the way, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_constrained_first_evidence_ready** — Do our current records contain enough information to tell Jev when to get the awkward parts out of the way?
- **part_order_constrained_first_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to get the awkward parts out of the way?
- **part_order_constrained_first_history_helps** — Would showing what has already worked and failed help Jev decide whether to get the awkward parts out of the way?
- **part_order_constrained_first_parallel_batch** — Can we ask about several independent opportunities to get the awkward parts out of the way together and make the whole search faster?
- **part_order_constrained_first_transfer** — If it helps to get the awkward parts out of the way here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_constrained_first_bad_failure** — Could a confident but wrong decision to get the awkward parts out of the way leave us with a seriously worse nest?

## save the little gap-fillers for later

Jev chooses which small parts to defer until larger constrained parts are placed.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_fillers_later_speed_2x** — Could we save the little gap-fillers for later and reach the same useful nesting quality in half the time?
- **part_order_fillers_later_speed_5x** — Could we save the little gap-fillers for later and cut the time to a useful nest by five times?
- **part_order_fillers_later_material** — If we save the little gap-fillers for later, could we use meaningfully less material in the same search time?
- **part_order_fillers_later_jev_value** — If we save the little gap-fillers for later, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_fillers_later_evidence_ready** — Do our current records contain enough information to tell Jev when to save the little gap-fillers for later?
- **part_order_fillers_later_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to save the little gap-fillers for later?
- **part_order_fillers_later_history_helps** — Would showing what has already worked and failed help Jev decide whether to save the little gap-fillers for later?
- **part_order_fillers_later_parallel_batch** — Can we ask about several independent opportunities to save the little gap-fillers for later together and make the whole search faster?
- **part_order_fillers_later_transfer** — If it helps to save the little gap-fillers for later here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_fillers_later_bad_failure** — Could a confident but wrong decision to save the little gap-fillers for later leave us with a seriously worse nest?

## mix big and small pieces instead of forming long blocks

Jev chooses a size-interleaving recipe from explicit part quantities and geometric summaries.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_interleave_speed_2x** — Could we mix big and small pieces instead of forming long blocks and reach the same useful nesting quality in half the time?
- **part_order_interleave_speed_5x** — Could we mix big and small pieces instead of forming long blocks and cut the time to a useful nest by five times?
- **part_order_interleave_material** — If we mix big and small pieces instead of forming long blocks, could we use meaningfully less material in the same search time?
- **part_order_interleave_jev_value** — If we mix big and small pieces instead of forming long blocks, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_interleave_evidence_ready** — Do our current records contain enough information to tell Jev when to mix big and small pieces instead of forming long blocks?
- **part_order_interleave_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to mix big and small pieces instead of forming long blocks?
- **part_order_interleave_history_helps** — Would showing what has already worked and failed help Jev decide whether to mix big and small pieces instead of forming long blocks?
- **part_order_interleave_parallel_batch** — Can we ask about several independent opportunities to mix big and small pieces instead of forming long blocks together and make the whole search faster?
- **part_order_interleave_transfer** — If it helps to mix big and small pieces instead of forming long blocks here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_interleave_bad_failure** — Could a confident but wrong decision to mix big and small pieces instead of forming long blocks leave us with a seriously worse nest?

## break up identical-part blocks that hurt the nest

Jev selects where to split repeated-part runs in the placement order.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_family_split_speed_2x** — Could we break up identical-part blocks that hurt the nest and reach the same useful nesting quality in half the time?
- **part_order_family_split_speed_5x** — Could we break up identical-part blocks that hurt the nest and cut the time to a useful nest by five times?
- **part_order_family_split_material** — If we break up identical-part blocks that hurt the nest, could we use meaningfully less material in the same search time?
- **part_order_family_split_jev_value** — If we break up identical-part blocks that hurt the nest, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_family_split_evidence_ready** — Do our current records contain enough information to tell Jev when to break up identical-part blocks that hurt the nest?
- **part_order_family_split_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to break up identical-part blocks that hurt the nest?
- **part_order_family_split_history_helps** — Would showing what has already worked and failed help Jev decide whether to break up identical-part blocks that hurt the nest?
- **part_order_family_split_parallel_batch** — Can we ask about several independent opportunities to break up identical-part blocks that hurt the nest together and make the whole search faster?
- **part_order_family_split_transfer** — If it helps to break up identical-part blocks that hurt the nest here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_family_split_bad_failure** — Could a confident but wrong decision to break up identical-part blocks that hurt the nest leave us with a seriously worse nest?

## put shapes that help each other next to each other

Jev chooses candidate complementary pairs for exact adjacency trials.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_complement_pair_speed_2x** — Could we put shapes that help each other next to each other and reach the same useful nesting quality in half the time?
- **part_order_complement_pair_speed_5x** — Could we put shapes that help each other next to each other and cut the time to a useful nest by five times?
- **part_order_complement_pair_material** — If we put shapes that help each other next to each other, could we use meaningfully less material in the same search time?
- **part_order_complement_pair_jev_value** — If we put shapes that help each other next to each other, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_complement_pair_evidence_ready** — Do our current records contain enough information to tell Jev when to put shapes that help each other next to each other?
- **part_order_complement_pair_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to put shapes that help each other next to each other?
- **part_order_complement_pair_history_helps** — Would showing what has already worked and failed help Jev decide whether to put shapes that help each other next to each other?
- **part_order_complement_pair_parallel_batch** — Can we ask about several independent opportunities to put shapes that help each other next to each other together and make the whole search faster?
- **part_order_complement_pair_transfer** — If it helps to put shapes that help each other next to each other here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_complement_pair_bad_failure** — Could a confident but wrong decision to put shapes that help each other next to each other leave us with a seriously worse nest?

## deal with the most dangerous leftovers first

Jev reprioritises the remaining queue using exact fit witnesses and current residual regions.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_remaining_risk_speed_2x** — Could we deal with the most dangerous leftovers first and reach the same useful nesting quality in half the time?
- **part_order_remaining_risk_speed_5x** — Could we deal with the most dangerous leftovers first and cut the time to a useful nest by five times?
- **part_order_remaining_risk_material** — If we deal with the most dangerous leftovers first, could we use meaningfully less material in the same search time?
- **part_order_remaining_risk_jev_value** — If we deal with the most dangerous leftovers first, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_remaining_risk_evidence_ready** — Do our current records contain enough information to tell Jev when to deal with the most dangerous leftovers first?
- **part_order_remaining_risk_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to deal with the most dangerous leftovers first?
- **part_order_remaining_risk_history_helps** — Would showing what has already worked and failed help Jev decide whether to deal with the most dangerous leftovers first?
- **part_order_remaining_risk_parallel_batch** — Can we ask about several independent opportunities to deal with the most dangerous leftovers first together and make the whole search faster?
- **part_order_remaining_risk_transfer** — If it helps to deal with the most dangerous leftovers first here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_remaining_risk_bad_failure** — Could a confident but wrong decision to deal with the most dangerous leftovers first leave us with a seriously worse nest?

## place narrow awkward shapes before their corridors disappear

Jev chooses whether elongated parts should precede broader parts in the supplied partial state.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_narrow_first_speed_2x** — Could we place narrow awkward shapes before their corridors disappear and reach the same useful nesting quality in half the time?
- **part_order_narrow_first_speed_5x** — Could we place narrow awkward shapes before their corridors disappear and cut the time to a useful nest by five times?
- **part_order_narrow_first_material** — If we place narrow awkward shapes before their corridors disappear, could we use meaningfully less material in the same search time?
- **part_order_narrow_first_jev_value** — If we place narrow awkward shapes before their corridors disappear, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_narrow_first_evidence_ready** — Do our current records contain enough information to tell Jev when to place narrow awkward shapes before their corridors disappear?
- **part_order_narrow_first_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to place narrow awkward shapes before their corridors disappear?
- **part_order_narrow_first_history_helps** — Would showing what has already worked and failed help Jev decide whether to place narrow awkward shapes before their corridors disappear?
- **part_order_narrow_first_parallel_batch** — Can we ask about several independent opportunities to place narrow awkward shapes before their corridors disappear together and make the whole search faster?
- **part_order_narrow_first_transfer** — If it helps to place narrow awkward shapes before their corridors disappear here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_narrow_first_bad_failure** — Could a confident but wrong decision to place narrow awkward shapes before their corridors disappear leave us with a seriously worse nest?

## avoid spending all of one useful shape too early

Jev adjusts the next batch composition based on remaining quantities and possible filler roles.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_quantity_balance_speed_2x** — Could we avoid spending all of one useful shape too early and reach the same useful nesting quality in half the time?
- **part_order_quantity_balance_speed_5x** — Could we avoid spending all of one useful shape too early and cut the time to a useful nest by five times?
- **part_order_quantity_balance_material** — If we avoid spending all of one useful shape too early, could we use meaningfully less material in the same search time?
- **part_order_quantity_balance_jev_value** — If we avoid spending all of one useful shape too early, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_quantity_balance_evidence_ready** — Do our current records contain enough information to tell Jev when to avoid spending all of one useful shape too early?
- **part_order_quantity_balance_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to avoid spending all of one useful shape too early?
- **part_order_quantity_balance_history_helps** — Would showing what has already worked and failed help Jev decide whether to avoid spending all of one useful shape too early?
- **part_order_quantity_balance_parallel_batch** — Can we ask about several independent opportunities to avoid spending all of one useful shape too early together and make the whole search faster?
- **part_order_quantity_balance_transfer** — If it helps to avoid spending all of one useful shape too early here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_quantity_balance_bad_failure** — Could a confident but wrong decision to avoid spending all of one useful shape too early leave us with a seriously worse nest?

## use ordering freedom among equally urgent jobs

Jev ranks legal order permutations within fixed deadline and production-priority constraints.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_due_date_ties_speed_2x** — Could we use ordering freedom among equally urgent jobs and reach the same useful nesting quality in half the time?
- **part_order_due_date_ties_speed_5x** — Could we use ordering freedom among equally urgent jobs and cut the time to a useful nest by five times?
- **part_order_due_date_ties_material** — If we use ordering freedom among equally urgent jobs, could we use meaningfully less material in the same search time?
- **part_order_due_date_ties_jev_value** — If we use ordering freedom among equally urgent jobs, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_due_date_ties_evidence_ready** — Do our current records contain enough information to tell Jev when to use ordering freedom among equally urgent jobs?
- **part_order_due_date_ties_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to use ordering freedom among equally urgent jobs?
- **part_order_due_date_ties_history_helps** — Would showing what has already worked and failed help Jev decide whether to use ordering freedom among equally urgent jobs?
- **part_order_due_date_ties_parallel_batch** — Can we ask about several independent opportunities to use ordering freedom among equally urgent jobs together and make the whole search faster?
- **part_order_due_date_ties_transfer** — If it helps to use ordering freedom among equally urgent jobs here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_due_date_ties_bad_failure** — Could a confident but wrong decision to use ordering freedom among equally urgent jobs leave us with a seriously worse nest?

## choose the next small group rather than one part at a time

Jev selects a short sequence from exact legal candidate groups and a remaining-part summary.

**Evidence needed:** Remaining contours, quantities and constraints; executable competing orders and complete outcomes.

- **part_order_lookahead_order_speed_2x** — Could we choose the next small group rather than one part at a time and reach the same useful nesting quality in half the time?
- **part_order_lookahead_order_speed_5x** — Could we choose the next small group rather than one part at a time and cut the time to a useful nest by five times?
- **part_order_lookahead_order_material** — If we choose the next small group rather than one part at a time, could we use meaningfully less material in the same search time?
- **part_order_lookahead_order_jev_value** — If we choose the next small group rather than one part at a time, would Jev make it faster than a cheap rule making those same decisions?
- **part_order_lookahead_order_evidence_ready** — Do our current records contain enough information to tell Jev when to choose the next small group rather than one part at a time?
- **part_order_lookahead_order_ask_early** — Would asking Jev before the expensive work be the better moment to decide whether to choose the next small group rather than one part at a time?
- **part_order_lookahead_order_history_helps** — Would showing what has already worked and failed help Jev decide whether to choose the next small group rather than one part at a time?
- **part_order_lookahead_order_parallel_batch** — Can we ask about several independent opportunities to choose the next small group rather than one part at a time together and make the whole search faster?
- **part_order_lookahead_order_transfer** — If it helps to choose the next small group rather than one part at a time here, is that likely to survive on unfamiliar jobs with different shapes and quantities?
- **part_order_lookahead_order_bad_failure** — Could a confident but wrong decision to choose the next small group rather than one part at a time leave us with a seriously worse nest?

