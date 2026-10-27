<!-- Plain-markdown mirror of https://silicyte.com/
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Silicyte

> Silicyte measures control integrity for AI agent fleets: whether the guardrails on coding agents ran, covered every path and failed independently, and how often agents override them. Earlier research on peptide and protein model evaluation stays here.

Canonical: https://silicyte.com/

---
[**Silicyte**](/)

Control integrity for AI agent fleets

# Did your agents' guardrails actually run?

We measure whether the guardrails on AI agents ran, covered every path and failed independently, and how often agents override them. On one operator's fleet of Claude Code agents, a guardrail was absent on 29.8% of the calls it existed to check. We traced the cause and fixed it.

[Read the measurement →](/refusal-uptime) [Get the open-source probe ↗](https://github.com/braxtonmensah/refusal-uptime)

Guardrail absent, 261,254 calls over 21 days [**29.8%**](/refusal-uptime)

Absent with 11 or more agents at once [**53.1%**](/refusal-uptime)

Guardrail time, 8 calls at once, before and after the fix (p95) [**36.3 s → 2.5 s**](/refusal-uptime#cause-and-fix)

Absent after the fix, at 11 or more agents (was 53.1%) [**5 of 8,055**](/refusal-uptime#cause-and-fix)

One operator, one Windows laptop, 30 Sep to 23 Oct 2026. Every figure links to how it was measured, and the pass thresholds were registered before each read. Prepared with AI assistance; not peer reviewed.

Time for a tool call's guardrails to finish, 95th percentile, one laptop, synthetic bursts:

| tool calls at once | five guardrail processes | one dispatcher process |
|---|---|---|
| 1 | 8.3 s | 0.9 s |
| 4 | 24.5 s | 1.0 s |
| 8 | 36.3 s | 2.5 s |

The guardrails' timeout budget was 10 to 15 s. Same decisions on 145 of 145 replayed calls.

Control integrity / Four numbers per guardrail

## A guardrail that never refuses may simply never have run.

To the agent, a guardrail that timed out and one that ran and allowed the action look the same. So we report four numbers for each guardrail. **Presence:** did it run (absent on 29.8% of its calls before the fix). **Coverage:** did it watch every path (20.5% of protected writes went through a path it never watched). **Independence:** did the guards fail separately (they failed together 99.86% of the time). **Override:** how often agents take the sanctioned way around it (81.6% of refusals).

[Read the full measurement and its limits →](/refusal-uptime)

Earlier work / Peptide design & model evaluation

## Molecular design.
Controls included.

We design peptides and protein binders, and we measure whether the score that ranks them is tracking the molecules or its own error.

[Evaluate your model →](/evaluation) [Explore the research →](/science)

Starved scorer vs intact [**t = -14.60**](/science)

Our own earlier split, found in self‑audit [**20.1%**](/data)

Same measure, our rebuilt folds [**0.0000**](/data)

Shuffled‑label control [**−0.0228**](/science)

Every figure above links to the run that produced it. Computational results only; we operate no laboratory and claim no experimental result.

[Degrading the scoring model made the reported gain 2.4 times larger: an intervention-based audit of in silico design loops](/papers/design-loops). 14 pages, not peer reviewed and not posted to a preprint server. Its evidence archive is deposited and citable: [DOI 10.5281/zenodo.23441786](https://doi.org/10.5281/zenodo.23441786).

Conceptual molecular illustration

SilicyteDesign / Evaluate / ReproduceIndependent research

Our focus

## Better evidence for
the next design decision.

Useful predictions need a clear connection to the data, the evaluation procedure and the decision they inform.

01 / Design

### Peptides & protein binders

Computational workflows for proposing and comparing molecular candidates.

[Research direction →](/science)

02 / Evaluate

### Model evaluation

Checks for sequence overlap, metric handling and sensitivity to the scoring procedure.

[Try the evaluation tool →](/check)

03 / Reproduce

### Traceable results

Released evaluation folds, documented methods and explicit limits on what each result establishes.

[Explore the data →](/data)

Research note / 001

## How sensitive is a design gain
to the model scoring it?

In our peptide-design experiment, withholding training families from the scoring model increased the reported computational gain. The result motivates closer evaluation of the scoring procedure; it does not establish better biological activity.

[Read the experiment and its limits →](/science#intervention)

Open research / Benchmark evaluation

## Thirteen published splits,
measured the same way.

Share of test rows carrying a training sequence at a Levenshtein ratio of 0.80 or above. Each bar is a benchmark's own shipped split, read from its own published files. Hover a bar for the homology control its authors applied.

Show as table

**The two bars that matter sit at opposite ends.** FLIP `conservation` and FLIP `secondary_structure` are built by the identical documented procedure. The sentence “Randomly split sequences into train/test with 95/5% probability” appears verbatim in both of their own READMEs, both are flagged green, and they measure **0.00%** and **65.38%**. The variable is not the split method. It is how redundant the underlying corpus is.

Test-row contamination at Levenshtein ratio 0.80, by published split

| Published split | Homology control, as published | Twin ≥ 0.80 |
|---|---|---|

A contamination rate is not a score inflation. Nothing was retrained for these figures, so they do not say by how much any reported accuracy is overstated. Two further splits were measured and deliberately excluded, each with its reason, in the [machine-readable record](/data/leakage-measurements.json).

[Read the benchmark audit →](/benchmark-leakage) [Open the corrected LRGB split →](/data/lrgb-corrected-v1/)

Work with Silicyte

## Does your model improvement survive its own evaluation?

A fixed-scope, ten-business-day retrospective evaluation on the data you already have. One endpoint, one pipeline, a reproduced metric and a corrected comparison. Fixed-fee pilot, $2,500, scoped on a free call first.

[See the Evaluation Sprint →](/evaluation)
