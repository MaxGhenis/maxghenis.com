---
title: "The US government just gutted Anthropic's R&D capacity"
description: "A Commerce export control pulled Claude Fable 5 and Mythos 5 on Friday. The overlooked effect: it cut Anthropic's own researchers off from the frontier models they build, while every competitor's researchers keep theirs."
pubDate: 'Jun 15 2026'
---

Anthropic released Claude Fable 5 last week. I used it for three days before the government switched it off.

I spent Tuesday through Thursday at a convening and Friday traveling without connectivity, so I worked at about a quarter of my usual pace. In that window I pointed Fable at a range of projects, including the microdata pipeline that PolicyEngine's tax and benefit modeling runs on. That pipeline combines household surveys, administrative records, and calibration against published totals into a synthetic population for federal, state, and local analysis. We had spent months rebuilding it. Fable redesigned the architecture across the dependent packages, rebuilt the pipeline, and produced a dataset about five times more accurate than the one it replaces, measured against our held-out targets. That work reaches users this week. In the same three days it re-engineered the agentic flows behind several systems we ship over the coming weeks.

That is one model, used part-time, for three days. The people who lose the most from Friday's order are not its customers. They are Anthropic's own researchers.

## What the order does

On Friday the Commerce Department directed Anthropic to suspend access to Fable 5 and the related Mythos 5 model for any foreign national, inside or outside the United States, including the company's own employees. Commerce used the Export Administration Regulations' ["deemed export" rule](https://www.bis.gov/learn-support/deemed-exports/what-deemed-export), which treats releasing controlled technology to a foreign person in the country as an export to their home country. Anthropic [could not screen its users by nationality in real time, so it disabled both models for everyone](https://www.anthropic.com/news/fable-mythos-access). Claude Opus 4.8 and the earlier models stayed up.

That is the first hit to its research. For as long as the order stands, every Anthropic researcher — citizen or not — works without the company's frontier model. They build the next model using the last one.

## Who the order actually bars

The durable restriction falls on foreign nationals, which is narrower than "non-citizen." The Bureau of Industry and Security states that ["persons with permanent residence status, U.S. citizenship, and persons granted status as 'protected individuals' are exempt from the 'deemed' export rule"](https://www.bis.gov/learn-support/deemed-exports/what-deemed-export). Green-card holders keep access. The bite lands on employees here on temporary visas.

How murky that line is showed up within a day. Headlines reported that [Andrej Karpathy, who joined Anthropic in May to lead its recursive self-improvement work, had been locked out of the models he was hired to build](https://www.ibtimes.co.uk/ai-expert-andrej-karpathy-anthropic-tech-regulation-1802715) because he is a Slovak-Canadian who holds no US citizenship. But Karpathy reportedly holds a green card, which exempts him. For days no one could say cleanly whether one of the field's most prominent researchers was in or out — a preview of the enforcement every lab now has to run, employee by employee.

## How many

Frontier AI runs on immigrant talent. About [two-thirds of top-tier AI researchers working in the United States earned their undergraduate degrees abroad](https://macropolo.org/interactive/digital-projects/the-global-ai-talent-tracker/), and international students are [the core of the US AI PhD pipeline](https://cset.georgetown.edu/article/international-graduate-students-critical-to-u-s-ai-competitiveness/). Most stay — [more than 80% of international AI PhDs remain five years out](https://cset.georgetown.edu/publication/the-long-term-stay-rates-of-international-stem-phd-graduates/) — and [74% of non-citizens plan to pursue a green card or citizenship](https://cset.georgetown.edu/publication/immigration-pathways-and-plans-of-ai-talent/), so many naturalize or get green cards and fall outside the order. What it still reaches are the researchers on temporary visas, and no one has published that share for Anthropic. The company is four years old and hiring foreign talent fast — its [certified H-1B count rose about 490% year over year](https://h1bgrader.com/h1b-sponsors/anthropic-pbc-10j7p51g0v) — so its staff skews toward recent arrivals more likely to be on visas than naturalized. My read is that this reaches a large share of its research workforce; during Friday's shutdown the figure was all of it. Every researcher at OpenAI, Google, and the Chinese labs, visa holders included, keeps access, because the order names only Anthropic's models.

## The incentive it sets

Applied as a standard, this penalizes shipping. Every frontier release would cut a lab's visa-holding researchers off from the model they just shipped, the one they need to build the next. A lab that ships nothing keeps its researchers' access; a lab that ships loses it.

## The path back

A mechanism exists. The deemed-export rule routinely lets foreign nationals work on controlled technology under an [individual license](https://www.bis.doc.gov/index.php/licensing/14-policy-guidance/deemed-exports/109-guidelines-for-foreign-national-licenses), usually backed by a technology control plan; semiconductor and aerospace firms employ non-citizens on restricted work this way. But BIS reviews each license under the rules for exporting to that employee's country of citizenship. For nationals of close allies, approval is routine. For nationals of countries the United States restricts, including China, the review [carries a presumption of denial](https://www.dwt.com/insights/2020/05/us-bis-china-technology-export-ban). The route back is per-employee and country-by-country, measured in months, and it would return some of the workforce while leaving the rest in review.

## On a consistent standard

The government has not said the problem is specific to Fable. It has not compared Fable to GPT-5.5 or any other model. Anthropic says [the capability at issue is available in other public models, including OpenAI's GPT-5.5, which carry no such restriction](https://www.anthropic.com/news/fable-mythos-access). The directive names only Anthropic's two models. Anthropic says the government [provided its evidence verbally, and that a competitor demonstrated the jailbreak](https://cyberscoop.com/us-government-anthropic-fable-5-mythos-5-export-controls/) behind the order.

No published standard tells another lab what to avoid, or tells Anthropic what to fix. For now the order's clearest effect is the one closest to home: Anthropic's researchers build the next model without the last one, and the visa holders among them face a months-long license to get it back — while every competitor's researchers never lost it.
