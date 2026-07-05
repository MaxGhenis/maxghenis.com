---
title: 'A year of ChatGPT is a fifth of a beer'
description: 'I built an interactive that prices drinks in AI queries — and lets you flip every assumption that makes published AI water numbers differ by 100x.'
pubDate: 'Jul 05 2026'
heroImage: './hero.png'
---

Asking ChatGPT 30 questions a day for a year uses about a fifth of the water behind one beer. That counts both data-center cooling and the power plants generating the electricity — the same supply-chain accounting the beer number uses.

I built [an interactive](https://maxghenis.com/drinking-ai) that prices drinks this way: pick a beer, a coffee, a glass of milk, and see its water footprint in ChatGPT queries. One beer ≈ 53,300 queries. One coffee ≈ 66,200. A glass of tap water ≈ 178.

The point isn't that drinks use a lot of water. It's that if AI's water use worries you, the ordinary things around you offer a scale to measure it against — and on that scale, your AI habit is small.

## Why every AI water number differs from every other one

Published water-per-query figures span more than 100x: [Google measured 0.26 mL](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/) per median Gemini prompt, [Sam Altman cited 0.32 mL](https://blog.samaltman.com/the-gentle-singularity) for the average ChatGPT query, [a peer-reviewed benchmark](https://arxiv.org/abs/2505.09598) puts GPT-4o near 2 mL, and [Mistral's life-cycle assessment](https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai) reports 45 mL per 400-token response.

These numbers barely disagree about physics. They disagree about where to draw the boundary:

- **0.26–0.32 mL** counts on-site data-center cooling only.
- **~2 mL** adds the water evaporated at the power plants generating the query's electricity.
- **45 mL** is a full life-cycle assessment of one long response from a large model.

The calculator defaults to the middle scope because it matches how the drink side is measured. Beer's footprint — 298 liters per kilogram, from [the standard crop-water tables](https://hess.copernicus.org/articles/15/1577/2011/hess-15-1577-2011.pdf) — counts the water behind the barley, not just the brewery's taps. The consistent AI analog counts the water behind the electricity, not just the cooling loop. Counting only cooling is like measuring beer by what the brewery pours in.

You can flip the scope yourself. The comparison survives every setting: even at Mistral's 45 mL, one beer still equals more than 2,000 responses.

## Agents change the unit

A "query" is a 2023 unit. Reasoning models emit several times the tokens of a chat response, and agents chain many calls per task — [Anthropic measured its multi-agent systems at about 15x](https://www.anthropic.com/engineering/multi-agent-research-system) the tokens of a chat interaction. Since water scales with tokens, the calculator lets you count in reasoning responses (10x — my mid-range estimate of a 2.5–50x published spread) or agentic tasks (15x).

One beer = 3,550 agentic tasks. That's 10 a day, every day, for a year. Running heavy agents doesn't rescue the panic either.

## The aggregate is the same picture

Zoom out from queries to totals. [A Patterns paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC12827721/) models all AI systems worldwide at 312.5–764.6 billion liters of water in 2025. The US drink categories I could source from government and industry data:

| Category | Year | Water footprint | vs global AI |
|---|---|---|---|
| Coffee | 2024/25 | 25 trillion L | 33–80x |
| Milk | 2024 | 20 trillion L | 26–64x |
| Soda | 2025 | 15.3 trillion L | 20–49x |
| Beer | 2023 | 7 trillion L | 9.2–22x |
| All eight tracked | — | 75.6 trillion L | 99–242x |

US coffee alone out-drinks global AI by 33–80x. Extrapolating AI's growth to 2026 (I estimate 1.5x, within the published 1.3–2.45x range of growth rates) still leaves the drinks 66–161x ahead.

## What this doesn't say

Water footprints measure volume, not scarcity. A liter evaporated from a stressed aquifer in Arizona is not a liter of rain on Bavarian barley, and the comparison doesn't pretend otherwise.

The genuine version of the AI water question is local: a hyperscale campus is roughly a golf-resort-sized water user, concentrated in one place, with summer-peaked draw. That's material for a small municipal system and trivial on a major river — a siting, pricing, and water-rights question, not a per-user guilt question. Those are different debates, and this page only settles the second one.

## Provenance

Every figure on the page links to its source — the Mekonnen–Hoekstra crop and animal water tables, USDA and NIAAA volume data, and the per-query figures above. The two Claude-estimated numbers (the 2026 projection and the 10x reasoning multiplier) are flagged as estimates on the page. The constants and derivations live in [a tested module](https://github.com/MaxGhenis/maxghenis.com/blob/master/src/lib/drinking-ai.ts) — 54 tests pin the headline numbers, so if a source changes, the page fails loudly instead of drifting quietly. If you find a better source for any figure, tell me and I'll swap it in.

[Andy Masley's post](https://andymasley.substack.com/p/individual-ai-use-is-not-bad-for) prompted the question.

Drink responsibly. Prompt freely: [maxghenis.com/drinking-ai](https://maxghenis.com/drinking-ai)
