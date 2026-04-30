---
title: 'Talkie-1930 math evals social posts'
description: 'Social media posts for the Talkie-1930 arithmetic evaluation post'
pubDate: 'Apr 30 2026'
draft: true
---

# Social posts

Blog: https://maxghenis.com/blog/talkie-1930-math-evals/
Repo: https://github.com/MaxGhenis/talkie-evals

## X

Talkie-1930 is a 13B language model trained only on text written before 1931. Can it do math?

- 0/70 on GSM8K word problems
- 42.8% on the EleutherAI arithmetic suite
- 91% on 2-digit addition, 13% on 3-operation expressions

The launch post's ~62% "Numeracy" headline hides the spread.

maxghenis.com/blog/talkie-1930-math-evals/

## Bluesky

Talkie-1930 is a 13B language model trained only on text published before 1931. Can it do math?

I tested it on public benchmarks:
- 0/70 on GSM8K grade-school word problems
- 42.8% on the EleutherAI arithmetic suite
- 91.4% on 2-digit addition, 13.0% on 3-operation expressions, 24.0% on 2-digit multiplication

The launch post's "Numeracy" panel shows ~62% accuracy at peak training compute but doesn't specify which tasks the average covers. The public arithmetic suite shows a 13.0%–91.4% spread.

Code: github.com/MaxGhenis/talkie-evals
Write-up: maxghenis.com/blog/talkie-1930-math-evals/

## LinkedIn

Can a language model trained only on pre-1931 text do math?

Talkie-1930 is a 13B-parameter model trained on text published before 1931. Its launch post claims "similar performance on core language understanding and numeracy tasks" between Talkie and a modern-web twin (same architecture, trained on FineWeb), with a "Numeracy" panel showing ~62% accuracy at peak training compute vs ~57% for the twin.

The panel doesn't specify which tasks, prompts, or scoring rules produced the curve. So I tested it on public benchmarks:

- GSM8K (grade-school word problems): 0 of 70 attempts correct, across direct-answer, zero-shot reasoning, and 4-shot reasoning prompts
- EleutherAI arithmetic suite (10 log-likelihood tasks): 42.8% overall on the 1930 base
- The spread: 91.4% on 2-digit addition, 73.2% on 3-digit addition, 13.0% on 3-operation expressions, 24.0% on 2-digit multiplication

Talkie-1930 fails as a general math reasoner but encodes elementary calculation patterns in narrow regimes. The aggregate "62% Numeracy" headline averages over unspecified tasks; the public arithmetic suite shows a 13.0%–91.4% spread.

Code, pinned dependencies, and full results: github.com/MaxGhenis/talkie-evals
Write-up: maxghenis.com/blog/talkie-1930-math-evals/
