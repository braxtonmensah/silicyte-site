# Silicyte AMP evaluation split, v1.0.0

A corrected cross-validation split for antimicrobial peptide activity prediction, plus the audit
that shows it is clean and the label reliability that bounds what any model can score on it.

Released 2026-10-14 under CC BY 4.0. If you use it, cite the DOI and please report your numbers on
these folds so they are comparable.

## Why this exists

The similarity clustering in common use for this task documents itself as single linkage and is
not: it compares each sequence only to cluster *representatives* and takes the first match. Two
sequences 85% identical to each other therefore land in different clusters whenever each matches a
different earlier representative.

Measured on the standard sets, with the quantity the guard exists to bound:

| set | sequences with a cross-fold neighbour above 0.80 identity |
|---|---|
| MIC | **20.1%** |
| HC50 | **24.6%** |

The usual sanity check, "does any family span a fold", passes **826 of 826** and **336 of 336**. It
passes because it tests a different quantity. Every check that existed passed.

This matters more than it sounds, because the inflation is not uniform across models. A
high-capacity model can memorise a near-twin's label where a 36-dimensional ridge cannot, so the
leak flatters exactly the models people are most excited about. Measured inflation here reaches
**+0.065** Spearman on the safety axis.

## What is in here

| file | contents |
|---|---|
| `folds_mic.csv` | 2904 sequences, log10 MIC, cluster id, fold |
| `folds_hc.csv` | 1238 sequences, log10 HC50, cluster id, fold |
| `manifest.json` | cluster statistics, leakage audit, label reliability, baselines |

Clusters are built by **transitive single linkage** (union-find) at Levenshtein ratio
**0.8**, so by construction no two sequences at or above that identity can be in different
clusters. Whole clusters are assigned to folds, largest first to the emptiest fold.

| | clusters | largest | singletons | cross-fold identity > 0.8 |
|---|---|---|---|---|
| MIC | 1198 | 48 (1.7%) | 832 | **0.0000** |
| HC50 | 450 | 127 (10.3%) | 289 | **0.0000** |

Single linkage can chain, so the cluster size distribution is reported above rather than hidden:
the largest MIC cluster holds 1.7% of the data,
which leaves grouped CV workable.

## The ceiling, measured

A model cannot correlate with a noisy label better than the label correlates with itself. From
GRAMPA's repeat measurements (split each sequence's measurements in half, median each half,
correlate across sequences, 200 random splits, Spearman-Brown corrected):

| | value |
|---|---|
| split-half Spearman | **0.7877** (sd 0.0067) |
| full-label reliability | **0.8812** |
| **ceiling on any model scored against these labels** | **0.9387** |

Caveat that must travel with that number: GRAMPA's repeats are mostly different bacteria and
strains, not replicate assays of one organism. So it is the reproducibility of *median activity over
a sample of organisms*, which is exactly what the label is, and it is the wrong ceiling to quote for
single-organism potency.

## Baselines on these folds

Pooled out-of-fold Spearman, tie-corrected. Ridge predictions are **averaged over a fixed penalty
grid rather than selected on inner folds**, because at this sample size selecting the penalty loses
to averaging over it; selecting it cost 0.038 on MIC in our own runs.

| model | MIC | HC50 |
|---|---|---|
| 36 descriptors | 0.4502 | 0.4074 |
| ESM2-35M frozen, mean-pooled | 0.4656 | |
| ESM2-650M frozen, mean-pooled | 0.4427 | 0.3502 |
| Ankh-base frozen, mean-pooled | 0.3870 | |
| **ESM2-650M fine-tuned, 3 seeds averaged** | **0.5356** | **0.5079** |
| the same, on deliberately shuffled labels | **-0.0228** | |

The last row is the control that makes the rest meaningful: a 650M-parameter model retrained on
scrambled labels scores nothing, which is direct evidence that these folds do not leak.

## Reproducing

The harness that built and scored all of this is `maxout_ruler.py` and friends. Fold construction
is deterministic given the sequence set and the threshold.

## License

CC BY 4.0. The underlying measurements come from public sources (GRAMPA, DRAMP, APD, Hemolytik);
please cite them as well.
