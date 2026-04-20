---
title: "Billionaires aren't 'just as likely' to be nonpayers as top taxpayers"
description: "Checking Ray Madoff's claim on The Ezra Klein Show against ProPublica and PolicyEngine microdata."
pubDate: 'Apr 20 2026'
heroImage: './madoff-billionaire-nonpayers.png'
---

On this week's [Ezra Klein Show](https://www.nytimes.com/2026/04/17/opinion/ezra-klein-podcast-ray-madoff.html), Boston College tax law professor Ray Madoff said:

> When it comes to the wealthiest Americans — Zuckerberg, Bezos, Musk, Larry Ellison, all the people we hear about so often — they are just as likely to be in the 40 percent of nonpayers as they are in the top 1 percent of payers.

The data doesn't support this.

The "40 percent of nonpayers" are households with $0 federal income tax liability. The top 1 percent of payers (TY2022) starts at $663,164 in adjusted gross income, per [IRS data via Tax Foundation](https://taxfoundation.org/data/all/federal/latest-federal-income-tax-data-2025/). When a centibillionaire sells stock, exercises options, or receives dividends, they clear that threshold by three or four orders of magnitude.

Here's what [ProPublica's 2021 investigation](https://www.propublica.org/article/the-secret-irs-files-trove-of-never-before-seen-records-reveal-how-the-wealthiest-avoid-income-tax) documented for the four people Madoff named:

- **Jeff Bezos** paid $0 in 2007 and 2011. Over 2014–2018 he paid $973 million. Since 2020 he has sold $8–10 billion of Amazon stock per year.
- **Elon Musk** paid $0 in 2018 and [$11 billion](https://www.cnn.com/2021/12/29/investing/elon-musk-tesla-stock-sales/index.html) in 2021 when he exercised expiring Tesla options.
- **Mark Zuckerberg**: no zero-tax years in the leak. His 10b5-1 sales produce hundreds of millions in taxable gains per year.
- **Larry Ellison**: no zero-tax years in the leak. Oracle's dividend produces taxable income each year.

Two of the four have documented zero years; two have none.

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

"Records" is the number of underlying microdata households contributing to each weighted group. The top 100 and top 1,000 are both drawn from the same 2 records — the microdata is sparse at this end, and Enhanced CPS net worth caps at $190.3M, so Bezos- and Musk-scale wealth isn't represented.

Within the $30M–$190M range the data can see, 17.4% of the wealthiest 100,000 households pay ≤ $0 in federal income+payroll tax, compared to 31.9% of all US households. Moving further up the wealth ladder, the nonpayer share drops to 0% for the top 1,000.

## What the claim should be

ProPublica's method divides taxes paid by the change in net worth over the period, not by reported income. Their 2014–2018 analysis of the top 25 billionaires found a "true tax rate" of 3.4% by that measure — taxes paid / (end-period wealth − start-period wealth). That's the finding that's intact. Buy-borrow-die lets centibillionaires fund consumption from loans against appreciating stock while deferring the realization event indefinitely, so taxes as a share of wealth accumulation are far below the share a salaried worker pays.

The accurate version of Madoff's point: taxes paid as a share of wealth accumulation for the richest Americans are lower than for most of the country. "Just as likely to be nonpayers as top 1% payers" uses income-tax filing brackets as the denominator, which is a different measurement, and that's the part the data doesn't back up.
