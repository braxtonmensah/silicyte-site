<!-- Plain-markdown mirror of https://silicyte.com/company
     Generated for retrieval crawlers. The HTML page is canonical.
     Pre-registration of the current test: https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md -->

# About Silicyte

> Silicyte is a solo, unincorporated research venture founded by Braxton Mensah in October 2026. It runs pre-registered, compute-matched tests of whether AI self-improvement compounds, starting with Silicyte Ratchet (silicyte-0119) on 400 sealed ARC-AGI-1 tasks. Result pending. $0 revenue, 0 customers.

Canonical: https://silicyte.com/company

---
[**Silicyte**](/)

About Silicyte

# Does AI self-improvement actually compound?

Silicyte is a one-person research venture that runs pre-registered, compute-matched tests of whether AI self-improvement compounds, and publishes the result either way, including a null.

AI systems now write the tools, prompts and code that their next round runs on. Whether that loop gets better faster than the same compute spent without it is an open question, and most reported gains are chosen on the same tests they are reported on. So each Silicyte test seals its test set before any model call, fixes its comparison arms and its prediction in public, and only then runs. Founded by Braxton Mensah in October 2026.

Stage, stated plainly: one founder (design and code AI-assisted, disclosed); $0 revenue, 0 customers; a working brand, not incorporated; silicyte-0119 registered 4 Nov 2026. [Follow Silicyte on LinkedIn ↗](https://www.linkedin.com/company/silicyte/)

01 The current test

## Silicyte Ratchet (silicyte-0119).

At equal total tokens, does a library of verified Python helpers that keeps growing round after round (STOCK) solve more of 400 sealed ARC-AGI-1 evaluation tasks than the same library frozen after round 1 (STATIC), the same tokens spent in one round (ONE-SHOT), verified whole programs shown in context (EXEMPLAR), a size- and genre-matched library of unverified code (SHAM), and no library with every token spent as extra samples (FLAT-TTC)?

Two planted positive controls, PLANT-DRIP and PLANT-L1, must show that the harness can see a library at all. If they fail, the run is reported as VOID, not as a null. The loop never reads the sealed tasks; their id list was hashed before any run (sha256 `911bf838d8843606d5fc1ba0550a0c23670027bf8f6e32e4e4fbf93854957ddd`).

Registered 4 Nov 2026 at 16:46 ET as silicyte-0119; the pre-registration was committed at 16:47 ET (commit [cc5fb5b](https://github.com/braxtonmensah/ratchet/commit/cc5fb5b)), before any model call. Our registered prediction for STOCK minus STATIC is **+2 of 400**, 80% band [-8, +14], and [-10.68, +17.216] after calibration against our own record. We put the chance that it COMPOUNDS under the registered decision rule at 0.15. **Result: pending.** If it reads null, we publish the null and drop library compounding as the thesis.

This is an evaluation, not a new method: it applies the compute-matched protocol of Berlot-Attwell et al. to ARC program libraries. Prepared with AI assistance; not peer reviewed.

[Read the pre-registration ↗](https://github.com/braxtonmensah/ratchet/blob/main/PREREG.md) · [Watch the repository ↗](https://github.com/braxtonmensah/ratchet)

02 Earlier work, with its correction

## Our own best number did not reproduce.

On one Windows laptop running one operator's fleet of Claude Code agents, one guardrail was absent on **29.8%** of the 103,850 calls it existed to check, rising to 53.1% with 11 or more agents at once. The cause there was process start-up; after the fix they were absent on 0 of 2,211 live calls at lighter load, and when heavy load returned, on 5 of 8,055 calls at 11 or more agents. On clean public GitHub runners, synthetic load gave a median of **0.0000** absence at a 15 s budget in every cell up to 24 agents (one repeat of three in one cell read 0.0354). The effect belongs to that laptop, not to agent fleets in general. [The laptop measurement and its limits](/refusal-uptime) · [clean-runner reruns](https://github.com/braxtonmensah/refusal-uptime/tree/loadtest-results).

Before that, Silicyte studied how data separation, metric implementation and scoring choices affect which molecules a design loop ranks highest. In our own peptide-design experiment, withholding training families from a scoring model made the reported computational gain 2.4 times larger (t = -14.60; evidence archive [DOI 10.5281/zenodo.23441786](https://doi.org/10.5281/zenodo.23441786)). This is evidence of sensitivity to the scoring procedure. Independent experimental outcomes are needed to establish which candidates are biologically better.

The research record includes methods, controls, limitations and corrections so readers can inspect what each result supports.

[Explore the earlier research →](/science)

Probe

### Refusal uptime probe

Open-source, standard-library Python that computes each Claude Code hook's refusal uptime from your own transcripts, on your own machine.

[Get the probe ↗](https://github.com/braxtonmensah/refusal-uptime)

Tool

### Peptide evaluation diagnostics

Check supported sequence tables for overlap and metric issues. The checker abstains when inputs or coverage do not support a conclusion. Free; runs in your browser.

[Open the checker →](/check)

Data

### Released evaluation folds

MIC and HC50 peptide folds with a stated similarity rule, historical baseline records and release corrections.

[Review the dataset →](/data)

Demonstration

### Peptide prediction workflow

An interactive view of computational predictions and their limits. Demonstration outputs are not measurements of a submitted peptide.

[Explore the demonstration →](/demo)

03 Research practices

## Clear scope. Traceable evidence.

Every test is registered before it runs, with its arms, decision rule and prediction fixed in a public commit. Changes after registration are appended as amendments, never edits. Nulls and VOID runs are published like any other result.

We do not claim prospective laboratory validation of any designed candidate. The agent measurements come from one operator's fleet on one laptop and did not reproduce on clean runners; they are not a survey of other fleets. Earlier computational results and their corrections are documented on the [science page](/science).

AI tools support the design, software and analysis, and we say so. Their use does not establish scientific validity; reproducible methods, appropriate controls and experimental evidence determine what a result can support.

Paid services are paused while the Ratchet test runs: the evaluation sprint, result audits, the 10-task eval pilot and the expert bench are not on offer, and nothing on this site is for sale.

[Read the research corrections](/science#withdrawn) · [Dataset release notes](/data/CORRECTIONS-2026-10-16.md)

04 Stage and contact

## Critique the design before the result.

If you see a flaw in the pre-registration, the most useful time to say so is now, before the sealed read: open an issue on the [ratchet repository](https://github.com/braxtonmensah/ratchet) or email Braxton. The result will be posted to the repository and to the [Silicyte LinkedIn page](https://www.linkedin.com/company/silicyte/) whatever it shows.

- Founder: [Braxton Mensah](https://www.linkedin.com/in/braxtonmensah), founder and sole investigator
- Team: one person. Design and implementation are AI-assisted, and disclosed
- Revenue and customers: $0 revenue, 0 customers
- Registration: a working brand, not incorporated
- Founded: October 2026
- Location: South Jordan, Utah, United States
- Also: Braxton trained and served his own system for ARC Prize 2026; official results are due 4 Dec 2026
- Follow: [linkedin.com/company/silicyte](https://www.linkedin.com/company/silicyte/) · [github.com/braxtonmensah/ratchet](https://github.com/braxtonmensah/ratchet)

[hello@silicyte.com](mailto:hello@silicyte.com)
