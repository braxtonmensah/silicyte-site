# Corrections to Silicyte AMP evaluation v1

Published October 16, 2026. The original v1 ZIP and its four files are retained unchanged as historical artifacts. Read this notice with their README and manifest.

## Verified property of the released folds

A full scan of the released CSVs compared 3,373,286 MIC and 613,057 HC cross-fold sequence pairs. No pair reached Levenshtein ratio 0.80. The maximum was 0.7948717949 for MIC and 0.7916666667 for HC. Counts are 2,904 MIC rows / 1,198 clusters and 1,238 HC rows / 450 clusters. The exported sequences, cluster identifiers and fold assignments match the local maxout fold artifact (seed 20261014).

CSV SHA-256:

- MIC: `9b29afa37639b2f3d09636f1f04cf82d3c614c7cba1153b402d2f11e0de34291`
- HC: `0767a0de2e13e42faffff40071cd63b1ef034b5a9bdb12dd8591b7a81d4a4081`

This verifies separation under the stated string metric and threshold. It does not establish biological generalization, independence of model selection, or separation under other similarity definitions. This was an internal verification, not an outside reproduction of the models.

## Claims that require correction

The values 0.9387 and the per-organism analogues were derived by applying a Spearman-Brown-style transformation to split-half rank correlations. They are not established universal ceilings on model Spearman performance. The repeat measurements also mix organisms and sources; they should not be described as pure assay repeatability. Preserve the measured agreement separately from the derived values and their unverified assumptions.

A near-zero shuffled-label run is a useful control outcome, but does not prove that folds do not leak or that all training and selection decisions were independent.

The reported 21x and 3.5x scorer-intervention improvements are computational. The experiment alone does not establish actual molecule quality, a causal mechanism, or the proposition that a model with less training data can never select better molecules.

The leaking implementation was found in our own pipeline. This does not establish that every paper or the whole field uses that implementation.

The v1 baseline values are historical records. The ZIP does not contain the full training/evaluation harness or per-model prediction provenance needed to reproduce every advertised score. Different fold builders existed in the research lane; a comparison must identify its exact inputs, fold assignment, training procedure and predictions. Do not infer comparability from a shared clustering description alone.

The README's request to cite a DOI was premature: the release supplies no DOI. Cite the versioned URL and these corrections until a persistent identifier is actually issued. No new model score or experimentally validated design is claimed in this correction.

## Browser checker limitations

The checker supports unmodified peptides using the 20 standard amino acids. It does not support SMILES, arbitrary sample identifiers or modified residues. Large similarity searches are sampled; finding no close relatives in a sample is inconclusive. Exact sequence-overlap checks do not reconstruct model-selection history. Prediction spread is descriptive and is not a universal test of significance or experimental resolution. Constant predictions or labels make rank correlation undefined.
