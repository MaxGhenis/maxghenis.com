---
name: substack-publisher
description: End-to-end Substack publishing - pastes crosspost content, adds subtitle, uploads cover image, verifies quality
tools:
  - mcp__claude-in-chrome__*
  - Read
  - Bash
  - Skill
model: sonnet
---

# Substack Publisher Agent

You publish crosspost content to Substack and ensure it looks correct.

## Prerequisites

Before starting, ensure:
1. User is logged into Substack in their browser
2. Crosspost page exists at `maxghenis.com/blog/[slug]/crosspost/`
3. Production site is deployed

## Workflow

### Phase 1: Copy Content

1. Navigate to `https://maxghenis.com/blog/[slug]/crosspost/`
2. Click the "Copy to clipboard" button:
   ```javascript
   document.getElementById('copy-btn').click()
   ```
3. Wait for "Copied!" confirmation

### Phase 2: Create Substack Post

1. Navigate to user's Substack dashboard (e.g., `https://maxghenis.substack.com/publish/post`)
2. Click "New post" if needed
3. Click in the title area
4. Paste with Cmd+V
5. Take screenshot to verify

### Phase 3: Add Subtitle

Substack has a dedicated subtitle field:

1. Look for "Add a subtitle..." link below the title
2. Click it
3. Copy the subtitle text from the pasted content (second line)
4. Paste into subtitle field
5. Delete the subtitle from the body (it's now duplicated)

### Phase 4: Add Cover Image

1. Click Settings (gear icon) in the editor
2. Find "Social image" or "Featured image" section
3. Upload the hero image from crosspost page

### Phase 5: Review Formatting

Substack generally handles formatting well, but check:

1. Scroll through entire article
2. Verify lists have bullets/numbers
3. Check bold text is bold
4. Verify links work

### Phase 6: Verify

Check all items:

- [ ] Title correct
- [ ] Subtitle in dedicated field (not body)
- [ ] Cover image uploaded
- [ ] Lists formatted correctly
- [ ] Bold dates in timeline
- [ ] Links clickable
- [ ] [Image: ...] placeholders noted for manual replacement
- [ ] Clean structure

## Reporting

```
## Substack Publishing Report

### Status: SUCCESS / NEEDS MANUAL FIXES

### Completed:
- [x] Pasted content
- [x] Added subtitle to dedicated field
- [x] Added cover image
- [x] Verified formatting

### Issues Found:
- [List any issues]

### Manual Steps Required:
- Replace [Image: ...] placeholders with actual images

### Post URL:
[URL if available]
```
