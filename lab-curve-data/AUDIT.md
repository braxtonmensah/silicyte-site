# AUDIT of silicyte-0120 labcurve_v1 (independent agent verify:lab, workflow wf_cb197ebd-886, 2026-11-04)

Copied verbatim from the workflow journal so every audit number in the essay traces to a file.

## Summary

Audit of silicyte-0120 labcurve_v1. My numbers match the counts agent exactly, but the gated verdict tells us nothing, because the prereg's own bootstrap cannot detect acceleration.

Reproduction: I took the first 1,772 lines of the live C:/Users/bmens/OneDrive - Indiana University/NQ_Project/loop/PREDICTIONS.jsonl. Its sha256 matches the counts agent's (63b1a1a8...). The live file now has 1,774 lines, with silicyte-0121 and silicyte-0122 added at 17:35, and hashes to e063eac1..., so any rerun must use the pinned snapshot. My own node script is C:/Users/bmens/AppData/Local/Temp/claude/7fe087937c141b65/e68c811b-dcb5-43d8-a9fb-98be3e2b7a94/scratchpad/audit/recompute.js. It dates by the date prefix only and does not reuse counts.js's ts parser. It gives the same results:
- 1,038 distinct ids, 0 outside the window, 0 ids registered on more than one day.
- Same daily series. alpha = 1.0133, moving-block CI [0.4942, 2.8718], median 1.1825.
- Circular-block CI [0.4564, 2.7272] and non-overlapping-block CI [0.5107, 2.7249]. Seeds 1, 2, 3 and 42 give CIs from about [0.48, 2.80] to [0.50, 2.88].
- Every variant says LINEAR. Excluding the 110 backfills reproduces alpha 5.098, CI [0.4375, 5.1916].

Prereg followed: yes, as written. The row is at line 1772 (17:08 ET). PREREG_LABCURVE_V1.md mtime is 17:09:12 and counts.js is 17:11, so the file was not edited after the counts ran. The series, t origin, OLS fit, B = 2000, seed 0, L = 7 and the verdict rule are all coded as registered.

Block bootstrap: yes, a moving block bootstrap (7-day blocks, starts uniform on 0..28, 5 blocks truncated to 35 days, percentile CI).

The fatal problem is that resampling blocks of daily increments in random order removes the trend being measured. My positive controls through the same prereg code:
- exact C = t^2: point alpha 2.0000, CI [0.7624, 1.9116], verdict LINEAR.
- exact C = t^3: alpha 3.0000, CI [0.654, 2.8757], LINEAR.
- C = 100 t^0.5: alpha 0.5, CI [0.5631, 1.2389], LINEAR.
- daily growth of 10% (C = 1.1^t, doubling about every 7.3 days): alpha 1.0375, LINEAR.
- perfectly flat 30/day: BETWEEN, from a floating-point edge at a CI of [1, 1].

So by construction the gate returns LINEAR for growth that is quadratic, cubic, square-root or exponential. LINEAR here is not evidence of anything, and silicyte-0120 should not be scored PASS (point 1.0 inside [0.85, 1.25]) as if it measured something. The point estimate also depends on the origin: 1.0133 from 10/01, 1.7251 from 10/15 excluding backfills, 5.098 from 10/01 excluding backfills. The instrument was built on 10/15 (memory feedback-loop-system.md: "Built 10/15"), and all 110 registrations before 10/15 are arcH-* backfills with date-only ts.

Rule-change dates: the prereg names 10/21. artifacts.md repeats it. counts.md names no rule date at all, which breaks the prereg's own instruction to report any step with the rule's date. The daily mean is 26.33 over 10/15-10/20, 83.89 over 10/21-10/29 and 2.50 over 10/30-11/04, so the step lands on 10/21. The memory files also date other changes to registration:
- 10/15: loop.py built.
- 10/17: --keywords required, and the order to register in every lane.
- 10/17-18: loop.py barred from the laptop, so rows were appended by shell (preflight "MANUAL").
- 10/21 05:47: the register-before-analysis rule.
- 10/22 14:0x: loop.py register refuses until --recall_ack.
None of these is named next to the series. The 2 registrations on 11/04 are silicyte-0119 (the Ratchet prereg) and silicyte-0120 itself, so the measurement counts itself.

Artifact dating: fair, with gaps. Earliest of git first-add, stamp and mtime is sound, and file birthtime agrees with mtime to the day on 2,010 of 2,048 files (38 have an earlier birth day, 0 a later one). But two bulk copy trees were not excluded:
- NQ_local/vcc-leaderboard-inaxis: 101 kept files, 71 of them written in one 2-second burst at 10/06 16:27 ET. Dedup removes only 28 on 10/06.
- NQ_local/braxtonmensah/silicyte-design-loops: a public republication repo whose first commit is 10/27. 57 files share git first-add 10/27, while that day has 75 files.
File counts also miss results appended as blocks inside existing files.

Guard counts: they are refusals. guard_dispatch.py writes the "deny" list only for guards whose output has permissionDecision == "deny"; shadow-mode would-denies go in a separate field. My recount up to 17:11:22 gives 81,009 rows, 1,973 refused calls and 2,033 per-guard denies (no_poll 609, gpu_before_cpu 597). No denier is missing from the "g" ran map. no_wrapup_question has allowed:false 93 and allowed:true 2 outside test sessions. do_dont_advise logs only on the block path. I found 4 unparseable dispatch lines against the 5 reported (the file is still being written).

Net: the numbers are correctly computed; the verdict cannot tell linear growth from accelerating growth. Publicly, describe this only as descriptive weekly counts (241, 564, 123 registrations for the weeks from 10/15, with rule dates beside them), not as a test of compounding.

## Problems and fixes

1. **C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/PREREG_LABCURVE_V1.md**
   - Issue: The gated CI is a 7-day block bootstrap of daily increments in random block order, which removes the trend. Positive controls through the identical code: exact C=t^2 gives CI [0.7624, 1.9116] LINEAR, C=t^3 gives [0.654, 2.8757] LINEAR, C=100 t^0.5 gives LINEAR, and 10% daily exponential growth gives alpha 1.0375 LINEAR. The gate has no power, so the LINEAR verdict is guaranteed and silicyte-0120 is uninformative.
   - Fix: Mark silicyte-0120 as an instrument failure (VOID or NO-POWER), not PASS or LINEAR. Register a v2 before looking again, with a gate that keeps time order: for example a residual block bootstrap around the fitted curve, or a ratio of weekly rates such as week k+1 over week k with a block CI. Require it to pass a t^2 positive control and a flat negative control, plus a power or MDE line, before it runs.
2. **C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/PREREG_LABCURVE_V1.md**
   - Issue: The t origin is 10/01, but loop.py was built on 10/15. All 110 registrations before 10/15 are arcH-* binary_prior backfills with date-only ts, 63 of them on 10/01. alpha depends on the origin: 1.0133 (10/01, all ids), 1.7251 (10/15 origin, backfills excluded), 5.098 (10/01 origin, backfills excluded). The prereg's bias list does not name this backfill.
   - Fix: In v2, set the origin to the instrument start (10/15), drop or separately label the backfill rows, and report alpha under both origins as a sensitivity.
3. **C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve/counts.md**
   - Issue: No rule-change date is named, against the prereg's 'any step after a rule change is reported with the rule's date'. The step falls on 10/21: daily mean 26.33 over 10/15-10/20, 83.89 over 10/21-10/29, 2.50 over 10/30-11/04. Other registration rules from memory are also absent: 10/15 loop built, 10/17 --keywords required and register-in-every-lane, 10/17-18 shell-appended MANUAL rows, 10/21 05:47 register-before-analysis, 10/22 14:0x recall_ack refusal.
   - Fix: Add a rule-date table beside the daily and weekly series, sourced from the memory files register-before-the-analysis-or-it-never-happens.md, loop-register-refuses-until-recall-acknowledged.md, preflight-returns-open-when-keywords-are-empty.md and feedback-loop-system.md.
4. **C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve/counts.md**
   - Issue: The series counts the measurement itself: the only 2 registrations on 11/04 are silicyte-0119 (Ratchet) and silicyte-0120 (this prereg). The input also has no time cutoff, so the live file (now 1,774 lines, sha256 e063eac1...) gives different numbers.
   - Fix: Exclude silicyte-0120 from its own series, state the 17:08 ET cutoff, and keep the pinned 1,772-line sha256 63b1a1a8... as the only valid input.
5. **C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve/artifacts.md**
   - Issue: Two bulk copy trees were not excluded. NQ_local/vcc-leaderboard-inaxis has 101 kept files, 71 of them written in a 2-second burst at 10/06 16:27 ET (dedup removes only 28 on 10/06). NQ_local/braxtonmensah/silicyte-design-loops is a republication repo whose first commit is 10/27; 57 files share git first-add 10/27, while that day has 75 files. File counts also miss results appended as blocks inside existing ledgers.
   - Fix: Add both trees to the exclusion regex, and flag any group of 10 or more files sharing one mtime second as a copy burst. Rerun artifacts.js and report the 10/06 and 10/27 counts before and after.
6. **C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve/artifacts.md**
   - Issue: All 7 secondary fits use the same block bootstrap, so the 'All 7 CIs cover 1.0' read inherits the no-power flaw. The 'not accelerating' sentence is not supported by those CIs.
   - Fix: Drop the alpha CI column, or relabel it as 'block-shuffled, no power'. Keep the weekly totals and the week 5 vs week 1 ratios (files 39%, jobs 43%, GPU-h spread 168%) as the descriptive read.
7. **C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve/counts.js**
   - Issue: Floating-point fragility in verdict(): a perfectly linear series (CI [1,1] up to rounding) comes out BETWEEN instead of LINEAR.
   - Fix: Compare with a tolerance (for example lo <= 1 + 1e-9 and hi >= 1 - 1e-9), or round to 4 decimals before applying the rule.
8. **C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve/guards.md**
   - Issue: Minor: the counts check out as refusals (deny is written only for permissionDecision == deny; shadow is a separate field). Recount: 81,009 rows, 1,973 refused calls, 2,033 per-guard denies, wrap-up allowed:false 93. But I find 4 unparseable rows, not the reported 5, and test sessions (AUTOPILO 138, HOOKEQUI 14 and others) are still inside the totals.
   - Fix: State the file byte size or sha256 used, and report totals with and without non-hex test sessions.

## Other fields

```json
{}
```
