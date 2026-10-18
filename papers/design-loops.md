<!-- Plain-markdown mirror of https://silicyte.com/papers/design-loops.html
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Degrading the scoring model made the reported gain 2.4 times larger

> Degrading a design loop's scoring model on purpose made its reported gain 2.4 times larger (t = -14.60). An intervention-based audit for in silico molecular design, with every number traceable to a pre-registration.

Canonical: https://silicyte.com/papers/design-loops.html

---
[**Silicyte**](/)

Paper · draft v1 · 2026-10-17

# Degrading the scoring model made the reported gain 2.4 times larger

An intervention-based audit for in silico molecular design.

Braxton Mensah, Silicyte, South Jordan, Utah. Not peer reviewed. Not submitted to a journal or a preprint server. 14 pages.

[Download the PDF ↓](/papers/Mensah_DesignLoops_preprint.pdf) [Evidence archive ↗](https://github.com/braxtonmensah/silicyte-design-loops)

01 Abstract

Closed-loop molecular design systems propose candidates, score them with a learned model, keep the best, retrain on the winners and repeat. Such loops are routinely reported by the improvement they produce on a held-out predictor. We show by direct intervention that this improvement does not measure molecule quality. Degrading the selection model on purpose, by withholding 80% of its training families while leaving the evaluation model untouched, made the reported gain 2.4 times larger: +1.3182 against +0.5421, a difference of -0.7761 with a standard error of 0.0531 (t = -14.60, n = 3 seeds per rung, all six paired shuffled controls inside their pre-registered band). The breeder's equation R = i·ρ·σ, which is the usual justification for these loops, predicts the opposite sign. A deliberately worse scorer producing a larger apparent improvement means that on this system the reported gain is not a monotone measure of scorer accuracy. We do not establish the mechanism of the inversion; one alternative we cannot exclude is that the selection model and the evaluation model share a feature basis. We then show why the standard defence, a second independent metric, usually cannot detect this. The gain reported by a k-winner mean carries an irreducible floor of sd·√(2/k). On our data (sd = 0.4562 per molecule, measured over 143 winner sets) that floor is 0.0645 at k = 100 against 0.0570 measured, and every value our own independent meter had produced, spanning +0.0138 to -0.0866, lies inside one such standard deviation of zero. Six reported configurations of "the independent metric did not move" were six measurements below the instrument's resolution. We document four further measurement defects found in our own pipeline, each of which passed every check that existed at the time: a constraint that pinned a histogram while the continuous statistic beneath it drifted; a cross-validation splitter that was not the algorithm its own documentation described, leaving 20.1% of held-out molecules with a near-twin in training. We then measured that same defect in three third-party published benchmarks we had no hand in producing, where 65.3%, 16.7% and 30.0% to 48.6% of held-out rows retain a close relative in training, the last of those under a split whose authors applied a 30%-identity control and documented it. We further document a diversity cap on pairwise identity that cannot bound distributional narrowing; and a rank correlation that did not correct for ties. We close with a seven-step audit protocol and a register of every claim this programme has withdrawn. We make no claim that our loop produces better molecules. It does not. On six seeded replicates the treatment arm sits 0.0652 below its own shuffled control on the independent meter (SE 0.0201, about 3.2σ). The contribution of this work is the instrument, not the gain.

02 Availability

## Every number traces to a pre-registration.

The evidence archive contains, for each result in the paper, the pre-registration file written *before* the run, the instrument that produced the number, the result file, and the saved out-of-fold predictions. Section 10 is a register of claims this programme withdrew, including one that refuted its own first headline. That register is only worth reading if a stranger can check it, which is what the archive is for.

Repository[silicyte-design-loops](https://github.com/braxtonmensah/silicyte-design-loops)

Releasev1.0.0

DOIPending

Licence[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

03 Status

## What this draft is.

This is a working draft hosted by its author. It has not been peer reviewed and it has not been posted to a preprint server. Every figure in it is computational; we operate no laboratory and claim no experimental result.

The research was conducted with substantial AI assistance, disclosed in section 13.1 of the paper itself. Large language models were used as the research engineering layer, and several of the corrections the paper reports were produced by one model auditing another model’s code. No AI system is listed as an author.
