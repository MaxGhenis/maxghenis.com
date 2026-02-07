---
title: 'I used Claude Code to recertify for SNAP'
description: 'Browser automation + document reading + form filling: Claude Code completed my SNAP recertification in about an hour of active work, across 373 tool calls.'
pubDate: 'Feb 06 2026'
---

I'm CEO of [PolicyEngine](https://policyengine.org), a tax and benefit policy nonprofit, but I don't take a regular salary — so I qualify for SNAP. I renewed my benefits tonight using [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and its browser automation capabilities. The entire recertification — navigating DC's District Direct portal, reading my financial documents, calculating income, filling out dozens of form fields, and submitting — took about an hour of active work. Claude made 373 tool calls. I sent 26 messages.

Here's what I did, and what Claude did.

## The conversation

It started simply:

> **Me:** help me recertify for snap
>
> **Claude:** I can help you with SNAP recertification. A few questions to get started: What state are you in? Have you received a recertification notice? Do you know if your state has an online portal?
>
> **Me:** dc, maybe i dont check my mail, yes it does

Claude found the portal, opened it in Chrome, and told me to log in (it can't enter passwords). I logged in and said:

> **Me:** done
>
> **Claude:** You're logged in and there's a banner right at the top: "Your SNAP case is due for recertification, click the link to recertify before your case is terminated."

Early on, Claude was asking for confirmation before every step. I put a stop to that:

> **Claude:** I can see the Start button at the bottom. Should I click it to begin the recertification form?
>
> **Me:** yes stop asking just go!

After that, Claude moved through the pre-filled sections autonomously — name, DOB, citizenship, household composition — only stopping when it actually needed something from me. Like when it hit the SSN page:

> **Claude:** This page is asking for your SSN. It's partially masked (showing XXX-XX-0844) so it's already on file. I cannot enter sensitive information like SSNs — this is something you'll need to verify/enter yourself.
>
> **Me:** it's already there, just hit next

When Claude reached the income section, it needed updated numbers from my financial accounts. It tried to access Wealthfront and Vanguard in the browser but couldn't:

> **Claude:** Financial sites are blocked for safety reasons — I can't access Wealthfront or Vanguard since they contain sensitive financial data. You'll need to grab those numbers yourself.
>
> **Me:** can you ge tthem?
>
> **Me:** i opened https://dashboard.web.vanguard.com/ can you view it?
>
> **Claude:** I don't see the Vanguard tab in my tab group. Unfortunately financial sites like Vanguard and Wealthfront are blocked by the browser extension's safety restrictions.
>
> **Me:** just downloaded a pdf for vanbguad

So I downloaded a Vanguard PDF, a Wealthfront CSV, and my paystubs to my Downloads folder. Claude read them directly from the filesystem, extracted the relevant figures, and calculated my quarterly investment income.

The rest was uneventful. Claude filled in employer details, navigated through expenses (all pre-filled from last time), checked attestation boxes, and reached the final submission page:

> **Claude:** Before I click Next to submit the recertification, I want to confirm with you. This is the final certification page where you're signing and certifying that all information is correct. Ready to submit?
>
> **Me:** i dont this it does but yes hit next

Submitted at 8:56 PM. The confirmation page told me my SNAP interview is due by February 10.

## What I provided

My role was minimal:

- **My state**: DC
- **My address hasn't changed**: "950 3rd st nw #206"
- **Downloaded documents**: I downloaded statements from my financial institutions showing dividend and interest income, and my recent paystubs, to my Downloads folder
- **Logged in**: I handled the login to District Direct myself
- **A few corrections**: like telling Claude the SSN was already filled in, and that I'm already registered to vote

That's 26 messages total. I never looked at the form itself — not once. Everything else was Claude.

## What Claude did

Claude read my financial documents (PDFs and CSVs), extracted the relevant figures, navigated the multi-page recertification form, and filled in every field. Here's a rough breakdown of its 373 tool calls:

- **72 screenshots** to see the current state of the page
- **88 clicks** to navigate buttons, dropdowns, checkboxes, and links
- **28 find operations** to locate elements on the page
- **22 form inputs** to fill text fields, select options, and enter data
- **6 page navigations**
- Plus scrolling, reading documents, web searches, and calculations

The form covers household composition, address, income from all sources (employment, investments, other), expenses (shelter, utilities, childcare, medical), and rights and responsibilities. Claude navigated all of it, carrying forward pre-filled data where nothing had changed and updating the fields that needed new numbers.

## What went wrong

It wasn't perfectly smooth:

- **Session timeouts**: District Direct timed out while Claude was reading my financial documents to calculate quarterly investment income. It had to re-navigate the entire form from the beginning.
- **Wrong employer address**: Claude searched the web for my employer's address and found an outdated PO Box. It caught the discrepancy itself by cross-referencing against my paystub and corrected it — I didn't even notice.
- **Form input quirks**: Some fields on the portal (like dollar amounts with a `$` prefix) wouldn't accept Claude's standard form input method. It had to fall back to clicking the field and typing directly.
- **Context overflows**: The conversation ran out of context three times — browser automation generates a lot of data, especially screenshots. Each time, Claude resumed with a summary of what happened before and picked up where it left off.

## How long it took

The whole process spanned about 3 hours and 40 minutes wall-clock, but most of that was idle time — me downloading documents, reading what Claude was doing, or stepping away. The active working time was roughly 1 hour and 20 minutes.

For comparison, doing this manually takes me at least an hour of focused attention: logging in, finding the right forms, looking up all my financial information, entering it carefully, reviewing everything, and submitting. Claude's version required about 5 minutes of my attention spread across the session.

## Why this matters

SNAP recertification is exactly the kind of task that AI should help with. It's:

- **High-stakes but routine**: Getting it wrong could mean losing benefits, but the process itself is just data entry
- **Document-heavy**: It requires pulling numbers from paystubs, bank statements, and investment accounts
- **Tedious**: The form is long, repetitive, and easy to make mistakes on
- **Time-sensitive**: Miss the deadline and you lose benefits

People who receive SNAP benefits are, by definition, low-income. Their time is valuable. The bureaucratic burden of maintaining benefits is a real cost, and it causes people to lose benefits they're entitled to. Tools that reduce that burden matter.

## What you'd need to try this

This used Claude Code with the [Claude in Chrome](https://chromewebstore.google.com/detail/claude-in-chrome/blelmpkgncmhfbjlccpkbjbdgfdjpgol) extension for browser automation. You'd need:

- A Claude Pro or Max subscription (for Claude Code access)
- The Chrome extension installed
- Your financial documents downloaded and accessible
- Comfort with Claude having access to your browser and local files

This is still early-stage technology. I wouldn't recommend it for someone who isn't comfortable reviewing what Claude is doing as it works. But the trajectory is clear: the boring, stressful parts of interfacing with government systems are exactly what AI agents should handle.
