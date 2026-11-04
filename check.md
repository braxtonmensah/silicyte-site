<!-- Plain-markdown mirror of https://silicyte.com/check
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Check your own result

> Local diagnostics for unmodified peptide tables: sequence similarity, descriptive prediction spread, tie handling and exact overlap. Incomplete checks remain inconclusive. Your file is not uploaded.

Canonical: https://silicyte.com/check

---
[**Silicyte**](/)

The instrument

**Paid work paused.** Silicyte's paid audits are not on offer while it runs its pre-registered self-improvement test ([silicyte-0119](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md)), and nothing on this page is for sale. The four browser checks below still run, free and locally.

# Four diagnostics for peptide evaluation tables.

Four checks for the defects that make a reported design gain look bigger than it is. Each one is a mistake we made first and found in our own pipeline: the standard antimicrobial peptide split leaked 20.1% of its held-out rows past a family-overlap test that passed 826 of 826.

Drop a CSV below. **Nothing is uploaded.** Your selected file is processed locally in this browser. Public site assets and examples are fetched from external servers.

Browser tool

## Start with your evaluation table

Unmodified peptide sequencesCSV input · no accountSelected files processed locally

01 Run it

## Your file, or ours.

One row per unmodified peptide, using the 20 standard amino acids. SMILES, sample IDs and modified residues are not supported. The page guesses your columns and you can correct it. A sequence column and a train/test or fold column are enough for two of the four checks; prediction and truth columns unlock the other two.

**Drop a CSV here**

or

Choose a file Use our published MIC folds Use a deliberately broken example

✓ Your file is processed locally and is not uploaded. This page retrieves public fonts, scripts and, when requested, our example dataset. There is no file-upload endpoint or analytics on this page. The checker source is one readable file you can inspect: [check.js](/assets/check.js). Inspect the implementation and its limits.

Sequence column

Split or fold column

Prediction column

Measured truth column

Which fold is held out

Identity threshold

Gain you are reporting

Run the four checks

Waiting

No file loaded yet. The four checks and what each one catches are described below; load something and they fill in with your numbers.

02 What each check catches

## What each diagnostic reports.

Every check below exists because it caught something in our own work first. The [research record](/science) documents each one, including the results it forced us to withdraw.

| Diagnostic | Purpose | What a finding means |
|---|---|---|
| **LEAK** | Compare peptide similarity across the designated training and test sets. | A held-out row has a near-twin in training, so its score is partly recall. |
| **SPREAD** | Describe the distribution of supplied predictions. | Your reported effect is smaller than the resolution floor of the set it was read off. |
| **TIES** | Compare tie-corrected rank correlation with an ordinal-rank calculation. | Your rank statistic moves when ties are corrected, so repeated labels are biasing it. |
| **SPLIT** | Check exact sequence overlap across designated training and test sets. | The same sequence appears on both sides of the split. |

**Sequence overlap can affect model comparisons.** Our historical evaluation recorded score inflation of up to 0.065 on the safety endpoint after a split defect. The size and direction of an overlap effect depend on the model and evaluation. Corrected splits and retraining are needed to assess the impact on a particular result.

03 Using the checks

## Free in your browser. Paid audits paused.

The browser checks are free and stay free. The method is published and anyone can run it. The paid result audits and diligence reads that used to be listed here are paused and not on offer.

For anyone, no account

### Browser checks

Free

Drop in an evaluation table and get sequence overlap, prediction spread, rank ties and split membership. Nothing is uploaded. This is the whole tool, not a limited preview, and it will stay free.

Run the diagnostics →

Paused

### Result audits and diligence reads

Not on offer

Silicyte is a solo, unincorporated research venture with $0 revenue and 0 customers, and it is not taking paid work while its current test runs.

[Read the current test ↗](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md)

### Limits, stated once

These four checks describe the table you supplied. They do not certify a model, establish biological activity, or replace experimental validation. Specifically:

- **LEAK** samples pairs on large files, so a run without a finding is inconclusive rather than clean.

- **SPREAD** is descriptive. It is a resolution floor, not an experimental error bar and not a significance test.

- **TIES** is undefined when every prediction is identical.

- **SPLIT** catches exact duplicates only, so passing it does not rule out leakage by similarity. That is what LEAK is for.

- None of them can tell you whether the prediction target matches the decision you actually care about. The [dataset analysis](/data) shows why pooled activity labels make that harder than it looks.

[Read the methods and limitations](/science).
