---
title: 'Elections on measured stakes (crosspost)'
description: 'Text-and-image version of the interactive post, for LinkedIn, Medium, and Substack'
pubDate: 'Jul 11 2026'
heroImage: './elections-on-measured-stakes-hero.png'
draft: true
---

Subtitle: An election model where every input except perception is
measured. At perfect information, fixed platforms turn on a $4-a-year
residual — and platforms that can move get disciplined to the status
quo.

Canonical: https://maxghenis.com/blog/elections-on-measured-stakes/

---

Do elections pick the policy that's better for people when voters
misperceive what policies would do to them? Models of that question
usually invent the decisive input: who stands to gain how much.
Democrasim (github.com/MaxGhenis/democrasim) measures it.

The electorate is 120,408 voting-age adults from PolicyEngine's
certified, population-calibrated microdata, representing 268 million
people (I co-founded PolicyEngine; this is a personal project using its
open data and models). The two platforms are actual encoded reforms with
opposite incidence, labeled generically: Policy A raises the child tax
credit base from $2,200 to $3,200 ($39.1B a year); Policy B caps the top
two marginal rates at 34% ($38.0B) — within 3%, so neither is simply the
bigger giveaway. Each voter's stake is the engine's answer for their own
household; a per-adult levy makes each policy budget-neutral, and
log-utility welfare ranks A above B. Perception is the one assumption:
each voter sees their own stake plus noise σ and an optional shared
bias, then votes their household by plurality.

[IMAGE: margin distribution figure — elections-on-measured-stakes-margins.png]

Gross of financing, 76% of adults see about $0 from both policies.
Policy A's gains arrive in per-child steps for the 20% of households
with children; Policy B sends 99.7% of its dollars to the top decile.
Financing hands the untouched majority a margin of a few dollars — the
two levies differ by $4.10 per adult per year — so 75% of adults have
less than $25 riding on the outcome while a fifth have more than $500.
Election models typically assume Gaussian or uniform stakes; neither
looks anything like this.

Three results (the interactive version at the canonical link runs the
real math in your browser):

**1. Perfect information elects the welfare-inferior policy 100% of the
time.** The 76% whose entire stake is the levy difference vote their
four dollars, and with the 3% who gain from the rate cap they outnumber
the fifth of adults in child households.

**2. Moderate noise fixes it.** At σ = $1,000, Policy A wins essentially
every election: the four-dollar voters become coin flips that cancel,
and the informed high-stakes minority decides. Misperception helps.

**3. Bias is the cheap attack.** About $221 per voter per year of shared
misperception flips the election that $1,000 of independent noise cannot
touch.

The perfect-information result is a knife-edge with a precise anatomy:
at σ = 0 the outcome rests on the sign of the $1.1B residual cost gap
between the policies — an artifact of budget-matching them within 3%. In
the counterfactual where B costs 3% more instead of less, perfect
information elects A every time. And the mass only rules while it votes:
with no financing its stake is exactly $0 and it abstains, with a $25
indifference band it abstains, and under approval voting it approves
neither policy — in all three cases perfect information tracks welfare
on about 24% turnout. Elections count people, not dollars.

Scale moves the thresholds. The tracking window at 10,001 voters spans
accuracy 0.52 to 0.69, but the entry point is Condorcet jury arithmetic
that falls toward 0.50 as the electorate grows; a threshold that doesn't
state its n is a sample size, not a finding. And noise and bias are
different objects: elections here tolerate large independent error and
flip on small shared error.

**Let the candidates move, and the verdict on information flips.** Make
the platforms choices — two dials, how much credit increase and how deep
a rate cap — picked by two candidates who are themselves households from
the data (a three-child household at $109,693 with +$1,133 riding on the
credit; a childless household at $578,540, the median-income member of
the rate cap's winners, with +$4,655 on the cap). Each values an enacted
position in dollars: own household change plus society's
equally-distributed-equivalent income change, mixed by a selfish weight.
Every pure Nash equilibrium is computed exactly.

[IMAGE: equilibrium platform intensity vs noise — elections-on-measured-stakes-strategic.png]

At σ = 0 every equilibrium enacts the status quo — which log welfare
ranks above both financed programs — whatever the candidates want: any
program is a levy, any levy hands the opponent a cheaper platform, and
competition undercuts to zero. Accurate voters graded fixed policies on
a welfare-irrelevant residual; they discipline chosen policies to the
welfare optimum. Noise dissolves that discipline — by σ = $10,000 both
candidates run their full programs (enacted blend 0.65 credit / 0.25
cap), and by $30,000 the election between the two full programs is a
0.545-to-0.455 coin flip that erases even the head-count advantage of a
program whose winners are a fifth of adults over one whose winners are
3%.

**Voters with mixed motives repair it cheaply.** Give voters the same
dollar-scale utility — own stake weighed against the policy's societal
value under their own inequality aversion. The societal signal between
these policies is $209.77 per household versus the knife-edge voters'
$4.10 margin, so putting under 4% of utility weight on society flips
perfect-information tracking from 0 to 1. At the noisy end, tracking at
σ = $30,000 runs 0.55 → 0.69 → 0.90 → 1.0 as selfish weight falls from 1
to 0. The strongest pairing: purely selfish candidates against a noisy
electorate with a 10% informed-sociotropic minority enact the status quo
at every noise level — the bloc deterministically punishes whichever
candidate proposes the more welfare-negative program (at a 2% share the
game has no pure equilibrium at all; best responses cycle). And the bloc
beats diffuse goodwill: 30% sociotropic voters misreading the societal
value by $500 hold enacted intensity to 0.11, while a uniformly
half-selfish electorate only gets from 0.63 to 0.44.

[IMAGE: enacted intensity vs sociotropic share — elections-on-measured-stakes-discipline.png]

The catch is that sociotropic voting swaps perception problems for
values problems: push inequality aversion from η = 1 to 2.5 and the
welfare ranking of these policies flips by $2.88 per household — fully
informed sociotropic voters split with zero misperception anywhere, and
no survey closes that gap.

This is a thought experiment about a few mechanisms, not political
science or election prediction. The welfare ranking is a modeling choice
(inequality aversion of η = 2.5 flips it), and both financed policies
score below the status quo — which fixed-platform plurality doesn't
offer, and the position game chooses. The repo carries the full notes,
regeneration scripts for every number, and tests that pin the knife-edge
facts.

The missing measurements are perception and motive: what people believe
specific reforms would do to their own household and to households like
theirs, versus what the engine computes, and how much weight they put on
each. That's a survey (democrasim#3), and its answers are points on the
axes the interactive version lets you drag.
