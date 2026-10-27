<!-- Plain-markdown mirror of https://silicyte.com/demo
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Run the pipeline on a peptide

> Explore sequence properties, reference similarity and computational predictions for a peptide. Reference assay measurements and model outputs are distinguished.

Canonical: https://silicyte.com/demo

---
[**Silicyte**](/)

Try it

# Explore a peptide prediction.

Inspect sequence properties, reference similarity and computational predictions across bacterial targets. This demonstration uses public data; its outputs are not experimental measurements of your peptide.

Peptide sequence

Run the pipeline

Interactive demonstration

## From sequence to context

Sequence descriptorsReference similarityPredictions & public assay data

Step 01
Read

## What the molecule is.

Length, net charge, and the hydrophobic moment: how strongly the hydrophobic residues fall on one face under an assumed helical arrangement. These are sequence-derived descriptors; they do not establish an experimentally measured structure.

Step 02
Search

## Who it is related to.

Search the demonstration's reference peptides by sequence similarity. Close relatives provide context, but similarity alone does not establish prediction accuracy.

Step 03
Domain

## Prediction context and limits.

The demonstration uses similarity as an illustrative domain heuristic. Sparse reference coverage limits interpretation. Model outputs require validation against relevant experimental outcomes.

Step 04
Spread

## Why one peptide is not one number.

Here is what the nearest labelled relative actually measured, organism by organism, in the public record. Across the whole set the median peptide's MIC moves 6.1x between organisms. Our recorded decomposition attributed 74.2% of resolvable variance to organism differences; that does not establish a universal noise ceiling.

• What this is

## Model and data provenance.

The demonstration uses fitted ridge weights shipped in [models.json](/assets/models.json), averaged over a penalty grid rather than selected on inner folds. An internal rerun reproduced descriptor out-of-fold Spearman 0.4502 on the released MIC folds. The historical fine-tuned result of 0.5356 is a separate model result, not the model running in this browser. These computational scores do not establish biological performance. See the [data page and release corrections](/data).

Reference values come from GRAMPA in micromolar units, reduced to a median per peptide and organism. Some source records lack complete chemical-modification metadata; canonical sequence letters alone do not verify that chemistry. Cite the original sources. Sequence input is processed in the browser. Reference measurements come from that public dataset; a predicted MIC is not a measured MIC for your input.

[Check your own result instead](/check) [Take the corrected folds](/data)
