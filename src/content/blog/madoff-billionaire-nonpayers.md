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

## What ProPublica actually documented

[ProPublica's 2021 investigation](https://www.propublica.org/article/the-secret-irs-files-trove-of-never-before-seen-records-reveal-how-the-wealthiest-avoid-income-tax) covered 2014–2018 for the top 25 billionaires. Per-person figures for the four people Madoff named:

- **Jeff Bezos** paid $0 in 2007 and 2011, $973 million over 2014–2018. Since 2020 he has sold $8–10 billion of Amazon stock per year.
- **Elon Musk** paid $0 in 2018 and [$11 billion](https://www.cnn.com/2021/12/29/investing/elon-musk-tesla-stock-sales/index.html) in 2021 when he exercised expiring Tesla options.
- **Mark Zuckerberg**: no zero-tax years in the leak. His 10b5-1 sales produce hundreds of millions in taxable gains per year.
- **Larry Ellison**: no zero-tax years in the leak. Oracle's dividend produces taxable income each year.

Two of the four have documented zero years; two have none. In the years with zero liability, income was offset by losses, interest expense, or charitable deductions — not persistent non-filing.

ProPublica also disclosed $0 years for Carl Icahn (2016, 2017 — interest-expense offsets) and George Soros (2016–2018 — fund losses). Both had nine- and ten-figure taxable years in other periods.

**Person-year zero rate — a rough estimate.** I asked Claude to estimate what share of person-years would show $0 federal income tax for the top 100 wealthiest over the past decade. Starting from the ProPublica disclosures (roughly 10–20 documented zero years across 25 people × 12 disclosed years ≈ 5% of person-years), then weighting the less-famous half of the Forbes 400 more heavily (more Icahn/Soros-style loss or deduction years), the estimate comes in around **5–10%**.

The baseline that Madoff's "40% of nonpayers" describes is a different population: retirees, students, and low earners who owe nothing year after year. The wealthy zero years are episodic — a wealthy person with a 10% per-year probability of a zero tax year is not in the same group as a retired household that owes $0 every year.

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

"Records" is the number of underlying microdata households contributing to each weighted group. The top 100 and top 1,000 are both drawn from the same 2 records, and Enhanced CPS net worth caps at $190.3M, so Bezos- and Musk-scale wealth isn't represented.

Within the $30M–$190M range the microdata can see, 17.4% of the wealthiest 100,000 households pay ≤ $0 in federal income+payroll tax, vs. 31.9% of all US households. Moving further up the wealth ladder, the nonpayer share drops to 0% for the top 1,000.

## Other estimates of what the wealthiest pay

The rate you get for the top of the distribution depends on the denominator:

- **Tax / reported AGI.** For the Forbes 400, ProPublica's [top-400 interactive table](https://projects.propublica.org/americas-highest-incomes-and-taxes-revealed/) lists individual effective federal income tax rates averaged 2013–2018; most are in the 17–24% range.
- **Tax / (AGI + untaxed corporate profits).** [Saez, Yagan, Zucman et al. (NBER w34170, 2025)](https://www.nber.org/papers/w34170) put the top 0.0002%'s total federal rate at 24% for 2018–2020, vs. 30% population-wide. [Splinter's reanalysis](https://www.davidsplinter.com/BillionaireTaxRate.pdf) adjusts for multi-return Forbes families and different corporate-tax imputation and gets 38%.
- **Tax / comprehensive income including unrealized capital gains.** The [OMB/CEA 2021 analysis](https://www.whitehouse.gov/cea/written-materials/2021/09/23/what-is-the-average-federal-individual-income-tax-rate-on-the-wealthiest-americans/) put the top 400 at 8.2%. ProPublica's 3.4% "true tax rate" divides tax paid by change in net worth over the period.

None of these studies — including ProPublica's follow-ups in the [Secret IRS Files series](https://www.propublica.org/series/the-secret-irs-files) — report the share of centibillionaire person-years with $0 federal income tax, because per-person year-by-year data isn't public. The question Madoff's claim depends on is structurally harder to answer than the rate question.

## What the claim should be

Taxes paid as a share of wealth accumulation for the richest Americans are lower than for most of the country: 3.4% (ProPublica), 8.2% (OMB/CEA), or 24–38% (Saez-Zucman-Splinter), depending on the denominator. "Just as likely to be nonpayers as top 1% payers" uses income-tax filing brackets as the denominator. By that measure, the ~5–10% estimated person-year zero rate for the top 100 wealthiest is about 1/10 the 40% population-wide rate, and the ~80–90% implied top-1%-payer rate for the same group (my estimate, since the rest of the time they realize enough income to clear $213K in federal tax) is roughly 10× the 1% population rate. The ratio isn't 1:1.
