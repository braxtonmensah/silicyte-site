# Corrected split for LRGB Peptides-func, v1

A drop-in replacement for `splits_random_stratified_peptide.pickle`, built so that no held-out
sequence has a close relative in training.

**File:** `lrgb_peptides_func_singlelinkage080.json`
**Licence:** CC BY 4.0. **Built:** 2026-10-17.

## The numbers, both from the same run

| split | test rows with a train twin at Levenshtein ratio >= 0.80 |
|---|---:|
| LRGB's shipped `splits_random_stratified_peptide.pickle` | **65.29%** |
| this file | **0.0%** (0 of 2,331) |

Exact sequence overlap is 0 as well. The control matters as much as the result: the same script
that reads 0.0% here re-measures LRGB's original at 65.29% in the same execution, so the
instrument is demonstrably unchanged between the two readings.

## Method

Transitive single-linkage clustering (union-find) over all 14,665 unique `peptide_seq` values at
Levenshtein ratio 0.80, giving 6,339 clusters, then **whole clusters** assigned to folds.

Representative-based clustering, which is what the common tools do, compares each sequence only to
cluster representatives. On a transitive chain where A resembles B and B resembles C but A does not
resemble C, the chain breaks and the related sequences land on opposite sides of the split. Single
linkage does not break those chains.

Proportions are held at LRGB's own **10,873 / 2,331 / 2,331**, so this is a drop-in: nothing in a
loader changes except the path.

## Format

```json
{"method": "...", "source_data_md5": "...", "rebuilt_twin_pct": 0.0,
 "splits": {"train": [ints], "val": [ints], "test": [ints]}}
```

The integers index rows of `peptide_multi_class_dataset.csv.gz` in file order, the same convention
as LRGB's pickle. Source data md5 `701eb743e899f4d793f0e13c8fa5a1b4`, source split md5
`5a0114bdadc80b94fc7ae974f13ef061`, both matching the values hard-coded in LRGB's own loader.

## What this does not claim

It does not claim that scores on LRGB's original split are wrong by any particular amount. **No
model was retrained to produce this file**, so it carries no inflation figure. A contamination rate
is not an inflation, and in a separate pre-registered test on a different benchmark the inflation
came back null; see https://silicyte.com/benchmark-leakage.html

It also does not claim 0.80 is the right threshold for every purpose. It is the threshold the
evaluations in this area are usually meant to mimic, and the builder takes it as a parameter.

Rebuild it yourself:
https://github.com/braxtonmensah/silicyte-design-loops/blob/main/thirdparty/build_lrgb_split.py
