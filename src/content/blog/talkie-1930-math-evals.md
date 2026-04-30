---
title: 'Can Talkie-1930 do arithmetic?'
description: 'I tested Talkie-1930 on GSM8K and the easier EleutherAI/OpenAI arithmetic suite, then packaged an lm-eval-harness runner so the runs are reproducible.'
pubDate: 'Apr 30 2026'
heroImage: './og-blog.png'
draft: true
---

[Talkie](https://talkie-lm.com/introducing-talkie) is a 13B language model trained only on text available before 1931. Its launch post includes a "Numeracy" panel showing talkie-1930 reaching about 62% average accuracy at peak training compute, slightly above the modern-web twin's roughly 57%. But the plot doesn't specify which tasks the average covers, which prompts were used, or how answers were scored.

I wanted a smaller, inspectable check: can Talkie-1930 do arithmetic at all?

The answer depends on the evaluation. As a generator, it gets 0 of 70 GSM8K attempts right across three prompt styles. As a log-likelihood model on simpler arithmetic completions, it averages 42.8% — ranging from 91.4% on 2-digit addition to 13.0% on 3-operation expressions.

## GSM8K: Basically no

I first tried [GSM8K](https://huggingface.co/datasets/openai/gsm8k), the grade-school math word-problem dataset. I used the instruction-tuned Talkie-1930 model and parsed the final numeric answer.

| Prompt style | N | Parsed | Correct |
| --- | ---: | ---: | ---: |
| Direct answer | 50 | 32 | 0 |
| Zero-shot reasoning | 10 | 9 | 0 |
| 4-shot reasoning | 10 | 10 | 0 |

Zero correct out of 70 attempts. The model usually produced a number, just the wrong one. In the few-shot run it imitated the solution format without doing the arithmetic underneath.

I treat these GSM8K numbers as generation probes, not the final benchmark. The repo now includes an `lm-evaluation-harness` path that runs GSM8K with greedy decoding (`do_sample: false`, `temperature: 0.0`); a one-question smoke test runs end to end (the model got it wrong), but I haven't rerun the full table through the harness yet.

That doesn't mean the model has no numeracy. GSM8K requires reading a word problem, tracking quantities, choosing operations, and formatting an answer. For Talkie, generation and instruction-following are themselves part of the bottleneck.

## Easier arithmetic: Sometimes yes

I then used the [EleutherAI arithmetic dataset](https://huggingface.co/datasets/EleutherAI/arithmetic), which comes from the OpenAI GPT-3 arithmetic tests. The current [lm-evaluation-harness task definitions](https://github.com/EleutherAI/lm-evaluation-harness/tree/main/lm_eval/tasks/arithmetic) score these as log-likelihood tasks: given a context like:

```text
Question: What is 98 plus 45?
Answer:
```

the model is correct if the exact target completion, like ` 143`, is the greedy continuation under teacher forcing.

This is much easier than GSM8K, and closer to a base-LM benchmark. I sampled 500 examples from each of the 10 arithmetic tasks with seed 1930, using a custom logger that matches the harness task format and saves token-level traces.

| Task | 1930 base | 1930 instruct | Modern-web base |
| --- | ---: | ---: | ---: |
| Single-digit 3 ops | 13.0% | 15.8% | 3.6% |
| 2-digit addition | 91.4% | 74.4% | 16.2% |
| 2-digit subtraction | 53.6% | 51.6% | 12.8% |
| 3-digit addition | 73.2% | 90.2% | 0.2% |
| 3-digit subtraction | 42.4% | 43.6% | 1.2% |
| 4-digit addition | 33.8% | 31.2% | 0.0% |
| 4-digit subtraction | 36.8% | 33.0% | 0.0% |
| 5-digit addition | 32.2% | 23.4% | 0.0% |
| 5-digit subtraction | 27.8% | 30.8% | 0.0% |
| 2-digit multiplication | 24.0% | 29.6% | 4.0% |
| **Overall** | **42.8%** | **42.4%** | **3.8%** |

The 1930 models aren't just refusing. They often put high probability on the right answer, especially for addition (91.4% base on 2-digit, 73.2% on 3-digit). The pattern breaks on multi-operation expressions, subtraction, multiplication, and larger digits.

The modern-web base scores 3.8% overall. In many errors it copied an operand instead of computing the result: for "98 plus 45" it preferred ` 98`; for "95 times 45" it preferred ` 95`. I don't read this as evidence that pre-1931 text makes a model more numerate than modern web text. More likely, I'm not reproducing the Talkie authors' exact benchmark setup, or this completion format interacts badly with the modern-web checkpoint.

## The metric is strict

The arithmetic score is format-strict. If the target is digits and the model prefers a word-form answer, the metric counts it wrong. On some two-digit additions the instruction-tuned model preferred tokens like `Forty` before the digit target. That's a legitimate miss under the benchmark, but a different kind of miss than computing the wrong number.

That's why I logged token-level outputs, not just aggregate scores. A single accuracy number hides the difference between "wrong operation," "copied an operand," "right value in the wrong format," and "format-following failure."

## Reproducibility

I packaged the evaluator as [a small repo](https://github.com/MaxGhenis/talkie-evals) using Modal for CUDA. It includes an `lm-evaluation-harness` adapter for benchmark-style runs and custom audit commands that log row-level arithmetic traces. The package pins:

- the Talkie Python package commit,
- the Hugging Face model revisions,
- the arithmetic and GSM8K dataset revisions,
- the Modal image Python and pip packages,
- the sample seed, with row-level outputs written to JSON.

The benchmark-style arithmetic run is:

```bash
uv run talkie-evals harness \
  --model-names talkie-1930-13b-base,talkie-1930-13b-it,talkie-web-13b-base \
  --tasks arithmetic \
  --sample-size 500
```

The custom arithmetic audit run that produced the table above is:

```bash
uv run talkie-evals arithmetic \
  --model-names talkie-1930-13b-base,talkie-1930-13b-it,talkie-web-13b-base \
  --sample-size 500 \
  --log-examples 25
```

The harness GSM8K command is:

```bash
uv run talkie-evals harness \
  --model-names talkie-1930-13b-it \
  --tasks gsm8k \
  --sample-size 50 \
  --num-fewshot 0 \
  --talkie-chat-template
```

The earlier custom GSM8K direct-answer probe was:

```bash
uv run talkie-evals gsm8k \
  --model-name talkie-1930-13b-it \
  --sample-size 50 \
  --condition-names zero_shot_direct
```

## Takeaway

Talkie-1930 fails as a general math reasoner, but it can do arithmetic in narrow regimes — addition more than multiplication, two digits more than five.

For anything downstream, the arithmetic suite is a better calibration check than GSM8K alone. GSM8K tells us the instruction-tuned model can't reliably solve generated word problems. The arithmetic suite tells us the base model still encodes elementary calculation patterns. The same instruction-tuned model scores 0/70 on GSM8K and 42.4% on the arithmetic suite — so elicitation and scoring can dominate the headline number.

The launch post's roughly 62% Numeracy figure averages over unspecified tasks. The public arithmetic suite shows a 13.0%–91.4% spread on the 1930 base.
