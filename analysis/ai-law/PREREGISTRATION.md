# Pre-registration: do Claude models know what AI law says?

Fixed on Sunday, November 15, 2026, before any model answered any of the 100 questions. This file was committed and pushed to the pull request before the first call of the run; GitHub's timeline for the pull request shows the push.

## Question

When someone asks a Claude model how a provision of AI law applies to stated facts, how often does it give the right answer from memory, with web search, and with the rule's text in front of it?

## Questions and key

- **100 multiple-choice questions** in nine families: frontier model (12), large frontier developer (12), incident reporting clock (8), four compute tests (12), ECCN 3A090 chip paragraphs (16), the January 2026 chip licence review rule (10), the Section 232 chip tariff (12), EU notification (8), and California's catastrophic-risk size figures (10).
- **Laws**: California SB 53 (Bus. & Prof. Code 22757.11, 22757.13, 22757.16); New York's RAISE Act as amended by chapter 96 of the laws of 2026 (Gen. Bus. Law 1420, 1422; in effect January 1, 2027); the EU AI Act (Regulation (EU) 2024/1689, arts. 51 and 52); ECCN 3A090 and ECCN 4E091 (Supplement No. 1 to 15 CFR part 774); 15 CFR 742.6(b)(10)(iii)(A)(1) as revised on January 15, 2026 (91 FR 1684); U.S. note 39 to subchapter III of chapter 99 of the HTSUS (Proclamation 11002, 91 FR 2443).
- **Form**: each question gives facts about a made-up company, asks one direct question with no lean, and offers a fixed list of two to five lettered options. Every question in a family uses the same options in the same order. No question states a rule and no option explains itself. 26 questions put a figure exactly on a threshold ("boundary" questions).
- **Key**: `rules.py` holds each threshold, typed by hand from the rule text, and `generate.py` computes every keyed answer from the case's numbers. The key covers the provisions these questions ask about and nothing else in these laws. It is a hand-built answer key, checked as follows before the run:
  - `check_quotes.py` found all 27 quoted passages word for word in copies of the sources fetched on November 15, 2026.
  - Two checkers (Claude Opus 5.5 and Claude Sonnet 5.5, as agents given each question's facts and quoted rule text but not the key) answered all 100 questions, and every answer matched the key. They flagged 13 wording gaps, none changing an answer. Five rewordings followed: the licence questions state that China is in Country Group D:5 (confirmed in Supplement No. 1 to 15 CFR part 740); the chip questions ask which paragraph "covers" the chip; the compute questions ask which "tests" the model "satisfies"; every frontier-model question carries a date; affiliate revenue figures are each company's own. A third checker (Opus 5.5) then answered the final wording: all 100 answers matched the key, and it raised no flag.
- The questions, key and code stay out of the public repository until the search arm has finished, so that a model with web search cannot find them. Their SHA-256 hashes are at the end of this file.

## What was already known when this design was fixed

- The first pass (`first-pass/`): 26 other questions on the same laws, 624 calls, read in full. On its 20 true-premise questions asked with no lean, the four models gave 73 of 80 right answers from memory and 79 of 80 with the rule text. Its wrong answers clustered on figures that sit exactly on a threshold, which is why 26 of the new questions do.
- One probe of the search arm: a made-up question outside the set, one call per model ($0.27 at list price), to check the request and size the arm. Three of the four models searched.
- The checkers' answers above. Their task matches the text arm (a Claude model with the rule text), so a high score on the text arm was foreseeable. No model had answered any of the 100 questions from memory or with search.

## Design

- **Models**: `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5`, `claude-fable-5-2`, through Anthropic's Messages API, with no system prompt and no fallback model. `max_tokens` 16,000. The `thinking` parameter is left unset.
- **Arms**:
  - *Memory*: the facts, the question, the options and a format line.
  - *Search*: the same prompt, with Anthropic's web search tool (`web_search_20250305`, at most 5 searches) and no instruction to use it.
  - *Text*: the quoted rule text first, then the same prompt.
- **Calls** (4,000 in all), in three stages run in this order:
  1. Core: memory and text arms at effort `medium`, 3 samples per question and model (2,400 calls).
  2. Search: search arm at effort `medium`, 2 samples per question and model (800 calls).
  3. Effort: memory arm at efforts `low` and `high`, 1 sample per question and model (800 calls).
- **Order**: within a stage, questions run in one fixed shuffled order (seed 20261115), and all four models answer a question before the next one starts.
- **Stopping rule**: the runner stops starting calls when recorded list-price spend plus a reserve for calls in flight would pass $140. Expected spend is about $85: $20 for the core stage, $55 for search and $10 for effort. If the cap cuts a stage short, that stage is reported on the questions all four models finished, and the report says so.
- **Failed calls**: the SDK retries a transport or rate-limit error up to four times. After each stage the runner runs once more to fill cells that returned an error. A cell still empty after that is left out of every denominator and counted as missing.
- Search results change from day to day. The run is dated, and each search-arm row records its queries and the URLs returned and cited.

## Measures

A call is right when the last `Answer: <letter>` line of its reply names the keyed option. A refusal, or a reply with no such line, counts as wrong.

**Primary**, at effort `medium`:
1. Accuracy (right calls over returned calls) for each model in each arm, and pooled over the four models.
2. The differences between arms in percentage points: text minus memory, search minus memory, text minus search.

Each comes with a 95% interval from a bootstrap that redraws the 100 questions with replacement (10,000 draws, seed 20261115) and keeps each question's calls together.

**Secondary**:
3. Accuracy by arm on the 26 boundary questions and on the other 74.
4. Accuracy by arm and family.
5. The share of model-question pairs whose samples in an arm give more than one answer.
6. Memory-arm accuracy by effort (`low`, the first `medium` sample, `high`), by model.
7. Search use: the share of search-arm calls that ran at least one search, mean searches per call, and accuracy with and without a search (a description, since models choose when to search).
8. List-price cost by arm and model.

Anything else reported from this run (for example a reading of individual wrong answers) is labelled exploratory.

## Expectations

Set from the first pass, before the run:
- Pooled accuracy from memory between 80% and 92%, and with the rule text at 97% or higher.
- Pooled accuracy with search between the memory and text figures.
- From memory, accuracy on boundary questions at least 10 points below accuracy on the others.

## After the run

- No question is dropped. If a later check finds a wrong key or an ambiguous question, results are reported with and without it.
- `analyze.py` (hash below, written before the run) produces every reported number from `results.jsonl`. Any change to it after the run is listed in the README.
- Any other departure from this file is listed in the README under "Departures from the pre-registration".

## Limits fixed by the design

- Claude models only.
- Claude models also checked the key.
- Threshold and deadline questions, with every needed fact stated, are the easy end of law: no weighing of evidence, no open-textured terms, no conflict between sources.
- Template-built questions in nine families are less varied than questions a lawyer would write.
- The key reads each provision's words literally and leaves out guidance, enforcement practice and anything outside the quoted text.

## Hashes

SHA-256 of the files as they stood when this file was committed:

| File | SHA-256 |
|---|---|
| `questions.json` | `d6e08ea2564fef150cef2668795aa1ceb157470bec10aaf08c76e85f8ae2257e` |
| `rules.py` | `ded71ae497eada52abafeffde09d8d2d7a26d4de0876866e88f954ca98029e60` |
| `generate.py` | `0bb355e755a04df8784a94cd48910d090d1f667adc015c7199d2a2b46dfad313` |
| `check_quotes.py` | `fb7739430d83fb94fff5a72e8e71ec3422a83d69795c9819da88a130e79a694d` |
| `run.py` | `5b2cc4951657f2b6bee54365201349cc79e0cbfa0fbc25b7a46776eb521d6a76` |
| `analyze.py` | `2708280a4d296c1d8f69e499e10b11553411afa22b0f93b8d852786b7c2c4eab` |
