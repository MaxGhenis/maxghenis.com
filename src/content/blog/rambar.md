---
title: 'RAMBar: A macOS Menu Bar RAM Monitor for Developers'
description: 'A native macOS menu bar app for tracking memory usage across Claude Code sessions, VS Code workspaces, Chrome tabs, and Python processes.'
pubDate: 'Jan 07 2026'
heroImage: './rambar.png'
---

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 2rem 0;">
  <iframe
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 12px;"
    src="https://www.youtube.com/embed/6lnQpfxJs0Y"
    title="RAMBar Demo"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

Claude Opus 4.5 kept crashing my VS Code.

Nothing wrong with the model—it was just so good that I started running 5, 6, even a dozen Claude Code sessions at once. My 16GB MacBook Air couldn't keep up. I upgraded to a 48GB MacBook Pro, which mostly solved the crashes, but I still had no visibility into what was eating memory. Activity Monitor shows processes, but not answers like "which Claude session is the hog?" or "can I spawn another subagent?"

So I built [RAMBar](https://maxghenis.com/rambar)—my first macOS app, built entirely with Claude Code. It shows RAM usage the way developers think about it.

## What It Does

RAMBar lives in your menu bar showing current RAM percentage, color-coded by status:

- **Green**: Under 70%, you're fine
- **Yellow**: 70-85%, getting tight
- **Red**: Over 85%, time to close something

Click it to see a breakdown of what's actually using your memory.

## Developer-Focused Breakdowns

Unlike generic system monitors, RAMBar understands developer workflows:

- **Claude Code sessions** — Shows main sessions vs subagents separately, so you can see when parallel agents are spawning
- **VS Code workspaces** — Memory grouped by which project folder is open
- **Chrome tabs** — Lists individual tabs by memory, so you can find that one tab eating 2GB
- **Python processes** — Useful when you're running Jupyter notebooks or ML training alongside everything else

## How it compares to other tools

Several macOS menu bar monitors exist, but none understand developer workflows:

| Tool | Price | Developer context | Claude Code awareness |
|------|-------|-------------------|----------------------|
| **RAMBar** | Free | ✅ Groups by workspace/session | ✅ Shows sessions + subagents |
| [Stats](https://github.com/exelban/stats) | Free | ❌ Process-level only | ❌ |
| [iStat Menus](https://bjango.com/mac/istatmenus/) | $12 | ❌ Process-level only | ❌ |
| [MenuBar Stats](https://seense.com/menubarstats/) | $5 | ❌ Process-level only | ❌ |
| Activity Monitor | Free | ❌ Process-level only | ❌ |

[Stats](https://github.com/exelban/stats) is excellent for general system monitoring—CPU graphs, network throughput, disk I/O—and it's free and open source. [iStat Menus](https://bjango.com/mac/istatmenus/) adds weather widgets, fan control, and extensive customization for $12.

RAMBar solves a different problem. When I see high memory usage, I don't want to know that `node` is using 4GB—I want to know *which VS Code workspace* that node process belongs to. I don't care that there are 47 Chrome Helper processes; I want to know which *tab* is the culprit. And when Claude Code spawns subagents, I want to see that hierarchy, not a flat list of identical `claude` processes.

If you need comprehensive system monitoring, use Stats or iStat Menus. If you're an AI-assisted developer who wants to know why your Mac is struggling during a coding session, RAMBar fills that gap.

## Get it

```bash
brew tap maxghenis/tap
brew install --cask rambar
```

Or download from [maxghenis.com/rambar](https://maxghenis.com/rambar). Source on [GitHub](https://github.com/MaxGhenis/rambar).

Requires macOS 14.0+. First launch: right-click and select Open to bypass Gatekeeper (the app is currently unsigned).

---

*Part of [12 Days of Shipping](https://maxghenis.com).*
