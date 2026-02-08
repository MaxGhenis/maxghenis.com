---
title: 'OpenMessages: How I built a macOS Google Messages client to give Claude my texts'
description: 'I had already connected Claude Code to WhatsApp, Signal, Slack, and Gmail. SMS was the last holdout — and no existing tool could solve it.'
pubDate: 'Feb 07 2026'
heroImage: './openmessages.png'
projectUrl: 'https://openmessages.ai'
---

I've been on a mission to give Claude Code access to all my communication channels. WhatsApp, Signal, Slack, Gmail — each one has an MCP server that lets Claude read and send messages on my behalf. But one channel was missing: SMS and RCS on my Android phone.

**[Download OpenMessages for Mac](https://github.com/MaxGhenis/openmessages/releases/latest/download/OpenMessages.dmg)** — free, open source, requires macOS 14.0+ and an Android phone with Google Messages.

## The gap

If you have an iPhone, iMessage on Mac gives you desktop texting for free. But I use Android, and Google Messages only offers a web client — no desktop app, no API, no way for an AI assistant to interact with it.

I needed Claude to be able to do things like "text Alex that the meeting moved to 3pm" or "check if James confirmed for tomorrow" without me picking up my phone. Every other messaging channel was already connected. SMS was the last holdout.

## Attempt 1: SMS Gateway

My first approach was [SMS Gateway](https://smsgateway.me), an Android app that exposes your phone's SMS capability via an API. I built an MCP server around it, and it worked — sort of.

The problems:

- **Clunky setup** — required installing a separate Android app, configuring API keys, keeping the app running in the background
- **SMS only** — no RCS support, so group chats and rich messages were invisible
- **Sending was unreliable** — messages would sometimes queue but never actually send
- **No conversation history** — you could only send messages, not read existing conversations

It was a dead end for anything beyond basic "fire and forget" SMS.

## Attempt 2: Google Messages protocol

I started digging into how Google Messages for Web actually works. It turns out Google uses an internal protocol (based on gRPC/protobuf) to pair a browser with your phone via QR code. A few open-source projects had reverse-engineered this protocol, most notably [mautrix/gmessages](https://github.com/mautrix/gmessages), a Go library originally built as a Matrix bridge.

This was the breakthrough. The mautrix library could:

- Pair with a phone via QR code (same as messages.google.com)
- Receive all conversations and messages in real time
- Send SMS and RCS messages
- Handle group chats, reactions, and read receipts

I quickly built an MCP server around it, and it worked beautifully. Claude could read my full message history and send texts.

## The mistake that became a feature

Here's where I'll admit something: I thought Google Messages only allowed one paired web device at a time. When I had Google Messages for Web paired, my phone's "Device pairing" screen didn't show the option to pair a new device. I don't know if Google changed this or if I was just looking in the wrong place, but I was convinced that running my MCP server meant giving up the web client. So I built a whole native macOS app to replace it.

Turns out... you can pair multiple devices. I didn't need to build the app at all.

But I'm glad I did. What started as a workaround became something better: an open-source, native Google Messages client for Mac — the first one that exists. No browser tab to keep open, no Electron wrapper, just a real app with a built-in MCP server for AI access.

## Building the app

Since I already had the Go backend handling the Google Messages protocol, I wrapped it in a native macOS app using Swift. The architecture is simple:

- **Go backend** — handles pairing, message sync, and the MCP server. Stores everything in a local SQLite database
- **Swift wrapper** — native macOS app that launches the Go backend and displays a web UI via WKWebView
- **Web UI** — clean conversation list and message view served from localhost

The app pairs with your phone the same way messages.google.com does — scan a QR code — and then syncs your full conversation history. The MCP server runs alongside the UI, so Claude can access messages while you browse them yourself.

Everything runs locally. No cloud servers, no accounts to create, no data leaving your machine.

## What Claude can do with it

With OpenMessages running, Claude Code can:

- **Search messages** — "find the address James sent me last week"
- **Read conversations** — "summarize my conversation with the team"
- **Send messages** — "text Alex that the meeting moved to 3pm"
- **React to messages** — "thumbs up the last message from Sarah"

Combined with WhatsApp, Signal, Slack, and Gmail MCP servers, Claude now has access to essentially all my communications. I can say "check all my messages for anything urgent" and it searches across every channel.

## What's next

OpenMessages is open source, and I think it's a canvas for something bigger. A native Messages client with full API access is a foundation that Google will never build. Some ideas I'd love to see:

- **AI-powered smart replies** — context-aware suggestions, not just "Thanks!"
- **Conversation summaries** — catch up on a busy group chat in seconds
- **Natural language search** — "when did someone send me a confirmation number?"
- **Priority inbox** — surface what actually needs a response
- **Cross-platform support** — Linux and Windows versions

If any of these interest you, [open an issue](https://github.com/MaxGhenis/openmessages/issues) or submit a PR. The architecture is simple enough that adding features is straightforward.

## Get it

OpenMessages is free and open source. Requires macOS 14.0+ and an Android phone with Google Messages.

**[Download for Mac](https://github.com/MaxGhenis/openmessages/releases/latest/download/OpenMessages.dmg)** | [openmessages.ai](https://openmessages.ai) | [GitHub](https://github.com/MaxGhenis/openmessages)
