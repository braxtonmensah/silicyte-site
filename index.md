<!-- Plain-markdown mirror of https://silicyte.com/
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Silicyte

> Silicyte runs pre-registered, compute-matched tests of whether AI self-improvement actually compounds, and publishes the result either way. First registered test: a verified-helper library on 400 sealed ARC-AGI-1 tasks (silicyte-0119). Earlier work on agent guardrail uptime and on peptide and protein model evaluation stays here.

Canonical: https://silicyte.com/

---
[**Silicyte**](/)

Recursive self-improvement, measured

# Does AI self-improvement actually compound?

AI systems now write the tools, prompts and code that their next round runs on. Most reported gains are chosen on the same tests they are reported on. Silicyte runs pre-registered, compute-matched tests of whether self-improvement compounds, seals the test set the loop never sees, and publishes the result either way.

[Read the first registered test →](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md) [Watch the repo ↗](https://github.com/braxtonmensah/ratchet)

Sealed ARC-AGI-1 tasks the loop never reads (id list hashed before any run) **400**

Arms at equal total tokens, plus two planted positive controls **6 + 2**

Our registered prediction, growing library minus frozen library, sealed solves of 400 **+2**

Our own earlier headline, laptop vs clean public runners (guard absence at a 15 s budget) **29.8% → 0.0000**

Registered 4 Nov 2026 as silicyte-0119, before any model call. Result pending; it will be published whatever it shows, including a null. The design applies the compute-matched protocol of Berlot-Attwell et al. to ARC program libraries; it is an evaluation, not a new method. Prepared with AI assistance; not peer reviewed.

## Our own best number did not reproduce. We said so.

On one operator's laptop fleet of Claude Code agents, a guardrail hook was absent on 29.8% of the 103,850 calls it existed to check (53.1% with 11 or more agents at once), and a one-dispatcher fix brought that to 5 of 8,055. We then reran the load on clean public machines, with antivirus on and off and with the same shell layer: absence at the documented budget was 0.0000 in every cell up to 24 agents. The effect belongs to that laptop, not to agent fleets in general, so we stopped building a company on it. The probe and every load-test result stay public: [laptop measurement](/refusal-uptime), [clean-runner reruns](https://github.com/braxtonmensah/refusal-uptime/tree/loadtest-results).

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
