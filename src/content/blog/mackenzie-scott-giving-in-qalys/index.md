---
title: "MacKenzie Scott's giving, in QALYs"
description: "An interactive cost-effectiveness model for MacKenzie Scott's $26B in philanthropy — and the AI prompts that built it."
pubDate: 'Jun 28 2026'
heroImage: './hero.png'
---

MacKenzie Scott gave away [$7 billion in 2025](https://www.cnbc.com/2025/12/13/mackenzie-scott-revealed-her-total-charitable-donations-for-2025.html) — [about a third of every megagift in America that year](https://fortune.com/2026/06/25/mackenzie-scott-largest-megadonor-2025-7-billion-donations-giving-usa-iu-report/), by the Indiana University Lilly Family School of Philanthropy's count. Almost none of it is denominated in health. I built an interactive tool that asks what her [$26 billion](https://yieldgiving.com/) in lifetime giving buys in the unit health economists use to compare lives — quality-adjusted life-years: **[maxghenis.com/mackenzie-scott-qaly](/mackenzie-scott-qaly)**. Drag the assumptions and a Monte Carlo cost-effectiveness model reruns in your browser; on the skeptical default it lands around 100,000 QALYs — a model output, not a measured fact, which is why the tool exists: move the assumptions yourself.

It runs the same machinery as the [GiveWell cost-effectiveness replication](/blog/givewell-cea/) I built in February — editable parameters, Monte Carlo, sensitivity analysis — pointed at a different question. GiveWell scores the most cost-effective charities in the world. This points the same lens at one donor's actual $26B portfolio, most of it unrestricted gifts to US organizations, where almost none of the spending is denominated in health to begin with.

## Why I care about the gap

I [took the Giving What We Can pledge in 2019](/blog/why-ive-taken-the-giving-what-we-can-pledge/) for one reason: the global poor benefit far more from a dollar than I do. This tool puts a number on that for Scott's giving. Measured purely in health, a dollar at the [global-health frontier](https://www.givewell.org/charities/amf) — bed nets averting child deaths — buys more than a thousand times the QALYs of her US-focused giving.

How much that gap should bother you is the open question, and the QALY count doesn't settle it. Part of the gap is outside her control: preventing a death costs far more in a rich country than a poor one, and a QALY ignores the income, opportunity, and rights her giving targets. Part of it is a choice: $26 billion is enough that where it goes carries real opportunity cost, measured in lives. The tool hands you the number, not the verdict. It's the same arithmetic that sends my own giving abroad.

## Two models, arguing

I built this with two coding agents, and the more useful part was letting them check each other. Claude Code wrote the model and the tool. Then I had Codex review the assumptions cold: it caught a real error — a cost-per-life figure I'd left in old dollars without inflating it — and disagreed with Claude on whether the global benchmark belongs in QALYs or DALYs. I'm centralizing on QALYs. Two models disagreeing about a modeling choice is a sharper adversarial review than either alone.

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

**To Codex:**

1. review the math/assumptions in https://maxghenis.com/mackenzie-scott-qaly (its a local repo)
2. would py wasm be more parsimonious and dry
3. fix it all
4. deployed?
5. yes do

The model, tests, and sources are on [GitHub](https://github.com/MaxGhenis/mackenzie-scott-qaly).
