import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { sitemapFilter } from './src/lib/sitemap-filter.mjs';

// The sitemap filter reads built pages, so it needs the resolved outDir
let outDir;

// https://astro.build/config
export default defineConfig({
  site: 'https://maxghenis.com',
  // Astro 7 defaults to 'jsx', which strips whitespace between inline elements
  compressHTML: true,
  integrations: [
    mdx(),
    {
      name: 'capture-out-dir',
      hooks: {
        'astro:config:done': ({ config }) => {
          outDir = config.outDir;
        },
      },
    },
    sitemap({
      // Drops crosspost staging pages, underscore-prefixed (unlisted) slugs,
      // and any page marked noindex, which includes every draft post
      filter: sitemapFilter(() => outDir),
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