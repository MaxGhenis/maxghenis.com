# Do Claude models know what AI law says? Code and data

This folder holds a test of four Claude models on 100 multiple-choice questions about AI law, in three arms: from memory, with web search, and with the rule's text in the prompt. The post is `src/content/blog/claude-ai-law-test.md`. The design was fixed in [PREREGISTRATION.md](PREREGISTRATION.md) before the first call.

## What ran

- **When**: November 15, 2026, 7:15 to 7:37 PM Eastern (00:15 to 00:37 UTC on November 16).
- **Models**: `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5`, `claude-fable-5-2`, through Anthropic's Messages API (`anthropic` Python SDK 2.8.0), effort `medium`, no system prompt, no fallback model, `max_tokens` 16,000. The `thinking` parameter was left unset, so each model chose whether to think (table below).
- **Questions**: 100, all multiple choice: 36 with two options, 10 with three, 26 with four and 28 with five, so guessing would match the key 33.4% of the time. Every question names the provision it asks about.
- **Memory and rule-text arms**: 100 questions x 4 models x 3 samples each, 2,400 calls, all returned. The rule text is quoted word for word; for the tariff it also carries a three-sentence summary of the heading table (`TARIFF_HEADINGS` in `rules.py`).
- **Search arm**: Anthropic's `web_search_20250305` tool (the basic version; the newer `web_search_20260209`, which filters results, was not tested), at most 5 searches, no instruction to search, 2 samples. 661 of 800 calls returned before the API credit ran out. 82 questions have both samples from all four models (656 calls), and every search accuracy figure uses those 82.
- **Cost**: $53.48 at list price for the 3,061 calls that returned, plus $0.27 for a four-call probe (`probe.jsonl`).

## Results

Shares of replies whose last `Answer: <letter>` line names the keyed option. Intervals are 95% intervals from redrawing the questions with replacement 10,000 times. They treat the questions as independent draws, and the questions come from nine templates, so they understate the uncertainty about other questions on these rules. A cell with no wrong reply gets 100.0 to 100.0 from this method, which shows no uncertainty where some remains.

All 100 questions:

| Model | From memory (95% interval) | With the rule text (95% interval) | Difference in points (95% interval) |
|---|---|---|---|
| Haiku 5.5 | 93.0% (279 of 300), 88.3 to 97.0 | 100.0% (300 of 300), 100.0 to 100.0 | 7.0 (3.0 to 11.7) |
| Sonnet 5.5 | 94.3% (283 of 300), 90.3 to 97.7 | 100.0% (300 of 300), 100.0 to 100.0 | 5.7 (2.3 to 9.7) |
| Opus 5.5 | 97.7% (293 of 300), 94.3 to 100.0 | 100.0% (300 of 300), 100.0 to 100.0 | 2.3 (0.0 to 5.7) |
| Fable 5.2 | 98.0% (294 of 300), 95.3 to 100.0 | 99.7% (299 of 300), 99.0 to 100.0 | 1.7 (0.0 to 4.0) |
| All four | 95.8% (1,149 of 1,200), 92.9 to 98.1 | 99.9% (1,199 of 1,200), 99.8 to 100.0 | 4.2 (1.9 to 7.0) |

The 82 questions the search arm finished:

| Model | From memory | With web search | With the rule text | Search minus memory | Text minus search |
|---|---|---|---|---|---|
| Haiku 5.5 | 92.7% (228 of 246), 87.4 to 97.2 | 99.4% (163 of 164), 98.2 to 100.0 | 100.0% (246 of 246), 100.0 to 100.0 | 6.7 (1.8 to 12.2) | 0.6 (0.0 to 1.8) |
| Sonnet 5.5 | 94.7% (233 of 246), 90.2 to 98.4 | 95.1% (156 of 164), 90.9 to 98.8 | 100.0% (246 of 246), 100.0 to 100.0 | 0.4 (-1.6 to 2.2) | 4.9 (1.2 to 9.1) |
| Opus 5.5 | 97.6% (240 of 246), 93.9 to 100.0 | 97.0% (159 of 164), 93.3 to 99.4 | 100.0% (246 of 246), 100.0 to 100.0 | -0.6 (-3.7 to 3.0) | 3.0 (0.6 to 6.7) |
| Fable 5.2 | 98.0% (241 of 246), 94.7 to 100.0 | 99.4% (163 of 164), 98.2 to 100.0 | 99.6% (245 of 246), 98.8 to 100.0 | 1.4 (0.0 to 3.7) | 0.2 (0.0 to 0.6) |
| All four | 95.7% (942 of 984), 92.5 to 98.3 | 97.7% (641 of 656), 96.0 to 99.1 | 99.9% (983 of 984), 99.7 to 100.0 | 2.0 (0.3 to 4.0) | 2.2 (0.9 to 3.9) |

On those 82 questions, pooled text minus memory is 4.2 points (1.6 to 7.3).

| Questions | From memory | With web search | With the rule text |
|---|---|---|---|
| All 100: a figure exactly on a threshold (26) | 91.7% (286 of 312) | | 99.7% (311 of 312) |
| All 100: the other 74 | 97.2% (863 of 888) | | 100.0% (888 of 888) |
| The 82: on a threshold (23) | 90.6% (250 of 276) | 95.1% (175 of 184) | 99.6% (275 of 276) |
| The 82: the other 59 | 97.7% (692 of 708) | 98.7% (466 of 472) | 100.0% (708 of 708) |

By rule, all four models:

| Rule | Questions | From memory | With the rule text | Of the 82 | From memory | With web search | With the rule text |
|---|---|---|---|---|---|---|---|
| Chip tariff (Section 232) | 12 | 84.7% (122 of 144) | 100.0% (144 of 144) | 10 | 82.5% (99 of 120) | 95.0% (76 of 80) | 100.0% (120 of 120) |
| Four compute tests | 12 | 93.8% (135 of 144) | 100.0% (144 of 144) | 11 | 93.2% (123 of 132) | 95.5% (84 of 88) | 100.0% (132 of 132) |
| Chip export paragraphs (ECCN 3A090) | 16 | 93.8% (180 of 192) | 100.0% (192 of 192) | 14 | 95.8% (161 of 168) | 96.4% (108 of 112) | 100.0% (168 of 168) |
| Incident reporting deadline (California, New York) | 8 | 95.8% (92 of 96) | 100.0% (96 of 96) | 6 | 98.6% (71 of 72) | 100.0% (48 of 48) | 100.0% (72 of 72) |
| Chip license review (January 2026 rule) | 10 | 97.5% (117 of 120) | 99.2% (119 of 120) | 8 | 96.9% (93 of 96) | 98.4% (63 of 64) | 99.0% (95 of 96) |
| Frontier model (California, New York) | 12 | 99.3% (143 of 144) | 100.0% (144 of 144) | 10 | 99.2% (119 of 120) | 100.0% (80 of 80) | 100.0% (120 of 120) |
| Large frontier developer (California, New York) | 12 | 100.0% (144 of 144) | 100.0% (144 of 144) | 9 | 100.0% (108 of 108) | 100.0% (72 of 72) | 100.0% (108 of 108) |
| EU notification (AI Act art. 52) | 8 | 100.0% (96 of 96) | 100.0% (96 of 96) | 6 | 100.0% (72 of 72) | 100.0% (48 of 48) | 100.0% (72 of 72) |
| Catastrophic-risk size figures (California) | 10 | 100.0% (120 of 120) | 100.0% (120 of 120) | 8 | 100.0% (96 of 96) | 96.9% (62 of 64) | 100.0% (96 of 96) |

Search use, on the 82 questions:

| Model | Calls with a search | Searches per call | Right when it searched | Right when it did not |
|---|---|---|---|---|
| Haiku 5.5 | 76.2% (125 of 164) | 1.25 | 99.2% (124 of 125) | 100.0% (39 of 39) |
| Sonnet 5.5 | 8.5% (14 of 164) | 0.09 | 92.9% (13 of 14) | 95.3% (143 of 150) |
| Opus 5.5 | 65.2% (107 of 164) | 0.71 | 98.1% (105 of 107) | 94.7% (54 of 57) |
| Fable 5.2 | 64.6% (106 of 164) | 0.73 | 100.0% (106 of 106) | 98.3% (57 of 58) |
| All four | 53.7% (352 of 656) | 0.69 | 98.9% (348 of 352) | 96.4% (293 of 304) |

Fifteen search-arm replies missed the key, eleven of them from calls that ran no search. No search query, result link or cited link in `results.jsonl` points to this repository or site.

Replies that carry a thinking block:

| Model | From memory | With web search | With the rule text |
|---|---|---|---|
| Haiku 5.5 | 100.0% (300 of 300) | 100.0% (164 of 164) | 100.0% (300 of 300) |
| Sonnet 5.5 | 6.0% (18 of 300) | 82.9% (136 of 164) | 0.0% (0 of 300) |
| Opus 5.5 | 100.0% (300 of 300) | 100.0% (164 of 164) | 95.3% (286 of 300) |
| Fable 5.2 | 96.7% (290 of 300) | 100.0% (164 of 164) | 17.7% (53 of 300) |

Model-question pairs whose samples gave more than one answer: 17 of 400 from memory, 9 of 328 with search, 1 of 400 with the rule text.

Cost in US dollars at list price. The search column and the totals include $0.20 for five returned calls on two questions the search arm did not finish:

| Model | Memory, 3 samples | Rule text, 3 samples | Web search, 2 samples | Total |
|---|---|---|---|---|
| Haiku 5.5 | 0.13 | 0.07 | 2.42 | 2.61 |
| Sonnet 5.5 | 1.64 | 0.85 | 2.35 | 4.85 |
| Opus 5.5 | 3.40 | 1.90 | 10.39 | 15.69 |
| Fable 5.2 | 7.37 | 3.37 | 19.59 | 30.33 |
| All four | 12.53 | 6.19 | 34.76 | 53.48 |

Per call, pooled: memory 272 input and 587 output tokens, $0.0104; rule text 607 and 208, $0.0052; search arm (656 calls) 10,379 and 687, $0.0527. The 352 calls that searched averaged 16,696 input tokens and $0.0825; the 304 that did not, 3,065 and $0.0182.

`summary.json` holds every figure above and the per-question counts.

## Against the pre-registered expectations

| Expected | Result |
|---|---|
| Pooled accuracy from memory between 80% and 92% | 95.8%, above the range |
| Pooled accuracy with the rule text at 97% or higher | 99.9% |
| Pooled accuracy with search between memory and text | 97.7% on the 82 questions, between 95.7% and 99.9% |
| From memory, boundary questions at least 10 points below the others | 5.5 points below (91.7% against 97.2%) |

## Questions open to a second reading

Reviews after the run found ten questions whose facts leave room for another answer. The pre-registration says results are then reported with and without them. No question was dropped.

- `eu-notification-01`, `-03`, `-05`, `-07` give no date for the model's placing on the market. Article 111(3) of the AI Act gives providers of models placed on the market before August 2, 2025 until August 2, 2027 to comply.
- `incident-clock-05` to `-08` do not say that the model is developed, deployed or operating in New York, which section 1425 of the General Business Law requires for the article to apply.
- `eccn-3a090-07` gives a chip's peak as 150 MacTOPS at a bit length of 8 and does not say that 8 bits is its only bit length. Technical Note 2 to ECCN 3A090 says to evaluate the highest value across bit lengths, so another bit length could put the chip in a different paragraph.
- `compute-figures-08` puts a model at exactly 10^26 operations. The regulatory text of ECCN 4E091 says "10^26 or more", which the key follows; the preamble of the rule that created the entry (90 FR 4544) also says "more than 10^26 computational operations".

| Left out | From memory, all questions | With the rule text, all questions | From memory, search questions | With web search | With the rule text, search questions |
|---|---|---|---|---|---|
| Nothing | 95.8% (1,149 of 1,200) | 99.9% (1,199 of 1,200) | 95.7% (942 of 984) | 97.7% (641 of 656) | 99.9% (983 of 984) |
| The four EU questions | 95.6% (1,101 of 1,152) | 99.9% (1,151 of 1,152) | 95.6% (906 of 948) | 97.6% (617 of 632) | 99.9% (947 of 948) |
| The four New York incident questions | 95.9% (1,105 of 1,152) | 99.9% (1,151 of 1,152) | 95.7% (907 of 948) | 97.6% (617 of 632) | 99.9% (947 of 948) |
| `compute-figures-08` | 96.5% (1,146 of 1,188) | 99.9% (1,187 of 1,188) | 96.6% (939 of 972) | 98.3% (637 of 648) | 99.9% (971 of 972) |
| `eccn-3a090-07` | 95.7% (1,137 of 1,188) | 99.9% (1,187 of 1,188) | 95.7% (930 of 972) | 97.8% (634 of 648) | 99.9% (971 of 972) |
| All ten | 96.5% (1,042 of 1,080) | 99.9% (1,079 of 1,080) | 96.4% (856 of 888) | 98.3% (582 of 592) | 99.9% (887 of 888) |

Smaller gaps that a later version should close, none of which changes a keyed answer on the natural reading: `eccn-3a090-07` does not say that its figure is for dense matrices; the compute questions do not say that the model trained on no model-generated data, which Technical Note 3 to ECCN 4E091 would count; the frontier-model and large-developer questions for New York ask about definitions and need no New York link.

## Departures from the pre-registration

1. **The search arm stopped at 82 questions.** At 00:36:54 UTC the API began answering with HTTP 400, "Your credit balance is too low to access the Anthropic API"; 139 search calls failed. The pre-registration has a rule for a stage that the spending cap cuts short (report it on the questions all four models finished) and a rule for failed calls (count them as missing). The cap did not bind, so the first rule applies by analogy: the arm is reported on the first 82 questions of the fixed shuffled order, which all four models finished. Five returned calls on two partly answered questions (`incident-clock-07`, `licence-review-07`) are in `results.jsonl`; they count toward cost and toward no accuracy figure. No second pass filled the failed cells. The pre-registered script, which follows the failed-calls rule, gives 97.9% on all 661 returned search calls and search minus memory of 2.1 points (0.5 to 4.1).
2. **The effort stage did not run.** Measure 6 (memory-arm accuracy by effort) has no data.
3. **Order of calls.** The pre-registration says all four models answer a question before the next one starts. The runner sends calls in that fixed order to a pool of workers, so calls for neighbouring questions overlap.
4. **An answer line must start a line.** The pre-registered script's pattern also matched "Answer: B" inside a sentence. One reply differs (Sonnet 5.5, search arm, `chip-tariff-04`, sample 2): its only answer line reads "Answer: A", and its explanation ends 'I should have put "Answer: B" on the first line.' `analyze.py` scores it as a miss; the pre-registered script scored it as a match.
5. **`analyze.py` changed after the run**, for points 1 and 4 and to add like-for-like comparisons on the 82 questions, differences computed from exact counts, per-call cost, site counts, thinking counts, the first-letter check and the table above. `analyze_preregistered.py` is the file as it stood before the run; its SHA-256 is the one in the pre-registration, and its memory and rule-text figures on all 100 questions match `analyze.py`'s.
6. **Exploratory additions**, none of them a pre-registered measure: scoring the first `Answer:` letter in place of the last (19 of Sonnet 5.5's 300 rule-text replies open with a wrong letter and end on the keyed one, so first-letter scoring gives Sonnet 5.5 93.7% with the rule text; pooled figures become 95.7% from memory, 97.4% with search and 98.3% with the rule text); the count of misses by question; the site counts; and the reading of individual wrong replies in the post.

The other five hashed files (`questions.json`, `rules.py`, `generate.py`, `check_quotes.py`, `run.py`) are unchanged: `shasum -a 256` gives the values in the pre-registration.

## Files

| File | What it holds |
|---|---|
| `PREREGISTRATION.md` | Design, measures, stopping rule, expectations and file hashes, pushed before the first call |
| `rules.py` | Each threshold, copied from the rule text; the tests; the quoted passages |
| `generate.py` | Builds `questions.json`; `--check` confirms the file matches |
| `questions.json` | The 100 questions with options, rule text, key, boundary flag and the case's numbers |
| `key-checks.json` | The three blind checkers' answers and flags |
| `check_quotes.py` | Confirms every quoted passage appears word for word in downloaded copies of the sources (its header lists them; the copies are not in this repository) |
| `run.py` | The runner |
| `results.jsonl` | One row per call: stage, arm, effort, model, question, sample, the full reply, parsed answer, token counts, searches, list-price cost, search queries, result and cited URLs, or the error |
| `probe.jsonl` | The four probe calls on a made-up question |
| `analyze.py`, `summary.json` | The recount and its output |
| `analyze_preregistered.py` | The analysis script as hashed before the run |
| `tables.py`, `charts.py`, `chart_sizes.json` | Markdown tables and the post's charts (written to `public/images/`) |
| `cover/cover.svg` | Source of the post's cover image |
| `first-pass/` | The 26-question first pass that preceded this design, with its own README |

## Reproduce

```bash
python3 generate.py --check          # questions.json matches the generator
python3 analyze.py --write           # recount every figure from results.jsonl
python3 tables.py                    # the tables above
python3 charts.py                    # the charts
python3 check_quotes.py <folder>     # needs downloaded copies of the sources
```

Running `run.py` again needs an Anthropic API key and makes new calls; replies vary from run to run, and search results from day to day.

## The key

`rules.py` is an answer key for these 100 questions. It reads each provision's words literally, covers nothing else in these laws, and takes no account of guidance or enforcement practice. Claude Fable 5.2, working as a coding agent, wrote the questions and the key from the rule texts. Three blind checks by Claude models matched the key on all 100 questions: Opus 5.5 and Sonnet 5.5 on the first wording, and Opus 5.5 on the final wording after five rewordings (`key-checks.json`). The checkers worked from the quoted rule text, the same task as the rule-text arm, so that arm cannot reveal an error in the key that Claude models share. No person has read all 100 questions.

## Finishing the run

About $7 at list price would cover the 18 questions the search arm did not finish (139 calls at $0.053), and about $8 to $12 the effort stage (800 memory calls). The questions and key are public from this commit on, so a later search-arm call could find them; a rerun should check each reply's result and cited URLs for this repository.
