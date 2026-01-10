---
title: 'EV Subsidies Tax'
measureId: 'Prop 30'
position: 'no'

summary: 'Would reduce revenues by $1B/year. Vehicle subsidies are wasteful and sprawl-inducing.'
election: '2022-11-california'
---

*Don't cut other programs for more vehicle subsidies.*

#### Background

Prop 30 levies a new 1.75% tax on taxable incomes above \$2 million, with the revenue funding subsidies for zero-emissions vehicles (45%), charging stations (35%), and wildfire response and prevention (20%).

#### Tax analysis

The [legislative analyst estimates](https://lao.ca.gov/BallotAnalysis/Proposition?number=30&year=2022) that it will raise \$3.5 billion to \$5 billion annually.
But this only considers the revenue from the extra tax bracket.
In reality, this law will reduce tax revenues below the \$2 million threshold, as it could:
* Encourage high-earning residents to move out of California
* Discourage high-earning would-be residents from moving to California
* Reduce income for residents who would face the new tax

The legislative analyst acknowledges this, but puzzlingly declines to give even a ballpark estimate of the revenue loss:

> Some taxpayers probably would take steps to reduce the amount of income taxes they owe. This would reduce existing state revenues used to pay for activities not funded by Proposition 30. The degree to which this would happen and how much revenue the state might lose as a result is unknown.

This is frankly a shameful shirking of the legislative analyst's responsibility.
Voters deserve to know how much this ballot measure will affect other state programs.
So I'll give it a shot.

*Warning: Math ahead. Skip the the **Spending analysis** section for less math.*

##### Substitution effect

The first step is to find how much this tax changes the net marginal wage: the share of income that someone will take home after taxes.

The new tax would raise the total marginal tax rate for Californians with income above \$2 million from 53.75% to 55.5%:
* 37% federal income tax
* 1.45% federal Medicare tax
* 0.9% federal additional Medicare tax
* 12.3% California income tax
* 1% California mental health services tax
* 1.1% California payroll tax ([SB 951](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220SB951) just expanded this to all workers)
* **1.75% new California tax**

The change to the net marginal wage is (1-0.555) / (1-0.5375) - 1 = **-3.8%**.
That is, the new tax would reduce the amount of each extra dollar of income that top earners would take home by 3.8%.

The [Congressional Budget Office estimates](https://www.cbo.gov/sites/default/files/cbofiles/attachments/10-25-2012-Labor_Supply_and_Fiscal_Policy.pdf) that top earners have a labor supply substitution elasticity of 0.22; that is, a 10% increase in their net marginal wage will increase their labor supply by 2.2%.
Their income would be expected to fall 0.22 * 3.8% = 0.84% through this channel.

##### Income effect

CBO also estimates an income elasticity of 0.05; that is, a 10% increase in their net income will *reduce* their income by 0.5%.
The extra tax would therefore *increase* their income, as they strive to make up for the lost net income.
To estimate their income effect, though, we have to estimate how much of their income would be subject to the new tax.

The Franchise Tax Board's [most recent Personal Income Tax report](https://data.ftb.ca.gov/California-Personal-Income-Tax/PIT-Annual-Report-2020/s2q7-rtsh) (for tax year 2019) summarizes tax returns by adjusted gross income bin.
While this will overstate the number of affected filers, since AGI exceeds taxable income, it would be roughly offset by income growth from 2019 to 2023, when the tax would begin.

The report shows that filers with AGI above \$2 million:
* Count 35,000 (0.2% of all filers)
* Had \$220 billion in total taxable income
* Paid \$27 billion in state income tax, which was 30% of all state personal income income tax revenue

Among earners in the \$2 million+ AGI bin, the share of income subject to the new tax would be (220 billion - 35,000 * 2 million) / 220 billion = 150 billion / 220 billion ~= 70%.

Their net income would therefore falls by 1.75% * 70% * 0.05 = 0.06%.

In this case, the substitution effect is about 14 times larger than the income effect, and overall the labor supply of residents would fall by 0.84% - 0.06% = 0.78%.
This would be about \$210 million in lost revenue per year.

But would about migration?

##### Migration

Higher top tax rates can affect migration in two ways: people can move out, and people can avoid moving in.

One study is almost implausibly well-situated to estimate the impact of Prop 30 on such migration outcomes.
[Young (2016)](https://inequality.stanford.edu/sites/default/files/millionaire-migration-california-impact-top-tax-rates.pdf) tracks the population of millionaires relative to non-millionaires in California, following the introduction of millionaire taxes in California.
Results vary by the slice of the analysis, but overall they find that tax hikes slightly reduce the number of millionaires; for example, 0.1% reduction per 1% increase to the top marginal rate.

Applying Young (2016) to the 2019 tax data suggests that Prop 30 would reduce tax revenues by 0.1 * 1.75% * \$27 billion ~= \$50 million.

But Young (2016) has two major methodological issues:
1. It focuses on the millionaire population, even though, as it admits, "most people who earn \$1 million or more are having an unusually
good year." The paper's conclusion continues, "The somewhat temporary nature of very-high earnings is one reason why the tax changes examined here generate little observable tax flight." But this doesn't mean that people don't respond to the tax; they probably respond based on their *expected* income, rather than their exact income, and the paper's methodology wouldn't pick this up.
1. It assumes that California's millionaire population trend would have moved parallel to its non-millionaire population trend in absence of the tax changes. But California's tax changes are not random; if California raised millionaire taxes at times when it expected to attract millionaires (like 2004), then the study would underestimate the negative impact of the tax reform. This is known as "endogeneity" in econometrics, and I don't believe Young (2016) persuasively attempts to address it.

Another study addresses these issues: [Agrawal and Foremny (2019)](https://direct.mit.edu/rest/article-abstract/101/2/214/58521/Relocation-of-the-Rich-Migration-in-Response-to?redirectedFrom=fulltext) addresses the first issue by considering impacts on a wider range of high-income people, and the second issue by relying on a nationwide reform that granted regions the ability to set tax rates, avoiding endogeneity of specific regions setting taxes on their own timelines---indeed, they show from their data that regions do not set tax policy randomly.
Its Spanish setting is further from California, but I believe these methodological improvements outweigh the distance.

Agrawal and Foremny compare region pairs to estimate "an elasticity of the number of top taxpayers with respect to net-of-tax rates of 0.85."
That is (if I understand correctly), a 10% increase in Region A's net-of-tax wage rate relative to Region B will increase the number of taxpayers in Region A by 8.5%.

To apply this finding to Prop 30, we can note that:
1. The average top marginal rate in states outside California is about 49.35%: 37% federal + 1.45% Medicare + 0.9% additional Medicare + ~5% top state rate ([eyeballing the Tax Foundation's summary](https://taxfoundation.org/publications/state-individual-income-tax-rates-and-brackets/))
1. Therefore, top earners in California face a net-of-tax rate of (1-0.5375) / (1-0.4935) = 0.91x the rate outside of California
1. If Prop 30 passes, that ratio will fall to (1-0.555) / (1-0.4935) = 0.88x
1. Prop 30 therefore reduces the net-of-tax rate relative to other states by 0.88 / 0.91 - 1 = 3.8%
1. Applying the elasticity, this translates to 3.8% * 0.85 = 3.2% fewer top earners
1. Those fewer top earners would reduce revenues by 3.2% * \$27 billion = **\$860 million**

*Thanks to David Agrawal for confirming that the rates outside California should cancel out, since they are not changing.*

Both studies preceded the Covid-19 pandemic, which has likely increased migration elasticities due to remote work.
This increases my confidence that, even though Agrawal and Foremny are half a world from California, their impact is closer to the truth than Young.

Putting it all together, I would expect that **Prop 30 would reduce revenues by at least \$1 billion per year,** aside from the direct revenues.
That's \$1 billion less for healthcare, education, poverty reduction, and other services.
And for what?

#### Spending analysis

80% of the revenue would fund vehicle subsidies, between subsidies for the vehicles themselves and for charging them.
These would be wasteful and sprawl-inducing.

[Xing (2019)](https://www.nber.org/papers/w25771) finds that "70% of [clean vehicle tax credits] were obtained by households that would have bought an EV without the credits."
As a result, they estimate that it costs about \$800 for clean vehicle subsidies to avert a ton of carbon emissions.
Even the young [direct air capture technology](https://www.wri.org/insights/direct-air-capture-resource-considerations-and-costs-carbon-removal) only costs about \$250 to \$600 per ton to remove a ton of emissions.

Even Xing may be overestimating the benfits of clean vehicle subsidies, because they don't account for the impact on sprawl.
For example, [Tanguay (2012)](https://journals.sagepub.com/doi/abs/10.1068/a44259?journalCode=epna) finds that higher gas prices increase the population living in the inner city and decrease low-density housing units.
Cheaper travel, which also applies to charging station subsidies, encourage sprawl, which harms the environment through paving over nature, adding to construction materials, and increasing travel from other vehicles.
Prop 30 exacerbates these issues by reserving some funds for charging stations specifically at single family homes.

To a first approximation, my guess is that clean vehicle and charging subsidies have zero emissions impact when accounting for land use.

California's track record reveals other problems with clean vehicle subsidies, namely that they create benefit cliffs that punish people for earning more money.
Today, a California family that buys a clean vehicle and home charger [loses \$9,500 in subsidies](https://twitter.com/MaxGhenis/status/1490065501640265730) once they earn \$1 above 400% of the poverty line:
* \$2,500 from California's Clean Vehicle Rebate Project for the vehicle
* \$5,000 from California's Clean Vehicle Assistance Program for the vehicle
* \$2,000 from California's Clean Vehicle Assistance Program for the charger

Existing programs create cliffs at other margins as well.
These programs violate basic guiding principles of public policy, and Prop 30 would expand their brokenness.

Regarding the remaining 20% of revenues, I'm admittedly not very familiar on wildfire prevention programs.
I would guess that this is valuable today, though I'm skeptical that we should lock in even this for the next 20 years.
Nevertheless, we can fund it from the general fund.

#### Decision

My quick-and-dirty analysis could under- or over-estimate the revenue impact.
For example, it might be larger if high-income Californians have more income in capital gains, which can be timed or donated in ways to avoid incurring income more than wages, or if remote work makes people more mobile compared to the studies of Californians and Spaniards from years ago.
It might be smaller if the spending programs lure people into California, or if they generate local spending multipliers that generate more revenue.

Regardless, taxes shrink the economy, and spending more money on vehicles for the next twenty years is not a worthwhile reason to do it.
Vote no.
