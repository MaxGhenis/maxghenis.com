---
title: 'RAMBar: A macOS Menu Bar RAM Monitor for Developers'
description: 'A native macOS menu bar app for tracking memory usage across Claude Code sessions, VS Code workspaces, Chrome tabs, and Python processes.'
pubDate: 'Jan 07 2026'
heroImage: './rambar.png'
---

Running Claude Code alongside VS Code and Chrome burns through RAM fast. My 36GB M3 Pro regularly hits 90%+ memory usage during heavy coding sessions. macOS's Activity Monitor shows individual processes, but not the context I actually care about: which Claude session is using how much, or which VS Code workspace is the memory hog.

So I built [RAMBar](https://maxghenis.com/rambar), a native macOS menu bar app that shows RAM usage the way developers think about it.

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

## How It Compares to Other Tools

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

## The Dashboard

Click "Full" to open an expanded dashboard with a retro-futuristic control room aesthetic. It shows diagnostics and warnings when memory is high or too many Claude sessions are running.

## Get It

Download from [maxghenis.com/rambar](https://maxghenis.com/rambar) or build from source on [GitHub](https://github.com/MaxGhenis/rambar).

Requires macOS 14.0+. First launch: right-click and select Open to bypass Gatekeeper (the app is currently unsigned).

---

*Part of [12 Days of Shipping](https://maxghenis.com).*
