---
name: crosspost-common
description: Shared knowledge for crossposting workflow - copy process, verification checklist, common fixes
---

# Crosspost Common Knowledge

## Copy Workflow

1. Go to `maxghenis.com/blog/[post-slug]/crosspost/` (PRODUCTION, not localhost)
2. Click "Copy to clipboard" button
3. Clipboard now contains HTML with:
   - `<h1>` title
   - `<p>` subtitle
   - Body content with links preserved

**IMPORTANT**: Must use production site. Localhost images won't transfer.

## Verification Checklist

After pasting, verify ALL of these:

### Title
- [ ] Title is present and correct
- [ ] Title is the main heading (not body text)
- [ ] No extra text merged into title

### Subtitle
- [ ] Subtitle present (Medium/Substack only)
- [ ] Formatted correctly (gray on Medium)
- [ ] Not merged with body

### Images
- [ ] Cover image uploaded
- [ ] [Image: ...] placeholders replaced with actual images

### Lists
- [ ] Bullets render with bullets
- [ ] Numbers are sequential (1, 2, 3...)
- [ ] NO empty list items
- [ ] All items have content

### Formatting
- [ ] No extra blank lines
- [ ] No blockquote on regular text
- [ ] Bold text is bold
- [ ] Links clickable
- [ ] Headings formatted as headings

### Content
- [ ] Opening paragraph present
- [ ] Timeline dates are bold
- [ ] No nav elements ("Back to all posts")
- [ ] Clean ending

## Common Fixes

| Problem | Solution |
|---------|----------|
| Empty numbered list items | Manually retype content from crosspost page |
| Subtitle merged with body | Insert line break, reformat subtitle |
| Missing cover image | Download from crosspost page, upload to platform |
| Blockquote formatting | Remove blockquote, paste as plain paragraph |
| Missing opening paragraph | Copy from crosspost page and insert |

## Scrolling Through Article

To verify an article:
1. Go to top (Cmd+Home)
2. Take screenshot
3. Scroll down 3-5 ticks
4. Take screenshot
5. Repeat until end
6. Check each screenshot against checklist
