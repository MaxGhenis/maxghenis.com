---
title: "Elon Musk's AI predicts Americans will be $800 richer under Harris"
description: 'A large-scale experiment asking leading AI models to forecast key economic metrics under different presidential administrations.'
pubDate: 'Nov 04 2024'
heroImage: './images/elon-musk-ai-harris.jpg'
---

I conducted a large-scale experiment asking leading AI models to forecast key economic metrics for 2025 under different administrative scenarios. The research validates that these models can make meaningful economic predictions when properly prompted.

## Key findings

Musk's Grok AI produced notably optimistic projections for a Harris administration across tested metrics:

- **Air quality:** PM2.5 pollution would be 1.51 µg/m³ lower than under Trump (GPT-4o predicted 1.26)
- **Poverty:** Supplemental Poverty Measure 3.42 percentage points lower (vs GPT-4o's 1.76)
- **Individual prosperity:** Real GDP per capita $802 higher (vs GPT-4o's $388)

Grok's predictions exceeded GPT-4o's by factors ranging from 1.2x to 2.1x, with statistically significant differences.

## Methodology

I ran 500 trials for each model and metric using their APIs. Results remained stable across different prompting approaches. The study employed narrative prompting techniques, asking models to describe scenarios from a future perspective.

## Context and purpose

This project originated at a Manifold Markets event discussing political forecasting. Even GPT-4o-mini's more conservative estimates showed similar directional patterns.

## Broader implications

I work at PolicyEngine, which builds microsimulation models estimating how specific tax and benefit policies affect household budgets. These AI forecasts raise interesting questions about complementing precise policy analysis with broader contextual insights.

Complete methodology and results are available at [github.com/MaxGhenis/llm-presidential-outcome-forecasts](https://github.com/MaxGhenis/llm-presidential-outcome-forecasts).
