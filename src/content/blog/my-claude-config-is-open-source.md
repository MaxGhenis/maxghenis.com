---
title: 'My Claude Code config'
description: 'I audited my ~/.claude directory, cleaned it up, and made it public. Here''s what I found and what I changed.'
pubDate: 'Feb 18 2026'
---

I use [Claude Code](https://docs.anthropic.com/en/docs/claude-code) as my primary development environment. Over the past few months my `~/.claude` directory has accumulated a lot of customization --- slash commands, hooks, plugins, settings, secrets management. Today I made it all public: [github.com/MaxGhenis/.claude](https://github.com/MaxGhenis/.claude).

The path to making it public was more interesting than the final result.

## How it started

I went to `git init` my `~/.claude` directory and discovered it was already a git repo. One of my installed plugins had initialized its own repo there, and my personal config files were sitting alongside it, untracked. The `.git` directory pointed to the plugin's remote. My files were just along for the ride.

So the first step was cleaning house. I removed the plugin's git history, initialized a fresh repo, and started deciding what to track.

## The audit

Before making anything public, I went through every file. The `~/.claude` directory accumulates a lot: conversation transcripts, clipboard images, debug logs, session state, plugin caches. Most of that is ephemeral or sensitive and belongs in `.gitignore`.

What's left after exclusions is surprisingly small: a `CLAUDE.md` global instructions file, a `settings.json`, three hook scripts, a handful of slash commands, two local plugins, and a pair of shell scripts for secrets management.

While auditing, I also noticed that 36 GB of stale repo clones had accumulated in my home directory from multi-agent work. PolicyEngine US alone had 10 separate clones for different PRs, each a full copy of a large repo. That's not in `~/.claude`, but the audit prompted me to clean it up.

## Slash commands

Claude Code lets you define [custom slash commands](https://docs.anthropic.com/en/docs/claude-code/slash-commands) as markdown files in `~/.claude/commands/`. Each file is a prompt template you invoke with `/command-name`. I have nine:

- **`/briefing`** --- Pulls today's calendar, unread emails, and (in the first week of the month) monthly task reminders. I run this most mornings.
- **`/search-everything`** --- Cross-platform search across local files, WhatsApp, Gmail, Granola meeting notes, and the browser. It works through sources in order of speed and stops when it finds what I need.
- **`/expense`** and **`/anthropic-expenses`** --- Automate filing reimbursements on [Open Collective](https://opencollective.com/policyengine). They search my email for invoices, download receipts, and submit expenses.
- **`/download-receipts`** --- Extracts PDF attachments from Gmail search results and saves them locally.
- **`/gmail`** and **`/google-api`** --- Reference commands for email patterns and Google API authentication across my work and personal accounts.
- **`/slides`** --- Generates presentation decks from a brief or topic using a Next.js + Tailwind framework.
- **`/search-transcripts`** --- Searches past Claude Code conversation transcripts by keyword using [`claude-search`](https://github.com/nicobailon/claude-search).

Most of these compose multiple tools --- MCP servers, CLI utilities, APIs --- into a single action. The `/briefing` command, for example, calls the Google Calendar API, searches Gmail, and checks a task list, then synthesizes everything into a summary. Writing it as a slash command means I don't re-explain the workflow every session.

## Hooks

[Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) are shell scripts that run automatically before or after Claude Code events. I have three, and the audit revealed a gap: all three scripts existed on disk, but only one was wired up in `settings.json`. The other two were doing nothing.

This is an easy mistake to make. You write the script, mark it executable, and forget that hooks also need a corresponding entry in `settings.json` to actually fire. I fixed it --- all three are now connected.

**`enforce-package-managers.sh`** runs before every Bash command. It blocks `npm`, `npx`, `yarn`, `pip`, and `pipx` and tells Claude to use `bun` or `uv` instead. Without this, Claude defaults to npm about half the time regardless of what `CLAUDE.md` says. The hook makes the preference absolute:

```bash
if echo "$command" | grep -qE '\bnpm\s+(install|i|add|...)\b'; then
  echo '{"decision": "block", "reason": "Use bun instead of npm."}'
  exit 0
fi
```

**`auto-commit-wip.sh`** runs before context compression (the `PreCompact` event). Context compression often precedes crashes or context exhaustion, so this hook auto-commits all uncommitted changes. I added it after losing an entire branch of multi-agent work --- 10 files, 262 KB --- because agents wrote to the working tree without committing, then the session crashed. The commit uses `--fixup=HEAD` so that fixup commits can be cleanly squashed later with `git rebase --autosquash`.

**`warn-uncommitted.sh`** runs on session stop. If there are uncommitted changes in the current repo, it prints a warning. Same motivation: don't lose work.

## CLAUDE.md

The `CLAUDE.md` at the repo root is my global instructions file --- it applies to every Claude Code session regardless of which directory I'm in. During this audit I trimmed it from about 113 lines to about 70.

What I removed: instructions about the current year (Opus 4.6 already knows the date), package manager preferences (the hook enforces this more reliably than a text instruction), and verbose TDD workflow steps (Claude already follows test-first patterns when asked).

What survived:

- **Fake data disclosure**: Claude must never present mock data without prominent warnings. This matters because I work on policy analysis where fake numbers could be mistaken for real projections.
- **Model routing**: Use Opus or Haiku for subagents, never Sonnet.
- **Sentence case for headings**: A style preference that applies to everything I write.
- **Google API and email patterns**: Pointers to the relevant slash commands and account details.

The general lesson: if something can be enforced by a hook, put it in a hook. `CLAUDE.md` is a suggestion. A hook that returns `{"decision": "block"}` is a hard stop.

## Secrets management

The repo includes two shell scripts for secrets, both safe to publish:

- **`load-secrets.sh`** reads secrets from the macOS Keychain (service `claude-env`) and exports them as environment variables. It's sourced from `.zshrc` so every shell session has access.
- **`manage-secret.sh`** is a CRUD interface for the same Keychain service: `set`, `get`, `del`, `list`.

The scripts contain no secrets, just the Keychain lookup logic. I previously had an [age](https://github.com/FiloSottile/age)-encrypted secrets file alongside them, but it was redundant with the Keychain approach and added complexity. I removed it.

## Settings

`settings.json` configures MCP servers, permissions, hooks, enabled plugins, and plugin sources. The notable parts:

- **MCP servers**: Gmail, Google Ads, Chrome DevTools, and an Android SMS gateway, each defined with their command and environment variables (using `${VAR}` references that resolve from the macOS Keychain at runtime --- no secrets in the file).
- **Permissions**: I run in bypass mode with broad tool access. This is a personal machine and I prefer speed over confirmation dialogs.
- **Plugin sources**: Pointers to local plugin directories for plugins I'm developing.

## What I learned

A few things came out of this audit that I wasn't expecting:

**Hooks beat instructions.** The enforce-package-managers hook catches every `npm install` before it runs. The equivalent `CLAUDE.md` instruction ("use bun, not npm") works maybe half the time. If you care about a behavior strongly enough to write it down, write it as a hook instead.

**Hooks on disk aren't hooks in practice.** Two of my three safety hooks existed as executable scripts but weren't registered in `settings.json`. They'd never fired. The gap between "I wrote this" and "this is running" is easy to miss, especially since there's no warning that a hook script exists but isn't configured.

**Config directories accumulate without you noticing.** The 36 GB of stale clones, the plugin that had taken over my git history, the age-encrypted secrets file I'd stopped using months ago --- none of this was visible until I sat down and went through everything deliberately. Periodic audits are worth the time.

## Why make it public

A few reasons:

1. **Reference for others setting up Claude Code.** The documentation covers each feature individually, but seeing a real configuration that ties them together is more useful than reading about each piece in isolation.
2. **Backup and portability.** If I set up a new machine, I can clone this repo and have my workflow back immediately (minus secrets, which live in the Keychain).
3. **Accountability.** Knowing it's public makes me more deliberate about what goes in there.

The repo is at [github.com/MaxGhenis/.claude](https://github.com/MaxGhenis/.claude).
