---
title: 'The adolescence of policy simulation: On Amodei and economic disruption'
description: 'AI can answer policy questions. It cannot yet model policy impacts. That requires infrastructure we are still building.'
pubDate: 'Jan 27 2026'
---

Anthropic CEO Dario Amodei published a [20,000-word essay](https://www.darioamodei.com/essay/the-adolescence-of-technology) today called "The Adolescence of Technology." It covers AI safety, bioweapons, authoritarianism, and more. But one section stood out to me: his predictions about economic disruption.

Amodei writes that AI "will have effects that are much broader and occur much faster" than previous technological transitions. He predicts this will trigger an "unusually painful" short-term shock in the labor market, potentially displacing half of entry-level white collar jobs within the next five years.

If he's right, we'll need policy responses. And to design policy responses, we need to model them. That's where things get interesting.

## What AI can and cannot do

AI has gotten remarkably good at answering policy questions. Ask a frontier model about EITC phase-out rates or CTC eligibility rules and you'll probably get a correct answer. The models have read the tax code.

But there's a difference between answering policy questions and modeling policy impacts. Try this:

> "If the US expanded the Child Tax Credit to $3,600 for all children regardless of income, what would happen to the child poverty rate and the Gini coefficient?"

I asked myself this question. Here's my honest answer:

*I don't know. I could tell you the current child poverty rate is around 12% (SPM) and guess it would drop significantly—maybe to 8-9%?—based on vague memories of studies from the 2021 expanded CTC. For Gini, I'd guess a small decrease, maybe 0.005-0.01 points? But these are guesses anchored to half-remembered papers, not calculations. I have no microdata. I can't run a counterfactual. I'm pattern-matching to priors.*

This isn't a prompting problem. It's an infrastructure problem.

## Policy simulation requires three things

To actually model the impact of a policy change, you need:

1. **Policy** — The rules: tax formulas, benefit eligibility, phase-outs, interactions between programs
2. **Data** — Representative microdata: who earns what, household composition, geographic distribution
3. **Theory** — Behavioral assumptions: how do people respond to incentives, what's the takeup rate

AI might eventually nail the policy part. With enough statute text in context—or better, with deterministic APIs encoding the rules—models can learn to apply tax law correctly.

But AI can't conjure CPS microdata. It can't know the joint distribution of income, household size, and state of residence for 130 million US households. It can't decide whether to assume zero behavioral response or apply elasticities from the labor economics literature.

That's not intelligence. That's infrastructure.

## Two sides of the same coin

The same infrastructure serves another purpose. In "Machines of Loving Grace," Amodei imagines "a very thoughtful and informed AI whose job is to give you everything you're legally entitled to by the government." That's not hypothetical—tools like MyFriendBen and Amplifi already use PolicyEngine's API to screen people for benefits. Policy simulation and benefit access are two sides of the same coin. One computes law against population data, the other against your data.

## The adolescence parallel

Amodei calls this moment the "adolescence of technology"—powerful but not yet mature, capable of great things and great harm.

Policy simulation is in its own adolescence. We can model reforms in hours instead of months. [Governments are starting to use these tools](https://policyengine.org/uk/research/policyengine-10-downing-street). But the infrastructure is still clunky, adoption is still sparse, and most policy debates still happen without quantitative grounding.

The question is whether policy simulation grows up fast enough to match the disruption it needs to respond to.

## What this implies

If Amodei's timeline is right—powerful AI within two years, significant labor displacement within five—we don't have time for the traditional policy analysis cycle. Bills get introduced, CBO scores them months later, revisions happen, repeat. That works when policy moves at legislative pace.

But if the economy is changing faster than legislatures can respond, we need infrastructure that lets policymakers iterate quickly. Not just ideas about what to do, but tools for modeling trade-offs in real time.

This is part of why I've spent the last few years building [PolicyEngine](https://policyengine.org). It's one attempt at closing the gap—open-source microsimulation that anyone can use. But the broader point isn't about any one tool. It's that policy response capacity needs to exist before crises, not during them.

AI can accelerate parts of this. [We've been experimenting with AI workflows](https://policyengine.org/us/research/multi-agent-workflows-policy-research) that compress hours of analysis into minutes. But AI can only accelerate infrastructure that exists. It can't replace infrastructure that doesn't.

---

*Read Amodei's full essay: [The Adolescence of Technology](https://www.darioamodei.com/essay/the-adolescence-of-technology)*
