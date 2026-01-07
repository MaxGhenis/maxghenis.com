---
title: 'TerminalGrid: Turn VS Code into a Claude Code Superterminal'
description: 'A VS Code extension for keyboard-driven terminal grid management with project picker and auto-launch for AI coding tools.'
pubDate: 'Jan 07 2026'
heroImage: './terminalgrid.png'
---

I run multiple Claude Code sessions simultaneously—one for each project I'm working on. VS Code's terminal panel only splits horizontally, which is limiting. And the native terminal has [issues with image pasting](https://github.com/anthropics/claude-code/issues/1361) that matter when you're sharing screenshots with Claude.

So I built [TerminalGrid](https://maxghenis.com/terminalgrid), a VS Code extension that solves both problems.

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 2rem 0;">
  <iframe
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"
    src="https://www.youtube.com/embed/I3neOEJzi6M"
    title="TerminalGrid Demo"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## VS Code as a shell for coding agents

Boris Cherny, who created Claude Code, [recently shared](https://x.com/bcherny/status/2004897269674639461) that 100% of his contributions to Claude Code in the past month were written by Claude Code itself. I've been operating this way for two to three months now—not writing any code myself. Of course, Boris is a much better programmer than I am, so I had less to discard.

This shift has changed how I use VS Code. I've stopped looking at the code directly; VS Code is now just a shell for coding agents. I don't use the file explorer or most other features. It's still better than a raw terminal since it lets you paste screenshots, but otherwise I just keep it as a grid of Claude Code sessions.

## The problem

VS Code's [integrated terminal](https://code.visualstudio.com/docs/terminal/basics) only supports side-by-side splitting—no vertical stacking. This has been requested since 2018 ([#56112](https://github.com/microsoft/vscode/issues/56112), [#160501](https://github.com/microsoft/vscode/issues/160501)) and people are still asking for it in 2025 ([#254638](https://github.com/microsoft/vscode/issues/254638), [#252458](https://github.com/microsoft/vscode/issues/252458)). Microsoft hasn't implemented it.

Other extensions like [Split Terminal](https://marketplace.visualstudio.com/items?itemName=BrianNicholls.split-terminal) and [Workspace Layout](https://marketplace.visualstudio.com/items?itemName=lostintangent.workspace-layout) don't solve this either—they work within the terminal panel's limitations.

When you're running 4+ AI coding sessions, you need a proper grid:

```
┌─────────────────┬─────────────────┐
│  policyengine   │  api-server     │
│  (Claude Code)  │  (Claude Code)  │
├─────────────────┼─────────────────┤
│  docs           │  frontend       │
│  (Claude Code)  │  (Claude Code)  │
└─────────────────┴─────────────────┘
```

## The solution

TerminalGrid moves terminals to the editor area, where VS Code already supports full grid layouts. Then it adds keyboard shortcuts and a project picker:

1. **`Cmd+K Cmd+N`** — Opens a searchable list of your projects
2. **Pick a project** — Type to filter, select with Enter
3. **Terminal launches** — Runs `cd <project> && claude` automatically

The terminal is named after the folder, so you always know which Claude is working on what.

## Setup

```json
{
  "terminalgrid.projectDirectories": ["~/projects", "~/code"],
  "terminalgrid.autoLaunchCommand": "claude"
}
```

That's it. Now every `Cmd+K Cmd+Down/Right/N` gives you a project picker that launches Claude in the right directory.

## Other features

- **Crash recovery** — Terminal directories persist even if VS Code crashes
- **Image pasting** — Editor-area terminals handle screenshots better than the terminal panel
- **Works with any CLI tool** — Aider, Codex, Gemini CLI, or just plain shells

## Get it

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=MaxGhenis.terminalgrid) or:

```bash
code --install-extension MaxGhenis.terminalgrid
```

Source on [GitHub](https://github.com/MaxGhenis/terminalgrid).

---

*Day 1 of [12 Days of Shipping](https://maxghenis.com). Merry Christmas!*
