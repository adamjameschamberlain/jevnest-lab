# Jev question bank — 60 hypotheses, 120 questions

Each hypothesis has casual and technical wording with the same outcome definition. These are candidate research questions, not established sources of speedup. Noul returns a yes-probability; it is not evidence that a prediction is calibrated.

## Branch Quality

Choose a branch before its expensive completion. Required state: `subject`, `incumbent`, `objective`, `completionProtocol`.

### Beat Best

- **Casual:** Is this one worth chasing — will it beat what we already have?
- **Technical:** Will completing this branch produce a valid layout better than the current incumbent?
- **Measured label:** Completed branch beats the frozen incumbent using the declared objective comparator.

### Save Material

- **Casual:** Will this actually save material, or just shuffle things around?
- **Technical:** Will this branch reduce sheet count or consumed roll length by the declared material threshold?
- **Measured label:** Valid completion reduces the primary material objective by at least objective.materialThreshold; compactness alone does not count.

### Small Win

- **Casual:** Could this give us a small but useful win?
- **Technical:** Will this branch improve the incumbent by at least the minimum useful gain?
- **Measured label:** Valid completion achieves objective.minimumUsefulGain under the frozen comparator.

### Hit Target

- **Casual:** Can this get us over the finish line?
- **Technical:** Will this branch reach the explicitly supplied target layout quality?
- **Measured label:** Valid completion meets objective.target within completionProtocol.deadlineMs.

### Avoid Bad Tail

- **Casual:** Does this start well but leave us with a nasty pile of leftovers?
- **Technical:** Will the unseen remainder force a final layout worse than the incumbent?
- **Measured label:** Valid full completion is worse than the frozen incumbent despite the observed prefix; a timeout is censored, not a positive label.

## Branch Cost

Allocate time before a rollout. Required state: `subject`, `incumbent`, `objective`, `completionProtocol`, `costHistory`, `thresholds`.

### Time Sink

- **Casual:** Is this going to eat our time?
- **Technical:** Will full completion exceed the supplied slow-completion threshold?
- **Measured label:** Measured completion time exceeds thresholds.slowMs; right-censored runs shorter than that threshold remain unknown.

### Cheap Win

- **Casual:** Can we get a useful win out of this quickly?
- **Technical:** Will this branch reach the minimum useful gain before the quick-win deadline?
- **Measured label:** Valid completion improves the incumbent by objective.minimumUsefulGain within thresholds.quickMs.

### Worth Seconds

- **Casual:** Is the likely saving worth the seconds we would spend?
- **Technical:** Will this branch exceed the required material improvement per elapsed second?
- **Measured label:** Measured material gain divided by end-to-end incremental seconds exceeds thresholds.gainPerSecond; include evidence and API costs for a deployed policy.

### Deadline Waste

- **Casual:** Are we starting something we will not finish in time?
- **Technical:** Will this branch fail to return a valid complete layout before the remaining deadline?
- **Measured label:** No validated complete result is available at completionProtocol.deadlineMs; log timeout and invalidity separately.

### Cheap Reject

- **Casual:** Could we cheaply find out that this is a dud?
- **Technical:** Will the supplied short probe reject a non-improving branch at lower cost than completing it?
- **Measured label:** The predeclared probeRule rejects, full completion does not beat incumbent, and probe cost is below thresholds.probeFraction of completion cost.

## Head To Head

Choose between two executable alternatives. Required state: `subject`, `alternative`, `incumbent`, `objective`, `completionProtocol`.

### Better Final

- **Casual:** If we can only finish one, should it be A?
- **Technical:** Will branch A finish with better layout quality than branch B?
- **Measured label:** A and B are both completed under the same protocol; A beats B by the objective comparator. A tie is false; an unresolved timeout is unknown.

### Faster Target

- **Casual:** Which gets us a good enough nest sooner — is it A?
- **Technical:** Will A reach the supplied quality target sooner than B?
- **Measured label:** A first reaches objective.target earlier than B, counting preparation and inference allocation; neither reaching is false, incomplete observation is censored.

### Value First

- **Casual:** Should A get the next chunk of compute?
- **Technical:** Will spending the fixed compute window on A deliver more material improvement than spending it on B?
- **Measured label:** Matched windows produce greater valid material improvement from A; same starting incumbent and declared window.

### Boring Winner

- **Casual:** Is the boring-looking option A actually the better bet?
- **Technical:** Will A outperform B despite B having the better supplied local heuristic score?
- **Measured label:** A has the worse local score and the better completed objective; otherwise false. Local score is supplied as evidence, not as a label.

### Second Chance

- **Casual:** Are we about to throw away the better option A?
- **Technical:** Will the candidate rejected by the fixed arithmetic rule outperform its selected alternative?
- **Measured label:** A is rejected by the frozen rule and beats selected B after matched full completion; no retrospective relabelling of A.

## Probe Timing

Decide how much evidence to buy. Required state: `subject`, `incumbent`, `objective`, `completionProtocol`, `probePlans`, `thresholds`.

### Enough Already

- **Casual:** Have we seen enough to make the call now?
- **Technical:** Will the frozen decision using current evidence match the decision after all candidate completions?
- **Measured label:** Current frozen selector chooses a candidate within objective.regretTolerance of the fully completed best candidate.

### Look Longer

- **Casual:** Would watching a bit more save us from a bad decision?
- **Technical:** Will the next probe depth change the selected branch and reduce final regret enough to justify its cost?
- **Measured label:** Predeclared deeper probe changes the frozen selection, reduces regret by thresholds.regretReduction, and pays back added probe time under the evaluation protocol.

### Late Surprise

- **Casual:** Could this ugly start turn into the winner later?
- **Technical:** Will a branch currently below the median prefix ranking finish in the top quartile?
- **Measured label:** Below-median current rank and top-quartile completed objective, with frozen tie handling; requires the complete batch.

### Probe Wrong Place

- **Casual:** Are we staring at the easy bit and missing the trouble later on?
- **Technical:** Will probing the supplied later bottleneck distinguish final outcomes better than extending the current prefix?
- **Measured label:** Matched-cost bottleneck and prefix probes feed the same frozen selector; bottleneck probe yields lower completed regret.

### Skip Probe

- **Casual:** Can we skip this extra inspection without losing anything useful?
- **Technical:** Will omitting the proposed additional probe preserve acceptable selection quality while reducing elapsed time?
- **Measured label:** Without-probe selected result stays within objective.regretTolerance of with-probe result and has lower end-to-end selection time.

## Stop Restart

After a measured search window. Required state: `incumbent`, `objective`, `searchHistory`, `continuationPlan`, `restartPlan`, `thresholds`.

### Stop Now

- **Casual:** Are we just burning time now?
- **Technical:** Will another fixed search window fail to deliver the minimum useful improvement?
- **Measured label:** Continuation from the checkpoint produces no valid improvement of objective.minimumUsefulGain within thresholds.windowMs.

### Restart

- **Casual:** Should we stop fiddling with this and start somewhere else?
- **Technical:** Will the supplied restart outperform continuing the current search for the same time?
- **Measured label:** Matched restart and continuation windows begin from the same incumbent; restart produces better valid quality.

### Nearly Done

- **Casual:** Are we already close enough that more searching is pointless?
- **Technical:** Is the incumbent within the accepted tolerance of the predeclared reference quality?
- **Measured label:** Incumbent is within objective.acceptableGap of an independent long-run reference or certified bound, with reference type reported; reference is withheld from the model.

### One More

- **Casual:** Is one more round likely to pay off?
- **Technical:** Will the next fixed search window produce the minimum useful improvement?
- **Measured label:** Continuation yields a valid improvement of objective.minimumUsefulGain within thresholds.windowMs.

### Patient

- **Casual:** Is this a slow burner that deserves a longer chance?
- **Technical:** Will extending this stalled search beat the short-window alternative by the required gain?
- **Measured label:** Predeclared long continuation beats the named alternative by objective.minimumUsefulGain; charge additional elapsed time and report the short-window opportunity cost.

## Repair Operator

Choose a local repair before executing it. Required state: `subject`, `incumbent`, `objective`, `geometryEvidence`, `actions`, `actionProtocol`.

### Swap

- **Casual:** Would swapping these two get us unstuck?
- **Technical:** Will the supplied two-part swap improve the layout within the action budget?
- **Measured label:** Execute actions.swap and validate; result beats unchanged incumbent under actionProtocol.

### Rotate

- **Casual:** Is turning this awkward piece the move we are missing?
- **Technical:** Will the supplied allowed rotation and repair improve the layout?
- **Measured label:** Execute actions.rotate with allowed angles and matched repair budget; valid result beats unchanged incumbent.

### Unpack

- **Casual:** Should we pull this little area apart and try it again?
- **Technical:** Will the supplied neighbourhood removal and reinsertion improve the incumbent?
- **Measured label:** Execute actions.repackNeighbourhood under actionProtocol; valid final result beats incumbent including all removed parts.

### Move Blocker

- **Casual:** Is this piece hogging the space everyone else needs?
- **Technical:** Will relocating the nominated blocker yield the minimum useful improvement?
- **Measured label:** Execute actions.moveBlocker and complete the repair; valid material gain reaches objective.minimumUsefulGain.

### Big Change

- **Casual:** Does this need a big reshuffle rather than another tiny tweak?
- **Technical:** Will the supplied large perturbation beat the supplied small perturbation under equal time?
- **Measured label:** Matched actions.largePerturbation and actions.smallPerturbation; large gives better valid objective.

## Part Strategy

Choose the next part-order intervention. Required state: `subject`, `incumbent`, `objective`, `remainingParts`, `actions`, `actionProtocol`.

### Awkward First

- **Casual:** Should we deal with this pain of a piece before we use up its options?
- **Technical:** Will placing the nominated constrained part earlier improve the completed layout?
- **Measured label:** actions.constrainedFirst beats unchanged order after matched completions.

### Save Fillers

- **Casual:** Are we spending our useful little gap-fillers too soon?
- **Technical:** Will deferring the nominated filler parts improve the completed layout?
- **Measured label:** actions.deferFillers beats unchanged order under the same completion protocol.

### Mix Sizes

- **Casual:** Would mixing big and small pieces help here?
- **Technical:** Will the supplied interleaved size order outperform the current grouped order?
- **Measured label:** actions.interleaveSizes beats unchanged grouped order after matched completion.

### Keep Pair

- **Casual:** Do these two belong together?
- **Technical:** Will placing the supplied complementary pair consecutively improve material use?
- **Measured label:** actions.pairTogether beats actions.pairSeparate after full valid completion by the declared material threshold.

### Break Family

- **Casual:** Are we making life harder by keeping identical pieces together?
- **Technical:** Will breaking the supplied repeated-part block improve the completed layout?
- **Measured label:** actions.splitFamilyBlock beats unchanged schedule after matched completion.

## Gap Strategy

Judge the consequence of a legal placement. Required state: `subject`, `incumbent`, `objective`, `geometryEvidence`, `remainingParts`, `actions`, `actionProtocol`.

### Trap

- **Casual:** Does this cheap-looking move paint us into a corner?
- **Technical:** Will the nominated legal placement lead to worse completed quality than the supplied alternative?
- **Measured label:** Complete both legal placements with the same remaining policy; nominated placement loses.

### Save Gap

- **Casual:** Is this gap worth protecting for something still in the queue?
- **Technical:** Will reserving the nominated cavity outperform filling it with the currently proposed part?
- **Measured label:** actions.reserveCavity beats actions.fillCavity after matched full completion; all required parts retained.

### Ignore Gap

- **Casual:** Should we stop trying to rescue this little hole?
- **Technical:** Will ignoring the nominated cavity achieve acceptable quality faster than attempting to fill it?
- **Measured label:** actions.ignoreCavity is within objective.regretTolerance of actions.fillCavity and reaches that quality sooner.

### Open Space

- **Casual:** Would leaving one useful open area beat squeezing everything tight right now?
- **Technical:** Will the supplied open-frontier placement outperform the tighter local placement?
- **Measured label:** Matched completion of actions.openFrontier beats actions.tightPlacement on the final objective.

### Close Sheet

- **Casual:** Is it time to close this sheet and move on?
- **Technical:** Will opening a new sheet now reach acceptable final quality sooner than attempting further filling?
- **Measured label:** actions.openNextSheet reaches a layout within objective.regretTolerance of actions.keepFilling sooner; report sheet-count losses separately.

## Reuse

Avoid repeated geometry or search work. Required state: `subject`, `incumbent`, `objective`, `reuseEvidence`, `actions`, `actionProtocol`.

### Template

- **Casual:** Have we basically solved this bit already?
- **Technical:** Will reusing the supplied validated placement template preserve acceptable quality and reduce time?
- **Measured label:** actions.reuseTemplate validates all copies and constraints, stays within objective.regretTolerance of recomputation, and reduces end-to-end time.

### Repeat Block

- **Casual:** Can we stamp out this block instead of solving every copy again?
- **Technical:** Will the supplied repeated-block construction outperform individual placement in time at acceptable quality?
- **Measured label:** actions.repeatBlock produces a fully valid nest within objective.regretTolerance of individual placement and takes less elapsed time.

### Same Branch

- **Casual:** Are these two searches going to tell us the same thing?
- **Technical:** Will the supplied branches produce equivalent layout quality within tolerance?
- **Measured label:** Both completions differ by at most objective.equivalenceTolerance; this predicts redundancy, not exact geometric identity or permission to skip validity checks.

### Reuse Rotation

- **Casual:** Can we carry over what we learned about that orientation?
- **Technical:** Will reusing the supplied rotation preference preserve acceptable quality and save search time?
- **Measured label:** actions.reuseOrientation stays within objective.regretTolerance of fresh orientation search while reducing elapsed time.

### Cache Value

- **Casual:** Is keeping this expensive result around going to pay for itself?
- **Technical:** Will retaining the nominated cache entry save more compute than its declared retention overhead?
- **Measured label:** Future requests under the frozen workload reuse the exact keyed result; measured saved compute exceeds actionProtocol.retentionCostMs. Exact-key validity remains deterministic.

## Portfolio

Allocate workers and diversity. Required state: `incumbent`, `objective`, `searchHistory`, `alternatives`, `allocationPlans`, `actionProtocol`.

### Explore

- **Casual:** Should we try something genuinely different now?
- **Technical:** Will the supplied exploratory allocation beat exploitation for the same resource budget?
- **Measured label:** Matched actions defined in allocationPlans.explore and exploit; explore gives better valid quality with equal wall time and worker count.

### Diversify

- **Casual:** Are we paying several workers to make the same mistake?
- **Technical:** Will the supplied diverse portfolio outperform the current similar-worker portfolio?
- **Measured label:** Equal-worker, equal-wall-time portfolios; diverse allocation reaches better quality. Also report CPU-seconds and API use.

### Runner Up

- **Casual:** Is the runner-up worth keeping alive?
- **Technical:** Will retaining the supplied runner-up improve final quality compared with allocating all resources to the leader?
- **Measured label:** Matched allocationPlans.keepRunnerUp beats allocationPlans.leaderOnly on completed objective.

### Geometry Parallel

- **Casual:** Would another geometry worker help more than another opinion?
- **Technical:** Will the supplied additional-geometry allocation beat the additional-model-evidence allocation?
- **Measured label:** Compare the named plans under the same declared monetary or compute constraint; geometry plan reaches target sooner. Report resource mismatch if budgets cannot be matched.

### Overlap Wait

- **Casual:** Can we get useful work done while Jev is thinking?
- **Technical:** Will executing the supplied independent geometry task during the model wait reduce time to the target?
- **Measured label:** Actual concurrent execution reduces end-to-end target time versus sequential execution with identical work, worker limits and quality; include contention and discarded work.

## Job Strategy

Choose the initial strategy from job evidence. Required state: `jobEvidence`, `objective`, `strategyPlans`, `actionProtocol`.

### Greedy Enough

- **Casual:** Is this one simple enough that a quick sensible arrangement will do?
- **Technical:** Will the supplied fast deterministic strategy achieve acceptable reference quality?
- **Measured label:** Fast strategy is within objective.acceptableGap of the independent reference under the stated constraints; reference outcomes withheld.

### Ga Worth It

- **Casual:** Does this job actually need a proper search?
- **Technical:** Will the supplied GA search improve enough over the fast baseline to justify its cost?
- **Measured label:** GA reaches objective.minimumUsefulGain over fast baseline within actionProtocol.deadlineMs; also report time-to-target and CPU-seconds.

### Order Matters

- **Casual:** Is getting the queue in the right order the main thing here?
- **Technical:** Will the supplied order-only strategy outperform the rotation-only strategy under equal budget?
- **Measured label:** Matched strategyPlans.orderOnly beats strategyPlans.rotationOnly on final valid objective.

### Rotation Matters

- **Casual:** Are we wasting time shuffling when turning the pieces is what matters?
- **Technical:** Will the supplied rotation-only strategy outperform the order-only strategy under equal budget?
- **Measured label:** Matched strategyPlans.rotationOnly beats strategyPlans.orderOnly; allowed rotations identical across strategies.

### Repeat Job

- **Casual:** Is this really a repeat-pattern job wearing a complicated disguise?
- **Technical:** Will the supplied repeated-pattern strategy beat the general search at acceptable quality?
- **Measured label:** strategyPlans.pattern reaches quality within objective.regretTolerance of general search sooner, including pattern discovery and validation costs.

## Trust Checks

Decide whether to trust or defer a prediction. Required state: `subject`, `incumbent`, `objective`, `completionProtocol`, `robustnessPlans`, `thresholds`.

### Fragile

- **Casual:** Would a tiny change knock this apparent winner off its perch?
- **Technical:** Will the supplied legal perturbation set reverse the nominated winner frequently?
- **Measured label:** Winner changes in at least thresholds.reversalFraction of the predeclared perturbations after matched completions.

### Missing Clue

- **Casual:** Are we missing the one bit of information that could change the call?
- **Technical:** Will adding the specified withheld evidence change the frozen selection and reduce regret?
- **Measured label:** Predeclared evidence ablation yields a changed selection and regret reduction of at least thresholds.regretReduction; future outcomes never enter the added evidence.

### Trust Arithmetic

- **Casual:** Should we just trust the cheap rule on this one?
- **Technical:** Will the supplied arithmetic choice finish within tolerance of the best candidate?
- **Measured label:** Arithmetic-selected candidate is within objective.regretTolerance of the fully completed candidate set.

### Trust Model

- **Casual:** Is this one where Jev can spot something the cheap rule misses?
- **Technical:** Will the separately frozen model selector outperform the arithmetic selector on this state?
- **Measured label:** Separately frozen selector predictions, made without these diagnostic answers, are scored on all completed branches; model regret is lower by thresholds.regretReduction.

### Order Bias

- **Casual:** Would changing the order we show the options change the answer?
- **Technical:** Will the frozen selector change its semantic choice under the supplied option permutations?
- **Measured label:** Run the same question with anonymised identifiers and permutations; a changed semantic choice is true. Report outcome regret separately; disagreement alone is not a quality loss.
