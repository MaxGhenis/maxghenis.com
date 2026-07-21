import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://maxghenis.com',
  // Astro 7 defaults to 'jsx', which strips whitespace between inline elements
  compressHTML: true,
  integrations: [
    mdx(),
    sitemap({
      // Crosspost pages are copy-paste staging, not canonical content;
      // underscore-prefixed slugs are unlisted posts
      filter: (page) => !page.includes('/crosspost/') && !page.includes('/_'),
    }),
    react(),
  ],

  redirects: {
    '/blog/three-days-with-fable': '/blog/us-gutted-anthropic-rd',
  },

  vite: {
    // @ts-ignore - tailwindcss vite plugin type mismatch
    plugins: [tailwindcss()],
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});