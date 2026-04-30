---
title: 'Can Talkie-1930 do arithmetic?'
description: 'I tested Talkie-1930 on GSM8K and the easier EleutherAI/OpenAI arithmetic suite, then packaged an lm-eval-harness runner so the runs are reproducible.'
pubDate: 'Apr 30 2026'
heroImage: './og-blog.png'
draft: true
---

[Talkie](https://talkie-lm.com/introducing-talkie) is a 13B language model trained only on text available before 1931. Its launch post includes a "Numeracy" benchmark plot, but not enough detail to tell exactly which tasks, prompts, or scoring rules produced the curve.

I wanted a smaller, inspectable check: can Talkie-1930 do arithmetic at all?

The answer depends heavily on the evaluation. As a generator, it mostly fails grade-school word problems. As a log-likelihood model on much simpler arithmetic completions, it shows real but uneven arithmetic competence.

## GSM8K: basically no

I first tried [GSM8K](https://huggingface.co/datasets/openai/gsm8k), the grade-school math word-problem dataset. I used the instruction-tuned Talkie-1930 model and parsed the final numeric answer.

| Prompt style | N | Parsed | Correct |
| --- | ---: | ---: | ---: |
| Direct answer | 50 | 32 | 0 |
| Zero-shot reasoning | 10 | 9 | 0 |
| 4-shot reasoning | 10 | 10 | 0 |

This was not close. The model often produced a number, but the number was wrong. In the few-shot run it could imitate the solution format, but not reliably do the arithmetic underneath it.

I would treat these GSM8K numbers as generation probes rather than the final benchmark. I have since added an `lm-evaluation-harness` path that runs GSM8K with greedy decoding (`do_sample: false`, `temperature: 0.0`); a one-question smoke test already works end to end, but I have not yet rerun the full GSM8K table through the harness.

That does not mean the model has no numeracy. GSM8K requires reading a word problem, tracking quantities, choosing operations, and formatting an answer. For Talkie, generation and instruction-following are themselves part of the bottleneck.

## Easier arithmetic: sometimes yes

I then used the [EleutherAI arithmetic dataset](https://huggingface.co/datasets/EleutherAI/arithmetic), which comes from the OpenAI GPT-3 arithmetic tests. The current [lm-evaluation-harness task definitions](https://github.com/EleutherAI/lm-evaluation-harness/tree/main/lm_eval/tasks/arithmetic) score these as log-likelihood tasks: given a context like:

```text
Question: What is 98 plus 45?
Answer:
```

the model is correct if the exact target completion, like ` 143`, is the greedy continuation under teacher forcing.

This is much easier than GSM8K and much more like a base-LM benchmark. I sampled 500 examples from each of the 10 arithmetic tasks with seed 1930 using a custom logger that matches the harness task format and saves token-level traces.

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

The 1930 models are not just parroting "I cannot do math." They often put high probability on the right answer, especially for addition. But the pattern is brittle. They struggle with multi-operation expressions, subtraction, multiplication, and larger-digit tasks.

The modern-web base result is surprising. In many errors it copied an operand instead of computing the result: for "98 plus 45" it preferred ` 98`; for "95 times 45" it preferred ` 95`. I would not interpret this as evidence that vintage pre-1931 text makes a model more numerate than modern web text. More likely, I am not reproducing the Talkie authors' exact benchmark setup, or this particular completion format interacts badly with the modern-web checkpoint.

## The metric is strict

The arithmetic score is also format-strict. If the target is digits and the model prefers a word-form answer, the harness-style metric counts it wrong. For example, on some two-digit additions the instruction-tuned model preferred tokens like `Forty` before the digit target. That is a legitimate miss under the benchmark, but not the same kind of miss as computing the wrong number.

This is why I logged token-level outputs, not just aggregate scores. A single accuracy number hides the difference between "wrong operation," "copied an operand," "right value in the wrong format," and "format-following failure."

## Reproducibility

I packaged the evaluator as a small repo using Modal for CUDA. It now includes an `lm-evaluation-harness` adapter for benchmark-style runs, plus custom audit commands for logging row-level arithmetic traces. The package pins:

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

and the harness GSM8K command is:

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

Talkie-1930 is not usable as a general math reasoner. But it is not non-numerate either. On simple arithmetic completions, the 1930 models have pockets of real ability, especially addition, while failing badly on more compositional or format-sensitive tasks.

For anything downstream, I would use the arithmetic suite as a calibration check, not GSM8K alone. GSM8K tells us that the instruction-tuned model cannot reliably solve generated word problems. The arithmetic suite tells us the base model still encodes some elementary calculation patterns, and that the exact elicitation and scoring rule matter a lot.
