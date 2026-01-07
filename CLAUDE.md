# maxghenis.com

Personal website built with Astro.

## Style guide

**CRITICAL: Use sentence case for all headings** - only capitalize the first word and proper nouns.

- ✅ "How it compares to other tools"
- ❌ "How It Compares to Other Tools"

This applies to blog post titles, section headings, and page titles.

## Structure

- `src/content/blog/` - Blog posts (markdown with frontmatter)
- `src/pages/` - Astro pages (projects, cv, rambar, terminalgrid, etc.)
- `src/components/` - Reusable components (Header, Footer, BaseHead)
- `public/` - Static assets

## Blog post frontmatter

```yaml
---
title: 'Post title in sentence case'
description: 'Brief description'
pubDate: 'Jan 07 2026'
heroImage: './image.png'  # Optional, relative path to image in same folder
---
```
