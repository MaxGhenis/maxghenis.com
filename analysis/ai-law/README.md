# Do Claude models know what AI law says? Code and data

Four Claude models answered 100 multiple-choice questions on AI law three ways: from memory, with web search, and with the rule's text in the prompt. The post is `src/content/blog/claude-ai-law-test.md`. The design was fixed in [PREREGISTRATION.md](PREREGISTRATION.md) before the first call.

## What ran

- **When**: November 15, 2026, 7:15 to 7:37 PM Eastern (00:15 to 00:37 UTC on November 16).
- **Models**: `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5`, `claude-fable-5-2`, through Anthropic's Messages API (`anthropic` Python SDK 2.8.0), effort `medium`, no system prompt, no fallback model, `max_tokens` 16,000.
- **Memory and rule-text arms**: 100 questions x 4 models x 3 samples each, 2,400 calls, all returned.
- **Search arm**: Anthropic's `web_search_20250305` tool, at most 5 searches, no instruction to search, 2 samples. 661 of 800 calls returned before the API credit ran out. 82 questions have both samples from all four models (656 calls), and every search figure uses those 82.
- **Cost**: $53.48 at list price for the 3,061 calls that returned, plus $0.27 for a four-call probe (`probe.jsonl`).

## Results

Shares of replies whose last `Answer: <letter>` line names the keyed option.

All 100 questions:

| Model | From memory | With the rule text | Difference in points (95% interval) |
|---|---|---|---|
| Haiku 5.5 | 93.0% (279 of 300) | 100.0% (300 of 300) | 7.0 (3.0 to 11.7) |
| Sonnet 5.5 | 94.3% (283 of 300) | 100.0% (300 of 300) | 5.7 (2.3 to 9.7) |
| Opus 5.5 | 97.7% (293 of 300) | 100.0% (300 of 300) | 2.3 (0.0 to 5.7) |
| Fable 5.2 | 98.0% (294 of 300) | 99.7% (299 of 300) | 1.7 (0.0 to 4.0) |
| All four | 95.8% (1,149 of 1,200) | 99.9% (1,199 of 1,200) | 4.1 (1.9 to 7.0) |

The 82 questions the search arm finished:

| Model | From memory | With web search | With the rule text |
|---|---|---|---|
| Haiku 5.5 | 92.7% (228 of 246) | 99.4% (163 of 164) | 100.0% (246 of 246) |
| Sonnet 5.5 | 94.7% (233 of 246) | 95.7% (157 of 164) | 100.0% (246 of 246) |
| Opus 5.5 | 97.6% (240 of 246) | 97.0% (159 of 164) | 100.0% (246 of 246) |
| Fable 5.2 | 98.0% (241 of 246) | 99.4% (163 of 164) | 99.6% (245 of 246) |
| All four | 95.7% (942 of 984) | 97.9% (642 of 656) | 99.9% (983 of 984) |

On those 82 questions, pooled: search minus memory 2.2 points (0.3 to 4.4), text minus search 2.0 (0.8 to 3.7), text minus memory 4.2 (1.6 to 7.3).

The intervals come from redrawing the questions with replacement 10,000 times. A cell with no wrong reply gets an interval of 100 to 100 from that method, which shows no uncertainty where some remains.

| Questions | From memory | With web search | With the rule text |
|---|---|---|---|
| All 100: a figure exactly on a threshold (26) | 91.7% (286 of 312) | | 99.7% (311 of 312) |
| All 100: the other 74 | 97.2% (863 of 888) | | 100.0% (888 of 888) |
| The 82: on a threshold (23) | 90.6% (250 of 276) | 95.7% (176 of 184) | 99.6% (275 of 276) |
| The 82: the other 59 | 97.7% (692 of 708) | 98.7% (466 of 472) | 100.0% (708 of 708) |

By rule, all four models:

| Rule | Questions | From memory | With the rule text | Of the 82 | From memory | With web search | With the rule text |
|---|---|---|---|---|---|---|---|
| Chip tariff (Section 232) | 12 | 84.7% (122 of 144) | 100.0% (144 of 144) | 10 | 82.5% (99 of 120) | 96.2% (77 of 80) | 100.0% (120 of 120) |
| Four compute tests | 12 | 93.8% (135 of 144) | 100.0% (144 of 144) | 11 | 93.2% (123 of 132) | 95.5% (84 of 88) | 100.0% (132 of 132) |
| Chip export paragraphs (ECCN 3A090) | 16 | 93.8% (180 of 192) | 100.0% (192 of 192) | 14 | 95.8% (161 of 168) | 96.4% (108 of 112) | 100.0% (168 of 168) |
| Incident reporting deadline (California, New York) | 8 | 95.8% (92 of 96) | 100.0% (96 of 96) | 6 | 98.6% (71 of 72) | 100.0% (48 of 48) | 100.0% (72 of 72) |
| Chip licence review (January 2026 rule) | 10 | 97.5% (117 of 120) | 99.2% (119 of 120) | 8 | 96.9% (93 of 96) | 98.4% (63 of 64) | 99.0% (95 of 96) |
| Frontier model (California, New York) | 12 | 99.3% (143 of 144) | 100.0% (144 of 144) | 10 | 99.2% (119 of 120) | 100.0% (80 of 80) | 100.0% (120 of 120) |
| Large frontier developer (California, New York) | 12 | 100.0% (144 of 144) | 100.0% (144 of 144) | 9 | 100.0% (108 of 108) | 100.0% (72 of 72) | 100.0% (108 of 108) |
| EU notification (AI Act art. 52) | 8 | 100.0% (96 of 96) | 100.0% (96 of 96) | 6 | 100.0% (72 of 72) | 100.0% (48 of 48) | 100.0% (72 of 72) |
| Catastrophic-risk size figures (California) | 10 | 100.0% (120 of 120) | 100.0% (120 of 120) | 8 | 100.0% (96 of 96) | 96.9% (62 of 64) | 100.0% (96 of 96) |

Search use, on the 82 questions:

| Model | Calls with a search | Searches per call | Right when it searched | Right when it did not |
|---|---|---|---|---|
| Haiku 5.5 | 76.2% (125 of 164) | 1.25 | 99.2% (124 of 125) | 100.0% (39 of 39) |
| Sonnet 5.5 | 8.5% (14 of 164) | 0.09 | 100.0% (14 of 14) | 95.3% (143 of 150) |
| Opus 5.5 | 65.2% (107 of 164) | 0.71 | 98.1% (105 of 107) | 94.7% (54 of 57) |
| Fable 5.2 | 64.6% (106 of 164) | 0.73 | 100.0% (106 of 106) | 98.3% (57 of 58) |
| All four | 53.7% (352 of 656) | 0.69 | 99.1% (349 of 352) | 96.4% (293 of 304) |

Model-question pairs whose samples gave more than one answer: 17 of 400 from memory, 10 of 328 with search, 1 of 400 with the rule text.

Cost in US dollars at list price:

| Model | Memory, 3 samples | Rule text, 3 samples | Web search, 2 samples | Total |
|---|---|---|---|---|
| Haiku 5.5 | 0.13 | 0.07 | 2.42 | 2.62 |
| Sonnet 5.5 | 1.64 | 0.85 | 2.35 | 4.84 |
| Opus 5.5 | 3.40 | 1.90 | 10.39 | 15.69 |
| Fable 5.2 | 7.37 | 3.37 | 19.59 | 30.33 |
| All four | 12.53 | 6.19 | 34.76 | 53.48 |

`summary.json` holds every figure above and the per-question counts.

## Against the pre-registered expectations

| Expected | Result |
|---|---|
| Pooled accuracy from memory between 80% and 92% | 95.8%, above the range |
| Pooled accuracy with the rule text at 97% or higher | 99.9% |
| Pooled accuracy with search between memory and text | 97.9% on the 82 questions, between 95.7% and 99.9% |
| From memory, boundary questions at least 10 points below the others | 5.5 points below (91.7% against 97.2%) |

## Departures from the pre-registration

1. **The search arm stopped at 82 questions.** At 00:36:54 UTC the API began answering with HTTP 400, "Your credit balance is too low to access the Anthropic API"; 139 search calls failed. The pre-registered rule for a stage cut short applies: the arm is reported on the questions all four models finished, the first 82 in the fixed shuffled order. Five returned calls on two partly answered questions (`incident-clock-07`, `licence-review-07`) are in `results.jsonl` and left out of every figure. No second pass filled the failed cells.
2. **The effort stage did not run.** Measure 6 (memory-arm accuracy by effort) has no data.
3. **`analyze.py` changed after the run**, for the two points above and to add like-for-like comparisons on the 82 questions, per-call cost, site counts and the first-letter check. `analyze_preregistered.py` is the file as it stood before the run; its SHA-256 is the one in the pre-registration. It cannot report the search arm on the 82 questions, and its memory and rule-text figures on all 100 match `analyze.py`'s.
4. **Exploratory additions**: scoring the first `Answer:` letter in place of the last (19 of Sonnet 5.5's 300 rule-text replies open with a wrong letter and end on the keyed one, so first-letter scoring gives Sonnet 5.5 93.7% with the rule text; pooled figures become 95.7% from memory, 97.4% with search and 98.3% with the rule text), and the reading of individual wrong replies in the post.

The other five hashed files (`questions.json`, `rules.py`, `generate.py`, `check_quotes.py`, `run.py`) are unchanged: `shasum -a 256` gives the values in the pre-registration.

## Files

| File | What it holds |
|---|---|
| `PREREGISTRATION.md` | Design, measures, stopping rule, expectations and file hashes, pushed before the first call |
| `rules.py` | Each threshold, typed by hand from the rule text; the tests; the quoted passages |
| `generate.py` | Builds `questions.json`; `--check` confirms the file matches |
| `questions.json` | The 100 questions with options, rule text, key, boundary flag and the case's numbers |
| `check_quotes.py` | Confirms every quoted passage appears word for word in downloaded copies of the sources (its header lists them) |
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

`rules.py` is a hand-built answer key for these 100 questions. It reads each provision's words literally, covers nothing else in these laws, and takes no account of guidance or enforcement practice. Claude Fable 5.2, working as a coding agent, wrote the questions and the key from the rule texts. Three blind checks by Claude models (Opus 5.5 and Sonnet 5.5 on the first wording, Opus 5.5 on the final wording) matched the key on all 100 questions.

## Finishing the run

About $10 at list price would cover the 18 questions the search arm did not reach, and about $10 the effort stage. The questions and key are public from this commit on, so a later search-arm call could find them; a rerun should check each reply's result and cited URLs for this repository.
