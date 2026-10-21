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
(22,824 runs); why the workstation differs is not yet tested.

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
