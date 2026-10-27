<!-- Plain-markdown mirror of https://silicyte.com/data
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Corrected antimicrobial peptide evaluation split

> Corrected MIC and HC50 peptide evaluation folds, with an explicit similarity threshold, historical baseline records and corrections to our earlier claims. Computational research, not biological validation.

Canonical: https://silicyte.com/data

---
[**Silicyte**](/)

Research dataset · v1.0.0

# Peptide evaluation data and documented folds.

If you train a model to predict antimicrobial activity, you hold out similar sequences to test generalization. Our representative-based clustering did not do what its documentation claimed: **20.1% of held-out MIC sequences in that earlier split had a near-identical training partner.** The released folds correct that issue.

We found it in our own pipeline, rebuilt the split properly, and are publishing the corrected one with its scope and limitations. Free, documented, no sign-up. A separate exploratory GRAMPA analysis found a median organism-pair agreement of **Spearman 0.596**. That analysis and its scope are in section 03.

[Download the package (77 KB)](/data/silicyte-amp-eval-v1.zip) [Check your own split](/check) [Read the documentation](/data/silicyte-amp-eval-v1/README.md)

Label definitions, source metadata and release corrections

MIC is a panel-oriented pooled label: species-level medians are averaged within Gram classes, then combined with 15:5 Gram-negative:Gram-positive weighting where available. It is not a single-organism assay value.

Of 2,904 MIC sequences, 1,114 include at least one source measurement without chemical-modification metadata. The cleaned HC50 source also lacks modification annotations. Canonical sequence letters alone do not verify chemical form.

The original v1 ZIP remains unchanged. Its reliability-derived ceiling and null-control interpretations were corrected. Read the [release corrections, source details and verification scope](/data/CORRECTIONS-2026-10-16.md) before reusing its historical documentation.

Open dataset

## AMP evaluation / v1.0.0

MIC · 2,904 rowsHC50 · 1,238 rows[Read release corrections →](/data/CORRECTIONS-2026-10-16.md)

01 The defect

## Why the original split needed correction.

The routine builds clusters by comparing each sequence only to cluster *representatives* and taking the first match. Two sequences 85% identical to each other land in different clusters whenever each matches a different earlier representative. True single linkage merges them transitively; this does not.

The standard sanity check asks whether any family spans a fold. It passes 826 out of 826. It passes because it tests a different quantity than the one the guard exists to bound.

| Split | Held-out sequences with a near-twin in training | Families spanning a fold |
|---|---|---|
| Our previous split, MIC | 20.1% | 0 of 826 |
| Our previous split, HC50 | 24.6% | 0 of 336 |
| **This release, MIC** | **0.0000** | 0 of 1198 |
| **This release, HC50** | **0.0000** | 0 of 450 |

**Sequence overlap can affect model comparisons.** Our historical evaluation recorded score inflation of up to 0.065 on the safety endpoint after a split defect. The effect depends on the model and procedure. Corrected splits and retraining are needed to assess its impact on a particular comparison.

02 What you get

## Folds, checks and historical baseline records.

[**v1 data archive**zip · 77 KB · CSVs and manifest](/data/silicyte-amp-eval-v1.zip) [**MIC folds**csv · 2,904 sequences · 1,198 clusters](/data/silicyte-amp-eval-v1/folds_mic.csv) [**HC50 folds**csv · 1,238 sequences · 450 clusters](/data/silicyte-amp-eval-v1/folds_hc.csv) [**Manifest**json · checks, reliability, baselines](/data/silicyte-amp-eval-v1/manifest.json)

### Measured agreement, with limits on its interpretation

Our recorded split-half agreement over measurements of the same peptides is 0.7877 (sd 0.0067, 200 random splits, peptides with four or more measurements), which is 0.8812 after a Spearman-Brown-style transformation. Taking its square root gives 0.9387, a derived value, not an established ceiling on model Spearman.

Those repeats are mostly different bacterial species rather than replicate assays of one organism, so this is not pure assay repeatability. The analogous per-organism derived values span 0.9535 to 0.9815. Their assumptions also require validation. See section 03.

| Baseline on these folds | MIC | HC50 |
|---|---|---|
| 36 physicochemical descriptors | 0.4502 | 0.4074 |
| ESM2-35M frozen, mean-pooled | 0.4656 | — |
| ESM2-650M frozen, mean-pooled | 0.4427 | 0.3502 |
| Ankh-base frozen, mean-pooled | 0.3870 | — |
| **ESM2-650M fine-tuned, 3 seeds averaged** | **0.5356** | **0.5079** |
| the same, on deliberately shuffled labels | -0.0228 | — |

Pooled out-of-fold Spearman, tie-corrected. Ridge predictions are averaged over a fixed penalty grid rather than selected on inner folds, because selecting it at this sample size cost us 0.038 on MIC before we caught it. These are historical recorded calculations; their full prediction provenance is not included in v1. A shuffled-label run is a control outcome, not proof of independence. See the [release corrections](/data/CORRECTIONS-2026-10-16.md).

03 The target

## Organism-specific measurements carry different information.

Our pooled activity labels average measurements against *different bacteria*, and those measurements agree with each other at a median Spearman of 0.596.

An exploratory variance decomposition used 51,345 public GRAMPA measurements over 6,760 sequences and 76 organisms, without fitting a predictive model: **74.2% of the resolvable variance is between organisms, not within them.**

**Activity varies across organisms.** Over 6,002 sequences measured against two or more organisms, the median spread of one peptide's own MIC across organisms is 6.1x in concentration, and the 90th percentile is 63.5x. Averaging that into a single training label removes distinctions that may matter for an organism-specific design decision. This analysis does not establish assay repeatability or a universal model-performance ceiling.

| Organism pair | Shared peptides | Spearman between them |
|---|---|---|
| E. coli vs S. aureus | 4,064 | +0.644 |
| E. coli vs P. aeruginosa | 2,547 | +0.762 |
| S. aureus vs P. aeruginosa | 2,510 | +0.629 |
| S. aureus vs C. albicans | 1,693 | +0.646 |
| E. coli vs B. subtilis | 1,519 | +0.635 |
| **all 491 pairs sharing 30+ peptides** | — | **median +0.596** |

The E. coli / S. aureus comparison includes 4,064 shared peptides and a recorded correlation of 0.644. Sample size alone does not separate organism effects from source, assay or selection effects.

### Within-organism split-half results

Computed exactly as the 0.9387 pooled figure was, but within one organism at a time. These historical calculations show how the statistic changes under different grouping. They do not establish universal prediction bounds.

| Target | Peptides with repeat records | Split-half | Derived value, not a ceiling |
|---|---|---|---|
| pooled across organisms in this analysis | — | 0.7877 | 0.9387 |
| E. coli only | 2,099 | +0.857 | **0.9608** |
| S. aureus only | 2,100 | +0.851 | **0.9590** |
| P. aeruginosa only | 1,035 | +0.833 | 0.9535 |
| B. subtilis only | 520 | +0.892 | **0.9711** |
| M. luteus only | 238 | +0.929 | **0.9815** |

### What this does and does not establish

**Organism is a factor worth retaining.** This decomposition does not establish why more labels failed to improve one model, or why different model classes produced similar scores. Those are separate causal hypotheses.

**It does not establish that a per-organism model scores better.** Our recorded paired per-organism comparison failed its registered improvement bar. Organism and source effects require further separation; the derived values above are not established floors or ceilings. Nothing here is wet-lab validated by us, because we have no laboratory. Species-aware prediction is not our idea either, and LLAMP, AMP0 and GGN-ABPMIC all do it. What is ours is the variance decomposition and agreement comparison on the public data we analyzed.

04 Using it

## Use a documented evaluation procedure.

For LRGB Peptides-func, a separate release provides [corrected row-index splits, source checksums and release notes](/data/lrgb-corrected-v1/). See the [benchmark audit](/benchmark-leakage) for the original-split control and limitations.

For comparisons on these folds, report the exact dataset version, training procedure, model-selection history and metric implementation. Shared folds alone do not make two evaluations equivalent. The release documentation describes the available data and its limits.

Silicyte (2026). Silicyte AMP evaluation split v1.0.0: corrected similarity folds for antimicrobial peptide activity prediction. https://silicyte.com/data

The original v1 archive carries a CC BY 4.0 notice. Upstream measurement permissions have not been fully verified in this audit; the archive notice is not a completed rights review. See the [source and release corrections](/data/CORRECTIONS-2026-10-16.md). Questions: [hello@silicyte.com](/company).
