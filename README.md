# maxghenis.com

Personal website and blog for Max Ghenis, built with [Astro](https://astro.build).

## Features

- **Blog** - Markdown and MDX posts with code highlighting
- **Social Feed** - Aggregated posts from Bluesky (live), X/Twitter, and LinkedIn (via export)
- **Research** - Academic papers and interactive JupyterBook projects
- **CV** - Embedded curriculum vitae
- **Newsletter** - Buttondown integration for email subscriptions
- **RSS** - Full RSS feed at `/rss.xml`

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding Content

### Blog Posts

Create a new `.md` or `.mdx` file in `src/content/blog/`:

```markdown
---
title: 'My Post Title'
description: 'A brief description'
pubDate: 'Nov 25 2024'
---

Your content here...
```

For interactive posts, use `.mdx` and import React components:

```mdx
import MyChart from '../../components/MyChart';

<MyChart client:load />
```

### Social Feed Updates

**Bluesky**: Updates automatically at build time via public API.

**X/Twitter**:
1. Request your data archive from X settings
2. Extract the ZIP and find `data/tweets.js`
3. Run: `npm run import-x /path/to/tweets.js`

**LinkedIn**:
1. Export your data from LinkedIn settings
2. Extract the ZIP
3. Run: `npm run import-linkedin /path/to/linkedin-archive/`

## Deployment

Deployed automatically to GitHub Pages on push to `main` via GitHub Actions.

To deploy manually:
```bash
npm run build
# Upload contents of dist/ to your host
```

## Tech Stack

- [Astro](https://astro.build) - Static site generator
- [React](https://react.dev) - Interactive components (islands)
- [MDX](https://mdxjs.com) - Enhanced markdown
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [GitHub Pages](https://pages.github.com) - Hosting

## License

Content is open source. Feel free to use as a template for your own site.
