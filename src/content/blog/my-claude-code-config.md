---
title: 'My Claude Code config'
description: 'I audited my ~/.claude directory, cleaned it up, and made it public. Here''s what I found, what I changed, and how I later moved domain-specific memory into on-demand skills.'
pubDate: 'Feb 18 2026'
updatedDate: 'Feb 21 2026'
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

## Skills: on-demand context loading

**Update (Feb 20):** Two days after publishing this post, I restructured how Claude Code accesses domain-specific reference information.

The problem: Claude Code has a persistent memory system --- a `MEMORY.md` file that's loaded into every session's system prompt. Mine had grown to 215 lines (past the 200-line truncation limit) with detailed API references, credential locations, deployment procedures, and troubleshooting guides for services like Whoop, Xero, App Store Connect, GCP billing, and Slack. Most of this was irrelevant to any given session but cost context every time.

The solution: [skills](https://docs.anthropic.com/en/docs/claude-code/plugins#skills). Skills are markdown files in a plugin's `skills/` directory that load on-demand based on trigger keywords in the conversation. When I mention "whoop" or "sleep data," the Whoop skill loads. When I mention "xero" or "UK expense," the Xero skill loads. Otherwise, they don't exist in the context window.

I moved 11 domain-specific reference sections from `MEMORY.md` into skills in my `max-productivity` local plugin:

| Skill | Triggers on | What it contains |
|-------|------------|-----------------|
| `whoop-health` | whoop, sleep, recovery, hrv | API endpoints, token refresh flow, cached data locations |
| `xero-uk-accounting` | xero, UK expense | OAuth flow, tenant ID, account codes |
| `app-store-connect` | app store, fastlane, xcode | API key, bundle IDs, build commands |
| `gcp-billing` | gcp, google cloud | Billing account IDs, project list |
| `opencollective-expenses` | expense, reimbursement | Collective details, currency handling |
| `cbo-baseline` | cbo, budget outlook | Excel file IDs, row numbers, YAML paths |
| `modal-vercel-deployment` | modal deploy, vercel deploy | Workspace config, failure modes |
| `agent-teams` | agent team, TeamCreate | Workflow steps, gotchas |
| `slack-patterns` | slack, DM | Channel IDs, pagination rules, DM access |
| `search-email-patterns` | draft email, find meeting | Search priority, drafting preferences |
| `claude-in-chrome` | chrome extension, browser automation | Setup, account matching, troubleshooting |

`MEMORY.md` went from 215 lines to 61 --- just core operating principles, account identifiers, and hard-won lessons that apply to every session. Everything else loads only when relevant.

The skill file format is straightforward:

```markdown
---
name: Whoop health data
description: Use this skill when working with Whoop API, health data,
  sleep analysis, recovery scores, or HRV data. Triggers: "whoop",
  "sleep", "recovery", "hrv", "health data".
version: 0.1.0
---

# Whoop API & health data

## Credentials
- **Config**: `~/.config/whoop/credentials.json`
...
```

The `description` field is what Claude Code matches against. If the conversation context matches the trigger keywords, the full skill content loads into the prompt. The plugin's `plugin.json` just needs `"skills": "./skills"` to auto-discover all skill directories.

This is the same pattern the [PolicyEngine plugin](https://github.com/PolicyEngine/policyengine-claude) uses for its 60+ skills --- I just hadn't applied it to my personal reference material until now.

To verify it worked, I restarted Claude Code and asked a single question that touches three different skills:

> What's Pavel's Slack DM channel ID? And what's the Whoop sleep API endpoint? And how do I deploy to Modal?

<details>
<summary>Full response from Claude Code</summary>

Claude spawned three parallel Explore agents that searched the skill files on-demand, then synthesized the results:

**Pavel's Slack DM channel ID**

`D047FDWKAKC` (user ID: `U047HTB58BE`)

**Whoop sleep API endpoint**

```
GET https://api.prod.whoop.com/developer/v2/activity/sleep?limit=25
```
- Auth: `Bearer {access_token}` header
- Max limit: 25 (50 fails)
- Pagination: `&nextToken=TOKEN`
- Credentials: `~/.config/whoop/credentials.json`
- Tokens expire frequently --- re-auth via OAuth if you get 403

**Modal deployment**

```bash
# Critical: unset keychain env vars first to use PE workspace
unset MODAL_TOKEN_ID MODAL_TOKEN_SECRET && modal deploy modal_app.py
```
- PE workspace: `policyengine` (verify with `modal profile current`)
- URL pattern: `https://policyengine--{app-name}-{function-name}.modal.run`
- If URL shows `maxghenis--` instead of `policyengine--`, you deployed to the wrong workspace --- unset env vars and redeploy
- For Vercel-fronted apps, update `VITE_API_URL` env var and force redeploy with `vercel --prod --force`

</details>

All three answers came from skills that loaded on-demand --- none of this was in the system prompt until the question triggered it.

### Keeping it clean: the config audit agent

The migration raised an obvious question: how do I keep things from drifting back? `MEMORY.md` grows automatically as Claude learns things during sessions. Without maintenance, it'll be back at 200+ lines within weeks.

The answer is an [agent](https://docs.anthropic.com/en/docs/claude-code/plugins#agents) --- an autonomous subprocess that can read files, analyze content, and make changes. I added a `config-audit` agent to the same `max-productivity` plugin. It triggers when `MEMORY.md` exceeds 150 lines or when I mention "clean up config" or "audit memory."

The agent knows the classification rules:

- **Behavioral rules** ("always do X") belong in `CLAUDE.md`
- **Compact facts** (account IDs, 1-2 line lessons) belong in `MEMORY.md`
- **Detailed reference** (API docs, step-by-step guides, anything >5 lines on one topic) belongs in a skill

When triggered, it reads all three layers, reports line counts, flags misplaced content, and proposes moves. After I approve, it creates new skill files, edits `MEMORY.md`, and updates `CLAUDE.md` as needed. It never deletes information --- it moves it to the right layer.

This closes the loop: skills handle the *what*, the agent handles the *when* and *where*. Configuration maintenance becomes something Claude does for me rather than something I have to remember to do.

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

## tmux: how not to set up a terminal grid

**Update (Feb 21):** I've moved from VS Code ([TerminalGrid](/blog/terminalgrid)) to iTerm2 + tmux for running multiple Claude Code sessions. The final setup took about 15 minutes. Getting there took most of a day.

The goal was simple: run 6+ Claude Code sessions in a visible grid, persistent across restarts. What followed was a comedy of errors --- each failure spawning a more complex workaround, each workaround failing in a more spectacular way, until the entire tmux server crashed and I was forced to start over with the obvious solution.

### Attempt 1: separate sessions + join-pane grid toggle

The first idea was one tmux session per project, then a `tmux-grid` script that would `join-pane` them all into a single window for a grid view. The problem: `join-pane` is destructive. It doesn't copy panes --- it *moves* them. Every time I toggled the grid, it permanently ripped windows out of their sessions. I rewrote the script at least eight times, each version breaking in a new way. Windows disappeared. Sessions ended up empty. The undo path was nonexistent because `join-pane` doesn't have one.

### Attempt 2: capture-pane read-only dashboard

OK, so don't move panes --- just *read* them. A `watch` command running `capture-pane` on each session, displaying the output in a split grid. This worked for about 30 seconds before I noticed the output was garbage. Claude Code uses [Ink](https://github.com/vadimdemedes/ink) (React for terminals) to render its TUI --- spinners, progress bars, dynamically updating panels. `capture-pane` grabs the raw terminal buffer, which is whatever escape sequences Ink happened to write last. The result was a grid of mangled ANSI artifacts. One pane out of six showed a readable header, purely by luck of timing.

This wasn't a bug to fix. It was a fundamental incompatibility: `capture-pane` can't render what Ink is drawing.

### Attempt 3: iTerm2 AppleScript automation

The Claude Code docs mention that `tmux -CC` in iTerm2 is the "suggested entrypoint." iTerm2 can host tmux sessions as native split panes, where each pane is a real terminal that Ink renders into properly. So I wrote an AppleScript to automatically split iTerm2 into a grid of tmux sessions.

This was the longest rabbit hole. At least eight rewrites. A catalog of errors:

- **App naming chaos.** AppleScript couldn't find `"iTerm2"`. Or `"iTerm"`. The working invocation turned out to be `application id "com.googlecode.iterm2"` --- the bundle identifier.
- **Type errors.** AppleScript error `-1700` (type coercion failure), `-609` (connection invalid), `-2741` (can't get reference). Each fix introduced the next error.
- **Infinite recursion.** When iTerm2 opened a new split pane, it loaded `.zshrc`, which contained the auto-launch script for the grid, which opened more split panes, which loaded `.zshrc`, which... the tmux server crashed under the load.
- **Pane reference failures.** AppleScript's object model for iTerm2 sessions is barely documented. `session 1 of current tab` worked for the first split but threw errors for subsequent ones.

After the tmux server crashed, I killed everything and sat with a blank terminal.

### The solution

I stopped iterating and asked a different question: what's the simplest thing that could work?

The answer was one tmux session, multiple panes, and a single built-in command: `select-layout tiled`. No AppleScript. No dashboard. No `join-pane`. No `capture-pane`. Just panes in a grid, each one a real terminal, each one rendering Claude Code's TUI perfectly.

The whole setup is three small changes.

**Auto-launch in `.zshrc`** --- every new terminal window attaches to the session or creates it:

```bash
if [[ -z "$TMUX" ]]; then
  tmux attach -t c 2>/dev/null || tmux new -s c 'claude --dangerously-skip-permissions'
fi
```

Close iTerm2, reopen it, and you're back where you left off.

**The `cc` script** at `~/bin/cc` creates new Claude Code panes:

```bash
#!/bin/zsh
# Usage: cc [name]
if [[ -z "$TMUX" ]]; then echo "Error: not inside a tmux session" >&2; exit 1; fi
name="${1:-$(date +%H%M%S)}"
tmux split-window -d -c ~ "claude --dangerously-skip-permissions"
pane=$(tmux list-panes -F '#{pane_index}' | tail -1)
tmux select-pane -t "$pane" -T "$name"
tmux select-layout tiled
```

Run `cc yankee-beer` and a new instance appears in the grid, titled "yankee-beer." The layout re-tiles automatically.

**tmux.conf additions** --- pane borders show names, and two keybindings handle the grid:

```bash
# Pane border titles
set -g pane-border-status top
set -g pane-border-format " #{pane_index}: #{pane_title} "

# prefix+c: new named Claude Code pane (prompts for name)
bind c command-prompt -p "name:" "run-shell '~/bin/cc %1'"

# prefix+g: re-tile into grid
bind g select-layout tiled
```

**Navigation:**

| Action | Key |
|--------|-----|
| Grid view (re-tile) | `prefix+g` |
| Zoom pane fullscreen | `prefix+z` |
| Return to grid | `prefix+z` again |
| Jump to pane by number | `prefix+q` then number |
| Next pane | `prefix+o` |
| Move pane to its own window (hide) | `prefix+!` |
| Kill pane | `prefix+x` then `y` |

The zoom toggle is the key workflow: `prefix+z` to focus on one session fullscreen, `prefix+z` again to see the whole grid.

### Phone access

SSH from a phone (via [Termux](https://termux.dev/) on Android or any SSH client on iOS) connects to the same tmux session. The `.zshrc` block detects `$SSH_CONNECTION` and creates a *grouped session* --- a linked session that shares windows but has its own independent view:

```bash
if [[ -n "$SSH_CONNECTION" ]]; then
  tmux new-session -A -t c -s "remote-$$" \; new-window -n remote 'claude --dangerously-skip-permissions'
fi
```

With `aggressive-resize on` in `tmux.conf`, the phone and laptop can have different window sizes without either one getting squished. [Tailscale](https://tailscale.com/) handles networking so I can reach the laptop from anywhere without port forwarding.

### Agent teams stay contained

Claude Code has an experimental [agent teams](https://code.claude.com/docs/en/agent-teams) feature where one session coordinates multiple teammates. By default, if it detects tmux, it creates new panes for each teammate --- which clutters your manually-arranged grid. Setting `teammateMode` to `in-process` in `settings.json` keeps teammates inside their lead's pane:

```json
{
  "teammateMode": "in-process"
}
```

Teammates still work in parallel, but they're contained within a single pane. Use `shift+down` to cycle through them.

### Why it took so long

The pattern of failure is worth more than the final config. Each broken approach spawned a more complex workaround instead of a simpler alternative. At no point --- through eight rewrites of `tmux-grid`, the dashboard dead end, and the iTerm2 AppleScript ordeal --- did either of us (me or Claude) ask "what's the simplest thing that works?" We only asked that question after the tmux server crashed and there was nothing left to iterate on.

The lesson is the same one that applies to most software projects: when the third workaround fails, the architecture is wrong. Step back. The solution to "my grid script breaks every time I run it" wasn't a better grid script. It was `select-layout tiled`.

All the config files are in [github.com/MaxGhenis/dotfiles](https://github.com/MaxGhenis/dotfiles). A living reference version with the latest config is at [/setup](/setup).

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
