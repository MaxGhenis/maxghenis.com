---
title: 'Scrollywood: Smooth scroll video recording for the web'
description: 'A Chrome extension that records smooth-scrolling videos of any webpage, built for capturing scrollytelling stories and long-form content.'
pubDate: 'Feb 06 2026'
projectUrl: '/scrollywood'
---

At [PolicyEngine](https://policyengine.org), we're building more scrollytelling stories to explain how tax and benefit policy works. Pages like [MITA](https://maxghenis.com/mita) use scroll-driven animations to walk through data visualizations step by step, and we want to share these experiences beyond the browser — in presentations, social posts, and demos.

The problem: there's no good way to record a smooth scroll of a webpage. Screen recording tools require you to scroll manually, which is never perfectly smooth. Browser automation tools can screenshot sequences but don't capture scroll-triggered animations. And scrollytelling pages depend on continuous scrolling to trigger IntersectionObserver callbacks that animate the content.

So I built [Scrollywood](/scrollywood) — a Chrome extension that records a perfectly smooth scroll video of any webpage.

![Scrollywood demo — smooth scroll recording of a scrollytelling page](/scrollywood-demo.gif)

## How it works

Click the extension icon, set your scroll duration, and hit Action. Scrollywood scrolls the page from top to bottom at a constant rate while recording the tab at 30-60fps. The result is a WebM video file.

The scroll is smooth and linear at 60fps, which is critical for scrollytelling pages. Libraries like [scrollama](https://github.com/russellsamora/scrollama) and [react-scrollama](https://github.com/jsonkao/react-scrollama) use IntersectionObserver to trigger animations as elements enter the viewport. A smooth programmatic scroll naturally crosses these thresholds, so the animations play exactly as they would during manual scrolling.

## Technical challenges

Building this was straightforward in concept but tricky in practice, mostly due to Chrome's Manifest V3 architecture:

**Service worker timeouts.** MV3 service workers sleep after ~30 seconds of inactivity, which makes `setTimeout` unreliable for recordings longer than 30 seconds. The fix: the offscreen document (which has a persistent DOM context) handles all timing, while the service worker only handles one-shot operations like script injection and downloads.

**Iframe-wrapped pages.** Some sites embed content in full-page iframes (e.g., a custom domain wrapping a GitHub Pages site). The outer frame has no scrollable content. Scrollywood detects these wrappers and defers to the inner frame, which handles its own scrolling via `allFrames: true` injection.

**CSS scroll-behavior conflicts.** Pages with `scroll-behavior: smooth` in CSS fight with programmatic scrolling. Scrollywood temporarily overrides this to `auto`, but carefully avoids overriding `overflow`, which would break `position: sticky` — the CSS property that makes scrollytelling graphics stay in place.

**Large recording downloads.** At 16Mbps for a 60-second recording, the video can be 100MB+. The original approach (base64-encoding the blob and sending it via `chrome.runtime.sendMessage`) silently fails at that size. The fix: download directly from the offscreen document using a blob URL.

## Get it

[Download Scrollywood](/scrollywood) and load it as an unpacked extension in Chrome. It's free and open source.

[Project page](/scrollywood) · [GitHub](https://github.com/MaxGhenis/scrollywood)
