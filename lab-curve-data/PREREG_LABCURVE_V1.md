# PREREG labcurve_v1 (silicyte-0120): does the autonomous lab's output accelerate?

Registered 2026-11-04 17:08 ET in loop/PREDICTIONS.jsonl, before any count below was computed.

## Primary (gated)

- Series: distinct registered prediction ids (rows with a `point`) in `NQ_Project/loop/PREDICTIONS.jsonl`, by registration
  day (ET), 2026-10-01 to 2026-11-04 inclusive. Cumulative count C(t), t = days since 2026-10-01 00:00 ET (t = 1 on 10/01).
- Fit: least squares of log C(t) on log t over days with C > 0. alpha = slope.
- CI: 7-day block bootstrap over the daily increments (2,000 resamples, seed 0), refit each resample.
- Verdict: ACCELERATING iff the 95% CI lies above 1.10; LINEAR iff it covers 1.0; DECELERATING iff it lies below 0.90; any
  other position is BETWEEN. Prediction: alpha = 1.0, 80% band [0.85, 1.25] (calibrated [0.8098, 1.317]).

## Secondary (descriptive, not gated)

- Weekly share of resolved predictions with verdict PASS, and with the outcome inside the registered band (calibration).
- RESULT_*.md and PREREG_*.md files per day across NQ_Project and NQ_local (by first git or file timestamp; method stated).
- Slurm jobs started per day (sacct), if readable.
- Compiled-guard refusals per day from the hook logs, per guard, against each guard's compile date.

## Known biases, named before the data

Registrations are a choice the agents make, not a pure output; a rule that forces registration (10/21 onward) raises counts
by construction, so any step after a rule change is reported with the rule's date. Weekend and session-limit gaps (for example the
11/04 05:05 to 07:31 usage pause) are real zeros, not missing data.
