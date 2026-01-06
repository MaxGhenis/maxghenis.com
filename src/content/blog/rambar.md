---
title: 'RAMBar: A macOS Menu Bar RAM Monitor for Developers'
description: 'A native macOS menu bar app for tracking memory usage across Claude Code sessions, VS Code workspaces, Chrome tabs, and Python processes.'
pubDate: 'Jan 06 2026'
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

## The Dashboard

Click "Full" to open an expanded dashboard with a retro-futuristic control room aesthetic. It shows diagnostics and warnings when memory is high or too many Claude sessions are running.

## Get It

Download from [maxghenis.com/rambar](https://maxghenis.com/rambar) or build from source on [GitHub](https://github.com/MaxGhenis/rambar).

Requires macOS 14.0+. First launch: right-click and select Open to bypass Gatekeeper (the app is currently unsigned).

---

*Part of [12 Days of Shipping](https://maxghenis.com).*
