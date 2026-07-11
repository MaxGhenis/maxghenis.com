---
title: 'Elections on measured stakes social posts'
description: 'Social media posts for the elections-on-measured-stakes post'
pubDate: 'Jul 11 2026'
heroImage: './elections-on-measured-stakes-hero.png'
draft: true
---

# Social posts

Blog: https://maxghenis.com/blog/elections-on-measured-stakes/
Repo: https://github.com/MaxGhenis/democrasim

## X / Bluesky (thread opener)

I rebuilt my toy election model so everything except perception is
measured: 120,408 real households, two encoded tax reforms, engine-computed
stakes.

At perfect information, the election is decided by a $4/year financing
residual. At σ=$1,000 of noise, it tracks welfare perfectly.

Interactive: maxghenis.com/blog/elections-on-measured-stakes/

## X / Bluesky (follow-ups)

76% of adults have ~$0 at stake from either reform. Once financing enters,
their margin is $4.10/year — and at perfect information they outvote
everyone with per-child-sized stakes. Elections count people, not dollars.

Noise vs bias: the model shrugs off $1,000/voter of independent
misperception and flips on $221/voter of shared misperception. If you
want to move this election, don't make voters noisier; make them share a
small error.

Every threshold is an electorate-size statement: the entry point of the
tracking window is Condorcet jury arithmetic that collapses toward 0.5
as n grows. A threshold without its n is a sample size, not a finding.

Four AI referees (2 Claude, 2 Codex) reviewed it before publication —
reports and my responses are in the repo, next to regeneration scripts
for every number.

## LinkedIn

A year ago I wrote a toy model asking whether elections pick the
welfare-better policy when voters misperceive their own stakes. This week
I rebuilt it on measured inputs: 120,408 adults from PolicyEngine's
certified microdata, two actual encoded tax reforms with opposite
incidence, and engine-computed household impacts. Perception is the one
assumption left.

The invented version was wrong about almost everything interesting. With
real stakes, perfect information hands the election to a $4-per-year
financing residual shared by the three-quarters of adults with nothing
else at stake; moderate misperception restores welfare tracking; and $221
per voter of shared bias flips what $1,000 of independent noise cannot.

The post runs the actual model in your browser — the math reduces to a
closed form, so you can drag noise, bias, financing, and electorate size
yourself: maxghenis.com/blog/elections-on-measured-stakes/
