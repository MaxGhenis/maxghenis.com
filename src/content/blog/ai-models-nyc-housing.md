---
title: 'AI models favor Cuomo over Mamdani on NYC housing production'
description: 'An experiment using six AI models to forecast NYC housing production under two mayoral candidates.'
pubDate: 'Jun 23 2025'
heroImage: './images/ai-models-nyc-housing.png'
---

I spent the weekend in New York City, where canvassers requested my vote for Tuesday's primary election at least a dozen times. While New Yorkers will vote on several offices, most of the energy went to the ranked-choice mayoral, where prediction markets call it a two-candidate race: former governor [Andrew Cuomo](https://www.andrewcuomo.com/) leads Assemblymember [Zohran Mamdani](https://www.zohranfornyc.com/) with roughly 2:1 odds of victory ([73% chance of winning on Manifold](https://manifold.markets/HillaryClinton/who-will-be-the-democratic-nyc-mayo), [70% on Polymarket](https://polymarket.com/event/who-will-win-dem-nomination-for-nyc-mayor), and [69% on Kalshi](https://kalshi.com/markets/kxmayornycnomd/new-york-city-mayoral-nominations)).

Returning to my home in Washington, it struck me that I hadn't yet seen a quantitative analysis of the leading candidates' housing plans. Indeed, two main housing supply advocacy organizations—[Open New York](https://opennewyork.org/endorsements/) and [NYC New Liberals](https://www.nycnewliberals.org/2025-voting-guide)—declined to endorse either Cuomo or Mamdani. What if frontier AI models could fill the gap?

My experiment started with creating two prediction markets on [Manifold Markets](http://manifold.markets) asking how many housing units NYC would have by 2029—the final year of the four-year term—conditional on either Andrew Cuomo or Zohran Mamdani winning the mayoral election. I then provided six AI models with the market text and requested probability distributions:

- OpenAI o3-pro (normal and deep research versions)
- Anthropic Claude 4 Opus (normal and deep research versions)
- Google Gemini 2.5 Pro (normal and deep research versions)

## Key findings

**Housing stock predictions (2029):**
- Cuomo scenario: 3,924,000 homes
- Mamdani scenario: 3,869,000 homes
- Difference: 55,000 more units under Cuomo

**Growth comparison (from 2023 baseline of 3,705,000 homes):**
- Cuomo growth: 219,000 units (5.91%)
- Mamdani growth: 164,000 units (4.43%)
- **Result: 34% more growth under Cuomo**

Because the mayor takes office in January 2026, and the survey is conducted January-June 2029, this provides approximately 3.25 years of mayoral influence. Any growth occurring between the 2023 survey and the election may not be attributable to the election, and it would dilute the delta in growth. Alternatively, we can estimate the baseline growth excluding projected growth from 2023 to 2026. Assuming growth continues at the 27,500/year pace of [2022](https://data.census.gov/table/ACSDT1Y2022.B25001?g=160XX00US3651000) to [2023](https://data.census.gov/table/ACSDT1Y2023.B25001?g=160XX00US3651000) (per the American Community Survey), NYC is "nowcasted" to have 3,760,450 homes at the beginning of 2025. The growth over the term then falls to 164,000 under Cuomo and 109,000 under Mamdani: **50% more growth under Cuomo**.

## Model variation

Model predictions differed significantly:
- OpenAI o3-pro without Deep Research: 75,000 unit advantage for Cuomo
- OpenAI o3-pro with Deep Research: 36,000 unit advantage
- Google Gemini 2.5 Pro projected larger differentials than Anthropic Claude 4 Opus

## Factors identified

**General growth drivers:**
- Existing 421-a pipeline projects
- 1.4% vacancy rate (lowest since 1968)
- City of Yes zoning reforms (~5,500 units/year)
- Expected declining interest rates

**Cuomo-specific factors:**
- 467-m office conversion incentive
- Real estate industry relationships
- Proposed $5 billion capital fund

**Mamdani-specific factors:**
- 200,000 public units over 10 years
- Rent freeze on stabilized units
- Requires state approval for $70 billion financing

## Conclusion

I've increasingly found that AI models give more thorough responses when prompted with quantitative exercises like these, whether for [trade deficit policies](https://www.linkedin.com/posts/maxghenis_what-happens-when-you-give-an-ai-economist-activity-7325825369821884416-WUAN?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAHRBmABgFgIdjcDFs-ZD8yHUI3Rd1pqlWY) or [sleep therapies](https://x.com/MaxGhenis/status/1929213247443423622). For AIs and humans alike, forecasting forces one to identify the most relevant evidence to explore the dynamics at play—and to recognize that magnitudes matter.

Time will tell how accurate the AIs' predictions are. For now, I'm giving my mana as a proxy for their forecasts; if you disagree, I invite you to bet against them.

You can read the [full 48 pages of AI predictions here](https://docs.google.com/document/d/1g2IrB7p14vL6zagq7jIQaTwu1BUNMswl0mMSlUjn1vE/edit?usp=sharing), and [view the data here](https://docs.google.com/spreadsheets/d/1wJUly5dNDof42i259dhPkBOlcGTPe_ye1sv-Zu3mTCM/edit?gid=0#gid=0).
