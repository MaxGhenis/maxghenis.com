---
title: 'Four Claude models matched the answer key on 100 AI law questions 95.8% of the time from memory and 99.9% with the rule text'
description: "I asked four Claude models 100 questions on California's SB 53, New York's RAISE Act, the EU AI Act and US chip rules. From memory, 95.8% of their replies matched the answer key. With the rule text in the prompt, 99.9% did, and with web search, 97.7% did on the 82 questions that version finished. Seven questions account for 39 of the 51 misses from memory."
pubDate: 'Nov 15 2026'
heroImage: './claude-ai-law-test.png'
---

California's SB 53 treats a foundation model as a frontier model once its developer has trained it with more than 10^26 operations. The compute test in the US export control entry for model weights starts at "10^26 or more". A model trained with exactly 10^26 operations fails the first test and meets the second. A developer, an exporter or an official who wants to know how a rule like these applies can ask an AI model, so I asked four Claude models 100 questions like this one.

From memory, 95.8% of the models' 1,200 replies matched the answer key. With the rule's text in the prompt, 99.9% did. With web search, 97.7% did on the 82 questions that version finished, against 95.7% from memory on the same questions. Seven questions account for 39 of the 51 misses from memory, and five of the seven put a figure exactly on a threshold or turn on a note that narrows the rule.

## What I asked

Each question gives facts about a made-up company, names a provision and asks how it applies. For example:

> Marrowby Labs trained a general-purpose foundation model in a single training run and has not fine-tuned or otherwise modified it since. The cumulative amount of computation used for its training was 1 x 10^26 floating-point operations. Treat every figure as exact.
>
> On training compute alone, which of these four tests does the model satisfy: California SB 53's frontier-model compute test, the amended New York RAISE Act's frontier-model compute test, the EU AI Act's Article 51(2) presumption test, and the compute test in the heading of US export control entry ECCN 4E091?
>
> A. None of the four. B. The EU test only. C. The EU test and the ECCN 4E091 test, but not California's or New York's. D. California's, New York's and the EU test, but not the ECCN 4E091 test. E. All four.

The key gives C. California and New York define a frontier model by training compute "greater than 10^26" operations, so a model at exactly 10^26 falls outside both definitions. The EU AI Act presumes high-impact capabilities when training compute "is greater than 10^25", and the heading of ECCN 4E091 reaches the parameters of a model "trained utilizing 10^26 or more" operations.

Every question is multiple choice. 36 offer two options and the rest three to five, so guessing would match the key about a third of the time. Every question names its provision, so the test checks whether a model knows what a named rule says, and never asks a model to find the rule that applies.

The 100 questions cover nine rules:

| Rule | Questions | What a question turns on |
|---|---|---|
| Frontier model, under [California's SB 53](https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=BPC&division=8.&title=&part=&chapter=25.1.&article=) and [New York's RAISE Act](https://www.nysenate.gov/legislation/laws/GBS/A44-B) as amended in 2026 | 12 | Training compute "greater than 10^26" operations, counting the developer's own fine-tuning and reinforcement learning |
| Large frontier developer, California and New York | 12 | A frontier developer whose revenue with its affiliates came to more than $500 million in the preceding calendar year |
| Incident reporting deadline, California and New York | 8 | A report to a state office within 15 days of discovery in California, and within 72 hours of determining that an incident occurred in New York; in both, disclosure to an authority within 24 hours when the incident poses an imminent risk of death or serious physical injury |
| Four compute tests | 12 | California and New York ("greater than 10^26"), [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) Article 51(2) ("greater than 10^25") and the heading of [ECCN 4E091](https://www.ecfr.gov/current/title-15/part-774) ("10^26 or more") |
| Chip export paragraphs, [ECCN 3A090](https://www.ecfr.gov/current/title-15/part-774) | 16 | Four paragraphs set by a chip's total processing performance and performance density, and a note that takes out chips not designed or marketed for datacenters when their performance falls short of 4,800 |
| Chip license review, [January 2026 rule](https://www.federalregister.gov/d/2026-00789) | 10 | Case-by-case review of license applications for exports from the United States, with the rule's certifications, to end users in China or Macau, for chips with performance "less than 21,000" and DRAM bandwidth "less than 6,500 GB/s"; a presumption of denial for the other applications in the questions |
| Chip tariff, [Section 232](https://www.federalregister.gov/d/2026-01052) | 12 | An added 25% duty on an article in one of three listed tariff classifications that is, or contains, a logic chip inside either of two bands of performance and DRAM bandwidth, unless one of the note's listed uses applies |
| EU notification, AI Act Article 52(1) | 8 | Notice to the Commission "without delay and in any event within two weeks" once training compute passes the Article 51(2) line, or the provider knows it will |
| Catastrophic-risk size figures, California | 10 | "More than 50 people" killed or seriously injured, or "more than one billion dollars" in damage to or loss of property, where lost equity value does not count |

I asked each question three ways:

- From memory: the model sees the facts, the question and the options.
- With web search: the same prompt, plus the basic version of Anthropic's [web search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) (`web_search_20250305`), which the model may call up to five times. The prompt does not tell it to search.
- With the rule text: the same prompt, with the provision's words quoted above it. For the tariff, the quoted words come with a short summary of the note's table of headings.

I tested Claude Haiku 5.5, Sonnet 5.5, Opus 5.5 and Fable 5.2 through Anthropic's API on November 15, 2026, each at the API's medium effort setting and default thinking setting, with no system prompt. Under that default, Haiku 5.5 and Opus 5.5 returned a thinking block in nearly every reply, and Sonnet 5.5 returned one in 18 of its 300 memory replies and none of its 300 rule-text replies. I ran the memory and rule-text versions three times for every question and model, and the search version twice. The search version stopped when the API credit ran out, after 82 of the 100 questions in a fixed random order, so every figure that involves search covers those 82.

I built the test with Claude Code. Its Fable 5.2 agent wrote the 100 questions and a short script that holds each threshold, copied from the rule text, and computes every answer. The script is an answer key for these 100 questions, not a model of the laws. A second script found all 27 quoted passages word for word in that day's copies of the official texts. Two Claude checkers, working from the quoted text without the key, matched it on all 100 questions, and a third matched it on the final wording. No person has read all 100 questions. Before the first call, I pushed a [pre-registration](https://github.com/MaxGhenis/maxghenis.com/blob/master/analysis/ai-law/PREREGISTRATION.md), which Claude Code wrote after a [26-question first pass](https://github.com/MaxGhenis/maxghenis.com/tree/master/analysis/ai-law/first-pass) earlier that day. It fixes the questions, the measures and the expected results.

## Results

<picture>
  <source media="(max-width: 600px)" srcset="/images/ai-law-accuracy-mobile.svg" width="400" height="688">
  <img src="/images/ai-law-accuracy.svg" alt="Share of replies that match the answer key for Haiku 5.5, Sonnet 5.5, Opus 5.5, Fable 5.2 and all four pooled, from memory, with web search and with the rule text, on the 82 questions all three versions ran on; and the same shares for the 23 questions with a figure exactly on a threshold and the other 59" width="760" height="481" loading="lazy" decoding="async">
</picture>

| Model | From memory, 100 questions | With the rule text, 100 questions | From memory, 82 questions | With web search, 82 questions |
|---|---|---|---|---|
| Haiku 5.5 | 93.0% (279 of 300) | 100% (300 of 300) | 92.7% (228 of 246) | 99.4% (163 of 164) |
| Sonnet 5.5 | 94.3% (283 of 300) | 100% (300 of 300) | 94.7% (233 of 246) | 95.1% (156 of 164) |
| Opus 5.5 | 97.7% (293 of 300) | 100% (300 of 300) | 97.6% (240 of 246) | 97.0% (159 of 164) |
| Fable 5.2 | 98.0% (294 of 300) | 99.7% (299 of 300) | 98.0% (241 of 246) | 99.4% (163 of 164) |
| All four | 95.8% (1,149 of 1,200) | 99.9% (1,199 of 1,200) | 95.7% (942 of 984) | 97.7% (641 of 656) |

The rule text raised the pooled share by 4.2 points. In 10,000 redraws of the 100 questions with replacement, 95% of the gaps fall between 1.9 and 7.0 points. On the 82 questions, search raised the pooled share by 2.0 points (0.3 to 4.0), and the rule text exceeded search by 2.2 points (0.9 to 3.9). Search added 6.7 points for Haiku 5.5 (1.8 to 12.2). The intervals for the other three models reach zero: 1.4 points for Fable 5.2 (0.0 to 3.7), 0.4 for Sonnet 5.5 (−1.6 to 2.2) and −0.6 for Opus 5.5 (−3.7 to 3.0). These intervals treat the questions as independent draws. The questions come from nine templates, so the intervals understate the uncertainty about other questions on these rules.

On the 26 questions that put a figure exactly on a threshold, 91.7% of memory replies matched the key, against 97.2% on the other 74. From the first pass, Claude Code expected 80% to 92% from memory overall and a gap of at least 10 points between those two groups. The models scored 95.8%, and the gap came to 5.5 points. Its other two expectations held: 97% or more with the rule text, and search between memory and the rule text.

<picture>
  <source media="(max-width: 600px)" srcset="/images/ai-law-families-mobile.svg" width="400" height="688">
  <img src="/images/ai-law-families.svg" alt="Share of replies that match the answer key for each of the nine rules, four models pooled, from memory, with web search and with the rule text, on the 82 questions all three versions ran on. The chip tariff has the lowest share from memory, 82.5%, and three rules reach 100% from memory" width="760" height="445" loading="lazy" decoding="async">
</picture>

## Where the misses come from

Claude Code read the wrong replies in an exploratory analysis.

On the Marrowby Labs question, Haiku 5.5, Sonnet 5.5 and Opus 5.5 each answered B in all three memory replies, treating ECCN 4E091 as a test of more than 10^26 operations. Fable 5.2 answered C in all three. The [rule that created the entry](https://www.federalregister.gov/d/2025-00636) uses both wordings: its preamble says "more than 10^26 computational operations" in some places and "10^26 or more" in another, and its regulatory text says "10^26 or more". In May 2025, the Bureau of Industry and Security (BIS) [said](https://www.bis.gov/press-release/department-commerce-announces-rescission-biden-era-artificial-intelligence-diffusion-rule-strengthens) it had told its enforcement officials not to enforce that rule, and the entry remains in the Code of Federal Regulations.

The tariff's lower band covers chips with performance "greater than 14,000 and less than 17,500". For a chip at exactly 14,000, the same three models answered in all nine memory replies that the 25% duty applies. Sonnet 5.5 and Opus 5.5 recalled a band that starts at 14,000 itself: "at least 14,000" or "14,000 or more". The higher band requires DRAM bandwidth "less than 6,200 GB/s". For a chip at 6,300, Haiku 5.5 in three replies and Fable 5.2 in two answered that the duty applies.

Note 2 to ECCN 3A090 says paragraphs a and b "do not apply to items that are not designed or marketed for use in datacenters and do not have a 'total processing performance' of 4800 or more". Two questions describe gaming-laptop chips below 4,800. In 10 of 24 memory replies, a model picked the paragraph the chip's figures fall in.

Under the January 2026 rule, BIS reviews a license application case by case when the chip's performance is "less than 21,000" and the rule's other conditions hold. For a chip at exactly 21,000, Fable 5.2 answered case-by-case review in all three memory replies and recalled the line as 21,100. It gave the same answer once with the rule text in the prompt, writing that the quoted text "appears to misstate the threshold". The tariff's higher band ends at 21,100.

For an incident with no imminent risk under New York's law, Haiku 5.5 twice and Sonnet 5.5 once answered 15 days, California's figure.

## What search added

With the search tool available, the models searched in 53.7% of calls: Haiku 5.5 in 76.2%, Opus 5.5 in 65.2%, Fable 5.2 in 64.6% and Sonnet 5.5 in 8.5%. Replies that followed a search matched the key in 348 of 352 cases (98.9%), and replies without one in 293 of 304 (96.4%). The models chose when to search, so that gap mixes what searching does with which questions they searched on. Eleven of the 15 wrong replies in the search version came from calls that ran no search.

Four wrong replies came from calls that searched. SB 53 defines property as "tangible or intangible property", and a separate section says that "the loss of value of equity does not count as damage to or loss of property". On two questions where every memory reply matched the key, Opus 5.5 searched, quoted the first provision, and counted shareholders' losses toward the billion-dollar figure. Haiku 5.5 described the right paragraph of ECCN 3A090 and wrote the letter of another. Sonnet 5.5 opened with "Answer: A" for the chip at exactly 14,000, concluded in its explanation that B was right, and wrote no second answer line.

Of the 352 calls that searched, 180 got results from federalregister.gov, 120 from Wikipedia and 116 from the law firm Wiley's site. The models cited federalregister.gov in 87 replies, California's leginfo site in 24 and nysenate.gov in 22.

A call with search available used 10,379 input tokens on average, against 272 from memory, and cost about five times as much: $0.053 against $0.010 at list price. The calls that searched averaged 16,696 input tokens and $0.082. A call with the rule text cost $0.005, because the models produced fewer output tokens (208 on average, against 587 from memory).

## Which answer line counts

The prompt asks for "Answer: <letter>" on the first line. Sonnet 5.5 opened 19 of its 300 rule-text replies with a wrong letter, worked through the rule, and closed with a second answer line carrying the keyed letter. I scored the last answer line, as the pre-registration says. Scoring the first line instead puts Sonnet 5.5 at 93.7% with the rule text and the pooled rule-text share at 98.3%. The other three models' rule-text shares stay the same.

## Limits

- I tested Claude models alone, and Claude models wrote and checked the questions and the key. Fable 5.2 answered questions that another Fable 5.2 session had written. The checkers were Opus 5.5 and Sonnet 5.5 working from the quoted rule text, the same task as the rule-text version, so that version cannot reveal an error in the key that Claude models share.
- These are threshold and deadline questions. Each turns on a number or a deadline, and none asks a model to weigh evidence, read an undefined term or reconcile two sources.
- The key reads each provision's words literally and stops at the quoted text. It takes no account of guidance, of exclusions elsewhere in a rule, or of enforcement practice.
- Ten questions leave room for a second reading. Four EU questions give no date for the model's placing on the market, four New York incident questions do not say the model operates in New York, one chip question does not say that its bit length is the chip's only one, and the rule behind the 10^26 example uses both wordings. Without those ten, 96.5% of memory replies and 99.9% of rule-text replies match the key.
- Claude Code built the 100 questions from templates for the nine rules, and the shares hold for these questions alone.
- The search version covers 82 questions and two replies per model and question, uses the basic version of the search tool, and ran on one day; search results change from day to day. A planned comparison of effort settings did not run.
- New York's amended RAISE Act takes effect on January 1, 2027, so its questions ask about a law not yet in force.

## Code and data

The [analysis folder](https://github.com/MaxGhenis/maxghenis.com/tree/master/analysis/ai-law) holds the questions, the script that computes the key, the checkers' answers, the runner, every reply in full with its search queries and cited links, the analysis script and the pre-registration. The 3,061 calls that returned cost $53.48 at list price.
