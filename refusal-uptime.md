<!-- Plain-markdown mirror of https://silicyte.com/refusal-uptime.html
     Generated for retrieval crawlers. The HTML page is canonical.
     Full technical note: https://github.com/braxtonmensah/refusal-uptime/blob/main/NOTE.md -->

# Refusal uptime: did your agents' guardrails actually run?

> Claude Code runs each pre-tool guardrail as a separate process with a timeout, and by default a
> guardrail that times out lets the action through. The timeout is logged, but nothing reports it
> as a share of the actions the guardrail should have checked. On one operator's fleet of Claude
> Code agents, one guardrail was absent on 29.8% of the calls it existed to check.

Canonical: https://silicyte.com/refusal-uptime.html

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
(22,824 runs). On the workstation, process start cost was measured on 23 Oct and is the cause on
this fleet (next section); memory pressure, antivirus and the cloud-synced folder were not separated
from it.

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

Limit: the heaviest load of the earlier period, 11 or more agents at once, did not recur in those
nine hours, so presence at that load is not yet measured after the fix. Before the fix, at 7 to 10
agents, the compute guard was absent on 7.6% of its calls.

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
