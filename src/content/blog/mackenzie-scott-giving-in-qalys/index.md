---
title: "MacKenzie Scott's giving, in QALYs"
description: "An interactive cost-effectiveness model for MacKenzie Scott's $26B in philanthropy — and the AI prompts that built it."
pubDate: 'Jun 28 2026'
heroImage: './hero.png'
projectUrl: '/mackenzie-scott-qaly'
---

MacKenzie Scott gave away [$7 billion in 2025](https://www.cnbc.com/2025/12/13/mackenzie-scott-revealed-her-total-charitable-donations-for-2025.html) — [about a third of every megagift in America that year](https://fortune.com/2026/06/25/mackenzie-scott-largest-megadonor-2025-7-billion-donations-giving-usa-iu-report/), by the Indiana University Lilly Family School of Philanthropy's count. Almost none of it is denominated in health. I built an interactive tool that asks what her [$26 billion](https://yieldgiving.com/) in lifetime giving buys in the unit health economists use to compare lives — quality-adjusted life-years: **[maxghenis.com/mackenzie-scott-qaly](/mackenzie-scott-qaly)**. Drag the assumptions and a Monte Carlo cost-effectiveness model reruns in your browser; on the skeptical default it lands around 70,000 QALYs — a model output, not a measured fact, which is why the tool exists: move the assumptions yourself.

It runs the same machinery as the [GiveWell cost-effectiveness replication](/blog/givewell-cea/) I built in February — editable parameters, Monte Carlo, sensitivity analysis — pointed at a different question. GiveWell scores the most cost-effective charities in the world. This points the same lens at one donor's actual $26B portfolio, most of it unrestricted gifts to US organizations, where almost none of the spending is denominated in health to begin with.

## Why I care about the gap

I [took the Giving What We Can pledge in 2019](/blog/why-ive-taken-the-giving-what-we-can-pledge/) for one reason: the global poor benefit far more from a dollar than I do. This tool puts a number on that for Scott's giving. Measured purely in health, a dollar at the [global-health frontier](https://www.givewell.org/charities/amf) — bed nets averting child deaths — buys more than a thousand times the QALYs of her US-focused giving. That's a marginal comparison; redeploying the full $26 billion would saturate frontier opportunities and cut the multiple to a few hundred times — [the tool page works through the arithmetic](/mackenzie-scott-qaly).

How much that gap should bother you is the open question, and the QALY count doesn't settle it. Part of the gap is outside her control: preventing a death costs far more in a rich country than a poor one, and a QALY ignores the income, opportunity, and rights her giving targets. Part of it is a choice: $26 billion is enough that where it goes carries real opportunity cost, measured in lives. The tool hands you the number, not the verdict. It's the same arithmetic that sends my own giving abroad.

## Two models, arguing

I built this with two coding agents, and the more useful part was letting them check each other. Claude Code wrote the model and the tool. Then I had Codex review the assumptions cold: it caught a real error — a cost-per-life figure I'd left in old dollars without inflating it — and disagreed with Claude on whether the global benchmark belongs in QALYs or DALYs. I'm centralizing on QALYs. Two models disagreeing about a modeling choice is a sharper adversarial review than either alone.

Two further full review rounds (both models, against everything) caught more, and the fixes moved the headline from ~98,000 to ~87,000: gifts are now recorded as the exact disclosed tranches and inflated to 2026 dollars year by year instead of divided nominal-vs-current; the community-health-center figure now uses the paper's own [~$54k per life-year](https://pmc.ncbi.nlm.nih.gov/articles/PMC4436657/) with an explicit life-year→QALY conversion (the old version skipped it); several 2000s-era cost-effectiveness anchors got inflated to current dollars; the frontier benchmark was re-derived twice — first for discounting consistency, then onto [GiveWell's current program averages](https://www.givewell.org/impact-estimates) — cutting the headline multiple by about 40%; the benefit/cost ratio now uses [HHS's published value per QALY](https://aspe.hhs.gov/reports/standard-ria-values) instead of a per-life-year value applied to QALYs; and one citation was re-attributed to the paper the numbers actually come from — [Sommers (2017)](https://www.journals.uchicago.edu/doi/10.1162/ajhe_a_00080), verified against the PDF, after I'd confidently planted the wrong one. Every correction made the model more skeptical or more honest, none was caught by a human, and the errors had survived earlier review passes.

The allocation across causes was still my prior, though — I'd accepted "Scott doesn't publish dollars-by-cause" without checking hard enough. She publishes better: [Yield Giving's gift database](https://yieldgiving.com/gifts) itemizes dollar amounts for about two-thirds of the money, with focus areas on every disclosed dollar. Deriving the split from her own data — 53 org-reported areas mapped onto the model's 13 archetypes, [every rule documented](https://github.com/MaxGhenis/mackenzie-scott-qaly/blob/main/data/yieldgiving/leaf_to_archetype.yaml) — cut the skeptical median from ~87,000 to ~70,000. Her real portfolio holds less food, housing, and cash assistance than I'd assumed (the buckets with the strongest health evidence) and more workforce development and nonprofit infrastructure (which have almost none). The undisclosed third isn't dropped: her essays give each year's total, so the residual is a known dollar amount, spread over that year's undisclosed gifts in proportion to the recipient's pre-gift [IRS 990 revenue](https://projects.propublica.org/nonprofits/) raised to an elasticity fit on the disclosed pairs, with the fuzzy name-to-EIN matches audited by a third model, a small one, against the live API. That fit is a finding in its own right: across 1,313 disclosed gift–revenue pairs, gift size scales with organization revenue to the power 0.41 — a 10× bigger organization gets about 2.5× more money. Her giving is far flatter across organization size than proportional. The imputed third moves each cause share by at most ~1.5 points — the disclosed two-thirds was representative.

None of the model code was hand-written; the whole thing was natural-language prompting. For transparency, here is every prompt I typed, verbatim — typos and all.

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
