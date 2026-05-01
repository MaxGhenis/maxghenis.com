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

- 4.9% strict / 7.2% flexible on full 5-shot GSM8K
- 42.7% on the EleutherAI arithmetic suite
- 92% on 2-digit addition, 12% on 3-operation expressions

The launch post's ~62% "Numeracy" headline hides the spread.

maxghenis.com/blog/talkie-1930-math-evals/

## Bluesky

Talkie-1930 is a 13B language model trained only on text published before 1931. Can it do math?

I tested it on public benchmarks:
- 4.9% strict / 7.2% flexible on full 5-shot GSM8K
- 42.7% on the EleutherAI arithmetic suite
- 91.6% on 2-digit addition, 11.5% on 3-operation expressions, 26.2% on 2-digit multiplication

The launch post's "Numeracy" panel shows ~62% accuracy at peak training compute but doesn't specify which tasks the average covers. The public arithmetic suite shows an 11.5%–91.6% spread.

Code: github.com/MaxGhenis/talkie-evals
Write-up: maxghenis.com/blog/talkie-1930-math-evals/

## LinkedIn

Can a language model trained only on pre-1931 text do math?

Talkie-1930 is a 13B-parameter model trained on text published before 1931. Its launch post claims "similar performance on core language understanding and numeracy tasks" between Talkie and a modern-web twin (same architecture, trained on FineWeb), with a "Numeracy" panel showing ~62% accuracy at peak training compute vs ~57% for the twin.

The panel doesn't specify which tasks, prompts, or scoring rules produced the curve. So I tested it on public benchmarks:

- GSM8K (grade-school word problems): 4.9% strict / 7.2% flexible on the full standard 5-shot run
- EleutherAI arithmetic suite (10 log-likelihood tasks): 42.7% overall on the 1930 base
- The spread: 91.6% on 2-digit addition, 74.7% on 3-digit addition, 11.5% on 3-operation expressions, 26.2% on 2-digit multiplication

Talkie-1930 fails as a general math reasoner but encodes elementary calculation patterns in narrow regimes. The aggregate "62% Numeracy" headline averages over unspecified tasks; the public arithmetic suite shows an 11.5%–91.6% spread.

Code, pinned dependencies, and full results: github.com/MaxGhenis/talkie-evals
Write-up: maxghenis.com/blog/talkie-1930-math-evals/
