---
title: 'Will Waymo make DC streets safer?'
description: 'I created paired Manifold markets on DC traffic fatalities and serious injuries in 2027, conditional on whether Waymo serves the public before then.'
pubDate: 'Apr 25 2026'
---

Waymo wants to launch in Washington, DC. The policy question I care about is not just whether it gets permission. It is whether DC streets get safer.

Waymo [announced](https://waymo.com/blog/2025/03/next-stop-for-waymo-one-washingtondc/) that it aimed to bring Waymo One to DC in 2026, while also saying it still needed regulations to operate without a human behind the wheel. DC politics then became the binding constraint. Axios reported this month that Councilmember Charles Allen was introducing [legislation to allow robotaxis](https://www.axios.com/local/washington-dc/2026/04/24/dc-bill-robotaxis-waymo-charles-allen), while a delayed DDOT robotaxi study was [expected this summer](https://www.axios.com/local/washington-dc/2026/04/16/robotaxi-study-waymo-ddot).

There is already a Manifold market on the political trigger: [Waymo serves the general public in Washington, D.C. before 2027](https://manifold.markets/Bayesian/waymo-serves-the-general-public-in). That is useful, but it stops one step too early. If it resolves YES, we learn Waymo launched. We still do not learn whether that was good for public safety.

So I created paired markets for the outcome that matters more:

- If Waymo serves DC before 2027, how safe are DC streets in 2027?
- If Waymo does not serve DC before 2027, how safe are DC streets in 2027?

The gap between those forecasts is the market's implied estimate of Waymo's aggregate safety effect.

## Why not forecast Waymo crashes?

My first instinct was to ask something like "How many Waymo crashes will there be in DC?" That is the wrong metric.

If Waymo is not legally permitted, Waymo crashes mechanically fall toward zero. That would mostly measure exposure, not safety. A city with no robotaxis has no robotaxi crashes, but that does not mean banning robotaxis made the city safer.

The right question is citywide: total traffic fatalities or serious traffic-crash injuries in DC in 2027. Those can go up or down in either world. They also capture the actual policy tradeoff: whether Waymo replaces riskier human-driven miles, induces extra trips, interacts badly with pedestrians and cyclists, or stays too small to matter.

DC already tracks these outcomes through its [Vision Zero dashboard](https://dcvisionzero.github.io/Crash-Injury-Dashboard/) and crash datasets. The dashboard covers traffic fatalities and major injuries, says DDOT uses the data for safety engineering, and, as of this writing, was updated on April 23, 2026 with crash records through April 21.

Recent data are noisy. DC had roughly 50 traffic fatalities in both 2023 and 2024, fell into the low 20s in 2025, and was back at 14 fatalities year-to-date by late April 2026. Serious injuries have trended down more steadily, from the mid-300s in 2023-2024 to about 300 in 2025.

## The markets

I made four Manifold markets:

| Outcome | If Waymo serves DC before 2027 | If Waymo does not serve DC before 2027 |
| --- | ---: | ---: |
| 2027 DC traffic fatalities | [41](https://manifold.markets/MaxGhenis/if-waymo-serves-dc-before-2027-how) | [42](https://manifold.markets/MaxGhenis/if-waymo-does-not-serve-dc-before-2) |
| 2027 DC serious traffic-crash injuries | [280](https://manifold.markets/MaxGhenis/if-waymo-serves-dc-before-2027-how-hUglCRuRq8) | [285](https://manifold.markets/MaxGhenis/if-waymo-does-not-serve-dc-before-2-t8StNlcEEy) |

Those numbers are my seed estimates from April 25, 2026, not final claims. Markets move.

Disclosure: I created and hold positions in the four conditional markets and traded the trigger market toward my estimate.

My current prices imply a modest expected safety benefit: about one fewer traffic fatality and five fewer serious injuries in 2027 if Waymo serves DC before 2027. That is not because I think autonomous vehicles cannot matter. It is because the outcome is citywide and the first-year exposure is likely small. Even if Waymo is safer per mile than human driving, it takes a lot of substituted miles to visibly move aggregate DC fatality counts.

## What would move the forecast?

I would move the Waymo-launch markets lower on fatalities and injuries if DC authorized a broad rollout earlier than expected, if Waymo announced a large service area, or if evidence from other cities showed large substitution away from human-driven ridehail miles.

I would move them higher if DC limited service to a tiny geofence, required slow expansion, saw operational problems around pedestrians or emergency vehicles, or if early adoption looked like mostly induced trips rather than substituted trips.

I would move both launch and no-launch markets together if the baseline DC traffic-safety trend changed. The biggest uncertainty is not Waymo. It is where DC's underlying safety trend is headed after the unusually low fatality count in 2025 and the sharper 2026 year-to-date pace.

## Market design notes

The key design choice is pairing the launch and no-launch worlds on the same citywide outcomes. That makes the disagreement concrete. If you think Waymo would make DC more dangerous, buy up the launch-conditional fatality and injury markets relative to the no-launch markets. If you think Waymo would make DC safer, push them down.

I also separated market rules from seed rationale. The descriptions define resolution: which official sources count, what year to measure, and when to resolve N/A based on the trigger market. My rationale for the seed prices belongs in comments, not in the resolution criteria. The market should not bake my argument into the rules.

This is the part I eventually want [farness](https://farness.ai/) to support: when a public decision has measurable outcomes, turn the forecast into a set of linked markets. But the general-purpose tooling deserves its own post. Here the point is narrower: if the DC Waymo debate is really about safety, the safety claim should be explicit and tradeable.
