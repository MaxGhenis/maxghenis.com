---
title: "Billionaires aren't 'just as likely' to be nonpayers as top taxpayers"
description: "Checking Ray Madoff's claim on The Ezra Klein Show against ProPublica and PolicyEngine microdata."
pubDate: 'Apr 20 2026'
heroImage: './madoff-billionaire-nonpayers.png'
---

On this week's [Ezra Klein Show](https://www.nytimes.com/2026/04/17/opinion/ezra-klein-podcast-ray-madoff.html), Boston College tax law professor Ray Madoff said:

> When it comes to the wealthiest Americans — Zuckerberg, Bezos, Musk, Larry Ellison, all the people we hear about so often — they are just as likely to be in the 40 percent of nonpayers as they are in the top 1 percent of payers.

Madoff's claim is about federal income tax (the measure the "40% of nonpayers" statistic describes). Everything below uses that same denominator.

The top 1% by AGI starts at $663,164 for TY2022 ([IRS via Tax Foundation](https://taxfoundation.org/data/all/federal/latest-federal-income-tax-data-2025/)). The top 1% by federal income tax paid has a higher threshold — household-level it's $185,608 in PolicyEngine's 2026 microdata (below). When a centibillionaire sells stock, exercises options, or receives dividends, they clear either threshold by three to four orders of magnitude.

## Per-person data disclosed by ProPublica

Year-by-year federal income tax for the people [ProPublica](https://www.propublica.org/article/the-secret-irs-files-trove-of-never-before-seen-records-reveal-how-the-wealthiest-avoid-income-tax) named with dollar figures. The leak window is 2014–2018 unless noted.

| Person | $0 years in 2014–2018 | $0 years outside the window | Non-$0 tax disclosed |
|---|---|---|---|
| Warren Buffett | 0 | — | $23.7M total, 2014–2018 |
| Jeff Bezos | 0 | 2007, 2011 | $973M total, 2014–2018 |
| Michael Bloomberg | "several" (count not disclosed) | — | $292M total, 2014–2018; $70.7M in 2018 |
| Elon Musk | 2018 | — | $455M total, 2014–2018; $11B in 2021 |
| Mark Zuckerberg | 0 | — | hundreds of millions/yr via 10b5-1 |
| Larry Ellison | 0 | — | Oracle dividend every year |
| Carl Icahn | 2016, 2017 | — | $544M AGI across those years, $0 tax via interest expense |
| George Soros | 2016, 2017, 2018 | — | other years not disclosed |

In the 2014–2018 window: ≥6 zero years (Musk 1, Icahn 2, Soros 3, Bloomberg ≥1 unspecified) across 40 person-years, i.e. **≥15%**. Adding Bezos's out-of-window 2007 and 2011 zeros is 8+ documented zero years across the broader ProPublica coverage. Half of the eight named people had at least one documented zero year; half had none.

**Extrapolation to the top 100 wealthiest over the past decade is an estimate.** Starting from the ~15% in-window disclosed rate and adjusting for the Forbes 400 containing more hedge-fund and private-equity profiles (Icahn/Soros-style loss or deduction years) than the few names ProPublica covered in detail, a plausible range is **5–15%** per-year zero rate. This is a Claude estimate, not a published number — the underlying data isn't public.

Against Madoff's claim, the meaningful comparison is:

- Random US household in a given year: 40–44% pay $0 federal income tax ([TPC](https://taxpolicycenter.org/briefing-book/who-doesnt-pay-federal-income-taxes); 43.9% in PolicyEngine's 2026 file below), ~1% are in the top 1% of payers. Ratio nonpayer : top-1%-payer = **~40 : 1**.
- Top 100 wealthiest in a given year: 5–15% estimated zero rate; top-1%-of-payers rate not directly measured but most years' disclosed tax bills for Bezos, Musk, Bloomberg, and Zuckerberg put them well past the top-1% threshold. Directionally the ratio is inverted from the population.

## What the microdata says

[PolicyEngine's Enhanced CPS](https://policyengine.github.io/policyengine-us/) imputes household net worth from the Federal Reserve's Survey of Consumer Finances. The 99th percentile of federal income tax at the household level is $185,608 in the 2026 file (script: [gist](https://gist.github.com/MaxGhenis/3f10cc98b643e0a76e74eae9afe35082)):

| Wealthiest N households | Records | Net-worth range | Top 1% of income-tax payers | Pay $0 |
|---|---|---|---|---|
| Top 100 | 2 | $100.6M – $190.3M | 100.0% | 0.0% |
| Top 1,000 | 2 | $100.6M – $190.3M | 100.0% | 0.0% |
| Top 10,000 | 7 | $51.3M – $190.3M | 78.1% | 10.3% |
| Top 100,000 | 27 | $30.2M – $190.3M | 21.5% | 50.5% |
| Top 1,000,000 | 135 | $13.4M – $190.3M | 4.2% | 34.0% |
| All US households | 6,876 | — | 1.0% | 43.9% |

"Records" is the number of underlying microdata households contributing to each weighted group. The top 100 and top 1,000 both come from the same 2 records, so the 100.0% and 0.0% point estimates have no meaningful precision at that end — they're saying "the two synthetic records at the top of the file both clear the threshold and both have positive tax." The top-10,000 and top-100,000 rows are based on more records and are more informative about the $30M–$190M range.

Net worth in Enhanced CPS is imputed from the [Survey of Consumer Finances](https://www.federalreserve.gov/econres/scfindex.htm), which excludes Forbes 400-style respondents by design and truncates the upper tail at around $190M. The Forbes 400 uses direct estimates of billionaire wealth and isn't integrated into the SCF or into PE's microdata. So the microdata can't directly test Madoff's claim for Zuckerberg, Bezos, Musk, or Ellison — only for the visible $30M–$190M range.

Within that range, the top-100,000 row is notable: 50.5% pay $0 federal income tax, higher than the 43.9% population baseline. These are wealth-holders whose wealth is concentrated in housing, retirement accounts, or unrealized stock gains, with little realized annual income. This is the wealth profile that comes closest to matching Madoff's framing — but it's an order of magnitude less wealthy than Forbes 400 territory, and the share of nonpayers drops toward zero as you move further up the wealth ladder in the file.

Binned by net worth:

![Share paying $0 and share in top 1% by net worth bin, PolicyEngine Enhanced CPS 2026](./madoff-scatter.png)

Sample size per bin is printed below each point. The $100M+ bin is based on only 3 records, so the 100% / 0% point there reflects the sparse top of the file, not a robust estimate.

## Other estimates of what the wealthiest pay

The rate you get for the top of the distribution depends on the denominator:

- **Tax / reported AGI.** For the Forbes 400, ProPublica's [top-400 interactive table](https://projects.propublica.org/americas-highest-incomes-and-taxes-revealed/) lists individual effective federal income tax rates averaged 2013–2018; most are in the 17–24% range.
- **Tax / (AGI + untaxed corporate profits).** [Saez, Yagan, Zucman et al. (NBER w34170, 2025)](https://www.nber.org/papers/w34170) put the top 0.0002% total federal rate at 24% for 2018–2020, vs. 30% population-wide. [Splinter's reanalysis](https://www.davidsplinter.com/BillionaireTaxRate.pdf) adjusts for multi-return Forbes families and different corporate-tax imputation and arrives at 38% — above the population average.
- **Tax / comprehensive income including unrealized capital gains.** The [OMB/CEA 2021 analysis](https://www.whitehouse.gov/cea/written-materials/2021/09/23/what-is-the-average-federal-individual-income-tax-rate-on-the-wealthiest-americans/) put the top 400 at 8.2%. ProPublica's 3.4% "true tax rate" divides tax paid by change in net worth over the period.

None of these studies — including ProPublica's follow-ups in the [Secret IRS Files series](https://www.propublica.org/series/the-secret-irs-files) — report the share of centibillionaire person-years with $0 federal income tax, because per-person year-by-year data isn't public. The question Madoff's framing depends on isn't directly measured in the published literature.

## Rate vs. frequency

Two of the three rate methodologies (ProPublica 3.4%, OMB/CEA 8.2%, Saez-Zucman 24%) put the richest below the 30% population average; Splinter's 38% recalculation is above. The rate story is more contested than a single headline number suggests.

The frequency framing — "just as likely to be in the 40% of nonpayers as the top 1% of payers" — is a different question. On the frequency side: the 43.9% population-wide income-tax nonpayer share is dominated by retirees, students, and low-earning filers with refundable credits, and a random household's ratio of (nonpayer year : top-1%-payer year) is ~40:1. For the top 100 wealthiest, the estimated zero-year rate is 5–15% and the top-1%-payer rate in most disclosed years is high — directionally the reverse of Madoff's "just as likely."
