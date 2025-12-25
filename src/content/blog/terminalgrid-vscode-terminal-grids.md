---
title: 'TerminalGrid: Turn VS Code into a Claude Code Superterminal'
description: 'A VS Code extension for keyboard-driven terminal grid management with project picker and auto-launch for AI coding tools.'
pubDate: 'Dec 25 2024'
---

I run multiple Claude Code sessions simultaneously—one for each project I'm working on. VS Code's terminal panel only splits horizontally, which is limiting. And the native terminal has [issues with image pasting](https://github.com/anthropics/claude-code/issues/1361) that matter when you're sharing screenshots with Claude.

So I built [TerminalGrid](https://marketplace.visualstudio.com/items?itemName=MaxGhenis.terminalgrid), a VS Code extension that solves both problems.

## The Problem

VS Code's integrated terminal only supports horizontal splitting. There's no native way to stack terminals vertically or create complex grids. This has been requested for years ([#56112](https://github.com/microsoft/vscode/issues/56112), [#160501](https://github.com/microsoft/vscode/issues/160501)), but hasn't been implemented.

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

## The Solution

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

## Other Features

- **Crash recovery** — Terminal directories persist even if VS Code crashes
- **Image pasting** — Editor-area terminals handle screenshots better than the terminal panel
- **Works with any CLI tool** — Aider, Codex, Gemini CLI, or just plain shells

## Get It

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=MaxGhenis.terminalgrid) or:

```bash
code --install-extension MaxGhenis.terminalgrid
```

Source on [GitHub](https://github.com/MaxGhenis/terminalgrid).

---

*Day 1 of [12 Days of Shipping](https://maxghenis.com). Merry Christmas!*
