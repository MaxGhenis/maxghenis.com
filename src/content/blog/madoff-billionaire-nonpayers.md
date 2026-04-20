---
title: "Billionaires aren't 'just as likely' to be nonpayers as top taxpayers"
description: "Ray Madoff's memorable line on The Ezra Klein Show overstates what ProPublica actually found."
pubDate: 'Apr 20 2026'
heroImage: './madoff-billionaire-nonpayers.png'
---

On this week's [Ezra Klein Show](https://www.nytimes.com/2026/04/17/opinion/ezra-klein-podcast-ray-madoff.html), Boston College tax law professor Ray Madoff landed a memorable line:

> When it comes to the wealthiest Americans — Zuckerberg, Bezos, Musk, Larry Ellison, all the people we hear about so often — they are just as likely to be in the 40 percent of nonpayers as they are in the top 1 percent of payers.

It's a great rhetorical move. But it doesn't match the evidence.

The "40 percent of nonpayers" are households with $0 federal income tax liability. The top 1 percent of payers (TY2022) starts at about $663,000 in adjusted gross income, per the [IRS via Tax Foundation](https://taxfoundation.org/data/all/federal/latest-federal-income-tax-data-2025/). Whenever a centibillionaire sells stock, exercises options, or receives dividends, they clear that threshold by three or four orders of magnitude.

Here's what [ProPublica's 2021 investigation](https://www.propublica.org/article/the-secret-irs-files-trove-of-never-before-seen-records-reveal-how-the-wealthiest-avoid-income-tax) actually documented for the four people Madoff named:

- **Jeff Bezos** paid $0 in 2007 and 2011. Over the 2014–2018 window ProPublica analyzed, he paid $973 million. Since 2020 he has sold $8–10 billion of Amazon stock annually.
- **Elon Musk** paid $0 in 2018 — then roughly [$11 billion](https://www.cnn.com/2021/12/29/investing/elon-musk-tesla-stock-sales/index.html) in 2021 when he exercised expiring Tesla options, reportedly the largest personal federal income tax bill ever paid.
- **Mark Zuckerberg**: no zero-tax years surfaced in the leak. His 10b5-1 stock sales produce hundreds of millions in taxable gains most years.
- **Larry Ellison**: no zero-tax years surfaced either. Oracle pays a dividend, which forces annual taxable income whether he wants it or not.

So these four are overwhelmingly in the top 1 percent of payers, not the 40 percent of nonpayers. Bezos and Musk each have one or two documented zero years over more than a decade; Zuckerberg and Ellison have none in the public record.

## What the microdata says

I also checked this against [PolicyEngine's Enhanced CPS](https://policyengine.github.io/policyengine-us/), which imputes household net worth from the Federal Reserve's Survey of Consumer Finances. Taking the wealthiest households in the 2026 microdata and comparing their federal income+payroll tax against the weighted 99th percentile of all households ($213,112):

| Wealthiest N households | Net-worth range | Share in top 1% of fed-tax payers | Share paying ≤ $0 |
|---|---|---|---|
| Top 100 | $100M – $190M | **100.0%** | 0.0% |
| Top 1,000 | $100M – $190M | **100.0%** | 0.0% |
| Top 10,000 | $51M – $190M | 78.1% | 10.3% |
| Top 100,000 | $30M – $190M | 21.5% | 17.4% |

For context, 31.9% of all U.S. households pay $0 or less in federal income+payroll tax. But every single one of the 1,000 wealthiest households PolicyEngine can see — all with net worth above $100 million — is a top-1% federal taxpayer. None are nonpayers.

A caveat: the Enhanced CPS only captures net worth up to about $190 million, so true centibillionaires like Bezos and Musk don't show up. But that's Madoff's point cutting the wrong way — the claim was about the *visible* top of the wealth distribution, and in PolicyEngine's microdata, not one of them is a nonpayer.

## Where the claim comes from

Madoff's underlying point still holds. ProPublica's headline finding — a 3.4 percent "true tax rate" for the top 25 billionaires over 2014–2018, measured against wealth growth — is intact. Buy, borrow, die lets them defer indefinitely, and their effective rate *relative to economic gains* is far below what a salaried worker pays.

But the income-tax framing she reached for ("40 percent nonpayers, 1 percent top payers") uses a different denominator than the evidence supports. The accurate version is simpler: *when measured against their wealth growth, the richest Americans pay a lower rate than most of the country.* That's defensible. "Just as likely to be nonpayers" is where ProPublica's data stops backing her up.

Precision matters because lines like this travel. They get stripped from context and posted as facts. When the fact doesn't hold, it hands the other side an easy rebuttal — right when the underlying critique deserves to be taken seriously.
