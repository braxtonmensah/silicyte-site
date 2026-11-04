<!-- Plain-markdown mirror of https://silicyte.com/
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Silicyte

> Silicyte runs pre-registered, compute-matched tests of whether AI self-improvement actually compounds, and publishes the result either way. Silicyte Ratchet (silicyte-0119) tests a verified-helper library on 400 sealed ARC-AGI-1 tasks; registered 4 Nov 2026, result pending. Earlier work on agent guardrail uptime, peptide and protein model evaluation and the Virtual Cell Challenge stays here.

Canonical: https://silicyte.com/

---
[**Silicyte**](/)

Recursive self-improvement, measured

# Does AI self-improvement actually compound?

AI systems now write the tools, prompts and code that their next round runs on. Most reported gains are chosen on the same tests they are reported on. Silicyte runs pre-registered, compute-matched tests of whether self-improvement compounds, seals the test set the loop never sees, and publishes the result either way.

Silicyte Ratchet (silicyte-0119) · Result: **pending** · prereg [cc5fb5b](https://github.com/braxtonmensah/ratchet/commit/cc5fb5b) · registered 4 Nov 2026

[Read the Ratchet test →](/ratchet) [The pre-registration ↗](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md)

Sealed ARC-AGI-1 tasks the loop never reads (id list hashed before any run) **400**

Arms at equal total tokens, plus two planted positive controls **6 + 2**

Our registered prediction, growing library minus frozen library, sealed solves of 400, with its 80% band **+2** [-8, +14]

Our own earlier headline, laptop vs clean public runners (guard absence at a 15 s budget) **29.8% → 0.0000**

Registered 4 Nov 2026 as silicyte-0119, before any model call, at commit cc5fb5b. Result pending; it will be published whatever it shows, including a null. The design applies the compute-matched protocol of Berlot-Attwell et al. to ARC program libraries; it is an evaluation, not a new method. Prepared with AI assistance; not peer reviewed.

## Our own best number did not reproduce. We said so.

On one operator's laptop fleet of Claude Code agents, a guardrail hook was absent on 29.8% of the 103,850 calls it existed to check (53.1% with 11 or more agents at once), and a one-dispatcher fix brought that to 5 of 8,055. We then reran the load on clean public machines, with antivirus on and off and with the same shell layer: absence at the documented budget was 0.0000 in every cell up to 24 agents. The effect belongs to that laptop, not to agent fleets in general, so we stopped building a company on it. The probe and every load-test result stay public: [laptop measurement](/refusal-uptime), [clean-runner reruns](https://github.com/braxtonmensah/refusal-uptime/tree/loadtest-results).

## Earlier work: before Ratchet, still public, limits attached

- **10.5281/zenodo.23441786** (design-loop audit): degrading the scoring model made the reported gain 2.4 times larger. Computational only (we operate no laboratory) and not peer reviewed; the evidence archive is deposited under this DOI. [The paper](/papers/design-loops), [the DOI](https://doi.org/10.5281/zenodo.23441786).
- **65.29%** (LRGB Peptides-func leakage): share of test rows in the shipped split with a training twin at Levenshtein ratio 0.80. A corrected split is released. [The audit](/benchmark-leakage), [the corrected split](/data/lrgb-corrected-v1/).
- **29.8% to 0.0000** (guardrail uptime, not reproduced): a guardrail hook was absent on 29.8% of 103,850 calls on one laptop. On clean public runners the median absence was 0.0000 at a 15 s budget in every cell up to 24 agents, so we dropped it as our thesis. [The laptop measurement](/refusal-uptime), [the reruns](https://github.com/braxtonmensah/refusal-uptime/tree/loadtest-results).

[More earlier work](/science): [Agents (guardrail uptime)](/refusal-uptime), [Split audit](/audit), [Demo](/demo), [Reference answers](/reference), [Data](/data).

Open research / Benchmark evaluation

## Thirteen published splits,
measured the same way.

Share of test rows carrying a training sequence at a Levenshtein ratio of 0.80 or above. Each bar is a benchmark's own shipped split, read from its own published files. Hover a bar for the homology control its authors applied.

**The two bars that matter sit at opposite ends.** FLIP `conservation` and FLIP `secondary_structure` are built by the identical documented procedure. The sentence “Randomly split sequences into train/test with 95/5% probability” appears verbatim in both of their own READMEs, both are flagged green, and they measure **0.00%** and **65.38%**. The variable is not the split method. It is how redundant the underlying corpus is.

Test-row contamination at Levenshtein ratio 0.80, by published split

| Published split | Homology control, as published | Twin ≥ 0.80 |
|---|---|---|
| FLIP secondary_structure sampled | Random 95/5. No clustering. | 65.38% |
| LRGB Peptides-func | None. Stratified random split. | 65.29% |
| AMPlify positive class | None, by design (paper's Methods) | 63.47% |
| PepBenchmark hemolytic HC50 | k-mer, then MMseqs2 at 30% identity | 48.56% |
| AMPlify negative class | None, by design (paper's Methods) | 30.18% |
| PepBenchmark E. coli MIC | k-mer, then MMseqs2 at 30% identity | 29.97% |
| AMP Scanner v2 positive class | CD-HIT at 90% identity, pool filtered before splitting | 16.71% |
| FLIP meltome mixed | MMseqs2 at 20% identity, whole clusters assigned 80/20 | 0.29% |
| FLIP meltome human | MMseqs2 at 20% identity, whole clusters assigned 80/20 | 0.05% |
| AMP Scanner v2 negative class | CD-HIT at 40% identity, pool filtered before splitting | 0.00% |
| FLIP meltome human_cell | MMseqs2 at 20% identity, whole clusters assigned 80/20 | 0.00% |
| FLIP scl mixed_hard | MMseqs2 at 20% identity, whole clusters assigned 80/20 | 0.00% |
| FLIP conservation sampled | Random 95/5. No clustering. | 0.00% |

A contamination rate is not a score inflation. These rates were measured without retraining, so on their own they do not say by how much any reported accuracy is overstated. Where we did retrain, the figure belongs to its model: on LRGB Peptides-func the count ECFP + LightGBM baseline of arXiv 2501.17901 scores +0.1773 macro AP higher on the shipped split than on corrected splits (sd 0.0094; [details](/benchmark-leakage#peptides-func-retrained)). Two further splits were measured and deliberately excluded, each with its reason, in the [machine-readable record](/data/leakage-measurements.json).

[Read the benchmark audit →](/benchmark-leakage) [Open the corrected LRGB split →](/data/lrgb-corrected-v1/)

Follow

## Get the Ratchet result when it lands.

It goes up here, in the repo and in the feed, whatever it shows, including a null.

- [Watch braxtonmensah/ratchet on GitHub](https://github.com/braxtonmensah/ratchet)
- [Atom feed](/feed.xml)
- [Silicyte on LinkedIn](https://www.linkedin.com/company/silicyte/)
- [hello@silicyte.com](mailto:hello@silicyte.com)
