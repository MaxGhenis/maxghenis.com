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

Talkie-1930 is a 13B language model trained only on pre-1931 text. I tested its math.

On rote arithmetic, it matches or exceeds GPT-3 175B (13× larger).
On 5-shot GSM8K word problems, it scores 4.9% — same-size LLaMA 13B scores 17.8%.

Same model. Two benchmarks. Different eras of capability.

maxghenis.com/blog/talkie-1930-math-evals/

## Bluesky

Talkie-1930 is a 13B language model trained only on text published before 1931. I tested its math, and it has an unusually split capability profile.

On the EleutherAI/OpenAI arithmetic suite (Brown et al. 2020), Talkie-1930 13B base scores higher than same-size GPT-3 13B on every task except 2-digit subtraction. On 4-digit and 5-digit add/subtract, it also exceeds GPT-3 175B at 13× fewer parameters:

- 5-digit addition: Talkie 31.4% vs GPT-3 13B 0.05% vs GPT-3 175B 9.3%
- 4-digit subtraction: Talkie 36.1% vs GPT-3 13B 0.4% vs GPT-3 175B 26.8%

On GSM8K word problems (5-shot, strict), it scores 4.9% — vs 17.8% for same-size LLaMA 13B and 92.0% for GPT-4 at its March 2023 release.

Capability gap with modern frontier models lives in instruction-following, chain-of-thought, and word-problem framing, not in the underlying numeric pattern matching.

The post embeds an interactive examination booklet to step through 1,319 GSM8K questions and 15,000 arithmetic rows.

Browser: talkie-evals-browser.vercel.app
Code: github.com/MaxGhenis/talkie-evals
Write-up: maxghenis.com/blog/talkie-1930-math-evals/

## LinkedIn

Can a language model trained only on pre-1931 text do math?

Talkie-1930 is a 13B-parameter model trained on text published before 1931. Its launch post claims "similar performance on core language understanding and numeracy tasks" between Talkie and a modern-web twin (same architecture, trained on FineWeb), with a "Numeracy" panel showing ~62% average accuracy at peak training compute vs ~57% for the twin. The panel doesn't specify which tasks.

I tested it on two public benchmarks:

GSM8K (Cobbe et al. 2021): 4.9% strict / 7.2% flexible on the standard 5-shot run.
Same-size LLaMA 13B (Touvron et al. 2023) reports 17.8%.
GPT-4 cleared 92.0% at its March 2023 release; Claude 3 Opus reported 95.0% in March 2024.

EleutherAI arithmetic suite (10 log-likelihood tasks from the original GPT-3 paper, Brown et al. 2020): 42.7% overall on the 1930 base. On 8 of 10 tasks it scores higher than same-size GPT-3 13B from that paper. On 4-digit and 5-digit add/subtract it also scores higher than GPT-3 175B at 13× fewer parameters:

- 5-digit addition: Talkie 31.4% vs GPT-3 13B 0.05% vs GPT-3 175B 9.3%
- 4-digit subtraction: Talkie 36.1% vs GPT-3 13B 0.4% vs GPT-3 175B 26.8%
- 2-digit multiplication: Talkie 26.2% vs GPT-3 13B 7.1% vs GPT-3 175B 29.2%

The capability profile splits cleanly: on rote arithmetic completion, Talkie-1930 13B is at GPT-3-175B level (the 2020 frontier) at 13× fewer parameters. On grade-school word problems it's roughly 2019-era. The gap with modern frontier models is in instruction-following, chain-of-thought, and word-problem framing — not in the underlying numeric pattern matching.

The post embeds an interactive examination booklet, designed to look like a 1930 schoolmaster's grading ledger, where you can step through every Talkie response — 1,319 GSM8K questions and 15,000 arithmetic rows — with filters for run, metric, candidate, subject, and grade.

Browser: talkie-evals-browser.vercel.app
Code, pinned dependencies, and full results: github.com/MaxGhenis/talkie-evals
Write-up: maxghenis.com/blog/talkie-1930-math-evals/
