---
title: "The US government just gutted Anthropic's R&D capacity"
description: "A Commerce export control pulled Claude Fable 5 and Mythos 5 on Friday. The overlooked effect: it cut roughly a third of Anthropic's own researchers off from the frontier models they build, while every competitor's researchers keep theirs."
pubDate: 'Jun 15 2026'
heroImage: './images/three-days-with-fable.png'
---

Anthropic released Claude Fable 5 last week. I used it for three days before the government switched it off.

I spent Tuesday through Thursday at a convening and Friday traveling without connectivity, so I worked at about a quarter of my usual pace. In that window I pointed Fable at a range of projects, including the microdata pipeline that PolicyEngine's tax and benefit modeling runs on. That pipeline combines household surveys, administrative records, and calibration against published totals into a synthetic population for federal, state, and local analysis. We had spent months rebuilding it. Fable redesigned the architecture across the dependent packages, rebuilt the pipeline, and produced a dataset about five times more accurate than the one it replaces, measured against our held-out targets. That work reaches users this week. In the same three days it re-engineered the agentic flows behind several systems we ship over the coming weeks.

That is one model, used part-time, for three days. The effect that matters most from Friday's order is not on its customers. It is on Anthropic's own researchers.

## What the order does

On Friday the Commerce Department directed Anthropic to suspend access to Fable 5 and the related Mythos 5 model for any foreign national, inside or outside the United States, including the company's own employees. Commerce used the Export Administration Regulations' ["deemed export" rule](https://www.bis.gov/learn-support/deemed-exports/what-deemed-export), which treats releasing controlled technology to a foreign person in the country as an export to their home country. Anthropic [could not screen its customers by nationality in real time, so it pulled both models for all users](https://www.anthropic.com/news/fable-mythos-access). Claude Opus 4.8 and the earlier models stayed up.

That global cutoff is the commercial cost. The research cost is narrower and more specific.

## Who it bars

Inside the company, Anthropic knows each employee's status, so complying does not mean benching everyone — it means barring its foreign-national researchers from the models they build, while their citizen and green-card colleagues keep using them. And "foreign national" is narrower than "non-citizen": under the deemed-export rule the order invoked, the Bureau of Industry and Security states that ["persons with permanent residence status, U.S. citizenship, and persons granted status as 'protected individuals' are exempt"](https://www.bis.gov/learn-support/deemed-exports/what-deemed-export). Green-card holders keep access; the bite lands on employees on temporary visas. The Commerce letter itself is not public, so this rests on the standard rule the order cites — I have found no sourced basis for the competing claim that it reaches green-card holders.

How murky even that line is showed up within a day. Headlines reported that [Andrej Karpathy, who joined Anthropic in May to lead its recursive self-improvement work, had been locked out of the models he was hired to build](https://www.ibtimes.co.uk/ai-expert-andrej-karpathy-anthropic-tech-regulation-1802715) for lacking US citizenship. But Karpathy reportedly holds an EB-1 green card, which exempts him; the headlines had conflated "not a citizen" with "barred." For days no one could say cleanly whether one of the field's most prominent researchers was in or out.

## How many

Frontier AI runs on immigrant talent: about [two-thirds of top-tier AI researchers in the United States earned their undergraduate degrees abroad](https://macropolo.org/interactive/digital-projects/the-global-ai-talent-tracker/), and international students are [the core of the US AI PhD pipeline](https://cset.georgetown.edu/article/international-graduate-students-critical-to-u-s-ai-competitiveness/). My estimate is that roughly **35% of Anthropic's researchers are on temporary visas**, and so are the ones barred. The funnel: about 65% of its research staff are foreign-origin, and roughly 55% of those are still on a temporary visa rather than naturalized or holding a green card — a fraction that runs high because Anthropic is only four years old, and because [green-card backlogs for Chinese and Indian nationals](https://www.dwt.com/insights/2020/05/us-bis-china-technology-export-ban), the field's two largest talent sources, run a decade or more, leaving even long-tenured staff on H-1B. It is an estimate, not a count: Anthropic publishes no breakdown, and its [H-1B filings](https://h1bgrader.com/h1b-sponsors/anthropic-pbc-10j7p51g0v) are flow, not stock. Whatever the exact figure, every researcher at OpenAI, Google, and the Chinese labs — visa holders included — keeps access, because the order names only Anthropic's models.

## The incentive it sets

Applied as a standard, this penalizes shipping. Every frontier release would cut a lab's visa-holding researchers off from the model they just shipped, the one they need to build the next. A lab that ships nothing keeps its researchers' access; a lab that ships loses it.

## The path back

A mechanism exists. The deemed-export rule routinely lets foreign nationals work on controlled technology under an [individual license](https://www.bis.doc.gov/index.php/licensing/14-policy-guidance/deemed-exports/109-guidelines-for-foreign-national-licenses), usually backed by a technology control plan; semiconductor and aerospace firms employ non-citizens on restricted work this way. But BIS reviews each license under the rules for exporting to that employee's country of citizenship. For nationals of close allies, approval is routine. For nationals of countries the United States restricts, including China, the review [carries a presumption of denial](https://www.dwt.com/insights/2020/05/us-bis-china-technology-export-ban). The route back is per-employee and country-by-country, measured in months, and it would return some of the workforce while leaving the rest in review.

## On a consistent standard

The government has not said the problem is specific to Fable. It has not compared Fable to GPT-5.5 or any other model. Anthropic says [the capability at issue is available in other public models, including OpenAI's GPT-5.5, which carry no such restriction](https://www.anthropic.com/news/fable-mythos-access). The directive names only Anthropic's two models. Anthropic says the government [provided its evidence verbally, and that a competitor demonstrated the jailbreak](https://cyberscoop.com/us-government-anthropic-fable-5-mythos-5-export-controls/) behind the order.

No published standard tells another lab what to avoid, or tells Anthropic what to fix. For now the order's clearest effect is the asymmetry: Anthropic's foreign-national researchers — roughly a third of its research staff — face a months-long license to use the model their colleagues built, while every competitor's researchers, citizens and visa holders alike, never lost access.
