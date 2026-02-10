---
title: 'Building an open-source GiveWell CEA calculator'
description: 'I built an interactive tool that implements GiveWell''s cost-effectiveness analysis for their top charities, with editable parameters, moral weights, and sensitivity analysis.'
pubDate: 'Feb 10 2026'
heroImage: './hero.png'
projectUrl: 'https://maxghenis.com/givewell-cea'
---

GiveWell publishes detailed spreadsheets estimating the cost-effectiveness of their top charities. These are excellent but hard to explore — each charity has its own multi-tab workbook, and testing "what if" scenarios means manually editing cells across multiple sheets.

I built an interactive calculator that implements the same methodology in a web app: **[maxghenis.com/givewell-cea](https://maxghenis.com/givewell-cea)**

## What it does

The tool compares six GiveWell top charities across all their operating regions:

- **Against Malaria Foundation** (8 countries) — bed nets
- **Malaria Consortium** (8 regions) — seasonal malaria chemoprevention
- **Helen Keller International** (8 countries) — vitamin A supplementation
- **New Incentives** (9 Nigerian states) — vaccination incentives
- **GiveDirectly** (5 countries) — cash transfers
- **Deworm the World** (13 regions) — deworming

Each charity card shows a strip plot of cost-effectiveness across regions, expressed as multiples of GiveWell's benchmark (unconditional cash transfers). Click any country to see:

- Cost per death averted, deaths averted, and people reached
- The full calculation breakdown, step by step
- Every parameter is editable — click any highlighted number to test different assumptions

![Expanded view showing AMF in DRC with the step-by-step calculation breakdown and editable parameters](./detail-view.png)

## Moral weights and sensitivity analysis

Two features go beyond what the spreadsheets offer:

**Moral weights** let you adjust the value placed on averting deaths at different ages. GiveWell's defaults weight under-5 deaths at 116 and ages 5-9 at 134 (reflecting both life-years saved and revealed donor preferences). You can scale all weights with a single multiplier, or set each age bracket manually.

**Sensitivity analysis** sweeps a parameter across its range and shows how each charity's cost-effectiveness changes. This makes crossover points visible — for example, at what under-5 moral weight does New Incentives overtake Malaria Consortium?

## Accuracy

Getting the numbers right was the hardest part. An earlier version used parameters from December 2024 spreadsheets, and a GiveWell research analyst flagged that the figures didn't match their current estimates.

I re-extracted all parameters from GiveWell's November 2025 CEA spreadsheets, downloading each workbook and reading cell values programmatically with openpyxl. Key corrections:

- **AMF mortality rates** were using raw rates instead of "in absence of nets" rates (e.g., DRC: 0.00306 → 0.00798)
- **New Incentives** counterfactual coverage was wrong (e.g., Bauchi: 0.56 → 0.82)
- **Helen Keller** funging adjustments were corrupted (e.g., Burkina Faso: 531.99 → -0.43)
- **MC/HKI benchmark constant** was rounded (0.003355 → 0.0033545)

After fixing these, I verified all 46 charity/country combinations against GiveWell's spreadsheets:

| Charity | Countries | Max difference |
|---------|-----------|---------------|
| AMF | 8 | <0.001% |
| Malaria Consortium | 8 | <0.001% |
| Helen Keller | 8 | <0.001% |
| New Incentives | 9 | 0.000% (exact) |
| Deworm the World | 13 | 0.000% (exact) |

298 automated tests verify the calculations.

## How it's built

The app is React + TypeScript + Vite, styled with vanilla CSS, and deployed to GitHub Pages. No external charting libraries — the strip plots and sensitivity chart are SVG. The total bundle is 286KB gzipped.

Each charity has its own calculation module that implements the GiveWell formula:
1. Calculate children/people reached from grant size and cost per person
2. Estimate deaths averted using mortality rates and intervention effectiveness
3. Convert to "units of value" using moral weights
4. Divide by grant size to get value per dollar
5. Compare to the benchmark (GiveDirectly cash transfers) to get the final multiple
6. Apply charity-level and intervention-level adjustments, plus leverage/funging

The country parameters are kept in a single `countries.ts` file — 600+ lines of data extracted from the spreadsheets. This is the most maintenance-heavy part; when GiveWell updates their models, these values need re-extraction.

## Caveats

This is an independent project, not affiliated with or endorsed by GiveWell. It implements a simplified version of their methodology — the full CEA includes additional considerations not captured here. GiveDirectly and deworming parameters use older extractions. For donation decisions, use [GiveWell's published estimates](https://www.givewell.org/how-we-work/our-criteria/cost-effectiveness/cost-effectiveness-models).

Source code: [github.com/MaxGhenis/givewell-cea](https://github.com/MaxGhenis/givewell-cea)
