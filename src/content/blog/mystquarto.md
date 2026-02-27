---
title: 'I built a MyST-to-Quarto converter (and why you might need one)'
description: 'mystquarto converts academic markdown between MyST and Quarto formats — directives, roles, config files, and frontmatter. Now on PyPI.'
pubDate: 'Feb 27 2026'
projectUrl: 'https://maxghenis.com/mystquarto'
---

I have about 20 academic papers written in [MyST Markdown](https://mystmd.org/). MyST is great — Jupyter Book integration, Sphinx directives, executable code cells. But I've been increasingly drawn to [Quarto](https://quarto.org/) for its PDF output, built-in cross-referencing, and the fact that it's becoming the standard for reproducible academic publishing.

The problem: converting between the two isn't trivial. Both formats use markdown, but their syntax for the interesting parts — executable code, citations, figures, admonitions, cross-references — is completely different. And no converter existed.

So I built one.

## What mystquarto does

```bash
pip install mystquarto

myst2quarto docs/ -o docs-quarto/
quarto2myst docs/ -o docs-myst/
```

It handles the full conversion in both directions:

**Block directives.** MyST uses Sphinx-style directives (`` ```{code-cell} python `` with `:tags: [hide-input]`). Quarto uses pandoc-style fences (`` ```{python} `` with `#| code-fold: true`). mystquarto converts between all 13+ directive types: code cells, figures, math blocks, admonitions, tab sets, margin content, tables, images, and more.

**Inline roles.** MyST's `` {cite}`smith2024` `` becomes Quarto's `[@smith2024]`. Same for cross-references (`` {numref}`fig-results` `` → `@fig-results`), equations, inline code evaluation, and document links. Nine role types in total.

**Config files.** `myst.yml` and `_quarto.yml` have different structures for the same concepts — project type, table of contents, bibliography, export formats, author metadata. mystquarto maps between them, detecting book vs. article projects automatically.

**Frontmatter.** Per-file YAML like `kernelspec` → `jupyter`, `label` → `id`, and `exports` → `format`.

**File extensions.** `.md` ↔ `.qmd` renaming, with asset copying and `_build`/`.git` directory skipping.

## Why not use Pandoc?

Pandoc is the universal markdown converter, but it operates at the document level — parsing to an AST and rendering back. It doesn't understand MyST directives or Quarto's executable code cells. These are treated as raw content or code blocks, not as semantic constructs that need structural transformation.

The conversion between MyST and Quarto is fundamentally about syntax mapping between two directive systems, not about document parsing. A code cell's `:tags: [hide-input]` needs to become `#| code-fold: true` — that's a structural transform, not a format conversion.

## How it works

The architecture is deliberately simple: a regex-based line scanner with a directive stack, processing files line by line. The scanner detects opening fences (both backtick and colon styles), tracks nesting depth, parses option blocks, and dispatches to transform functions on close.

No heavy dependencies. The entire package uses just `click` for the CLI and `pyyaml` for config/frontmatter parsing. No `markdown-it-py`, `myst-parser`, or `docutils`. This keeps the install fast and the code easy to understand and extend.

225 tests cover every transform rule, with fixture-based comparisons and roundtrip tests (MyST → Quarto → MyST).

## Try it

```bash
# Install
pip install mystquarto

# Or run without installing
uvx myst2quarto docs/

# Preview what would change
myst2quarto docs/ --dry-run
```

The code is at [github.com/MaxGhenis/mystquarto](https://github.com/MaxGhenis/mystquarto), MIT-0 licensed (no attribution required). The [project page](/mystquarto) has the full syntax mapping table.

If you're sitting on MyST projects and want to try Quarto — or vice versa — give it a shot.
