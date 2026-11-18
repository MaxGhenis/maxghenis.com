// Create Vercel Build Output API structure from Astro's dist/ output.
// This bypasses Vercel's framework adapter, which adds "check: true"
// to external rewrites causing them to fail.

import { readFileSync, writeFileSync, cpSync, mkdirSync } from 'fs';
import { buildRoutes } from './vercel-routes.js';

const outputDir = '.vercel/output';
const staticDir = `${outputDir}/static`;

// Copy dist/ to .vercel/output/static/
mkdirSync(staticDir, { recursive: true });
cpSync('dist', staticDir, { recursive: true });

// Read vercel.json for rewrites and redirects
const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));

const routes = buildRoutes(vercelConfig);

const config = {
  version: 3,
  routes,
  framework: { version: '5.16.15' },
  crons: [],
};

writeFileSync(`${outputDir}/config.json`, JSON.stringify(config, null, 2) + '\n');

const externalRewrites = routes.filter(r => r.dest && r.dest.startsWith('https://'));
console.log(`Created Build Output API config with ${externalRewrites.length} external rewrites (no check flag)`);
