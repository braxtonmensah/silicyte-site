<!-- Plain-markdown mirror of https://silicyte.com/evaluation.html
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Model Evaluation Sprint

> Does your reported model improvement survive a reproducible evaluation on your own experimental data? A fixed-scope, ten-business-day retrospective evaluation for peptide activity and toxicity models. Fixed-fee pilot, $2,500.

Canonical: https://silicyte.com/evaluation.html

---
[**Silicyte**](/)

Model Evaluation Sprint

# Does your model improvement
survive its own evaluation?

Before a reported gain decides your next experimental round, find out whether it holds up under a reproducible evaluation on the data you already have.

A fixed-scope, ten-business-day retrospective review of one endpoint, one pipeline and one agreed data snapshot. You get a reproduction of your reported metric, a check of what crosses your split, a corrected comparison against a baseline you choose, and a short memo on which claims survive.

Get a $99 Split Audit today ↓ [Scope the full sprint →](mailto:hello@silicyte.com?subject=Evaluation%20Sprint%20scoping%20call)

At a glance

Fixed-fee pilot$2,500

Turnaround10 business days from usable inputs

ScopeOne endpoint, one pipeline, one data snapshot

EndpointsPeptide activity and toxicity first

MethodComputational only. No laboratory work.

Scope and feasibility are confirmed on a free scoping call before any commitment. If the checks your question needs are not possible with the inputs available, we say so before you pay.

Split Audit

$99 same day

Send us your train and test split. Before the day is out you get a report on how many of your test rows have a near-duplicate in training, measured with the same instrument behind our audit of thirteen published benchmarks.

- Exact-duplicate rate and the share of test rows with a training sequence at Levenshtein ratio 0.80 or above

- The specific test rows that leak, with their nearest training neighbour

- A plain-language verdict on whether your held-out score can be read as held out

**Run it yourself, right now, in your browser.** The leak rate is free and your sequences never leave your machine: nothing is uploaded. The $99 unlocks the row-level findings and the corrected split.

[Run the audit →](/audit.html)

Need more than the overlap number? The full sprint below reproduces your metric, reviews labels and selection, and re-scores against a fair baseline.

01 When teams use it

## A decision is coming, and one number is carrying it.

The sprint is built for a specific moment: a team has to decide whether to adopt a model, trust a reported improvement, or use a selection procedure for its next experimental round, and it cannot resolve a specific evaluation concern internally in time.

Typical questions we take on:

- Our new model beats the old one on held-out data. Is the held-out set actually held out?

- Did the way we chose the model, the threshold or the candidates leak into the score we are reporting?

- Are our labels and assay conditions comparable across the rows we pooled?

- How much of the improvement survives against a fair baseline, with honest uncertainty?

02 What you receive

## Five deliverables, all reproducible.

01

### Reproduction of your reported metric

Or a precise account of why it cannot be reproduced from the inputs supplied.

02

### Overlap, label and selection review

Train/test overlap, label and condition handling, ties, and selection procedures. Complete overlap checks wherever feasible, with any sampling and its limits disclosed.

03

### A corrected comparison

Against an agreed baseline, with appropriate uncertainty and explicit limits on how far it generalises.

04

### A short decision memo

Which claims survive, which are unsupported, what changes, and which experiment or data would resolve what remains uncertain.

05

### Scripts and a walkthrough

Reproducible scripts and configuration, a record of the inputs and versions used, and a list of any evidence that was unavailable.

03 What we need from you

## The inputs that make the checks possible.

Sequence identifiers; experimental labels and assay conditions; prediction files; the original train, validation and test membership; evaluation code or configuration; and an account of how the model and candidates were selected.

We confirm which checks are possible from these inputs before accepting payment. Prediction files alone cannot establish that a model's training or selection history was independent, so if that is the question, we will need more than predictions and we will tell you so up front.

04 Scope and honest limits

## What the sprint is, and what it is not.

**Included:** one endpoint, one existing pipeline, one agreed data snapshot, at most two existing prediction sets and one agreed baseline.

**Not included:** new model development, broad data cleanup, prospective laboratory work and open-ended infrastructure repair. Material extra work is quoted separately before it starts.

**What it cannot tell you:** this is a retrospective evaluation. It is not prospective validation, and we make no promise that a retrospective improvement will raise your future hit rate. Conclusions that depend on retraining require a reproducible training run and agreed compute; fixed prediction files cannot substitute for retraining on corrected splits.

We start with peptide activity and toxicity endpoints, which is where our measured work is. We do not claim the same depth across every molecular modality.

05 Why trust the evaluator

## We publish our own errors first.

The credibility of an evaluation depends on the evaluator. Everything below is public and checkable.

Audit

### Thirteen published splits measured

Train/test overlap measured across five benchmark families from each benchmark's own published files. LRGB Peptides-func returns 65.29%; FLIP meltome returns 0.29%.

[Read the audit →](/benchmark-leakage.html)

Self-audit

### Our own pipeline, found and corrected

Our splitter claimed single-linkage clustering and was not. 20.1% of held-out MIC rows had a near-twin in training while the usual check passed 826 of 826. Rebuilt folds measure 0.0000.

[Read the correction →](/science.html)

Release

### A corrected split, released

A corrected LRGB Peptides-func row-index split, verified from its own public URL at 0.0% against a 65.29% control on the original.

[Open the split →](/data/lrgb-corrected-v1/)

06 Your data

## Your data stays yours.

Where to run the work and who has access are agreed before it starts. We prefer execution in an environment you control when that is workable. Your data is not reused, published or used to train any model without your separate permission.

We do not describe local execution as cryptographic zero-knowledge, and we do not claim an established enterprise security programme. Silicyte is an independent, founder-led venture and is not yet incorporated; engagements are contracted once scope is agreed.

Start with one question

## Tell us the decision and the number behind it.

Send the endpoint, roughly how your split was built, and the decision the result feeds. We will reply with whether the sprint fits and what it would need.

[Request a scoping call →](mailto:hello@silicyte.com?subject=Evaluation%20Sprint%20scoping%20call)
