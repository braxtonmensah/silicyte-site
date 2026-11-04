# labcurve_v1 (silicyte-0120), secondary series: artifacts (agent 'artifacts')

Measured 2026-11-04, about 17:30 ET. Descriptive only, not gated (PREREG_LABCURVE_V1.md "Secondary"). Prereg not modified.

## Method

- Fit (same as primary): cumulative C(t) over 2026-10-01..2026-11-04 (35 days, t = 1 on 10/01), counts inside the window only;
  OLS of log C on log t over days with C > 0; alpha = slope. CI: moving 7-day block bootstrap of daily increments,
  2,000 resamples, seed 0 (mulberry32), 2.5/97.5 percentiles. Position label uses the primary's thresholds (descriptive).
- Day = ET calendar day (Intl America/New_York; laptop TZ is US Eastern; Quartz `date +%Z` = EST so sacct times are ET).

### Files (RESULT_*.md, PREREG_*.md, case-insensitive)

- Found 2,588 under NQ_Project and NQ_local (pruned node_modules and .git).
- Excluded 540: `.claude/worktrees/` copies (349), dated handoff copy trees `vcc-leaderboard-handoff-1010/`,
  `arc26_handoff_pm3/`, `handoff_2026-09-29/`, and `*.bak*` (1 file). Kept 2,048 (1,354 RESULT, 694 PREREG), all readable.
- Date = earliest of: git first-add date (`git log --all --diff-filter=A`, author date, converted to ET) if tracked;
  a `Registered|Written|Measured ... YYYY-MM-DD` stamp in the first 5 lines (kept only if 2025-01-01..2026-11-04);
  file mtime (ET). Ties go git > stamp > mtime.
- Source used: git 510, stamp 245, mtime 1,293. 1,587 files sit inside a repo, but many are untracked (gitignored agents/ dirs).
- 233 files dated before 10/01 (outside the window). Content dedupe (sha256, earliest day kept): 1,991 unique of 2,048.
- Caveat: mtime is the majority source; a mass copy or re-save moves a file to a later day, so the file series is a
  lower bound on early activity and noisy day to day.

### Slurm (user bsmensah, Quartz)

- 15,850 allocation rows since 2026-09-01 (first job 2026-09-28). 14,399 started; 1,451 never started (Start=None).
- Jobs/day = started allocations by Start day. 7,157 started jobs carried gres/gpu.
- GPU-hours = gres/gpu count x ElapsedRaw / 3600. Two attributions: (a) all to the Start day; (b) spread across the ET days
  the job ran. Running jobs count elapsed-so-far. Total since 09/01: 17,360.1 GPU-h.

## Results (window 2026-10-01..2026-11-04)

| Series | Total in window | alpha | 95% CI (block bootstrap) | Position |
|---|---|---|---|---|
| Files, all kept | 1,815 | 1.1079 | [0.6561, 2.1229] | LINEAR (covers 1.0) |
| Files, content-deduped | 1,763 | 1.1094 | [0.6620, 2.1111] | LINEAR |
| RESULT_* only | 1,202 | 1.0250 | [0.6947, 2.0336] | LINEAR |
| PREREG_* only | 613 | 1.4832 | [0.5409, 2.2121] | LINEAR |
| Slurm jobs started | 14,123 | 1.0016 | [0.6329, 1.5037] | LINEAR |
| GPU-hours, start-day | 17,198.71 | 1.4329 | [0.6491, 1.7101] | LINEAR |
| GPU-hours, spread by day | 17,202.6 | 1.4600 | [0.6937, 1.7745] | LINEAR |

Weekly totals (10/01-07, 10/08-14, 10/15-21, 10/22-28, 10/29-11/04):

- Files (all kept): 617, 535, 271, 154, 238
- Slurm jobs started: 2,246, 5,021, 4,031, 1,850, 975
- GPU-hours, start-day: 2,623.8, 2,616.8, 2,788.7, 6,216.6, 2,952.8
- GPU-hours, spread: 1,860.2, 3,379.3, 2,791.3, 6,055.2, 3,116.4

Read: every series has a CI covering 1.0. File and job rates fell after week 1 to 2 (week 5 is 39% of week 1 for files,
43% for jobs); GPU-hours rose (week 5 is 168% of week 1, spread attribution), so the work moved to fewer, larger jobs.
alpha > 1 on GPU-hours and PREREG is driven by the 10/22-28 week and by a slow first days; it is not accelerating by the
prereg rule. Rule-change dates to set beside any step (from the prereg): forced registration 10/21 onward.

## Daily table (ET)

| Day | Files | Files dedup | Jobs | GPU-h start | GPU-h spread |
|---|---|---|---|---|---|
| 10-01 | 28 | 28 | 725 | 204.12 | 206.8 |
| 10-02 | 32 | 29 | 233 | 39.87 | 41.1 |
| 10-03 | 58 | 55 | 239 | 7.16 | 6.9 |
| 10-04 | 73 | 73 | 524 | 205.12 | 200.5 |
| 10-05 | 136 | 136 | 305 | 535.44 | 223.3 |
| 10-06 | 136 | 108 | 105 | 864.07 | 559.6 |
| 10-07 | 154 | 154 | 115 | 768.06 | 622.0 |
| 10-08 | 119 | 119 | 187 | 386.93 | 681.8 |
| 10-09 | 16 | 16 | 255 | 3.74 | 439.5 |
| 10-10 | 16 | 16 | 2305 | 905.67 | 828.1 |
| 10-11 | 98 | 98 | 962 | 548.61 | 627.6 |
| 10-12 | 103 | 103 | 522 | 244.69 | 279.5 |
| 10-13 | 79 | 79 | 532 | 345.85 | 248.7 |
| 10-14 | 104 | 90 | 258 | 181.33 | 274.1 |
| 10-15 | 54 | 54 | 483 | 354.45 | 318.7 |
| 10-16 | 30 | 30 | 82 | 107.26 | 145.4 |
| 10-17 | 104 | 104 | 1087 | 1307.58 | 1115.6 |
| 10-18 | 24 | 24 | 620 | 344.35 | 505.0 |
| 10-19 | 31 | 31 | 477 | 334.00 | 366.0 |
| 10-20 | 5 | 5 | 543 | 63.09 | 61.1 |
| 10-21 | 23 | 23 | 739 | 277.92 | 279.5 |
| 10-22 | 1 | 1 | 260 | 169.29 | 163.1 |
| 10-23 | 2 | 2 | 467 | 279.79 | 276.5 |
| 10-24 | 0 | 0 | 82 | 1941.03 | 674.2 |
| 10-25 | 12 | 12 | 92 | 421.47 | 1131.7 |
| 10-26 | 8 | 8 | 680 | 2270.11 | 1362.8 |
| 10-27 | 75 | 71 | 130 | 637.76 | 1419.4 |
| 10-28 | 56 | 56 | 139 | 497.13 | 1027.5 |
| 10-29 | 79 | 79 | 145 | 806.63 | 488.3 |
| 10-30 | 15 | 15 | 58 | 417.44 | 585.0 |
| 10-31 | 27 | 27 | 121 | 342.78 | 442.1 |
| 11-01 | 3 | 3 | 140 | 486.20 | 513.4 |
| 11-02 | 42 | 42 | 233 | 437.54 | 348.9 |
| 11-03 | 47 | 47 | 178 | 242.61 | 467.9 |
| 11-04 (partial) | 25 | 25 | 100 | 219.61 | 270.8 |

Pre-window files by day: 09-15:7 09-16:6 09-18:2 09-20:1 09-22:10 09-23:6 09-24:1 09-25:14 09-26:37 09-27:37 09-28:59 09-29:22 09-30:31.
Pre-window Slurm (jobs/GPU-h start-day): 09-28: 38/6.1, 09-29: 69/146.82, 09-30: 169/8.48.

## Exact commands

Inputs are saved in `labcurve/artifacts_inputs/` (all.txt, kept.txt, repos.txt, gitadd.tsv, sacct.txt). Scripts:
`labcurve/artifacts.js` (main), `labcurve/artifacts_gpuh_spread.js` (spread GPU-h; reads `labcurve_out.json` from the
dir passed, so run it on `artifacts_inputs/`). Output: `labcurve/artifacts_out.json`. S below = the input dir.

```bash
# 1. find files
for R in "/c/Users/bmens/OneDrive - Indiana University/NQ_Project" "/c/Users/bmens/NQ_local"; do
  find "$R" \( -name node_modules -o -name .git \) -prune -o -type f \( -iname 'RESULT_*.md' -o -iname 'PREREG_*.md' \) -print; done > $S/all.txt
grep -vE '/\.claude/worktrees/|/vcc-leaderboard-handoff-1010/|/arc26_handoff_pm3/|/handoff_2026-09-29/|\.bak' $S/all.txt > $S/kept.txt
# 2. repos and git first-add dates
for R in ...same roots...; do find "$R" -maxdepth 6 -name node_modules -prune -o -name .git -print | grep -v '/\.claude/worktrees/'; done | sed 's#/\.git$##' > $S/repos.txt
while read -r r; do n=$(grep -cF "$r/" $S/kept.txt); [ "$n" -gt 0 ] && git -C "$r" log --all --diff-filter=A --format='C %aI' --name-only -- '*RESULT_*' '*PREREG_*' '*result_*' '*prereg_*' \
  | awk -v r="$r" '/^C /{d=$2;next} NF{print r"\t"d"\t"$0}' >> $S/gitadd.tsv; done < $S/repos.txt
# 3. sacct (login shell on Quartz, written to a file, copied back)
wsl -e bash -lc "timeout 120 ssh -o BatchMode=yes -o ControlPath=none quartz 'bash -lc \"sacct -u bsmensah -S 2026-09-01 -E now -X -n -P --format=JobID,Submit,Start,ElapsedRaw,AllocTRES > ~/sacct_labcurve.txt; wc -l ~/sacct_labcurve.txt\"'"
wsl -e bash -lc "timeout 120 scp -o BatchMode=yes -o ControlPath=none quartz:sacct_labcurve.txt $S/sacct.txt"   # 15850 rows
# 4. fits
node artifacts.js $S            # writes $S/labcurve_out.json
node artifacts_gpuh_spread.js $S
```
