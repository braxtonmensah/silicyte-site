<!-- Plain-markdown mirror of https://silicyte.com/
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Silicyte

> Silicyte publishes research on peptide and protein model evaluation, benchmark leakage and controlled design loops. Explore the methods, code and open data.

Canonical: https://silicyte.com/

---
[**Silicyte**](/)

Peptide design & model evaluation

# Molecular design.
Controls included.

We design peptides and protein binders, and we measure whether the score that ranks them is tracking the molecules or its own error.

[Evaluate your model →](/evaluation.html) [Explore the research →](/science.html)

Starved scorer vs intact [**t = -14.60**](/science.html)

Leaked held-out rows, standard split [**20.1%**](/data.html)

Same measure, our rebuilt folds [**0.0000**](/data.html)

Shuffled-label control [**−0.0228**](/science.html)

Every figure above links to the run that produced it. Computational results only; we operate no laboratory and claim no experimental result.

Conceptual molecular illustration

SilicyteDesign / Evaluate / ReproduceIndependent research

Our focus

## Better evidence for
the next design decision.

Useful predictions need a clear connection to the data, the evaluation procedure and the decision they inform.

01 / Design

### Peptides & protein binders

Computational workflows for proposing and comparing molecular candidates.

[Research direction →](/science.html)

02 / Evaluate

### Model evaluation

Checks for sequence overlap, metric handling and sensitivity to the scoring procedure.

[Try the evaluation tool →](/check.html)

03 / Reproduce

### Traceable results

Released evaluation folds, documented methods and explicit limits on what each result establishes.

[Explore the data →](/data.html)

Research note / 001

## How sensitive is a design gain
to the model scoring it?

In our peptide-design experiment, withholding training families from the scoring model increased the reported computational gain. The result motivates closer evaluation of the scoring procedure; it does not establish better biological activity.

[Read the experiment and its limits →](/science.html#intervention)

Open research / Benchmark evaluation

## Twelve published splits,
measured the same way.

Share of test rows carrying a training sequence at a Levenshtein ratio of 0.80 or above. Each bar is a benchmark's own shipped split, read from its own published files. Hover a bar for the homology control its authors applied.

Show as table

**The two bars that matter sit at opposite ends.** FLIP `conservation` and FLIP `secondary_structure` are built by the identical documented procedure. The sentence “Randomly split sequences into train/test with 95/5% probability” appears verbatim in both of their own READMEs, both are flagged green, and they measure **0.00%** and **65.38%**. The variable is not the split method. It is how redundant the underlying corpus is.

Test-row contamination at Levenshtein ratio 0.80, by published split

| Published split | Homology control, as published | Twin ≥ 0.80 |
|---|---|---|

A contamination rate is not a score inflation. Nothing was retrained for these figures, so they do not say by how much any reported accuracy is overstated. Two further splits were measured and deliberately excluded, each with its reason, in the [machine-readable record](/data/leakage-measurements.json).

[Read the benchmark audit →](/benchmark-leakage.html) [Open the corrected LRGB split →](/data/lrgb-corrected-v1/)

Work with Silicyte

## Does your model improvement survive its own evaluation?

A fixed-scope, ten-business-day retrospective evaluation on the data you already have. One endpoint, one pipeline, a reproduced metric and a corrected comparison. Fixed-fee pilot, $2,500, scoped on a free call first.

[See the Evaluation Sprint →](/evaluation.html)
