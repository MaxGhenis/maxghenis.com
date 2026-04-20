---
title: "Billionaires aren't 'just as likely' to be nonpayers as top taxpayers"
description: "Checking Ray Madoff's claim on The Ezra Klein Show against ProPublica, PolicyEngine microdata, and some back-of-envelope estimates."
pubDate: 'Apr 20 2026'
heroImage: './madoff-billionaire-nonpayers.png'
---

On this week's [Ezra Klein Show](https://www.nytimes.com/2026/04/17/opinion/ezra-klein-podcast-ray-madoff.html), Boston College tax law professor Ray Madoff said:

> When it comes to the wealthiest Americans — Zuckerberg, Bezos, Musk, Larry Ellison, all the people we hear about so often — they are just as likely to be in the 40 percent of nonpayers as they are in the top 1 percent of payers.

The data doesn't support this.

The "40 percent of nonpayers" are households with $0 federal income tax liability. The top 1 percent of payers (TY2022) starts at $663,164 in adjusted gross income, per [IRS data via Tax Foundation](https://taxfoundation.org/data/all/federal/latest-federal-income-tax-data-2025/). When a centibillionaire sells stock, exercises options, or receives dividends, they clear that threshold by three to four orders of magnitude.

## Per-person data disclosed by ProPublica

Year-by-year federal income tax for the people [ProPublica](https://www.propublica.org/article/the-secret-irs-files-trove-of-never-before-seen-records-reveal-how-the-wealthiest-avoid-income-tax) named with dollar figures:

| Person | Documented $0 years | Non-$0 tax disclosed | Source period |
|---|---|---|---|
| Warren Buffett | 0 | $23.7M total | 2014–2018 |
| Jeff Bezos | 2007, 2011 | $973M total | 2014–2018 (+ 2007, 2011) |
| Michael Bloomberg | unspecified "several" | $292M total; $70.7M in 2018 | 2014–2018 |
| Elon Musk | 2018 | $455M total (2014–2018); $11B in 2021 | 2014–2018, 2021 |
| Mark Zuckerberg | 0 in the leak | hundreds of millions/yr via 10b5-1 | 2014–2018 |
| Larry Ellison | 0 in the leak | Oracle dividend every year | 2014–2018 |
| Carl Icahn | 2016, 2017 | not disclosed (AGI $544M, $0 tax via interest expense) | 2014–2018 |
| George Soros | 2016, 2017, 2018 | $0 entire disclosed window (fund losses) | 2014–2018 |

Six $0 years across ~40 person-years of disclosed data = **~15%**. Four of the eight had at least one $0 year; four had none.

**Extrapolation to the top 100 wealthiest over the past decade: I asked Claude to estimate.** Starting from the 15% disclosed-person-year rate and weighting the less-famous half of the Forbes 400 more heavily (more Icahn/Soros-style loss or deduction years than the Bezos/Zuckerberg-style stock-selling pattern), my estimate is a **~5–10%** per-year zero rate.

For context:
- Random US household in a given year: ~40% pay $0 federal income tax ([Tax Policy Center](https://taxpolicycenter.org/briefing-book/who-doesnt-pay-federal-income-taxes)), ~1% in top 1% of payers (by definition). Ratio nonpayer : top-1%-payer = **40 : 1**.
- Top 100 wealthiest in a given year: ~5–10% estimated $0 rate, ~80–90% estimated top-1%-of-payers rate (Claude estimates, grounded in the disclosed data above). Ratio ≈ **1 : 10**.

Madoff's claim implies a 1:1 ratio for the wealthy. The data and estimates give something closer to 1:10 — inverted from what "just as likely" implies.

## What the microdata says

[PolicyEngine's Enhanced CPS](https://policyengine.github.io/policyengine-us/) imputes household net worth from the Federal Reserve's Survey of Consumer Finances. Against the 2026 microdata, the 99th percentile of federal income+payroll tax at the household level is $213,112 (script: [gist](https://gist.github.com/MaxGhenis/3f10cc98b643e0a76e74eae9afe35082)):

| Wealthiest N households | Records | Net-worth range | Share in top 1% of fed-tax payers | Share paying ≤ $0 |
|---|---|---|---|---|
| Top 100 | 2 | $100.6M – $190.3M | 100.0% | 0.0% |
| Top 1,000 | 2 | $100.6M – $190.3M | 100.0% | 0.0% |
| Top 10,000 | 7 | $51.3M – $190.3M | 78.1% | 10.3% |
| Top 100,000 | 27 | $30.2M – $190.3M | 21.5% | 17.4% |
| Top 1,000,000 | 135 | $13.4M – $190.3M | 4.3% | 7.1% |
| All US households | 6,876 | — | 1.0% | 31.9% |

"Records" is the number of underlying microdata households contributing to each weighted group. The top 100 and top 1,000 both come from the same 2 records. Net worth in Enhanced CPS is imputed from the [Survey of Consumer Finances](https://www.federalreserve.gov/econres/scfindex.htm), which by design excludes Forbes 400-style respondents and truncates wealth at around $190M in the file. The Forbes 400 uses direct estimates of billionaire wealth and isn't integrated into the SCF or into PE's microdata. So this test covers the wealth range the microdata can see ($30M–$190M), not actual centibillionaires.

In the $30M–$190M range that is in the data, the nonpayer share falls from 31.9% (all households) to 17.4% (top 100,000 by wealth) to 0% (top 1,000).

## Other estimates of what the wealthiest pay

The rate you get for the top of the distribution depends on the denominator:

- **Tax / reported AGI.** For the Forbes 400, ProPublica's [top-400 interactive table](https://projects.propublica.org/americas-highest-incomes-and-taxes-revealed/) lists individual effective federal income tax rates averaged 2013–2018; most are in the 17–24% range.
- **Tax / (AGI + untaxed corporate profits).** [Saez, Yagan, Zucman et al. (NBER w34170, 2025)](https://www.nber.org/papers/w34170) put the top 0.0002%'s total federal rate at 24% for 2018–2020, vs. 30% population-wide. [Splinter's reanalysis](https://www.davidsplinter.com/BillionaireTaxRate.pdf) adjusts for multi-return Forbes families and different corporate-tax imputation and gets 38%.
- **Tax / comprehensive income including unrealized capital gains.** The [OMB/CEA 2021 analysis](https://www.whitehouse.gov/cea/written-materials/2021/09/23/what-is-the-average-federal-individual-income-tax-rate-on-the-wealthiest-americans/) put the top 400 at 8.2%. ProPublica's 3.4% "true tax rate" divides tax paid by change in net worth over the period.

None of these studies — including ProPublica's follow-ups in the [Secret IRS Files series](https://www.propublica.org/series/the-secret-irs-files) — report the share of centibillionaire person-years with $0 federal income tax, because per-person year-by-year data isn't public. The question Madoff's claim depends on is structurally harder to answer than the rate question.

## What the claim should be

The rate measures (3.4% / 8.2% / 24–38%) show the richest pay lower rates than the population once unrealized gains are in the denominator. That's defensible across all three methodologies.

The frequency measure — "just as likely to be nonpayers as top 1% payers" — uses income-tax filing brackets. On that measure, top-100 ratio (nonpayer : top-1%-payer) is ~1:10, not 1:1. The claim mixes the rate argument with frequency framing, and the frequency framing is off by about an order of magnitude.
