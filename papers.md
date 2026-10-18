<!-- Plain-markdown mirror of https://silicyte.com/papers.html
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Papers and releases

> Silicyte research papers, benchmark audits and evaluation-data releases. Read the methods, code, controls and limitations behind our published computational work.

Canonical: https://silicyte.com/papers.html

---
[**Silicyte**](/)

Papers and releases

# What we have published, and what it can be checked against.

Each entry links to the artifact a sceptical reader would actually open: the PDF, the evidence archive, the dataset. Where something does not exist yet, the row says so rather than leaving it out.

01 Paper

Draft · evidence archive DOI 10.5281/zenodo.23441786

### [Design loops climb their scorer’s error: an intervention-based audit for in silico molecular design](/papers/design-loops.html)

Braxton Mensah. Degrading a design loop’s selection model on purpose, by withholding 80% of its training families while leaving the evaluation model untouched, made the reported gain 2.4 times larger: +1.3182 against +0.5421, difference -0.7761, SE 0.0531, t = -14.60. A model that knows less cannot design better molecules, so what the loop climbs is the scorer’s error. 13 pages. Not peer reviewed and not posted to a preprint server. The paper itself has no DOI; the DOI below belongs to its evidence archive, which is a software deposit.

[Abstract](/papers/design-loops.html) · [PDF](/papers/Mensah_DesignLoops_preprint.pdf) · [Evidence archive](https://github.com/braxtonmensah/silicyte-design-loops) · [DOI 10.5281/zenodo.23441786](https://doi.org/10.5281/zenodo.23441786)

02 Research note

## The leakage defect is not ours alone.

[Read the benchmark audit, methods and current corrections](/benchmark-leakage.html), or [download the corrected LRGB split](/data/lrgb-corrected-v1/). The table below is a selection of the reported measurements; sequence overlap alone does not quantify score inflation.

Every leakage figure we had published came from our own pipeline on one dataset family, so the claim that this is a field problem rested on a single case, and that case was us. On 2026-10-17 we ran our own check against three third-party published benchmarks. All were downloaded fresh and hashed. For the LRGB benchmark both MD5s match the values hard-coded in its official loader, so this is exactly reproducible rather than approximately.

| Published split | Homology control applied | Exact overlap | Twin ≥ 0.80 |
|---|---|---|---|
| **LRGB Peptides-func** NeurIPS 2022 | None. Stratified random split. | 7.72% | 65.29% |
| **AMP Scanner v2**, positives Bioinformatics 2018 | CD-HIT, 90% identity | 0.00% | 16.71% |
| **AMP Scanner v2**, negatives same paper, same tool | CD-HIT, 40% identity | 0.00% | 0.00% |

Twin = Levenshtein ratio of at least 0.80 against any training sequence. LRGB: n = 2,331 test rows against 10,873 train, and 66.24% of test rows also sit in a 0.80 single-linkage cluster that holds a training member. AMP Scanner v2: n = 712 per class per side. Measured 2026-10-17.

**The third row is why the first two are believable.** AMP Scanner v2 filtered its positives at 90% identity and its negatives at 40%: same paper, same tool, same pipeline. Our check returns a sixth of the test set on one and exactly zero on the other. A check that fired on both would be a false-positive generator. It also localises the damage, because the contamination sits entirely on the positive class, so it inflates sensitivity specifically rather than accuracy uniformly.

### When the control is applied, it does not reach zero.

The table above covers one benchmark with no homology control and one that reduced redundancy before splitting. **PepBenchmark** (ICLR 2026) is the harder case: it deduplicates during cleaning and its stated default split is a k-mer split followed by MMseqs2 clustering at 30% sequence identity. We measured every strategy it ships, five seeds each.

| PepBenchmark split strategy | E. coli MIC | Haemolysis HC50 |
|---|---|---|
| Random split | 66.54% | 77.42% |
| MMseqs2, 30% identity | 29.16% | 48.56% |
| CD-HIT | 19.11% | 30.52% |
| **Hybrid, the paper's default** | **29.97%** | **48.56%** |

Test rows retaining a Levenshtein twin of at least 0.80 in training, mean over 5 seeds. n = 321 and 194 test rows. Exact sequence overlap is 0.00% on every dataset, every strategy and every seed: their deduplication works at the exact level, and our duplicate check correctly finds nothing. Files pulled from the published HuggingFace dataset and hashed, 2026-10-17.

**The controls move in the right direction and never arrive.** Going from a random split to a 30%-identity MMseqs2 split removes between half and two thirds of the contamination, and leaves 29.97% and 48.56% behind. This is a different claim from the one above it. A benchmark with no homology control shows that people forget. A benchmark that ships the fix as its default shows that the standard representative-based tools do not deliver the separation the paper claims, because they under-merge on transitive chains of similarity.

### Why AMP Scanner v2 reached 0.00% and this does not

The two are not contradictory, and the distinction matters. AMP Scanner applied CD-HIT at 40% to the pool *before* splitting, which removes redundant sequences outright, so nothing similar survives anywhere. PepBenchmark clusters and assigns whole clusters to splits, which separates only to the extent the clustering merges everything it should. Redundancy reduction and homology-aware splitting are different operations and they fail differently.

### A second defect, found by inspection rather than by the check

In the same release, `kmer_split.json` and `random_split.json` are byte-different files with different checksums, but their train and test index sets are **identical across all five seeds on both datasets**. The k-mer motif split has silently collapsed into the random split. We report this because we found it, not because our checks caught it; they did not.

### What this does not establish

We have not retrained anything on corrected versions of these splits, so we have not measured what the leakage is worth in accuracy on any of these benchmarks. A contamination rate is not an inflation. The only inflation figure we have measured is our own, +0.065 on HC50, and it does not transfer to somebody else’s model.

For LRGB, of the 180 test rows that share a primary sequence with training, only 30 are the identical molecule by SMILES. For a sequence model all 180 are leakage; for the graph models LRGB actually benchmarks, the other 150 differ in stereochemistry or modification and are near-leakage. We state it as a shared primary sequence, never as duplicate molecules.

We redistribute neither dataset. LRGB Peptides-func is CC BY-NC 4.0, inherited from SATPdb; AMP Scanner v2 states no licence and its positives derive from APD3. We report measurements and link to their own download pages.

03 Data

## Corrected evaluation folds.

Rebuilt antimicrobial peptide MIC and HC50 folds using true transitive single linkage at 0.80, released under CC BY 4.0 with the leakage audit and the baselines. The standard split leaks 20.1% of its held-out rows; the same measure on ours is 0.0000.

[Open the dataset →](/data.html)
