---
title: "Testing California's bond funds against the billionaire tax odds"
description: "Prediction markets have priced California's Proposition 40 for almost a year, and a fund of California municipal bonds has not moved with the odds by any amount I could detect. Before November 3, I registered a test that pools ballot measures across states."
pubDate: 'Oct 20 2026'
updatedDate: 'Oct 22 2026'
heroImage: './california-bond-funds-billionaire-tax-odds.png'
---

For almost a year, prediction markets have priced the odds that California voters pass Proposition 40, and a fund of California municipal bonds, measured against a national fund, has not moved with those odds by any amount I could detect.

Proposition 40, on the November 3 ballot, is a one-time 5% tax on the net worth of billionaires who lived in California on January 1, 2026. By October 11, Kalshi's market on it, where each contract pays $1 if the measure passes, had seen 1.5 million contracts, and Polymarket's had seen $3.9 million in reported volume. The chance of passage they implied ranged from 17% to 56.5%. If a measure matters for a state's finances, the state's bonds should move when the odds of its passage move.

## The test

Slemrod and Greimel ran a version of this test in 1999. They used the price of Steve Forbes's contract on the Iowa Electronic Market as a proxy for the chance that his flat tax would become law. In their [working paper](https://www.nber.org/papers/w6583), comparing each day's bond yields with that day's contract price, they found evidence consistent with 5-year municipal bonds pricing that chance and none for 30-year bonds. In the published paper, the correlations, found there for 5- and 10-year bonds, did not survive when they compared daily changes. Snowberg, Wolfers and Zitzewitz [later applied the same logic](https://www.nber.org/papers/w12073) to the 2004 presidential election. The ratio of the bond move to the odds move gives the price change that goes with a swing from certain failure to certain passage.

Municipal bonds, or munis, are the debt of state and local governments, and a bond's yield is the annual return its price implies. For Proposition 40, I compared the daily returns, price changes plus interest paid out, of two iShares funds: [CMF](https://www.ishares.com/us/products/239731/ishares-california-amtfree-muni-bond-etf) holds California munis and [MUB](https://www.ishares.com/us/products/239766/ishares-national-amtfree-muni-bond-etf) holds munis from across the country. Using how far CMF's price moves when interest rates move, I converted the difference into an approximate change in the gap between their yields, called the spread. The spread nets out interest-rate news that hits every state's bonds. For each trading day through October 9, I set that change at the 4 p.m. Eastern close against the day's change in the passage odds.

A basis point is a hundredth of a percentage point of yield. A full swing in the odds, from certain failure to certain passage, went with a change in the spread of +0.8 basis points on Kalshi's odds and −0.5 on Polymarket's; positive means California's yields rose against the nation's. The 95% ranges, the effects the data can't rule out, run from −3.5 to +5.0 and from −3.8 to +2.9. Letting the response build over five days, or using each market's odds to filter out noise specific to the other, widens the ranges and still finds nothing distinguishable from zero.

<picture>
  <source media="(max-width: 600px)" srcset="/images/prop40-chart-mobile.svg" width="400" height="860">
  <img src="/images/prop40-chart.svg" alt="Proposition 40 passage odds on Kalshi and Polymarket from October 2025 to October 2026, and a scatter of the daily change in the odds against the daily change in the California fund spread, with fitted lines near zero and a dashed line showing a 6 basis-point effect" width="760" height="740" loading="lazy" decoding="async">
</picture>

*The odds ranged from 17% to 56.5%. On the 11 trading days when either market moved 10 points or more, the spread moved 1.73 basis points or less. It moved more than that on 15 of the 238 trading days. An effect of 5 to 7 basis points for a full swing, the smallest the test finds four times in five, would move the spread about 1 basis point on a 15-point day; the dashed line shows a 6 basis-point effect.*

## What the test could see

The detection floor is the smallest effect the test finds four times in five. I measured it by planting effects of known size into the actual daily returns. It came to 6.4 to 6.9 basis points with Kalshi's odds and 5.0 to 5.3 with Polymarket's, depending on the effect's direction. The test catches smaller effects less often.

How large an effect should anyone expect? The [Legislative Analyst's Office](https://lao.ca.gov/ballot/2026/prop40-110326.pdf) says the tax would raise "tens of billions of dollars" over several years, and that billionaires' responses could cost the state under $1 billion a year in income tax. PolicyEngine, which I co-founded, estimates both in a [calculator](https://policyengine.org/us/california-wealth-tax), billionaire by billionaire, under assumptions you can change. Ninety percent of the one-time money would have to go to health care. [Novy-Marx and Rauh](https://www.aeaweb.org/articles?id=10.1257/pol.4.2.182) found that muni spreads rose 7 to 15 basis points for each 10% of state-generated revenue lost to investment losses, in states with weaker credit. Those losses happened once; this one would recur each year, and the one-time revenue comes with its own spending rule. The fiscal estimates do not establish how large an effect to expect.

The approach can see a large effect. Over the weeks around the 2024 presidential election, an hourly version, using nearly round-the-clock prices linked to the federal government's 10-year notes, gives 26 basis points on the 10-year yield for a full swing in the odds, with a 95% range of 11 to 41. A stricter test is less sure: a result that size would turn up by chance about 6% of the time, and almost all of the evidence comes from election night. On election night alone, Polymarket's odds on Donald Trump rose 38 percentage points while those prices fell 1.0%, an implied 44 basis points.

## Why fund prices

The test uses the daily closing prices of two exchange-traded funds because those prices are free and come every trading day. That choice has costs. CMF held 1,809 bonds on October 9. On October 8, California bonds made up 96.4% of its market value (the rest was cash and derivatives) against 16.6% of MUB's, so a move confined to California's bonds shows up in the spread at about 0.8 of its size, and an effect concentrated in a subset of California's bonds would show up smaller still. A fund's price can also sit away from its net asset value, and the gap moves: CMF closed 0.26% above its net asset value on October 9, about 4 basis points of yield, and in 2025 it closed above on 150 days and below on 94. MUB also closed 0.26% above that day; what reaches the spread is how the two gaps change from day to day. Trade-by-trade records and licensed evaluated prices exist for individual bonds, but neither gave me a free daily series to test with. The finding is no detectable effect in California fund prices. It does not show that ballot measures can't move municipal bonds.

## Official vote days carry less news than the days before them

Event studies measure how prices respond to dated news, and official dates are the obvious anchors: votes, certifications, signatures. In these markets those dates carried less news about passage than the days before them and approaching deadlines did.

[Washington's House](https://app.leg.wa.gov/billsummary?BillNumber=6346&Year=2026) took up the state's 9.9% tax on income above $1 million on Monday, March 9, and passed it the next evening, after [24 hours of debate](https://aprilconnors.houserepublicans.wa.gov/2026/03/10/house-republican-floor-leader-april-connors-releases-statement-after-marathon-income-tax-debate/). Kalshi's market on the tax rose 22 percentage points over the weekend before the House took the bill up, 7 across the vote, and 14.5 more by the afternoon of March 12, after the Senate concurred on March 11. The U.S. House first passed the 2025 reconciliation act at 6:56 a.m. Eastern on May 22, 2025. Kalshi's odds on the act had already jumped from 70% to 84% between 10 and 11 p.m. the night before.

Official dates produced large moves when they settled a market's question. California's secretary of state announced on June 17 that the billionaire tax was eligible for the ballot, and certified it as qualified on June 25. Kalshi's market on whether the measure would make the ballot rose 23.5 and 29 percentage points on those days, while the passage markets moved 4 points or less. Washington's signing moved its market 46 points, because that contract paid only if the tax became law before April 1.

An event study pinned to the votes' actual times would have missed Washington's 22-point jump and the federal market's 14-point jump.

## The states without a daily price

Four state tax measures drew markets with usable price histories in the past year: Washington's income tax, New York City's second-home surcharge, California's billionaire tax and Florida's property-tax amendment. California and New York each have funds that hold mostly their own state's munis and have daily prices. New York's second-home market never moved more than 3 percentage points in a day, too little for a useful test. Washington and Florida have no such fund.

Washington's income tax is the only one of the four that changes how a state taxes its own bonds: it taxes interest on other states' bonds and exempts Washington's. Florida's Amendment 3 would cut local non-school property tax by $11.83 billion a year once fully in effect, according to the state's [Revenue Estimating Conference](https://edr.state.fl.us/Content/conferences/revenueimpact/archives/2026F/_pdf/impact0710.pdf). Florida's counties and cities repay some of their bonds from property taxes, and the [amendment](https://www.flsenate.gov/Session/Bill/2026F/1F/BillText/er/PDF) keeps "debt service payments for existing obligations" among the permitted uses of property tax revenue.

[EMMA](https://emma.msrb.org/), the free trade record run by the Municipal Securities Rulemaking Board, the municipal market's self-regulatory organization, shows reported trade prices for individual bonds. Its [terms of use](https://www.msrb.org/Municipal-Securities-Rulemaking-Boards-Website-Terms-Use) bar "data mining, crawling, 'scraping', robot or similar automated" access. The board's 2017 [price list](https://www.msrb.org/sites/default/files/2022-09/MSRBSubscriptionServicesPriceList.pdf) put a delayed trade feed at $5,500 a year, and 12 months of history at $2,500 plus a $2,000 one-time fee. The board's [academic historical product](https://www.msrb.org/sites/default/files/2022-08/Historical-Academic-Transaction-Data-Product-License-Agreement.pdf) lists $500 per year of trades plus a $500 setup fee and provides data with a three-year lag, too late to cover these markets. Its [subscription page](https://www.msrb.org/Market-Transparency/Subscription-Services-and-Products) also says trade data are "available at no cost to academic researchers," without naming the product.

I found no free daily price series suitable for testing Washington's tax on bond interest or Florida's $11.83 billion property-tax cut.

## What I'm testing on November 3

Election night resolves many measures at once, and their surprises differ in size and sign, so a test that pools them can see smaller effects than any single campaign. Before the vote I registered one. In each of 21 states whose own municipal bond fund qualified for the test (two through exchange-traded funds and 19 through mutual funds' daily net asset values), it relates the daily change in the state's spread to the change in the state's expected revenue from its ballot measures, built from each measure's official fiscal estimate and the markets' odds, over the three trading days after the election and, for close counts, through California's certification deadline on December 11. The registration fixes the 158 measures with a market (147 had a price on October 19), the funds, the windows, the statistics and what would count as confirming or refuting an effect.

In practice the primary test rests on six revenue measures in California and Colorado, the only states with both a testable fund and a priced measure that has an official revenue estimate. At October 19's prices, and if election night settles every measure, the median smallest effect it can detect is 2.0 basis points per $1 billion a year of revenue; if only 60% of each surprise arrives by November 6, it is 4.3. Scaling Novy-Marx and Rauh's estimates gives 0.5 to 1.0 basis points, so the likeliest registered outcome is inconclusive.

I froze the registration on October 19. Its checksums are timestamped in Bitcoin block 972148, mined 12 minutes after the freeze, and the registration, code and checksums are public at [github.com/MaxGhenis/ballot-measure-prereg-2026](https://github.com/MaxGhenis/ballot-measure-prereg-2026).

*Updated October 22, 2026: I added the chart and the calculator link, and corrected the sentence on converting returns to basis points, which uses CMF's duration alone.*
