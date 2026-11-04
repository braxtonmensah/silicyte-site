<!-- Plain-markdown mirror of https://silicyte.com/evaluation
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Model Evaluation Sprint (paused)

> Paused: Silicyte's retrospective evaluation sprint for peptide activity and toxicity models is not on offer while Silicyte runs its pre-registered self-improvement test (silicyte-0119). The method stays public as a record; nothing here is for sale.

Canonical: https://silicyte.com/evaluation

---
[**Silicyte**](/)

Model Evaluation Sprint · paused

**Paused.** This service is not on offer while Silicyte runs its pre-registered self-improvement test ([silicyte-0119](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md)). No scoping calls, quotes or payments are being taken, and nothing on this page is for sale. The page stays up as a record of the method; the free browser checks still run at [/check](/check).

# Does your model improvement
survive its own evaluation?

Before a reported gain decides your next experimental round, find out whether it holds up under a reproducible evaluation on the data you already have.

As designed, a fixed-scope, ten-business-day retrospective review of one endpoint, one pipeline and one agreed data snapshot: a reproduction of your reported metric, a check of what crosses your split, a corrected comparison against a chosen baseline, and a short memo on which claims survive.

[Run the free browser checks →](/check) [Read the current test ↗](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md)

At a glance

StatusPaused, not on offer

ScopeOne endpoint, one pipeline, one data snapshot

EndpointsPeptide activity and toxicity first

MethodComputational only. No laboratory work.

No scoping calls, quotes or payments are being taken while the service is paused.

Split Audit

Paused

The split audit measured how many test rows have a near-duplicate in training, with the same instrument behind our audit of thirteen published benchmarks. The paid report is not on offer.

- Exact-duplicate rate and the share of test rows with a training sequence at Levenshtein ratio 0.80 or above

- The specific test rows that leak, with their nearest training neighbour

- A plain-language verdict on whether your held-out score can be read as held out

**Run it yourself, in your browser.** The overlap checks are free and your sequences never leave your machine: nothing is uploaded.

[Run the free checks →](/check)

The method below is kept as a record of what the sprint checked: reproduce the metric, review labels and selection, and re-score against a fair baseline.

01 When teams use it

## A decision is coming, and one number is carrying it.

The sprint was built for a specific moment: a team has to decide whether to adopt a model, trust a reported improvement, or use a selection procedure for its next experimental round, and it cannot resolve a specific evaluation concern internally in time.

Typical questions it was designed for:

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

Which checks are possible depends on these inputs. Prediction files alone cannot establish that a model's training or selection history was independent, so if that is the question, predictions are not enough.

04 Scope and honest limits

## What the sprint is, and what it is not.

**Included:** one endpoint, one existing pipeline, one agreed data snapshot, at most two existing prediction sets and one agreed baseline.

**Not included:** new model development, broad data cleanup, prospective laboratory work and open-ended infrastructure repair.

**What it cannot tell you:** this is a retrospective evaluation. It is not prospective validation, and we make no promise that a retrospective improvement will raise your future hit rate. Conclusions that depend on retraining require a reproducible training run and agreed compute; fixed prediction files cannot substitute for retraining on corrected splits.

We start with peptide activity and toxicity endpoints, which is where our measured work is. We do not claim the same depth across every molecular modality.

05 Why trust the evaluator

## We publish our own errors first.

The credibility of an evaluation depends on the evaluator. Everything below is public and checkable.

Audit

### Thirteen published splits measured

Train/test overlap measured across five benchmark families from each benchmark's own published files. LRGB Peptides-func returns 65.29%; FLIP meltome returns 0.29%.

[Read the audit →](/benchmark-leakage)

Self-audit

### Our own pipeline, found and corrected

Our splitter claimed single-linkage clustering and was not. 20.1% of held-out MIC rows had a near-twin in training while the usual check passed 826 of 826. Rebuilt folds measure 0.0000.

[Read the correction →](/science)

Release

### A corrected split, released

A corrected LRGB Peptides-func row-index split, verified from its own public URL at 0.0% against a 65.29% control on the original.

[Open the split →](/data/lrgb-corrected-v1/)

06 Your data

## Your data stays yours.

Where to run the work and who has access are agreed before it starts. We prefer execution in an environment you control when that is workable. Your data is not reused, published or used to train any model without your separate permission.

We do not describe local execution as cryptographic zero-knowledge, and we do not claim an established enterprise security programme. Silicyte is a solo, founder-led venture, not incorporated, with $0 revenue and 0 customers; no engagements are being taken while this service is paused.

Paused

## Follow the current test instead.

Silicyte is running a pre-registered, compute-matched test of whether AI self-improvement compounds (silicyte-0119, 400 sealed ARC-AGI-1 tasks). The result will be published whatever it shows.

[Read the pre-registration ↗](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md)
