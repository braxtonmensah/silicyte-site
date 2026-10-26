<!-- Plain-markdown mirror of https://silicyte.com/refusal-uptime
     Generated for retrieval crawlers. The HTML page is canonical.
     Full technical note: https://github.com/braxtonmensah/refusal-uptime/blob/main/NOTE.md -->

# Refusal uptime: did your agents' guardrails actually run?

> Claude Code runs each pre-tool guardrail as a separate process with a timeout, and by default a
> guardrail that times out lets the action through. The timeout is logged, but nothing reports it
> as a share of the actions the guardrail should have checked. On one operator's fleet of Claude
> Code agents, one guardrail was absent on 29.8% of the calls it existed to check.

Canonical: https://silicyte.com/refusal-uptime

Measured on one Windows laptop with 8 logical CPUs, 30 Sep to 21 Oct 2026: 3,844 sessions and
261,254 tool calls. Every count was computed twice by independent methods. Where a number was
forecast before the data was read, this page says so. Prepared with AI assistance; not peer reviewed.

## The measurement

| guardrail | calls it existed to check | absent | share absent |
|---|---|---|---|
| compute guard (`gpu_before_cpu`, 15 s) | 103,850 | 30,929 | 29.8% |
| polling guard (`no_poll`, 10 s) | 40,283 | 24,121 | 59.9% |

For the compute guard, 30,761 of the 30,929 absent calls returned a result that was not a refusal.
Forecast before the read: 0.20 (band 0.05 to 0.50); measured 0.298.

## Load

Absence of the compute guard by transcripts active in the same 10 minutes: 1: 0.2% (5 of 2,258);
2-3: 0.5%; 4-6: 4.4%; 7-10: 7.6%; 11 or more: 53.1% (28,569 of 53,831); 30 or more: 79.2%. The
same rise held within single days and within single sessions (61 of 82 sessions; per-session means
2.3% vs 37.6%). Forecast +0.25 (band +0.05 to +0.60); measured +0.529. A Linux server running
synthetic agents with replicas of the same guards showed zero absence up to 48 agents on 8 cores
(22,824 runs). On the workstation, per-call process start cost was measured on 23 Oct and removing
it fixed this fleet (next section), but it is not shown to be the whole cause. On clean public Windows
runners (4 vCPUs, 25 Oct), synthetic load, about 1 GB of free memory, antivirus real-time scanning and
a Git Bash launch layer each made guards slower and stacked: 95th-percentile time at 24 agents was
2.7 s with none of them, 4.6 s with scanning, and 6.8 s with scanning and the shell layer. In the
median run none pushed a guard past 10 s. Two single runs did, briefly: 4 of 113 calls past 15 s
(slowest 21.3 s) at 4 agents with about 1 GB free, and 2 of 185 past 10 s at 24 agents with scanning
and the shell layer. Nothing on the runners came near the laptop's sustained absence, so whatever else
the laptop adds (the real agent sessions, the cloud-synced folder) is untested. (Corrected 25 Oct,
22:24 ET: this paragraph said none passed 10 s; that held for the median run only.) The runs, their pre-registered gates and their data are public:
[loadtest-results](https://github.com/braxtonmensah/refusal-uptime/tree/loadtest-results).

## Cause and fix (2026-10-23)

The guardrails timed out while starting. Running them in one process fixed it.

On this fleet every shell call started five guardrails at once, each one its own Python process. We
timed the start-up itself, with bursts of tool calls fired together on the same laptop. With 4
calls at once, a call's guardrails took 24.5 s to finish at the 95th percentile; with 8 at once,
36.3 s. Both are past the 10 to 15 s budgets, which is the load curve above. It also explains the
independence number below: the guards on one host failed together because they were all waiting on
the same start-up.

The fix runs every guardrail inside a single dispatcher process per call, each guard's own code
unchanged. Replayed on 145 tool calls (140 real calls from the fleet and 5 built to be refused), the
dispatcher returned the same decision and the same refusal text on all 145. At 8 calls at once its
95th percentile was 2.5 s, 0.069 of the old figure. The pass threshold, 0.50, was registered before
the measurement.

| tool calls at once | five guard processes, p95 | one dispatcher, p95 |
|---|---|---|
| 1 | 8.3 s | 0.9 s |
| 4 | 24.5 s | 1.0 s |
| 8 | 36.3 s | 2.5 s |

Limits: one laptop, synthetic bursts of calls fired together, six rounds per setting. The old form
was launched without the shell layer the agent harness puts in front of each guardrail, so its real
cost was higher than shown.

After the fix, on live traffic: absent on 0 of 2,211 calls. The fix went live on this fleet at
11:37 ET on 23 Oct. Over the next nine hours, across 8 sessions, the transcripts recorded 0
guardrail timeouts or errors on the 2,211 calls the guardrails existed to check (Wilson 95%
interval 0 to 0.17%). Counted independently, the dispatcher's own log shows it ran on 2,214 calls,
within 3 of the transcript count for every tool, with no guard errors and 35 refusals applied. The
gate, registered before the read, was failures on at most 2% of at least 2,000 calls.

Then the heavy load came back, up to 48 agents at once: absent on 5 of 8,055 shell calls, against 53.1%
before. Far lower, not zero. Those nine hours never reached 11 agents at once, so we registered a second
gate before looking: failures on at most 2% of at least 500 calls made while 11 or more agents were
active. By 14:24 ET on 25 Oct that load had recurred, peaking at 20, and the guardrails were absent on 0
of the 1,184 calls they existed to check. We re-read the whole period that evening, to 21:10 ET, after
hours of multi-agent runs that reached 48 agents at once. At 11 or more agents the compute guard's shell
calls were absent on 5 of 8,055 (0.062%; Wilson 95% upper bound 0.15%), against 53.1% before the fix; at
30 or more, on 1 of 4,117, against 79.2%.

Calls made in the same ten minutes share one machine state, so they are not independent and a per-call
bound overstates the evidence. Ten-minute windows are a weak unit too: before the fix, 83 of 423 busy
windows were already clean (a window-level test we registered failed its gate, clean share 0.196
against 0.10); after it, 33 of 36 were. Longer runs are the strict unit. Before the fix, none of the 21
sustained busy episodes (five or more consecutive ten-minute windows at 11 or more agents) was clean.
After it, 3 of 5 were. We registered that re-read before looking, with the gate that every sustained
episode be clean, and it failed: two episodes let 5 shell calls through unchecked. In one, at 25 to 30
agents, 3 calls' guardrails timed out after 36.8 to 56.1 s against the 30 s budget; in the other, at 16
agents, the dispatcher returned an error on 2. At this load the fix cut absence by about three orders of
magnitude. It did not remove it.

Separately, 5 absences fell in one standby episode: the laptop went into standby between 02:56 and 03:21
ET on 25 Oct, in the middle of calls. A timeout that counts wall-clock time would fire the moment the
machine wakes, so the call goes ahead unchecked. That is a second way for a guardrail to vanish, and no
timeout setting fixes it; only a guardrail that blocks on failure, or a host that does not sleep under
agents, does. (Corrected 25 Oct, 22:24 ET: this section said all post-fix absences came from the
standby; the evening re-read found 7 more under load.)

Limits: one laptop, and a before/after comparison rather than a randomized one. The change also raised
the budget from 10 to 15 s to 30 s and dropped a shell launch layer, so the controlled evidence for the
cause is still the bench above. Sessions run under other accounts are not counted, so agent counts are
a lower bound.

## Control integrity: four numbers per guardrail

- Presence: absent on 29.8% of the calls it existed to check.
- Coverage: 20.5% of 931 protected writes went through a shell path the guard never watched;
  38.8% got no verdict at all.
- Independence: when the compute guard was absent, the polling guard on the same machine was
  absent too 99.86% of the time (91.0% the other way round).
- Override: 81.6% of 461 refusals were re-issued with the guard's own sanctioned override; 95.4% of
  18,588 override uses came before any refusal.

## A wrong prediction

We predicted that after a refusal agents would reach the same effect through an unwatched path on
20% of refusals. It happened after 4 of 603 refusals across three guards (0.7%, a lower bound).

## Growth, an extrapolation from one fleet

Guard timeouts doubled every 2.8 days over the period. Busy-hour concurrency (the mean of a day's
six busiest 10-minute windows, 10.4 on 21 Oct) doubles every 23.8 days; on its trend it reaches 30,
where absence was 79%, by 26 Nov 2026. Peak windows already pass 30.

## Audit

PCI DSS 4.0.1 requirement 10.7.2: "Failures of critical security control systems are detected,
alerted, and addressed promptly." SOC 2 Type 2 asks whether controls operated effectively over the
period.

## The probe

Open source, standard-library Python, runs locally on your own Claude Code transcripts:
https://github.com/braxtonmensah/refusal-uptime
