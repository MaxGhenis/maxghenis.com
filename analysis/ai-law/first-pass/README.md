# First pass: 26 questions, four Claude models, November 15, 2026

A small exploratory run that came before the larger test in the parent folder. It asked four Claude models 26 multiple-choice questions about AI law, and its results shaped the larger test's design.

## What ran

- **Questions** (`items.json`): 26, each with its rule text and keyed answer. Twenty state the rule correctly. Six state a rule wrongly, and their keyed answer is the last option, "The question misstates the rule."
- **Laws**: California SB 53 (Bus. & Prof. Code 22757.10 to 22757.16), New York's RAISE Act as amended (compute figure only), the EU AI Act (arts. 51(2) and 52(1)), ECCN 3A090 and ECCN 4E091 (15 CFR part 774), the January 15, 2026 BIS licence review rule (91 FR 1684), and the Section 232 semiconductor tariff (Proclamation 11002, U.S. note 39).
- **Three wordings** of each question: no lean, the asker hopes for one answer, the asker suspects the other.
- **Two conditions**: the question alone, and the question with the rule text first.
- **Models**: `claude-haiku-5-5`, `claude-sonnet-5-5`, `claude-opus-5-5`, `claude-fable-5-2`, through Anthropic's Messages API, each at effort `medium`, with no system prompt and no tools. One reply per cell: 26 x 3 x 2 x 4 = 624 calls, $5.17 at list price.
- **Answer key**: a writer drafted each question and answer from quoted rule text, and two checkers computed every answer again without seeing the writer's. All three agreed on all 26. The writer and checkers were Claude models. `check_key.py` recomputes the 26 answers from thresholds typed by hand from the rule text.

## Files

| File | What it holds |
|---|---|
| `items.json` | The questions, options, rule text and key |
| `results.jsonl` | One row per call: model, question, wording, condition, parsed answer, token counts, list-price cost, and the first 700 characters of the reply |
| `run_pilot.py` | The runner, as it ran |
| `score_pilot.py` | The scorer that ran with it |
| `check_key.py` | Recomputes the key: `python3 check_key.py` |
| `leans.json` | Which options each leaned wording points toward |
| `analyze.py` | An independent recount of every figure: `python3 analyze.py --write` |
| `summary.json` | The recount's output |

## Results

Counts of answers that match the key. "Plain" rows use only the wording with no lean.

| | Question alone | With the rule text |
|---|---|---|
| 20 true-premise questions, plain wording, four models | 73 of 80 | 79 of 80 |
| Same, all three wordings | 218 of 240 | 236 of 240 |
| Haiku 5.5, all three wordings | 54 of 60 | 60 of 60 |
| Sonnet 5.5, all three wordings | 53 of 60 | 58 of 60 |
| Opus 5.5, all three wordings | 54 of 60 | 60 of 60 |
| Fable 5.2, all three wordings | 57 of 60 | 58 of 60 |
| Hopeful and suspicious wordings got different answers (of 80 model-question pairs) | 5 | 3 |
| False premises flagged (of 72) | 68 | 72 |

Without the rule text, four questions account for 21 of the 22 wrong answers on true-premise questions: a model trained with exactly 10^26 operations (9 of 12 wrong), the note that takes non-datacenter chips under 4800 TPP out of ECCN 3A090.a and 3A090.b (6), a chip at exactly 21,000 TPP under the January 2026 review rule (3), and a chip inside the tariff's higher TPP band with DRAM bandwidth outside it (3).

## Limits

- One reply per cell, 26 questions, Claude models only.
- The runner stored the first 700 characters of each reply. In 28 Sonnet 5.5 rows the stored text ends before the "Answer:" line, so the file alone cannot confirm those letters; the runner parsed them from the full reply.
- The runner scored the first "Answer:" letter in a reply. Two Sonnet 5.5 replies to one false-premise question then corrected themselves to the keyed answer and count as wrong.
- Two tariff questions call the outcome with no added duty "the ordinary duty heading". U.S. note 39(a) uses "ordinary customs duty treatment" for heading 9903.79.01, the heading with the added 25% duty. The keyed outcomes match the note; the label does not.
