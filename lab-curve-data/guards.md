# labcurve_v1 (silicyte-0120), secondary item: compiled-guard refusals per day ("guards" lane)

Descriptive, not gated (PREREG_LABCURVE_V1.md, Secondary). Read-only. No transcript content used, only counts and guard names.
Computed 2026-11-04 after 17:11 ET (last dispatch row 2026-11-04 17:11:22). Node only, no Python.

## Sources and what each can and cannot count

| Source | Covers | Dated? | Notes |
|---|---|---|---|
| hooks/state/dispatch.jsonl (19,264,481 B, 81,009 rows + 5 unparseable) | the 14 PreToolUse guards in guard_dispatch.py GUARDS | yes, per row | starts 2026-10-23 10:56:30 (dispatcher install); PreToolUse refusals before that were never logged |
| hooks/state/wrapup_questions.jsonl | no_wrapup_question (separate PreToolUse hook on wrap_up) | yes | allowed:false = refusal; sessions "t" excluded as tests |
| hooks/state/do_dont_advise.jsonl | do_dont_advise (Stop) | yes | one row per refused stop; sessions not 11-12 hex chars excluded as tests (6 rows on 11/01) |
| hooks/state/absence_claim_<sid>.json (23 files) | absence_claim Stop surface | file mtime only | list of refused-claim hashes; 39 claims refused; date = last refusal in that session, so per-day is approximate |
| hooks/state/idle_work_guard_<sid>.json (29 files) | idle_work_guard (Stop) | no history | stores the CURRENT consecutive-block counter, reset to 0 on work; sum now 9 over 4 files; total refusals not recoverable |
| hooks/state/goal_lock_<sid>.json (268 files + goal_lock_x.json) | goal_lock (Stop) | no history | stores the current empty-attempt counter, reset to 0 when it locks; lock events are not logged at all |
| hooks/state/recall_unread_*.json | recall_unread (Stop) | n/a | 0 files exist; the hook writes its file before every refusal, so 0 refusals are on disk |

stamp_guard is not a Stop hook: it is a PreToolUse guard in GUARDS (Write|Edit|Bash|PowerShell). The Stop hooks in settings.json are
goal_lock, recall_unread, absence_claim, do_dont_advise, idle_work_guard.

## Guards: compile date and what each prevents (one line, from its docstring)

Compile date = docstring date, cross-checked with file mtime / earliest .bak / first appearance in dispatch.jsonl ("first seen").

| Guard | Hook | Compiled | First seen in dispatch | Prevents |
|---|---|---|---|---|
| gpu_before_cpu | PreToolUse | 2026-09-30 (v1, .bak mtime); v3 10-19 | 10-23 10:56:30 | launching a local Python program on the laptop CPU (CPU_OK=1 override) |
| goal_lock | Stop | 2026-10-12 (mtime, earliest state file 10-12) | n/a | a /goal loop of 6 consecutive empty attempts burning usage (ends the loop) |
| no_poll | PreToolUse | 2026-10-17 | 10-23 10:56:30 | sleep-then-look and repeated looks at the same pending job without a wake-up |
| stamp_guard | PreToolUse | 2026-10-19 (.bak_v1 mtime) | 10-23 10:56:30 | forward-dated time stamps written into record files |
| no_wrapup_question | PreToolUse (own hook) | 2026-10-21 12:19 ET | n/a (own log) | a question in the wrap-up box instead of autonomous work |
| quartz_overwrite_guard | PreToolUse | 2026-10-22 | 10-23 10:56:30 | scp-overwriting a .sh/.py on Quartz that running Slurm jobs may be executing |
| jsonl_grep_guard | PreToolUse | 2026-10-22 | 10-23 10:56:30 | backtracking `grep -o '.{0,N}'` windows on huge .jsonl transcript lines |
| waiter_shape | PreToolUse | 2026-10-29 | 10-29 11:33:52 | backgrounded held-ssh waiters whose timeout exceeds the measured reap threshold |
| memory_dup | PreToolUse | 2026-10-29 | 10-29 11:35:03 | a new memory file restating an existing one (matched on its numbers) |
| recall_unread | Stop | 2026-10-29 | n/a | ending a turn having opened none of the files recall surfaced |
| memindex_cap | PreToolUse | 2026-10-29 | 10-29 11:37:20 | growing MEMORY.md past the size where its tail is silently dropped |
| queue_write_guard | PreToolUse | 2026-10-29 | 10-29 14:28:41 | writing the ARC chain queue without qlint.py gated by && first |
| gen_script_guard | PreToolUse | 2026-10-29 | 10-29 14:28:41 | launching a script generated in the same command without asserting its size/sha256 |
| name_the_frame | PreToolUse | 2026-10-29 | 10-29 15:02:09 | a VCC measurement written to memory without its frame/instrument/k |
| absence_claim | PreToolUse + Stop | 2026-10-31 | 10-31 02:16:56 | absence claims ("has not been run") without a same-turn search for the claim's own distinctive word |
| do_dont_advise | Stop | 2026-11-01 (21:42 ET order; first log 21:44:25) | n/a | replies that propose or offer work instead of doing it |
| idle_work_guard | Stop | 2026-11-02 06:3x ET | n/a | empty stop attempts (no tool, under 400 chars); hands back WORKQUEUE items |
| payload_manifest_guard | PreToolUse | 2026-11-02 | 11-02 07:57:39 | a Kaggle push whose embedded ut_payload MANIFEST sha256s do not match PAYLOAD |
| interim_trend_guard | PreToolUse | 2026-11-03 | 11-03 02:16:02 | trend words on the same line as an INTERIM read |

guard_dispatch.py itself (2026-10-23) is infrastructure (one interpreter for all PreToolUse guards), not a guard; not counted.

## Guards compiled per week (Monday start)

| Week of | Compiled | Guards |
|---|---|---|
| 2026-09-28 | 1 | gpu_before_cpu |
| 2026-10-05 | 0 | |
| 2026-10-12 | 2 | goal_lock, no_poll |
| 2026-10-19 | 4 | stamp_guard, no_wrapup_question, quartz_overwrite_guard, jsonl_grep_guard |
| 2026-10-26 | 9 | waiter_shape, memory_dup, recall_unread, memindex_cap, queue_write_guard, gen_script_guard, name_the_frame, absence_claim, do_dont_advise |
| 2026-11-02 (partial, to 11-04) | 3 | idle_work_guard, payload_manifest_guard, interim_trend_guard |
| total | 19 | |

## Total refusals per day (dated sources only)

dispatch = PreToolUse calls refused (a call with 2+ deniers counts once); rate = refused / dispatched calls.
Total = dispatch + no_wrapup_question + do_dont_advise. absence_claim Stop claims (mtime-dated) listed separately, not in Total.

| Day | dispatched calls | dispatch refusals | rate % | no_wrapup_question | do_dont_advise | Total | absence_claim Stop claims (approx) |
|---|---|---|---|---|---|---|---|
| 10-21 | (no log) | (no log) | | 6 | | 6 | |
| 10-22 | (no log) | (no log) | | 9 | | 9 | |
| 10-23 | 3,555 | 75 | 2.11 | 3 | | 78 | |
| 10-24 | 1,696 | 42 | 2.48 | 2 | | 44 | |
| 10-25 | 16,641 | 276 | 1.66 | 6 | | 282 | |
| 10-26 | 7,665 | 160 | 2.09 | 8 | | 168 | |
| 10-27 | 4,301 | 103 | 2.39 | 1 | | 104 | |
| 10-28 | 10,273 | 186 | 1.81 | 8 | | 194 | |
| 10-29 | 10,528 | 270 | 2.56 | 8 | | 278 | |
| 10-30 | 1,474 | 57 | 3.87 | 4 | | 61 | |
| 10-31 | 4,538 | 140 | 3.09 | 11 | | 151 | 13 |
| 11-01 | 3,745 | 63 | 1.68 | 6 | 3 | 72 | 5 |
| 11-02 | 8,026 | 234 | 2.92 | 11 | 36 | 281 | 13 |
| 11-03 | 7,044 | 315 | 4.47 | 8 | 19 | 342 | 8 |
| 11-04 (to 17:11) | 1,523 | 52 | 3.41 | 2 | 3 | 57 | 0 |
| sum | 81,009 | 1,973 | 2.436 | 93 | 61 | 2,127 | 39 |

Test-session share of dispatch refusals: sids HOOKEQUI 14, qlinttes 3, t 4, vq 2 (23 total); AUTOPILO 138, LEAD-CHE 1, empty sid 7;
hex session ids 1,804. Not removed above. Zero shadow-mode rows and zero guard errors in all 81,009 rows.

## Refusals per guard (dispatch.jsonl, 2026-10-23 10:56 to 2026-11-04 17:11 ET)

Per-guard sum is 2,033 (60 more than 1,973 refused calls, because some calls had 2+ deniers; all are counted per guard).
"days" = logged days from first seen through 11-04 inclusive. Allows = ran minus deny.

| Guard | ran | deny | allows | deny per 1,000 runs | days | deny per day | first deny | last deny |
|---|---|---|---|---|---|---|---|---|
| no_poll | 68,665 | 609 | 68,056 | 8.87 | 13 | 46.85 | 10-23 11:27:47 | 11-04 17:01:33 |
| gpu_before_cpu | 62,162 | 597 | 61,565 | 9.60 | 13 | 45.92 | 10-23 11:24:32 | 11-04 16:57:37 |
| stamp_guard | 73,943 | 283 | 73,660 | 3.83 | 13 | 21.77 | 10-23 11:27:53 | 11-04 16:54:11 |
| quartz_overwrite_guard | 62,162 | 243 | 61,919 | 3.91 | 13 | 18.69 | 10-23 11:27:15 | 11-04 16:41:17 |
| waiter_shape | 23,202 | 183 | 23,019 | 7.89 | 7 | 26.14 | 10-29 11:35:31 | 11-04 16:16:33 |
| jsonl_grep_guard | 62,162 | 46 | 62,116 | 0.74 | 13 | 3.54 | 10-23 11:36:38 | 11-03 11:30:55 |
| absence_claim (PreToolUse) | 3,493 | 39 | 3,454 | 11.17 | 5 | 7.80 | 10-31 02:18:59 | 11-04 03:17:36 |
| gen_script_guard | 21,802 | 17 | 21,785 | 0.78 | 7 | 2.43 | 10-29 14:29:02 | 11-04 16:50:14 |
| memory_dup | 1,997 | 7 | 1,990 | 3.51 | 7 | 1.00 | 10-29 11:35:48 | 10-29 14:42:48 |
| memindex_cap | 3,691 | 5 | 3,686 | 1.35 | 7 | 0.71 | 10-29 11:37:41 | 10-30 21:28:52 |
| name_the_frame | 3,368 | 2 | 3,366 | 0.59 | 7 | 0.29 | 10-29 15:02:09 | 11-03 16:36:00 |
| queue_write_guard | 21,802 | 1 | 21,801 | 0.05 | 7 | 0.14 | 10-29 14:28:57 | 10-29 14:28:57 |
| payload_manifest_guard | 10,421 | 1 | 10,420 | 0.10 | 3 | 0.33 | 11-02 07:57:42 | 11-02 07:57:42 |
| interim_trend_guard | 6,707 | 0 | 6,707 | 0.00 | 2 | 0.00 | none | none |

Per guard per day (dispatch):

| Day | gpu | quartz_ow | jsonl_grep | no_poll | stamp | waiter | mem_dup | memidx | queue | gen_script | frame | absence | payload |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 10-23 | 16 | 15 | 2 | 23 | 19 | | | | | | | | |
| 10-24 | 5 | 15 | 2 | 13 | 7 | | | | | | | | |
| 10-25 | 146 | 14 | 5 | 66 | 45 | | | | | | | | |
| 10-26 | 66 | 7 | 4 | 60 | 23 | | | | | | | | |
| 10-27 | 46 | 19 | 2 | 24 | 12 | | | | | | | | |
| 10-28 | 49 | 17 | 2 | 92 | 27 | | | | | | | | |
| 10-29 | 50 | 33 | 12 | 112 | 30 | 25 | 7 | 3 | 1 | 2 | 1 | | |
| 10-30 | 13 | 13 | 1 | 12 | 9 | 9 | | 2 | | | | | |
| 10-31 | 42 | 17 | 4 | 33 | 23 | 12 | | | | 1 | | 14 | |
| 11-01 | 12 | 16 | 4 | 11 | 11 | 3 | | | | 4 | | 3 | |
| 11-02 | 44 | 19 | 6 | 65 | 44 | 53 | | | | 4 | | 14 | 1 |
| 11-03 | 94 | 48 | 2 | 86 | 23 | 77 | | | | 4 | 1 | 7 | |
| 11-04 | 14 | 10 | | 12 | 10 | 4 | | | | 2 | | 1 | |

Non-dispatch guards:

| Guard | refusals | allows | basis |
|---|---|---|---|
| no_wrapup_question | 93 (10-21 to 11-04) | 2 | wrapup_questions.jsonl, test session "t" (1 deny, 1 allow) excluded |
| do_dont_advise | 61 refused stops, 65 sentences | not logged | do_dont_advise.jsonl excluding 6 test rows; state files hold 65 sentence hashes over 23 sessions (matches) |
| absence_claim (Stop) | 39 claims in 23 sessions | not logged | state files; stops refused is at most 39 |
| idle_work_guard | at least 9 (current counters) | not logged | counter resets on work, history not kept |
| goal_lock | not countable | not logged | lock events not written; counter resets to 0 on lock |
| recall_unread | 0 on disk | not logged | 0 state files |

## Caveats (named, not corrected)

- PreToolUse refusals before 2026-10-23 10:56 ET exist only in transcripts, so gpu_before_cpu, no_poll, stamp_guard, quartz_overwrite_guard
  and jsonl_grep_guard have 0 logged days before the dispatcher, though compiled earlier. Their per-day rates start 10-23.
- A refusal is often followed by a retry that passes, so refusals count attempts blocked, not distinct mistakes prevented.
- Rising Total after 10-29 is partly by construction: 9 guards were added that week (prereg's known-bias rule: report steps with the rule's date).
- Timestamps are the laptop's local clock as written by Python time.strftime / datetime.now (ET on this machine).

## Exact commands

1. `cat C:/Users/bmens/.claude/hooks/guard_dispatch.py`; `head -n 14` of every guard .py (docstrings); `ls -la` hooks/ and hooks/state/.
2. settings.json hooks: `node -e "const s=require('./settings.json');...print each event, matcher, command"` (cwd C:/Users/bmens/.claude).
3. dispatch aggregation: `node <scratchpad>/agg.js C:/Users/bmens/.claude/hooks/state/dispatch.jsonl > <scratchpad>/agg.json`
   (agg.js streams lines; per day: calls, rows with deny non-null, per-guard deny counts from the deny list; per guard: runs = key present in "g",
   deny, shadow, err, first/last deny; first seen = first ts with the guard in "g").
4. Stop/other logs: `node -e` over do_dont_advise.jsonl (rows and sentences per day, test = session not /^[0-9a-f]{11,12}$/),
   wrapup_questions.jsonl (allowed true/false per day, test = session length < 20), and each state file prefix
   (absence_claim_, do_dont_advise_, idle_work_guard_, goal_lock_: array length or blocks/empty value, grouped by file mtime date).
5. Totals and rates: `node -e` over agg.json plus the two dated Stop/wrap-up series (output reproduced in the tables above).
   scratchpad = C:/Users/bmens/AppData/Local/Temp/claude/7fe087937c141b65/e68c811b-dcb5-43d8-a9fb-98be3e2b7a94/scratchpad
