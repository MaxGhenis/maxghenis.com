---
title: "MacKenzie Scott's giving, in QALYs"
description: "An interactive cost-effectiveness model for MacKenzie Scott's $26B in philanthropy — and the AI prompts that built it."
pubDate: 'Jun 28 2026'
updatedDate: 'Nov 18 2026'
heroImage: './hero.png'
projectUrl: '/mackenzie-scott-qaly'
---

In December 2025, MacKenzie Scott announced $7.17 billion in gifts since the previous December. Giving USA counted $6.65 billion from Scott, about a third of the $19.2 billion Americans gave in megagifts in 2025. [Scott's announcement](https://yieldgiving.com/essays/we-are-the-ones-we-ve-been-waiting-for/) · [Giving USA figures reported by AP](https://apnews.com/article/8363b76bc8cf854f6865c31129e8a4b1).

I built an interactive tool to estimate how much health her $26.39 billion in gifts through 2025 buys. Under the model's default assumptions, I estimate a median of **205,000 quality-adjusted life-years (QALYs)**, with a 90% simulation interval of 95,000–423,000. [Interactive model](/mackenzie-scott-qaly) · [Working paper](/mackenzie-scott-qaly/paper/) · [Giving totals](https://github.com/MaxGhenis/mackenzie-scott-qaly/blob/main/data/parameters.yaml).

Give near-exclusive weight to randomized evidence and the median falls to about 9,000 QALYs. Take the studies' effects at near face value and it rises to about 419,000. Each point in the chart uses 100,000 draws.

[![On a log scale, median estimated QALYs rise from 8,797 with near-exclusive weight on randomized evidence to 204,804 at the default and 419,171 at near face value.](/mackenzie-scott-qaly/paper-assets/index_files/figure-html/fig-stance-output-1.png)](/mackenzie-scott-qaly)

I used the same approach as my February [replication of GiveWell's cost-effectiveness analysis](/blog/givewell-cea/). You can change parameters, rerun the simulation, and see which assumptions move the estimate. Here I apply it to one donor's portfolio, where the gifts fund goals as varied as education, housing, and health.

## Why I care about the gap

I [took the Giving What We Can pledge in 2019](/blog/why-ive-taken-the-giving-what-we-can-pledge/) because a dollar can do more for people in poverty than it does for me. I used GiveWell’s 2022–2024 average costs per life saved for bed nets and seasonal malaria chemoprevention as a benchmark. Under my default assumptions, a dollar at those costs buys roughly 500 times as many QALYs as an average dollar in Scott’s portfolio. [GiveWell's impact estimates](https://www.givewell.org/impact-estimates) · [Working paper](/mackenzie-scott-qaly/paper/).

The impact of another donation depends on which programs still need funding. Spending tens of billions of dollars at those historical costs would require enough malaria programs with comparable costs and room for funding. GiveWell’s separate evaluation of direct cash transfers includes gains in household consumption. My estimate covers health. Scott also funds outcomes such as income, opportunity, and rights. The health comparison helps explain why I give abroad. [GiveWell's cash-transfer benchmark](https://blog.givewell.org/2024/11/12/re-evaluating-the-impact-of-unconditional-cash-transfers/) · [Yield Giving's gifts](https://yieldgiving.com/gifts/).

## Two models, arguing

Claude Code wrote the model and the tool, and I asked Codex to review the assumptions. Codex found a cost-per-life figure that still used its original dollar year and questioned whether to express the global benchmark in QALYs or DALYs. I use QALYs throughout.

Applying a common dollar year and correcting the health conversions moved the early median from roughly 98,000 to 87,000 QALYs. The current model expresses gifts and costs in 2026 dollars, converts the community-health-center study's roughly $54,000 per life-year in 2012 dollars into dollars per QALY, and values QALYs using the HHS regulatory estimates. [Results before the corrections](https://github.com/MaxGhenis/mackenzie-scott-qaly/blob/e5f6c6e/results/summary.json) · [Results after the corrections](https://github.com/MaxGhenis/mackenzie-scott-qaly/blob/14546e1/results/summary.json) · [Community-health-center study](https://pmc.ncbi.nlm.nih.gov/articles/PMC4436657/) · [HHS estimates](https://aspe.hhs.gov/reports/standard-ria-values).

Yield Giving reports individual amounts for about two-thirds of the money. I use 53 recipient-reported focus areas and the organizations’ service locations to allocate giving across 14 intervention categories. To estimate the undisclosed amounts, I compare each period's announced total with its disclosed gifts, then distribute the difference using recipients' pre-gift Form 990 revenue. When a gift lacks usable revenue, I give it the median weight for its period. [Yield Giving gifts](https://yieldgiving.com/gifts/) · [Focus-area mapping](https://github.com/MaxGhenis/mackenzie-scott-qaly/blob/main/data/yieldgiving/leaf_to_archetype.yaml) · [Gift ledger](/mackenzie-scott-qaly/gift-ledger.csv).

The fit uses **1,314 disclosed gifts** with usable pre-gift revenue. A tenfold difference in recipient revenue corresponds to about **3.6 times the fitted gift amount** (elasticity 0.55, R² 0.53). That relationship describes the matched sample and supplies the weights for estimating undisclosed gifts. [Matching diagnostics](https://github.com/MaxGhenis/mackenzie-scott-qaly/blob/main/web/matching_diagnostics.json).

The model uses reported service locations to route certain health and development dollars outside the United States to global-health cost assumptions. This category accounts for about 5% of giving and 69% of mean estimated QALYs. An audit of 50 organizations that list "global" service locations estimates how much of their work takes place in the United States. [Working paper](/mackenzie-scott-qaly/paper/) · [Geography evidence](https://github.com/MaxGhenis/mackenzie-scott-qaly/tree/main/data/yieldgiving/geo_audit).

Using the reported focus areas to allocate dollars lowered the early estimate from about 87,000 to 70,000 QALYs. A reader pointed out that the model had used U.S. costs for health services delivered abroad. The median rose to about 204,000 with geographic routing (v1.0) and fell to about 202,000 after the geography audit (v1.1). The current v1.2 estimate uses the corrected Form 990 matches and comes to about 205,000. The allocation toggle lets you compare the three versioned allocations. [Historical results and corrections](/mackenzie-scott-qaly/paper/#corrections-history).

I prompted Claude Code and Codex to build and review the original model. The appendix records those prompts.

## Appendix: the prompts

**To Claude Code:**

1. estimate the qaly impact of mckenzie scott's lifetime donations
2. do better than judgment calls. make an actual quant analysis givewell-cea style. make a repo for it if thats useful
3. no just qalys for now. and considfer evidence quality especially causal identification credibility
4. /cycle
5. shall we make it an interactive and put it on maxghenis.com (using all the design tokens)? like a real py package with ci, nextjs/tailwind etc
6. inline link any falsifiable claims ALWAYS ALWAYS REMEMBER THIS
7. whats the global frontier
8. is it a falsifiable claim
9. fix
10. codex made some changes wdyt
11. give me a prompt for it to fix. but i think there was a misunderstanding i didnt ask for a qaly/daly change, could we centralize around one? which?
12. if you were starting this project from scratch howd you do it
13. yes
14. do a full review of this, both you and with a sol subagent
15. yep go - and dont have anyu allegiance to existing code, feel free to rebuild any and all things froms cratch
16. do it all
17. make sure the prose isnt bogged down by the history - like it seems like leading with the inflation adjustment in the tool is just based on it having been a bug we just fixed. users should see the tool first thing when they get to the page
18. can we give the blog post like a button at the top to use the tool, like we do for rambar etc
19. whats the delta against givewell? noting scaling limitations etc
20. sure yeah does it belong in the blog or the tool? like you could imagine a bigger version of the tool that also combines it with givewells for a general qaly estimator for every intervention and portfolio but not now
21. Vs. global frontier / 1,212× / more health per marginal $ — this makes it sounds like scott's is 1212x more effective
22. maybe we should drop the card and just discuss it in the written stuff...
23. then could you just make the 90% interval below in small text instead of a separate card, also add to the $/qaly
24. i dont get these two - whats the 2.1x wrt? whats 64.2b?
25. scott doesnt publish *any* dollars by cause? i thought she at least published her list of orgs, like are we basing this on any real data?
26. undisclosed ones can we do some research on, if need be we could scale by total revenue in the relevant year from 990s
27. what model are we using for this
28. i dont think we need fable for this fan out do we? could probably do like 5.6 terra or something
29. yeah terra is the small codex tier, use it for the audit

**To Codex:**

1. review the math/assumptions in https://maxghenis.com/mackenzie-scott-qaly (its a local repo)
2. would py wasm be more parsimonious and dry
3. fix it all
4. deployed?
5. yes do

The model, tests, and sources are on [GitHub](https://github.com/MaxGhenis/mackenzie-scott-qaly).
