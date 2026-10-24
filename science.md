<!-- Plain-markdown mirror of https://silicyte.com/science.html
     Generated for retrieval crawlers. The HTML page is canonical.
     Machine-readable measurements: https://silicyte.com/data/leakage-measurements.json -->

# Scorer intervention and evaluation limits

> Our starved scorer reported 21-fold computational improvement versus 3.5-fold for the intact arm. The experiment does not establish biological improvement or a causal mechanism. Methods, controls and limitations.

Canonical: https://silicyte.com/science.html

---
[**Silicyte**](/)

Evidence

# Research, methods and evidence.

Computational results with their methods, controls and limitations. This record also preserves corrections to earlier interpretations.

The intervention Why checks go blind The wrong error bar Evaluation corrections Where the limit is Result status

Research record

## Experiments and controls

Scoring sensitivityEvaluation correctionsResult status

01 The intervention

## Reported gains depend on the scoring procedure.

We tested the sensitivity of a reported design gain to the scoring model's training coverage. We withheld 80% of its training families and kept the separate measuring model fixed so both arms were evaluated with the same computational procedure. This intervention does not directly measure molecule quality.

**Withholding scorer training families increased the reported computational gain.** Intact scorer: the loop reported its molecules ended 3.5x better at killing bacteria relative to harming blood cells. Scorer given a fifth of the data: 21x better. In the units the field uses, that is +0.5421 against +1.3182, a difference of 0.7761 with a standard error of 0.0531, which is 14.6 error bars wide (t = −14.60). Three runs each, twelve arms in one allocation, job 12243941.

This intervention changed the reported computational metric. Without experimental outcomes it does not establish which arm produced better molecules or identify the causal mechanism. Shared scorer errors are a hypothesis to test. Six control loops run with scrambled rewards all stayed inside their pre-registered band of ±0.11, spanning -0.0851 to +0.0396. This is a control outcome for these runs, rather than proof that the full evaluation is free of defects.

**What this does not show.** It does not show the molecules got worse, and it does not establish why the effect inverts. A plausible account is that the scorer and the measuring model share a feature vocabulary, so a handicapped scorer pushes harder along a direction the measuring model also likes. This experiment does not test that. What it establishes is the sign and the size.

[Explore the peptide prediction demonstration](/demo.html)

02 Interpreting the control

## An independent metric still needs an appropriate uncertainty analysis.

In our retained-candidate experiments, averages varied with which candidates were selected. We examined a simple spread-based approximation under an independent-sample model. Pairing, dependence, selection and the relevant outcome variance can change that calculation. Prediction spread alone does not establish experimental resolution.

**Our historical approximation gave a 16% scale at 100 molecules kept.** And the changes we were asking it about ranged from 3% better to 18% worse. So six separate conclusions of "the independent check did not move" needed a better uncertainty analysis. The approximation alone does not establish that any individual effect was undetectable or statistically insignificant.

| Molecules kept | Approximation, not a detection threshold | Historical computed scale |
|---|---|---|
| 100 | 16% | 0.0645 |
| 200 | 11% | 0.0456 |
| 1,000 | 4.8% | 0.0204 |
| 3,250 | 2.6% | 0.0113 |

Predicted from the spread between individual molecules (0.4562 over 143 saved sets of winners); the predicted 0.0645 came back as 0.0570 in that particular check. This comparison does not calibrate a universal significance test. More observations or paired comparisons may improve precision, but covariance and selection must be accounted for. [Our browser tool](/check.html) now labels prediction spread as descriptive and does not issue an uncertainty verdict.

03 The wrong error bar

## The control is eight times noisier than the thing it controls.

When you want to know whether a result is real, the instinct is to look at how much the control run jumps around and treat that as the noise level. Here that instinct is wrong by a factor of eight, and we had been making exactly that mistake.

**Our real runs land in the same place every time. Our control runs scatter.** Repeating the real loop with fresh random seeds moved the answer by 0.0071. Repeating the control moved it by 0.0570. Selection is nearly deterministic, so the real loop keeps finding the same molecules; the control re-draws at random every time and pays the full sampling wobble from the section above. Neither one's scatter is the other's error bar.

Putting repeats on a number that already existed, rather than running a new experiment, changed what it said. Across six seeded repeats the real loop sits **about 14% below its own control** on the independent check: -0.0652 with a standard error of 0.0201, which is 3.2 error bars. That is the best-supported negative result we have, and it is a comparison of two arms on one fixed ruler, which is the kind of comparison that survives the measurement faults in the next section.

04 Evaluation corrections

## Six evaluation issues and their corrections.

The issues below affected earlier results. We retain the original context and corrections to make the research record traceable and the checks reproducible.

FAULT 01

### A rule that guarded a histogram, not the thing that mattered

We held the molecules' electric charge fixed so the loop could not cheat by drifting composition. The check reported a perfect match at every round while the actual charge slid by a third of a unit, because the rule worked in whole numbers and real charge is continuous: 30% of real antibacterial peptides sit between the integers.

FAULT 02

### A control that looked healthier than the real run

The same bug made the control arm hold its charge perfectly, because a control has no pressure to drift with. A control outperforming the treatment on a safety check is the signature of this bug, not reassurance.

FAULT 03

### Test molecules with near-twins in training

The routine separating training from testing described itself as one algorithm and implemented another, so 20% of supposedly held-out molecules had a near-identical partner in training while our test passed 826 of 826. The corrected split is published on the [data page](/data.html).

FAULT 04

### A diversity cap that cannot see the collapse

We capped how similar any two molecules could be. The winners still converged on one narrow family, with no single pair breaching the cap. Capping the worst pair removed 12% of the problem; bounding the average removed 82%.

FAULT 05

### A drift measure that reported zero while drifting

It compared the last round against the first, so a run sitting permanently off-target reported no drift at all.

FAULT 06

### A correlation that mishandled ties

Our earlier rank implementation mishandled tied values and affected reported correlations. The current browser checker uses average ranks for ties. Historical model results should be interpreted with their recorded evaluation and correction status.

The pattern connecting most of these: the guard was tested, and the test passed, but nobody measured the quantity the guard exists to bound. Current checks state the quantity measured, the available coverage and the remaining limits.

05 Where the limit actually is

## What our model experiments did and did not establish.

We tested particular changes in data quantity and model size. These experiments do not rule out better data or models. What we build is described on the [company page](/company.html).

**This particular data addition did not clear our improvement bar.** Adding 42% more laboratory measurements moved our scoring model's accuracy by between -0.004 and +0.007, against a threshold of +0.02 we had set in advance for calling it worthwhile. Going from 983 to 1,353 training examples moved it +0.003. This particular experiment does not establish whether additional or different data would improve another model or task.

**Historical fine-tuning comparison.** Our recorded comparison of frozen features and fine-tuning reported changes of +0.1192 for potency and +0.1577 for safety. These are computational results for that evaluation. A shuffled-label run scored -0.0228; one null run does not establish independence of every selection step. The fine-tuning result was not freshly reproduced in the October 16 descriptor-baseline rerun. See the [data record and limitations](/data.html).

06 Withdrawn

## Research corrections and result status.

Earlier claims are retained below with their current status and the evidence that changed their interpretation.

Withdrawn

### Our first headline result

We reported a large improvement in the kill-versus-harm ratio. Its own control, and then the independent check, overturned it. It was the scorer effect in section 01.

Void

### Two complete runs, discarded under our own rule

One drifted in composition, one breached its tolerance. Their results are recorded in our files only so that they can never later be presented as evidence.

Reinstated

### Accuracy figures inflated by our own leaking data split

Overstated by as much as 0.065 by fault 03, and withdrawn while the corrected-fold re-run ran. The fine-tuned model's score on that run is recorded at 0.5356 rather than the earlier 0.5219. This is a historical computational result; neither that comparison nor one shuffled-label run establishes independence of all selection steps.

Withdrawn

### Three conclusions that did not survive repeating the run

Including a setting we had called the best one, which lost to its alternative once we ran more than one random seed, and a claimed noise level that turned out to be 5 to 10 times too large because it mixed different configurations together.

Unmeasurable

### Three quality gates we had set below the noise

One required a run to stay within a tolerance that a control with nothing to learn exceeded by six times on its own. Zero of six repeat runs passed it, including the controls. The gates were mis-set, and we say so rather than claiming they were met.

Unverifiable

### One early result that cannot be rechecked

Its values were recorded to one decimal place and its molecules were overwritten by a later run. The data needed to verify it no longer exists, so it counts for nothing.

Working papers, pre-registration files and run logs for every figure on this page are available on request at [hello@silicyte.com](/company.html). Each carries its job identifiers.
