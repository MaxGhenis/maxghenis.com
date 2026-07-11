---
title: 'Elections on measured stakes (crosspost)'
description: 'Text-and-image version of the interactive post, for LinkedIn, Medium, and Substack'
pubDate: 'Jul 11 2026'
heroImage: './elections-on-measured-stakes-hero.png'
draft: true
---

Subtitle: I rebuilt an election model so that everything except
perception is measured. At perfect information, a $4-per-year financing
residual decides the winner.

Canonical: https://maxghenis.com/blog/elections-on-measured-stakes/

---

A year ago I wrote a toy model of a question that bugs me: do elections
pick the policy that's better for people when voters misperceive what
policies would do to them? Every number in it was invented. This week I
rebuilt it so that everything except perception is measured, and the
invented version turns out to have been wrong about almost everything
interesting.

The rebuilt model, democrasim (github.com/MaxGhenis/democrasim), uses
120,408 voting-age adults from PolicyEngine's certified microdata
(268 million represented; I co-founded PolicyEngine — this is a personal
project on its open data). The two platforms are actual encoded reforms
with opposite incidence, labeled generically: Policy A raises the child
tax credit base from $2,200 to $3,200 ($39.1B a year); Policy B caps the
top two marginal rates at 34% ($38.0B) — matched within 3% so neither is
simply the bigger giveaway. Each voter's true stake is the engine's
answer for their household; a per-adult levy makes each policy
budget-neutral, and log-utility welfare ranks A above B. Perception is
the one assumption: each voter sees their own stake plus noise σ and an
optional shared bias, then votes their household by plurality.

[IMAGE: margin distribution figure — elections-on-measured-stakes-margins.png]

Gross of financing, 76% of adults see about $0 from both policies.
Policy A's gains arrive in per-child steps for the 20% of households
with children; Policy B sends 99.7% of its dollars to the top decile.
Financing hands the indifferent mass a margin of a few dollars — the two
levies differ by $4.10 per adult per year — so 75% of adults have less
than $25 riding on the outcome while a fifth have more than $500.

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

The perfect-information result is a knife-edge, not a law: at σ = 0 the
outcome is decided by the sign of the $1.1B residual cost gap between
the policies — an artifact of budget-matching them within 3%. In the
counterfactual where B costs 3% more instead of less, perfect
information elects A every time. And the mass only rules while it votes:
with no financing its stake is exactly $0 and it abstains, with a $25
indifference band it abstains, and under approval voting it approves
neither policy — in all three cases perfect information tracks welfare
on about 24% turnout. Elections count people, not dollars.

Two corrections the toy model needed. Thresholds are electorate-size
statements: the tracking window at 10,001 voters spans accuracy 0.52 to
0.69, but the entry point is Condorcet jury arithmetic that falls toward
0.50 as n grows; any threshold that doesn't state its n is a sample
size, not a finding. And noise and bias are different objects: elections
here are robust to large independent error and fragile to small shared
error.

This is a thought experiment about one mechanism, not political science
or election prediction; the welfare ranking is itself a modeling choice
(η ≥ 3 inequality aversion flips it), and both financed policies score
below the status quo, which plurality doesn't offer. Four AI referees
(two Claude, two Codex) reviewed the work before publication; their
reports, the findings note, and regeneration scripts for every number
are in the repo.

The missing measurement is perception itself: what people believe
specific reforms would do to their own household, versus what the engine
computes. That's a survey (democrasim#3), and its answer will be one
number on the axis the interactive version lets you drag.
