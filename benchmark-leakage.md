<!-- Plain-markdown mirror of https://silicyte.com/benchmark-leakage
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# 65% of a NeurIPS benchmark's test set has a near-duplicate in training

> I measured train/test sequence overlap in six published peptide and protein ML splits. LRGB Peptides-func 65.29%, AMPlify 63.47%, PepBenchmark's default 30%-identity split 29.97% to 48.56%, AMP Scanner v2 16.71% on positives and 0.00% on negatives, and FLIP meltome 0.29%. The clean one clusters at 20% identity and splits whole clusters.

Canonical: https://silicyte.com/benchmark-leakage

---
[**Silicyte**](/)

Measurement · 2026-10-17

# 65% of a NeurIPS benchmark’s test set has a near-duplicate in training.

I measured train/test sequence overlap across **thirteen published splits** from five benchmark families. Seven leak and six are clean. Then I measured what the contamination actually costs, against a gate fixed in advance, and the answer turned out to depend on the model: **null for a 26-feature baseline, +0.13 Spearman for a protein language model**, on identical data.

Every file is downloaded from its own published location and hashed at run time. For the LRGB row both checksums match the values hard-coded in that benchmark’s own loader.

| Published split | Homology control, as published | Exact overlap | Twin ≥ 0.80 |
|---|---|---|---|
| **LRGB Peptides-func** NeurIPS 2022 Datasets & Benchmarks | None. Stratified random split. | 7.72% | 65.29% |
| **AMPlify**, positive class BMC Genomics 2022 | None, by design (paper's Methods; see the correction below) | 0.00% | 63.47% |
| **AMPlify**, negative class same paper, same download, same run | None, by design (paper's Methods; see the correction below) | 0.00% | 30.18% |
| **PepBenchmark**, `hybrid_split` ICLR 2026, the paper’s documented default | k-mer, then MMseqs2 at 30% identity | 0.00% | 29.97% / 48.56% |
| **AMP Scanner v2**, positive class Bioinformatics 2018 | CD-HIT at 90% identity, pool filtered before splitting | 0.00% | 16.71% |
| **AMP Scanner v2**, negative class same paper, same tool, same run | CD-HIT at 40% identity, pool filtered before splitting | 0.00% | **0.00%** |
| **FLIP meltome**`mixed` NeurIPS 2021, full-length proteins | MMseqs2 at **20%** identity, whole **clusters** assigned 80/20 | 0.00% | **0.29%** |
| **FLIP meltome**`human` same benchmark, human proteins only | as above | 0.00% | **0.05%** |
| **FLIP meltome**`human_cell` same benchmark, human cell lysate | as above | 0.00% | **0.00%** |
| **FLIP scl**`mixed_hard` different task: 10-class localisation | as above | 0.00% | **0.00%** |
| **FLIP conservation**`sampled` same benchmark, random split | Random 95/5. No clustering. | 0.00% | **0.00%** |
| **FLIP secondary_structure**`sampled` same benchmark, same random design | Random 95/5. No clustering. | 0.00% | **65.38%** |

**Correction, 25 Oct 2026.** This table first said AMPlify's homology control was "not documented in the repository". Its maintainers replied on [issue #21](https://github.com/BirolLab/AMPlify/issues/21) (22 Oct): near-identical sequences were kept deliberately, as the paper's Methods explain, because a single amino-acid substitution can change or abolish antimicrobial activity. They also point to the paper's Fig. 2, which evaluates AMPlify and other tools on test subsets filtered by similarity to each tool's training set and, they report, finds AMPlify ahead at every threshold. That is the paired control a contamination rate lacks, and it was in the paper; we had not read the full paper before measuring. The 63.47% and 30.18% stand as measured; what they cost in reported performance is the question Fig. 2 addresses and this table does not.

“Twin” means a Levenshtein ratio of at least 0.80 against any training sequence. LRGB: 2,331 test rows against 10,873 train. AMPlify: 835 test rows per class; 3,338 train for the positive class. PepBenchmark: mean over its five shipped seeds, on `antimicrobial_E_coli_mic` and `hemolytic_hc50`. AMP Scanner v2: 712 per class per side. FLIP meltome: 3,134 against 24,817, of which 20,206 unique.

01 The six clean rows

## They are why the rest of the table is believable.

If a check reports contamination everywhere, it is a false-positive generator and you should ignore it. This one returns **0.00%** five times and **0.29%** once, on six splits I had no hand in, from two different groups, across peptides and full-length proteins and across regression, 10-class classification and per-residue prediction.

The AMP Scanner v2 pair is the sharpest single version. One paper, one tool, one preprocessing run, two classes: positives filtered at 90% identity come back at 16.71%, negatives filtered at 40% come back at exactly zero. The check discriminates on the threshold alone. It also localises the damage, because contamination confined to the positive class inflates *sensitivity* specifically rather than accuracy uniformly.

FLIP matters for a different reason: it is the only benchmark here that appears on both sides of the table, and that contrast is the most useful thing on this page. See the correction below.

02 What actually separates them

## 30% identity was not enough. 20% with cluster-level assignment was.

Both PepBenchmark and FLIP do the right thing in principle: cluster by sequence identity, then assign to splits. They land 100x apart.

| Benchmark | Threshold | Unit assigned to the split | Twin ≥ 0.80 |
|---|---|---|---|
| PepBenchmark `hybrid_split` | 30% | k-mer group, then MMseqs2 | 29.97% / 48.56% |
| FLIP meltome `mixed` | 20% | whole MMseqs2 cluster | **0.29%** |

Representative-based clustering compares each sequence to cluster *representatives* rather than to every member. On a transitive chain where A resembles B and B resembles C but A does not resemble C, the chain gets broken and relatives land on opposite sides. Lowering the threshold makes the chains harder to break, and assigning whole clusters rather than looser groupings stops the break from crossing the split boundary.

This is the same defect I found in my own pipeline first: a splitter whose docstring described single-linkage clustering and which actually performed greedy first-match assignment. Every check I had written passed, because none of them measured the quantity the guard existed to bound. That is how I knew to look here.

**A second thing, found by reading rather than by the check.** In the PepBenchmark release, `kmer_split.json` and `random_split.json` are byte-different files with different checksums whose train and test index sets are identical across all five seeds, on both datasets. The k-mer motif split has collapsed into the random split.

02a The correction

## One benchmark sits on both sides of the line, and that is the finding.

Earlier today this page said FLIP was clean on four splits out of four. I then measured three more and one of them is not clean at all.

| FLIP split | How it is built, per FLIP’s own README | Twin ≥ 0.80 |
|---|---|---|
| `meltome/mixed`, `human`, `human_cell` | MMseqs2 at 20% identity, whole clusters assigned | 0.29% / 0.05% / 0.00% |
| `scl/mixed_hard` | cluster-based | 0.00% |
| `conservation/sampled` | “Randomly split sequences into train/test with 95/5% probability” | 0.00% |
| `secondary_structure/sampled` | the same sentence, verbatim, in its own README | **65.38%** |

The two random splits are built by the identical documented procedure and both carry FLIP’s green status marker. They land at opposite ends of the table. So the variable here is not the split method at all. It is how redundant the underlying corpus is: the PDB is full of near-identical chains, and the conservation sequences are not.

**This sharpens the rule rather than breaking it.** “Cluster your splits” was never the whole story. A random split is perfectly safe when the corpus is not redundant, and badly unsafe when it is, and there is no way to know which case you are in without measuring. That is the argument for measuring, and it is a better argument than the one I had this morning.

Measured but excluded: `FLIP bind` returns 98.33% on its `from_publication` split. I am not reporting that as leakage. Its six splits test generalisation across *ligand type* (`one_vs_many`, `one_vs_sm`, `one_vs_sn`), not across sequence similarity, so the same protein recurring with a different ligand is the design rather than a defect. A sequence-overlap number there does not mean what it means elsewhere on this page.

02b A result I am not counting

## Peptides-struct is the same split, not a second data point.

LRGB ships a second peptide task, Peptides-struct, and measuring it returns 7.72% exact and 65.29% twins: identical to Peptides-func to the digit. That is not a confirmation, and I am not presenting it as one.

The structure dataset file is genuinely different (`9786061a34298a0684150f2e4ff13f47`, matching the loader). But `splits_random_stratified_peptide_structure.pickle` hashes to `5a0114bdadc80b94fc7ae974f13ef061`, **byte-identical to the func split**, and its train, val and test index sets are identical as sets. LRGB uses one split for both peptide tasks over the same 15,535 molecules; only the label column differs. So this is the same computation on the same sequences, and counting it twice would be the exact error this page is about.

The honest framing is stronger than the double-count would have been: **a single contaminated split sits underneath both LRGB peptide leaderboards** and the thirty-plus published models scored on them.

03 Reproduce it

## Three scripts, no credentials.

Each downloads the benchmarks’ own published files and hashes them at run time.

 git clone https://github.com/braxtonmensah/silicyte-design-loops
 cd silicyte-design-loops/thirdparty
 pip install rapidfuzz numpy
 python verify_thirdparty.py # LRGB + AMP Scanner v2
 python verify_pepbench.py # PepBenchmark, 4 strategies x 5 seeds
 python verify_more.py # AMPlify + FLIP meltome mixed
 python verify_sweep.py # FLIP human/human_cell/scl + Peptides-struct

LRGB data `701eb743e899f4d793f0e13c8fa5a1b4` and split `5a0114bdadc80b94fc7ae974f13ef061`, both matching the values hard-coded in `graphgps/loader/dataset/peptides_functional.py`. AMP Scanner v2 zip `c32196cca2f4ac9adf728409e4129797`. FLIP meltome splits.zip `72b9257e8d6714d203c64bedaef0724e`.

03b What the contamination actually costs

## It depends on whether your model can exploit it.

Everything above is a contamination rate, and this page said for a long time that a rate is not an inflation. So I measured the inflation, against a gate written down [before anything was trained](https://github.com/braxtonmensah/silicyte-design-loops/blob/main/thirdparty/PREREG_INFLATION.md): support needed 0.03 Spearman with the same sign in four of five seeds.

PepBenchmark makes this unusually clean. It ships four split strategies over the *identical rows*, five seeds each. Same data, same labels, same ridge, same averaged penalty grid. I ran it twice, changing only the features.

| Features | random | mmseqs2 | hybrid | cdhit | random − cdhit | Verdict |
|---|---|---|---|---|---|---|
| 26 hand-built descriptors | +0.4771 | +0.4920 | +0.4700 | +0.4871 | −0.0100 | null |
| **ESM2-35M embeddings** | **+0.5798** | +0.4997 | +0.4795 | +0.4497 | **+0.1301** | **supported** |

Held-out Spearman on `antimicrobial_E_coli_mic`, mean over PepBenchmark’s five shipped seeds. ESM2 arm: SE 0.0143, every one of five seeds positive (+0.1039, +0.1704, +0.1491, +0.0927, +0.1344). Contamination on those two splits is 66.54% and 19.11%.

**The same contaminated split is worth nothing to one model and 0.13 to another.** A 26-feature descriptor model has nowhere to store a particular near-twin, so 66.54% contamination buys it nothing and the comparison comes out flat. A 480-dimensional protein language model representation can carry enough about a specific sequence that a near-duplicate in training is worth 0.13 Spearman. The difference in measured inflation between the two is +0.1401, on identical data.

### Why this matters more than another rate

**A contamination rate on its own does not tell you what your evaluation is worth.** You need the rate and the model, because capacity is what converts near-duplicates into score. That is the thing I could not say this morning and can say now, and it is the reason to measure rather than to assume.

### What stayed null, which is most of it

`hemolytic_hc50` is null under *both* models: +0.0734 with descriptors and +0.0744 with ESM2, and in both cases the sign holds in only three of five seeds, so the pre-registered sign condition fails. Per-seed on the ESM2 arm it runs +0.0516, −0.0108, −0.0190, +0.1440, +0.2061. That set has 1,926 rows against 3,204, which is the obvious explanation and one I have not tested.

**One of four dataset-model cells is supported.** The effect is real where it appears and it is not universal, and anyone quoting the 0.13 without that sentence is quoting me badly.

### And a weak model can be inflated too, if contamination is severe

On LRGB Peptides-func, at 65.29% contamination, the plain descriptor ridge scores +0.0333 macro-AP higher on the shipped split than on the [identity-separated one I built](/data/lrgb-corrected-v1/) (SE 0.0015, five of five rebuilds). So severity and capacity both matter, and separating them is the next experiment rather than a conclusion.

Limits worth stating plainly: ridge on *frozen* embeddings, not a fine-tuned encoder and not a GNN, so none of this transfers to PepBenchmark’s or LRGB’s leaderboard numbers. ESM2-35M is the smallest ESM2 there is. One benchmark, two datasets, four cells. The capacity story is a hypothesis with one contrast behind it.

04 Limits

## What this does not show.

**A contamination rate is not a score inflation.** I retrained nothing on corrected versions of these splits, so I have not measured what any of it is worth in reported accuracy. Anyone quoting these as “benchmark X is overstated by Y points” is quoting something I did not measure.

**For LRGB, only 30 of the 180 exact matches are the same molecule.** 180 test rows share a primary sequence with training and 30 of those also share a SMILES. For a sequence model all 180 are leakage; for the graph models LRGB is actually used to benchmark, the other 150 differ in stereochemistry or modification and are near-duplicates rather than duplicates. I say “shares a primary sequence” and never “duplicate molecule”.

**Pool filtering and split-aware clustering are different operations.** AMP Scanner’s 40% filter removed redundant sequences from the pool entirely, so nothing similar survived anywhere. PepBenchmark and FLIP assign clusters to splits. The first can reach zero trivially by deleting data; the second cannot do better than its clustering. The rows are not in tension.

**0.80 Levenshtein is a choice,** and it is the threshold the evaluations I work with are meant to mimic. The scripts take it as a parameter and the rates at 0.85, 0.90 and 0.95 are in the output.

**PepBenchmark published redundancy rates of its own, and they are not these.** Its paper reports per-dataset redundancy in Appendix D.1 and Table 10, measured at 90% MMseqs2 identity over the raw corpus, ranging from about 19% to 47% across its datasets, and it states plainly that near-duplicate peptides promote memorisation. Those figures overlap the range I report almost exactly, and they are a different quantity. Theirs describes how redundant the corpus is *before* a split is drawn. Mine describes what survives *after* their own 30%-identity control has been applied, at a different threshold, between the train and test sides specifically. The authors identified the redundancy; the open question was whether their control removed it, and the answer I measured is that it removes between half and two thirds. They also name a k-mer leakage mechanism without quantifying it, which remains unmeasured by anyone as far as I can find.

**The existing critique of LRGB does not look at the data.** Tönshoff, Ritzert, Rosenbluth and Grohe ([arXiv:2309.00367](https://arxiv.org/abs/2309.00367), TMLR 2024) re-ran the LRGB baselines and concluded the reported advantage of graph transformers was substantially an artifact of hyperparameter choice, feature normalisation and the link-prediction metric. That is a different and well-established finding, and it concerns the models rather than the split. I am not restating it.

**Related work, and a connection I have not tested.** Adamczyk, Ludynia and Czech ([arXiv:2501.17901](https://arxiv.org/abs/2501.17901), also in *Bioinformatics* 42(5)) show that count-based molecular fingerprints with short-range features outperform GNNs and transformers across LRGB and five other peptide benchmarks, which challenges the assumption that long-range interaction modelling is necessary. They do not measure sequence overlap, and I am not claiming they did. But the two results sit next to each other in an interesting way: if 65% of test rows have a close relative in training, a model that can recognise local motifs has a route to a good score that does not require learning the property. That is a hypothesis about a mechanism, it is not something I have tested, and testing it would mean retraining both model families on corrected splits.

**A stronger version of this argument already exists, and it is not mine.** Mattsson and Walters, in work covered by Derek Lowe in July 2026, show for protein-ligand affinity that a ligand-only baseline carrying no protein information at all still reaches r = 0.66 on one standard benchmark, and that leakage persists even at very low sequence identity. If that generalises, the problem is not that 30% was the wrong threshold but that sequence identity is the wrong axis to split on. My result is consistent with theirs and weaker than it: I show a specific control underperforming, not that the whole approach is unsound.

**What I deliberately did not measure, and why.** FLIP’s `aav` and `gb1` tasks, ProteinGym, and TAPE’s fluorescence and stability tasks are single-parent mutant libraries: every sequence is a variant of one wild type, so an edit-distance check returns about 100% by construction. The number would be real and meaningless. Running them to make the table longer would be the same kind of move this page criticises. FLIP’s `bind` is measured and excluded for the reason given above: its splits control for ligand type, not sequence identity.

**Homology leakage is not a new concern.** It is well documented in general. The only thing I am adding is the measurement on these specific published splits, and the comparison between the ones that handled it and the one that handled it well.

I found this class of defect in my own work first, along with three others, and withdrew the claims that depended on them. That record is in [the paper](/papers/design-loops.html), including the register of what I retracted.

05 Your turn

## Check your own evaluation table.

The same check runs in your browser on a CSV, with no account and no upload. If it finds nothing, that is a useful result too, and two of the six rows above are exactly that.

[Run it on your data →](/check.html) [Source ↗](https://github.com/braxtonmensah/silicyte-design-loops)
