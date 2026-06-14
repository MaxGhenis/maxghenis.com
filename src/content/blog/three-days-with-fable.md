---
title: 'Three days with Fable'
description: "Anthropic's Fable 5 rebuilt months of our data work in three days. Then a Commerce Department export control switched it off, including for the company's own engineers."
pubDate: 'Jun 14 2026'
---

Anthropic released Claude Fable 5 last week. I used it for three days before the government switched it off.

I spent Tuesday through Thursday at a convening and Friday traveling without connectivity, so I worked at about a quarter of my usual pace. In that window I pointed Fable at a range of projects, including the microdata pipeline that PolicyEngine's tax and benefit modeling runs on. That pipeline combines household surveys, administrative records, and calibration against published totals into a synthetic population for federal, state, and local analysis. We had spent months rebuilding it. Fable redesigned the architecture across the dependent packages, rebuilt the pipeline, and produced a dataset about five times more accurate than the one it replaces, measured against our held-out targets. That work reaches users this week. In the same three days it re-engineered the agentic flows behind several systems we ship over the coming weeks.

That is one model, used part-time, for three days.

## What the order does

On Friday the Commerce Department directed Anthropic to suspend access to Fable 5 and the related Mythos 5 model for any foreign national, including the company's own non-citizen employees and any foreign person on U.S. soil. Commerce used the [Export Administration Regulations' "deemed export" rule](https://www.bis.gov/learn-support/deemed-exports/what-deemed-export), which treats releasing controlled technology to a foreign national inside the United States as an export to their home country. [Reporting describes this as the first time the rule has covered a commercial AI model](https://www.tomshardware.com/tech-industry/artificial-intelligence/us-export-control-order-forces-anthropic-to-disable-claude-fable-5-and-mythos-5-worldwide) rather than hardware. Anthropic [could not screen its users by nationality in real time, so it disabled both models for everyone](https://www.anthropic.com/news/fable-mythos-access). Claude Opus 4.8 and the earlier models stayed up.

## The effect on Anthropic's research

Most coverage led with the public losing a model for a few days. The constraint on Anthropic's own research outlasts that.

The deemed-export rule keys on citizenship, so the order bars Anthropic's foreign-national employees from the model they built. By MacroPolo's [Global AI Talent Tracker](https://macropolo.org/interactive/digital-projects/the-global-ai-talent-tracker/), more than two-thirds of top-tier AI researchers working in the United States earned their undergraduate degrees abroad; the order reaches those among them who hold neither citizenship nor permanent residency, a share neither Anthropic nor the government has stated.

A foreign-national researcher at OpenAI, Google, or a Chinese lab can use that company's frontier model today. The same researcher at Anthropic cannot. The order restricts not only who buys the product but who builds the next one.

A restriction on the public model can rest on what the public might do with it. The deemed-export rule reaches Anthropic's own staff, where that reasoning does not apply. The question there is not whether the public should hold the capability. It is whether the people developing it can run it.

Applied as a standard, this penalizes shipping. Every frontier release would lock a lab's foreign-national researchers out of the model they just shipped, the one they need to build the next. A lab that ships nothing keeps its researchers' access; a lab that ships loses it.

## The licensing path

A mechanism exists. The deemed-export rule routinely lets foreign nationals work on controlled technology under an [individual license](https://www.bis.doc.gov/index.php/licensing/14-policy-guidance/deemed-exports/109-guidelines-for-foreign-national-licenses), usually backed by a technology control plan; semiconductor and aerospace firms employ non-citizens on restricted work this way. But BIS reviews each license under the rules for exporting to that employee's country of citizenship. For nationals of close allies, approval is routine. For nationals of countries the United States restricts, including China, the review [carries a presumption of denial](https://www.dwt.com/insights/2020/05/us-bis-china-technology-export-ban). Federal rules [target 90 days for processing](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-VII/subchapter-C/part-750), and sensitive cases run longer. The route back is not a switch. It is a per-employee, country-by-country process that would return part of the workforce in months and leave the rest in review.

## On a consistent standard

The government has not said the problem is specific to Fable. It has not compared Fable to GPT-5.5 or to any other model. Anthropic says [the capability at issue is available in other public models, including OpenAI's GPT-5.5, which carry no such restriction](https://www.anthropic.com/news/fable-mythos-access). The directive names only Anthropic's two models. Anthropic says the government [provided its evidence verbally, and that a competitor demonstrated the jailbreak](https://cyberscoop.com/us-government-anthropic-fable-5-mythos-5-export-controls/) behind the order.

The government has published no standard that would tell another lab what to avoid, or tell Anthropic what to fix. The model is offline for everyone, its own engineers included, and the route back runs on a licensing clock measured in months.
