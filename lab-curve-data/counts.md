# labcurve_v1 (silicyte-0120), agent: counts

Computed 2026-11-04 17:11 ET, after the prereg row (17:08 ET). Prereg followed as written; nothing in it was changed.

## Input and commands

- Input: `C:/Users/bmens/OneDrive - Indiana University/NQ_Project/loop/PREDICTIONS.jsonl`, 1,772 lines, sha256 `63b1a1a80fd2fabec8a5f65d41a24905cea95e1b667f5c85673ede5e10607c3f`.
- Script: `C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve/counts.js` (node, no Python).
- Command:
  `cd /c/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve; node counts.js "/c/Users/bmens/OneDrive - Indiana University/NQ_Project/loop/PREDICTIONS.jsonl" > counts_out.json`
- Full output: `C:/Users/bmens/NQ_local/silicyte-funding/rsi_sprint/restart/labcurve/counts_out.json`.

## Method choices (stated, since the prereg leaves them open)

- Parsing: line 440 (a vcc-0083 resolution row) holds Python `NaN`; parsed with `NaN -> null`. 0 lines left unparsed. Line 489 (vcc-0122 correction) has no `point`, so it is not a registration.
- Registration: distinct `id` among rows with a `point`; registration time = earliest `ts` among that id's rows. `ts` is laptop-local time (loop.py `NOW` uses `astimezone()`), read as ET. 8 rows write the last minute digit as the letter x (arc-0243 to arc-0248); that digit is read as 0, and the day is unaffected.
- t = 1 on 10/01, t = 35 on 11/04. Fit: OLS of ln C(t) on ln t over days with C > 0.
- Bootstrap: moving block bootstrap over the 35 daily increments, block length 7, block starts uniform on 0..28, 5 blocks concatenated (35 days), refit alpha each time; 2,000 resamples; PRNG mulberry32 seeded 0; 95% CI = 2.5 / 97.5 percentiles (linear interpolation). 2,000 of 2,000 resamples gave a finite alpha.
- Resolution: last row per id with status `read` or `resolved`; resolution time = `ts_resolved` (or `resolved_ts`). Week 1 = 10/01-10/07, ..., week 5 = 10/29-11/04, by resolution day.
- Verdict share uses rows whose `verdict` is PASS, FAIL or BETWEEN (1 row with UNDECIDED_INCOMPLETE excluded).

## Primary

- Distinct registered ids: 1,038, all inside 10/01-11/04 (0 outside).
- alpha = 1.0133; 95% CI [0.4942, 2.8718]; bootstrap median 1.1825.
- Verdict per prereg: **LINEAR** (CI covers 1.0). The point sits inside the registered 80% band [0.85, 1.25] and the calibrated band [0.8098, 1.317].
- The CI is 2.38 wide, so the read cannot tell accelerating from decelerating; LINEAR here means "not distinguishable from 1.0", nothing stronger.

Daily registrations (10/01 to 11/04):
63, 0, 1, 16, 11, 13, 4, 1, 0, 1, 0, 0, 0, 0, 8, 2, 40, 68, 34, 6, 83, 63, 51, 29, 152, 141, 42, 86, 108, 7, 0, 2, 4, 0, 2.

Weekly registrations: 10/01-10/07 108; 10/08-10/14 2; 10/15-10/21 241; 10/22-10/28 564; 10/29-11/04 123.

### Biases visible in the data (not named in the prereg)

- 110 ids are `kind: binary_prior` backfills (`preflight: backfill`, ids `arcH-*`) carrying date-only `ts` of 10/01-10/10 (63 of them on 10/01). They were written later against CLOSED_INDEX verdicts, so their dates are not registration dates. Every registration before 10/15 is a backfill.
- Sensitivity (descriptive, not the gated primary): excluding the 110 backfills leaves 928 ids, first one on 10/15; alpha = 5.098, 95% CI [0.4375, 5.1916], same rule gives LINEAR. The 5.098 point is an artifact of C(t) starting at t = 15; neither fit is informative about compounding.
- The rate collapses after 10/29: 108 on 10/29, then 7, 0, 2, 4, 0, 2 (15 registrations over 10/30-11/04). The prereg calls such gaps real zeros. A log-log fit of a cumulative series weights the late flat tail lightly, which is part of why the point stays near 1.
- Id numbers skip (for example arc-0689, arc-0693, vcc-0848 are absent as registrations), so some ids were issued without a row in this file.

## Secondary (descriptive, not gated)

- Resolved ids: 781 (110 of them backfills with no resolution timestamp). Withdrawn and never resolved: 37.
- Verdicts PASS / FAIL / BETWEEN: 157 / 291 / 100 of 548; PASS share 0.2865.
- Outcome inside registered band: 509 of 667 (0.7631) against a nominal 0.80. Inside calibrated band: 526 of 645 (0.8155).
- Median time from registration to resolution: 0.0347 days (50 minutes) over 671 ids with both timestamps.

| Resolution week | Resolved | With verdict | PASS | FAIL | BETWEEN | PASS share | Inside band | Inside calibrated |
|---|---|---|---|---|---|---|---|---|
| 10/01-10/07 | 0 | 0 | 0 | 0 | 0 | n/a | n/a | n/a |
| 10/08-10/14 | 0 | 0 | 0 | 0 | 0 | n/a | n/a | n/a |
| 10/15-10/21 | 156 | 53 | 15 | 31 | 7 | 0.2830 | 117/153 (0.7647) | 107/137 (0.7810) |
| 10/22-10/28 | 419 | 401 | 116 | 210 | 75 | 0.2893 | 320/418 (0.7656) | 337/412 (0.8180) |
| 10/29-11/04 | 96 | 94 | 26 | 50 | 18 | 0.2766 | 72/96 (0.7500) | 82/96 (0.8542) |

PASS share is flat across the three weeks with verdicts (0.2830, 0.2893, 0.2766). The `verdict` field covers only 53 of 156 resolutions in week 3, so that week's share rests on fewer rows.

## By lane (counts only)

| Lane | Registered | of which backfill | Resolved | PASS | FAIL | BETWEEN | Withdrawn unresolved | Inside band |
|---|---|---|---|---|---|---|---|---|
| arc | 458 | 110 | 333 | 44 | 89 | 41 | 23 | 170/219 |
| vcc | 464 | 0 | 355 | 95 | 182 | 55 | 11 | 267/355 |
| silicyte | 63 | 0 | 51 | 15 | 20 | 4 | 3 | 39/51 |
| tnfa | 36 | 0 | 29 | 1 | 0 | 0 | 0 | 21/29 |
| sas | 14 | 0 | 12 | 2 | 0 | 0 | 0 | 11/12 |
| knee | 3 | 0 | 1 | 0 | 0 | 0 | 0 | 1/1 |

Not done by this agent (other secondary items in the prereg): RESULT/PREREG file counts per day, slurm jobs per day, compiled-guard refusals per day.
