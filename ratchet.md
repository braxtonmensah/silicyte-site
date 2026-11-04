<!-- Plain-markdown mirror of https://silicyte.com/ratchet
     Generated for retrieval crawlers. The HTML page is canonical. -->

# Silicyte Ratchet (silicyte-0119)

> Does a library of verified program helpers compound on ARC-AGI-1? Result: pending.

Canonical: https://silicyte.com/ratchet

---

Silicyte Ratchet (silicyte-0119) is a pre-registered test of whether a library of verified program helpers compounds on ARC-AGI-1. A growing library must beat five controls at equal total tokens on 400 sealed evaluation tasks. It was registered on 2026-11-04 at commit cc5fb5b, before any model call. The result is pending and will be published whatever it shows.

[Read the pre-registration](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md) · [Watch the repo](https://github.com/braxtonmensah/ratchet) · [Follow the feed](https://silicyte.com/feed.xml)

This is an evaluation, not a new method. It applies the compute-matched protocol of Berlot-Attwell et al. to ARC program libraries. Prepared with AI assistance; not peer reviewed. Not related to arXiv 2605.22148, a different paper also named Ratchet.

## 01 The arms

Six arms at equal total tokens, plus two planted controls. The planted controls prove the harness can see a library at all; if they fail, the run is VOID, not NULL.

| Arm | Role | Library during growth |
|---|---|---|
| STOCK | treatment | grows after every round from helpers in demo-passing programs |
| STATIC | control | the round-1 library, frozen for the remaining rounds |
| ONE-SHOT | control | the same tokens spent in one round, then one library |
| EXEMPLAR | control | verified whole programs in context, no helper extraction |
| SHAM | control | size-, token- and genre-matched library of unverified code |
| FLAT-TTC | control | no library; the same tokens go to extra samples on each sealed task |
| PLANT-DRIP | positive control | Hodel arc-dsl primitives released in tranches |
| PLANT-L1 | positive control | tranche 1 only |

Every library arm has the same 6,000-token context cap. Sealed tasks never contribute helpers to any library.

## 02 The seal and the budget

Growth runs on the 400 ARC-AGI-1 training tasks. Scoring runs once per frozen library on the 400 ARC-AGI-1 evaluation tasks (fchollet/ARC-AGI at commit 399030444e0ab0cc8b4e199870fb20b863846f34), after every library in the run is frozen and hash-committed. Sorted sealed id list sha256: `911bf838d8843606d5fc1ba0550a0c23670027bf8f6e32e4e4fbf93854957ddd`.

The proposer is Qwen3.6-35B-A3B with weights fixed for the whole run. Every arm logs prompt tokens, generated tokens and sandbox executions, and FLAT-TTC receives STOCK's logged total tokens as extra samples, so no arm wins by spending more. Selection never uses test outputs.

## 03 The decision rule

A sealed task is solved if its pass@2 submission is correct in at least 2 of 3 scoring seeds. COMPOUNDS requires all of:

1. STOCK solves more sealed tasks than each of STATIC, ONE-SHOT, EXEMPLAR, SHAM and FLAT-TTC, each by an exact one-sided McNemar test at p < 0.05.
2. Reuse gate: on tasks STOCK solves and FLAT-TTC does not, at least 50% of winning programs call an accepted helper.
3. Knockout: deleting the called helpers, and separately inlining them as non-callable text, each removes at least half of those solves.
4. Contamination gate: on a colour-permuted and rotated sealed copy, STOCK keeps at least half its net gain over FLAT-TTC.

Other registered outcomes: LIBRARY HELPS, NOT COMPOUNDING; CONTEXT EFFECT; RETRIEVAL; NULL; and VOID if the planted control fails.

## 04 The prediction

| Registered quantity | Value |
|---|---|
| STOCK minus STATIC, net sealed solves of 400 (point) | +2 |
| 80% band, registered | [-8, +14] |
| Calibrated 80% band, Amendment 0 (fitted on 728 resolved predictions) | [-10.68, +17.216] |
| P(COMPOUNDS), our estimate | 0.15 |

## 05 Result log

| Date | Event |
|---|---|
| 2026-11-04 | Registered as silicyte-0119 (16:46 ET). PREREG.md committed as cc5fb5b (16:47 ET), before any model call. Result: pending. |

## 06 Questions

### What is Silicyte Ratchet?

Silicyte Ratchet (silicyte-0119) is a pre-registered test of whether a library of verified program helpers compounds on ARC-AGI-1. A growing library must beat five controls at equal total tokens on 400 sealed evaluation tasks. It was registered on 2026-11-04 at commit cc5fb5b, before any model call.

### What counts as compounding?

The growing library (STOCK) must solve more sealed tasks than each of STATIC, ONE-SHOT, EXEMPLAR, SHAM and FLAT-TTC by an exact one-sided McNemar test at p < 0.05. It must also pass a reuse gate, a helper knockout and a contamination gate. Anything less is reported under a weaker registered label or as NULL.

### What did Silicyte predict?

STOCK minus STATIC net sealed solves of 400: +2, with an 80% band of [-8, +14]. The calibrated band from Amendment 0 is [-10.68, +17.216]. Our probability that the run reads COMPOUNDS is 0.15.

### Is this the same as the Ratchet paper on arXiv (2605.22148)?

No. arXiv 2605.22148 is an unrelated paper about how reliable an LLM judge must be to retire a skill. This project is Silicyte Ratchet, register id silicyte-0119.

### When is the result published?

The result is pending. It will be committed to the ratchet repository and added to the result log on this page whatever it shows, including a null or a VOID run.

### Can someone else rerun it?

Yes. Every frozen library, the token ledger, the scoring script and the perturbation seed will be released. Rescoring one frozen library on the 400 sealed tasks needs one GPU and the public ARC-AGI-1 data.

## 07 Prior art

Each entry was opened at its source to confirm the title and identifier.

- Berlot-Attwell, Sesterhenn, Rudzicz and Si. [Is This LLM Library Learning? Evaluation Must Account For Compute and Behaviour](https://aclanthology.org/2026.eacl-long.163/). EACL 2026, 2026.eacl-long.163. Ratchet adopts its equal-compute baseline and behavioural checks and applies them to ARC program libraries.
- Berlot-Attwell, Rudzicz and Si. [Library Learning Doesn't: The Curious Case of the Single-Use "Library"](https://arxiv.org/abs/2410.20274). arXiv 2410.20274 (MATH-AI workshop, NeurIPS 2024). It found function reuse extremely infrequent in two math systems; Ratchet makes reuse and a helper knockout pass conditions.
- Berlot-Attwell, Rudzicz and Si. [LLM Library Learning Fails: A LEGO-Prover Case Study](https://arxiv.org/abs/2504.03048). arXiv 2504.03048. A post-hoc audit of one system; Ratchet registers its reuse test before the run.
- E. Pang. [arc_agi](https://github.com/epang080516/arc_agi) (GitHub). A DreamCoder-inspired ARC program-synthesis system with an expanding library of programs; Ratchet tests the expanding-library idea against a frozen library, a sham library and extra sampling at equal tokens.
- Stengel-Eskin, Prasad and Bansal. [ReGAL: Refactoring Programs to Discover Generalizable Abstractions](https://arxiv.org/abs/2401.16467). arXiv 2401.16467 (ICML 2024). It proposes an abstraction method; Ratchet fixes one extraction rule and scores it against compute-matched controls.
- Wang, Fried and Neubig. [TroVE: Inducing Verifiable and Efficient Toolboxes for Solving Programmatic Tasks](https://arxiv.org/abs/2401.12869). arXiv 2401.12869. A toolbox that grows and is trimmed; Ratchet's primary contrast is growing against frozen.
- Pourcel, Colas and Oudeyer. [Self-Improving Language Models for Evolutionary Program Synthesis: A Case Study on ARC-AGI](https://arxiv.org/abs/2507.14172) (SOAR). arXiv 2507.14172. SOAR fine-tunes the model between iterations; Ratchet keeps weights fixed and changes only the in-context library.
- Butt et al. [CodeIt: Self-Improving Language Models with Prioritized Hindsight Replay](https://arxiv.org/abs/2402.04858). arXiv 2402.04858 (ICML 2024). Self-improvement on ARC through weight updates; Ratchet has none.
- Ho et al. [ArcMemo: Abstract Reasoning Composition with Lifelong LLM Memory](https://arxiv.org/abs/2509.04439). arXiv 2509.04439. Concept-level memory in natural language; Ratchet's memory is verified, callable Python, with a size-matched sham library as a control.
- Ellis et al. [DreamCoder: Growing generalizable, interpretable knowledge with wake-sleep Bayesian program learning](https://arxiv.org/abs/2006.08381). arXiv 2006.08381. Library growth with a trained neural guide; Ratchet uses a fixed LLM proposer and equal-token controls.
- Grand et al. [LILO: Learning Interpretable Libraries by Compressing and Documenting Code](https://arxiv.org/abs/2310.19791). arXiv 2310.19791 (ICLR 2024). LLM synthesis plus symbolic compression; Ratchet measures a library of this family against compute-matched controls rather than building a new one.
- Xu, Yan, Chen and Kechadi. [Phantom Gains: Auditing Self-Improvement Against a Measured Null](https://arxiv.org/abs/2608.20290). arXiv 2608.20290. It audits LoRA self-training against a frozen control; Ratchet's STATIC and SHAM arms play that role for an in-context library, with three scoring seeds and a determinism smoke.
- Iscan. [Form, Not Content? A Preregistered, Placebo-Controlled Evaluation of Learned Error-Conditioned Self-Repair Through Prompts and Weights in Frozen Small Code Models](https://arxiv.org/abs/2607.12962). arXiv 2607.12962. Placebos for self-repair evidence; Ratchet's SHAM arm is the placebo for library content.
- Lehmann and Vahdati. [Can LLMs Improve Their Own Harness? A Controlled Study on ARC-AGI-3](https://arxiv.org/abs/2610.30499). arXiv 2610.30499. Self-improvement of the harness on interactive games; Ratchet studies a helper library on static ARC-AGI-1 tasks.

## 08 Follow

[Watch the repo on GitHub](https://github.com/braxtonmensah/ratchet) · [Atom feed](https://silicyte.com/feed.xml) · [Silicyte on LinkedIn](https://www.linkedin.com/company/silicyte/) · hello@silicyte.com

Cite: Mensah, B. (2026). Silicyte Ratchet (silicyte-0119). github.com/braxtonmensah/ratchet, pre-registration commit cc5fb5b. See [CITATION.cff](https://github.com/braxtonmensah/ratchet/blob/main/CITATION.cff).
