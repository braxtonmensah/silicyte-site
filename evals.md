# Silicyte evals: biology tasks a program can grade

Silicyte builds evaluation tasks for AI systems in therapeutic and basic biology. Every task comes with a key a program
scores, a deterministic grader, controls that must fail, and a log of attempts to fool the grader.

A free sample of **4 tasks** is public on GitHub and graded in GitHub Actions on every push:
https://github.com/braxtonmensah/silicyte-bio-evals-sample. Read the graders, run them, try to break them.

Checkable task data is not a new idea: established data vendors already sell verified tasks. The sample is here so you
can judge our work by its controls and its reward-hack logs, not by our description of them.

For AI labs and AI-for-science teams: a **10-task pilot**, ten tasks in your area of biology with private keys,
graders, controls and hack logs. Price quoted within 48 hours. Therapeutic and basic science only.

## 01 What a checkable task is

A model learns whatever its scorer rewards. In Silicyte's own published research, deliberately degrading a design
loop's scoring model made its reported gain 2.4 times larger (t = -14.60, DOI 10.5281/zenodo.23441786;
/papers/design-loops). So each task we ship carries six things, and CI checks all six:

1. **A prompt with the conventions written out**, so there is exactly one right answer.
2. **A key a program scores**, rebuilt from the source data on every CI run; CI fails if the rebuilt key differs from
   the committed one by a single byte.
3. **A deterministic grader**: no model calls, no randomness, no network.
4. **Controls that must fail**: shuffled labels, plus the near-miss answer each common convention error produces.
5. **A reward-hack log**: attempts to fool the grader and whether each was caught, generated from the grader's actual
   verdicts.
6. **Provenance**: every data file's URL, license and SHA-256, checked on every run. CC0 and CC BY 4.0 sources only in
   the sample.

## 02 The free sample

Every figure below is read from the CI run linked at the end of this section.

| Task | What the model must produce | PASS requires | Controls failed | Hacks caught |
|---|---|---|---|---|
| Trastuzumab epitope on HER2 (PDB 1N8Z, CC0) | The 17 HER2 residues within 4.0 A of the Fab, which chain contacts each, the closest Fab residue and the distance | Exact set and fields; distance within 0.01 A | 5 of 5 | 15 of 16 |
| PTEN variant abundance (MaveDB VAMP-seq, CC0) | Abundance predictions for 780 missense variants at 60 positions held out entirely | Spearman >= 0.66 (best of four cheap baselines: 0.558) | 3 of 3 | 11 of 12 |
| Gene Ontology enrichment (GO release 2026-08-05, CC BY 4.0) | Universe size, tested-term count and the 22 significant terms, under 13 written conventions | Exact; q within 1e-4 relative | 7 of 7 | 9 of 10 |
| Signal peptide cleavage (UniProt 2026_03, CC BY 4.0) | The signal peptide length of 100 anonymised human proteins | Exact for >= 71% (best of four cheap baselines: 61%) | 4 of 4 | 10 of 11 |

In total, 19 of 19 controls fail and 45 of 49 reward-hack attempts are caught. The 4 that are not caught are the same
attempt, once per task, listed on purpose: **copying the public key**. A public sample cannot hide its key, and two of
the four use labels that are public in MaveDB and UniProt. Paid tasks keep keys private and can use unpublished data.

What the near-miss controls show: in the GO task, keeping electronically inferred annotations moves the universe from
16,846 genes to 17,478, and following "regulates" edges moves the tested-term count from 7,149 to 7,419. In the HER2
task, selecting atoms by chain letter alone adds 3 water molecules that carry chain ID C. One convention error,
one FAIL.

Source: CI run 40433262658 (https://github.com/braxtonmensah/silicyte-bio-evals-sample/actions/runs/40433262658), files `tasks/*/key_meta.json` and `tasks/*/REWARD_HACK_LOG.md` in the repository.

## 03 How hard: two of four stumped a frontier model, two did not

We judged difficulty three ways. First, the two prediction tasks set their bar 0.10 above the best of four cheap
baselines, fixed before any model was run. Second, the two exact tasks fail on any one convention error, as the
controls above show. Third, we ran a blind test.

In the blind test, a Claude Opus 5.5 agent saw only each prompt and its inputs (no keys, no internet), could not run
code, and wrote one solution script per task, which CI ran once. It **passed 2 of 4**. It reproduced the HER2 epitope
and the GO enrichment exactly: those two tasks test exact execution of a written-out analysis rather than stump a
frontier model, and the blind pass doubles as an independent check that each has one right answer. It failed the two
prediction tasks: on PTEN it reached Spearman 0.590, above every cheap baseline but under the 0.66 bar, and its signal
peptide script crashed before writing an answer. One model, one shot, no execution: an agent that can run code and
retry will do better. Full record: DIFFICULTY.md in the repository.

## 04 The 10-task pilot

1. **Tell us the area.** Email hello@silicyte.com with the biology you want tested, the model behaviour you care about,
   and any data you want used.
2. **Quote within 48 hours.** Scope, deliverables, delivery date and a fixed price, in writing.
3. **Ten tasks.** Each with a prompt, private key, deterministic grader, controls that must fail, a reward-hack log
   and per-file provenance, plus a CI workflow that checks all of it.
4. **You check it.** Run the graders yourself. A task whose control passes or whose key fails its own grader is fixed
   before the pilot is accepted.

- Price: quoted within 48 hours, fixed, in writing
- Scope: therapeutic and basic biology: structure, variants, genomics, protein biochemistry, assays
- Not offered: anything that would make AI systems more capable of producing biological, chemical or other weapons.
  Every task is screened first (DUAL_USE_SCREENING.md in the repository)
- Status: early-stage and founder-led; a working brand, not yet incorporated

Contact: hello@silicyte.com

## 05 Plain terms

The sample is free under MIT (code) and CC BY 4.0 (task text and keys); data files keep their source licenses. It is a
sample, not a benchmark: four tasks say little about any model's biology ability in general. We use AI tools in our
own work, including to build these tasks, and say so; every number on this page comes from the CI run, not from our
reading of it. If you find a grader bug, report it on GitHub (issue template "Break the grader") and it becomes a CI
test case with your name on it.
