---
title: 'Talkie-1930 math evals social posts'
description: 'Social media posts for the Talkie-1930 arithmetic evaluation post'
pubDate: 'Apr 30 2026'
draft: true
---

# Social posts

Blog: https://maxghenis.com/blog/talkie-1930-math-evals/
Browser: https://talkie-evals-browser.vercel.app
Repo: https://github.com/MaxGhenis/talkie-evals

## X

Talkie-1930 is a 13B language model trained only on text from before 1931. Can it do math?

- 4.9% / 7.2% on 5-shot GSM8K (GPT-4 cleared 92% at release)
- 42.7% on the EleutherAI arithmetic suite
- 91.6% on 2-digit addition, 11.5% on 3-operation expressions

Embedded examination booklet to browse every response.

maxghenis.com/blog/talkie-1930-math-evals/

## Bluesky

Talkie-1930 is a 13B language model trained only on text published before 1931. Can it do math?

I tested it on public benchmarks:
- 4.9% strict / 7.2% flexible on full 5-shot GSM8K, vs GPT-4's 92.0% at March 2023 release and Claude 3 Opus's 95.0% in March 2024
- 42.7% on the EleutherAI/OpenAI arithmetic suite (which GPT-3 175B already cleared in 2020 for 2-digit addition)
- 91.6% on 2-digit addition, 11.5% on 3-operation expressions, 26.2% on 2-digit multiplication

The launch post's "Numeracy" panel shows ~62% average accuracy at peak training compute but doesn't specify which tasks the average covers. The public arithmetic suite shows an 11.5%–91.6% spread on the 1930 base.

The post embeds an interactive examination booklet — step through 1,319 GSM8K questions and 15,000 arithmetic rows, filtered by run, candidate, or grade.

Browser: talkie-evals-browser.vercel.app
Code: github.com/MaxGhenis/talkie-evals
Write-up: maxghenis.com/blog/talkie-1930-math-evals/

## LinkedIn

Can a language model trained only on pre-1931 text do math?

Talkie-1930 is a 13B-parameter model trained on text published before 1931. Its launch post claims "similar performance on core language understanding and numeracy tasks" between Talkie and a modern-web twin (same architecture, trained on FineWeb), with a "Numeracy" panel showing ~62% average accuracy at peak training compute vs ~57% for the twin.

The panel doesn't specify which tasks, prompts, or scoring rules produced the curve. So I tested it on public benchmarks:

- GSM8K (grade-school word problems): 4.9% strict / 7.2% flexible on the full standard 5-shot run. For context, GPT-4 cleared 92.0% at its March 2023 release; Claude 3 Opus reported 95.0% in March 2024.
- EleutherAI arithmetic suite (10 log-likelihood tasks from the original GPT-3 paper): 42.7% overall on the 1930 base. GPT-3 175B already hit 100% on 2-digit addition in that 2020 paper.
- The spread on Talkie-1930: 91.6% on 2-digit addition, 74.7% on 3-digit addition, 11.5% on 3-operation expressions, 26.2% on 2-digit multiplication.

Talkie-1930 fails as a general math reasoner but encodes elementary calculation patterns in narrow regimes. The aggregate "62% Numeracy" headline averages over unspecified tasks; the public arithmetic suite shows an 11.5%–91.6% spread.

The post embeds an interactive examination booklet, designed to look like a 1930 schoolmaster's grading ledger, where you can step through every Talkie response — 1,319 GSM8K questions and 15,000 arithmetic rows — with filters for run, metric, candidate, subject, and grade. Each card shows the prompt, the model's full response, the extracted answer, and the gold answer.

Browser: talkie-evals-browser.vercel.app
Code, pinned dependencies, and full results: github.com/MaxGhenis/talkie-evals
Write-up: maxghenis.com/blog/talkie-1930-math-evals/
