<!-- Plain-markdown mirror of https://silicyte.com/audit
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Split Audit: find train/test leakage in your own data

> Upload a train/test split and find out how many test rows have a near-duplicate in training. Runs entirely in your browser; your sequences are never uploaded. The leak rate is free. The row-level findings and a corrected split are $99.

Canonical: https://silicyte.com/audit

---
[**Silicyte**](/)

Split Audit

# How much of your test set
is already in training?

Drop in a train/test split. You get the exact fraction of test rows that carry a near-duplicate in training, measured with the same instrument that found 65.29% in a NeurIPS benchmark.

**Your data never leaves this page.** The comparison runs in your browser on your own machine. Nothing is uploaded, and you can verify that by watching your network tab or by disconnecting before you load the file.

Drop your split here, or choose a file

CSV or TSV with a sequence column and a split column, or two FASTA files concatenated. Up to about 20,000 rows.

What the file needs to contain

A sequence column named any of `sequence`, `seq`, `peptide`, `smiles` or `text`, and a split column named `split`, `set`, `fold` or `partition` whose values look like `train` and `test` (`val` and `valid` are treated as test). An `id` or `name` column is used if present. Example:

```
id,sequence,split
p001,GIGKFLHSAKKFGKAFVGEIMNS,train
p002,KWKLFKKIEKVGQNIRDGIIKAGPAVAVVGQATQIAK,train
p003,GIGKFLHSAKKFGKAFVGEIMNT,test
```

FASTA works too: headers containing `train` or `test` set the split.

Questions

## What this measures, and what it does not.

### Is my data uploaded anywhere?

No. The comparison runs in your browser. The file is read locally and the sequences are never sent to any server. Open your network tab while it runs, or disconnect before loading the file, and you will see the audit still completes.

### What counts as leakage?

A test row counts as leaking when some training row reaches a Levenshtein ratio of 0.80 or above against it, where the ratio is (lensum minus indel distance) divided by lensum. Every test row is compared against every training row. Nothing is sampled.

### Does a clean result mean my evaluation is sound?

No, and this matters. A clean result is a statement about sequence similarity only. It does not establish that model selection, hyperparameter choice or threshold tuning were independent of the test set, and it does not see leakage through shared assay batches, the same measurement under two identifiers, or metadata. Silicyte's own pipeline passed a family-overlap check 826 times out of 826 while 20.1% of its held-out rows kept a near-twin.

### If 65% of my test set leaks, is my accuracy 65 points too high?

No. A contamination rate is not a score inflation. Finding out how much a number is overstated means retraining on the corrected split and comparing, which this audit does not do. Anyone quoting a contamination rate as an inflation is quoting something that was not measured.
