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
  integrations: [mdx(), sitemap(), react()],

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