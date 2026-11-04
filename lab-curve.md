# We let AI agents run a research lab for 35 days. Here is its growth curve.

Our pre-registered test of whether the lab is speeding up came back LINEAR. Then our own audit agent fed the same code a cubic curve, and it said LINEAR again.

That second result is the most important thing in this post. If AI research can compound, so that a lab run by agents gets faster and better because of what it already did, the stakes are about as large as they get: science, software and every field that runs on experiments would move with it. We want this data to exist in public, so here is ours, including the part where our measuring stick broke.

I started Silicyte because I believe self-improving AI may be the most important thing happening in technology, and too much of the public evidence about it is a best run picked after the fact. If we are going to measure that claim for anyone else, we measure our own lab first. (Braxton Mensah, founder)

## The lab

Silicyte is one founder and a fleet of Claude Code agents working on one university cluster (Indiana University's Quartz). The founder picks the questions and writes the pass rules. The agents do the rest: they design experiments, write the code, launch the jobs, read the results and audit each other. Since 10/21 the rule is that an agent registers a prediction (a point estimate, an 80% band and a pass rule) before it analyzes anything; since 10/22 the ledger refuses a registration until the agent acknowledges the related prior results. Submissions to outside scoreboards still need the founder's explicit yes.

In the 35-day window we measured (10/01 to 11/04, 2026, Eastern time), the agents:

- started 14,123 Slurm jobs and used 17,198.71 GPU-hours (counted by job start day; jobs still running count their elapsed time so far);
- registered 1,038 distinct predictions, of which 781 have resolved and 37 were withdrawn;
- had 19 guards in force, 18 of them compiled inside the window: small programs that refuse specific agent mistakes before they happen.

Most of the predictions (922 of 1,038) come from two machine-learning competition lanes. One is ARC Prize 2026, where the founder trained and served a system; official results arrive 4 Dec 2026. We withhold competition details until those competitions close.

## The curve, as registered

We registered the test as silicyte-0120 at 17:08 ET on 11/04, before computing any count. The series: distinct registered predictions per day, accumulated into C(t), with t = 1 on 10/01. Fit log C on log t; the slope alpha is the growth exponent. An alpha of 1 means a steady rate. Above 1 means the lab is accelerating. The 95% interval came from a 7-day block bootstrap, 2,000 resamples, seed 0. The rule: ACCELERATING if the interval sits above 1.10, LINEAR if it covers 1.0, DECELERATING if it sits below 0.90.

We predicted alpha = 1.0, 80% band [0.85, 1.25].

Result: **alpha = 1.0133, 95% CI [0.4942, 2.8718]. Verdict as registered: LINEAR.** The point estimate landed inside our band.

An independent agent reproduced every digit from the pinned ledger snapshot (1,772 lines, sha256 63b1a1a8...), with its own parser, and got the same answer under circular blocks, non-overlapping blocks and four other seeds (audit file published with the counts).

## Why we are voiding our own verdict

Reproduction is not validity. The auditor then ran curves whose answer is known through the identical code:

| True curve | alpha | 95% CI | Verdict |
|---|---|---|---|
| C = t^2 (quadratic) | 2.0000 | [0.7624, 1.9116] | LINEAR |
| C = t^3 (cubic) | 3.0000 | [0.654, 2.8757] | LINEAR |
| C = 100 t^0.5 (slowing) | 0.5 | [0.5631, 1.2389] | LINEAR |
| C = 1.1^t (10% a day, doubling about every 7.3 days) | 1.0375 | | LINEAR |

The bootstrap resampled blocks of days in random order. That throws away time order, which is exactly the trend it was meant to detect. The gate had no power; it could only say LINEAR. Even the point fit is weak: real exponential growth reads as 1.0375. And alpha moves with the start date: 1.0133 from 10/01, 1.7251 from 10/15 without the 110 backfilled rows, 5.098 from 10/01 without them. All 110 registrations before 10/15 are backfills; the ledger itself was built on 10/15.

So silicyte-0120 is scored as an instrument failure, not a pass. We pre-registered carefully, and pre-registration did not save us. A positive control run before launch would have. Every test the lab runs now needs one, plus a negative control and a stated minimum detectable effect, before it touches data. A v2 of this test must pass a t^2 positive control and a flat negative control before it runs.

## What the curve actually shows

Without a valid test, here are the descriptive counts, with the rule dates beside them.

Registrations per week from 10/15: **241, 564, 123.** The daily mean was 26.33 from 10/15 to 10/20, 83.89 from 10/21 to 10/29, and 2.50 from 10/30 to 11/04. The jump lands on 10/21, the day the register-before-analysis rule took effect; on 10/22 the ledger began refusing registrations until the agent acknowledged prior results. That step is a rule, not a capability. The tail collapses: 108 registrations on 10/29, then 15 across 10/30 to 11/04. The only 2 on 11/04 are the Ratchet preregistration below and this measurement itself.

The cluster tells a different story from the ledger. Jobs per week: 2,246; 5,021; 4,031; 1,850; 975. GPU-hours per week, spread across the days jobs ran: 1,860.2; 3,379.3; 2,791.3; 6,055.2; 3,116.4. In week 5 the lab started 43% as many jobs as in week 1 but used 168% of the GPU-hours (113% if each job is counted on its start day). The work moved to fewer, larger jobs.

The honest read: over 35 days this lab did not visibly accelerate. Its output rate tracks the rules we set more than anything the agents learned.

## What the lab gets right and wrong

Of 548 resolved predictions with a verdict, 157 passed, 291 failed and 100 landed between: a PASS share of 28.65%. By week of resolution it was 28.30%, 28.93% and 27.66%. Flat. A lab that compounded would choose better bets over time. Ours picks winners at the same rate in week 5 as in week 3.

Calibration is better news. Of 667 raw 80% bands, 509 contained the outcome: 76.31%, close to the nominal 80%. The ledger widens every new band by a factor of x1.27, fitted on 728 resolved predictions; with that widening, 526 of 645 outcomes fell inside, or 81.55%. Because the factor was fitted on the lab's own record, read that as a check of fit more than a forecast. The Ratchet band below uses it.

The loop is fast. The median time from registration to resolution was 0.0347 days, about 50 minutes, over 671 predictions with both timestamps.

## Does the record compound?

The obvious way a lab could compound is through its archive: each new experiment builds on more past results, so later experiments are better informed. We tested that directly. Agents hand-labelled a uniform sample of preregistrations, blind to outcome, for which prior results each one drew on.

Two results:

- **Reuse is flat.** We fit how much each new experiment draws on the archive as the archive grows. The exponent was beta = 1.05 [0.93, 1.13], which in that fit means each experiment draws on a roughly fixed small working set no matter how large the archive gets.
- **Drawing on a past success does not help.** Experiments that built on a prior PASS had a PASS rate +0.05 higher, with interval [-0.10, +0.21]. Null.

The archive grows. By these two measures the lab does not get smarter from it. One signal did rise: within one competition lane the PASS rate went from 11% to 31% as the archive grew, then flattened, which we cannot separate from the lane simply learning its problem. We closed record-side compounding as a search for that lane.

## What did improve the lab

One change visibly altered what agents do: turning written lessons into compiled refusals.

In one session on 10/29 (an observation, not a trial), every compiled refusal that applied fired: 5 of 5. Of the written notes that applied, agents followed 1 of 4. A note telling agents never to hold a remote wait past the measured cutoff was filed one day and violated twice the next: both waits died, and four jobs ran unwatched for 90 minutes. After that, the rule became a guard that refuses the command.

Since 10/23 10:56 ET, one dispatcher has checked agent tool calls against the guards. Through 11/04 17:11 it checked 81,009 calls and refused 1,973 of them, or 2.436%. Counting two separately logged hooks too, 2,127 refusals were logged from 10/21. The biggest refusers:

| Guard | Refusals | What it stops |
|---|---|---|
| no_poll | 609 | sleeping, then checking a pending job again, instead of waiting on a signal |
| gpu_before_cpu | 597 | running Python on the founder's laptop instead of the cluster |
| stamp_guard | 283 | writing time stamps later than the real clock into records |
| quartz_overwrite_guard | 243 | overwriting a script that a running job is executing |
| waiter_shape | 183 | remote waits longer than the cluster lets them live |

Caveats: a refusal is a blocked attempt, not a distinct mistake, and retries often pass. Test sessions are still inside these totals. The rise after 10/29 is partly built in, because 9 of the 19 guards were added that week.

This is not compounding either. Each guard is a mistake someone noticed, frozen into a rule. But it is the one mechanism in our record that changes behavior on contact, and agents wrote and tested the guards, often in the same turn a failure was named.

## A retraction

We published that 29.8% of 103,850 guardrail calls came back absent: the safety check never answered. That number was real on one laptop. On clean public CI runners, with a 15 s timeout, the median absent rate was 0.0000 in every cell we ran, up to 24 concurrent agents; one repeat read 0.0354. The 29.8% described one machine, not guardrails under multi-agent load. The load-test results are public on the loadtest-results branch of braxtonmensah/refusal-uptime, and any page still showing 29.8% without 0.0000 beside it is wrong.

## What we test next: Ratchet

The question underneath all of this is whether an agent system can build something that makes its own later work better. Ratchet (silicyte-0119) asks it on a scoreboard we do not own.

We registered it at 16:46 ET on 11/04, and committed the preregistration as cc5fb5b at 16:47 ET, before any model call. At equal total tokens, does a library of verified Python helpers that keeps growing round after round (STOCK) solve more of 400 sealed ARC-AGI-1 evaluation tasks than:

- STATIC, the same library frozen after round 1;
- ONE-SHOT, the same tokens spent in one round;
- EXEMPLAR, whole verified programs in context with no helpers;
- SHAM, a matched library of unverified code;
- FLAT-TTC, no library, every token spent on extra samples?

The sealed task list is fixed by hash (sha256 911bf838...957ddd). Two planted positive controls: PLANT-DRIP releases known-good primitives over rounds; PLANT-L1 gets only the first tranche. If PLANT-DRIP cannot beat PLANT-L1, the run is VOID, not null. That is the lesson of the broken growth test, built into the next one before it runs.

Our prediction: STOCK minus STATIC = +2 of 400 sealed solves, 80% band [-8, +14], widened by the ledger to [-10.68, +17.216]. We put P(COMPOUNDS) at 0.15. Every compute-matched re-evaluation of in-context library learning we have found reads null, so the most likely outcome is no compounding. If it comes back null, we publish the null and drop library compounding as Silicyte's thesis. The result is pending; the prereg is at github.com/braxtonmensah/ratchet.

## Limits

- One operator, one cluster, one 35-day window.
- The design, the code and this post were written with AI assistance.
- Nothing here is peer reviewed. Our own audit found the main test powerless; read every other number with that in mind.
- The prediction ledger is a choice agents make under rules we set, so its counts measure rules as much as work.
- Competition details stay withheld until those competitions close.
- The scripts behind every count here and the derived daily and weekly series are published at https://silicyte.com/lab-curve-data/. The raw ledger snapshot (1,772 lines, sha256 63b1a1a80fd2fabec8a5f65d41a24905cea95e1b667f5c85673ede5e10607c3f) stays private until the competitions in it close, because its rows describe live competition work; its hash is fixed here so the published counts can be checked against it later.

We do not know yet whether AI research compounds. We do know how to find out without fooling ourselves, and we are going to keep publishing the answer, whatever it is.

Scripts, counts and the audit: https://silicyte.com/lab-curve-data/
