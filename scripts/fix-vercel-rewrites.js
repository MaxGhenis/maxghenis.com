// Create Vercel Build Output API structure from Astro's dist/ output.
// This bypasses Vercel's framework adapter, which adds "check: true"
// to external rewrites causing them to fail.

import { readFileSync, writeFileSync, cpSync, mkdirSync, existsSync } from 'fs';

const outputDir = '.vercel/output';
const staticDir = `${outputDir}/static`;

// Copy dist/ to .vercel/output/static/
mkdirSync(staticDir, { recursive: true });
cpSync('dist', staticDir, { recursive: true });

// Read vercel.json for rewrites and redirects
const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));

// Build route config
const routes = [
  // Cache headers for hashed assets
  { src: '^/assets/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
  { src: '^/_astro/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
];

// Add redirects
for (const r of vercelConfig.redirects || []) {
  routes.push({
    src: `^${r.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
    headers: { Location: r.destination },
    status: r.permanent ? 308 : 307,
  });
}

// Filesystem check (serve static files first)
routes.push({ handle: 'filesystem' });

// Add rewrites (NO check flag for external URLs)
for (const r of vercelConfig.rewrites || []) {
  const source = r.source;
  const dest = r.destination;

  if (source.includes(':path*')) {
    // Wildcard rewrite: /foo/:path* -> https://ext/foo/:path*
    // Also matches bare trailing slash: /foo/ -> /foo/
    const base = source.replace('/:path*', '');
    const destBase = dest.replace('/:path*', '');
    const escapedBase = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    routes.push({
      src: `^${escapedBase}(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?/?$`,
      dest: `${destBase}/$1`,
    });
  } else {
    // Exact path rewrite (with optional trailing slash)
    routes.push({
      src: `^${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`,
      dest: dest,
    });
  }
}

// Error handling
routes.push({ handle: 'error' });
routes.push({ status: 404, src: '^(?!/api).*$', dest: '/404.html' });

const config = {
  version: 3,
  routes,
  framework: { version: '5.16.15' },
  crons: [],
};

writeFileSync(`${outputDir}/config.json`, JSON.stringify(config, null, 2) + '\n');

const externalRewrites = routes.filter(r => r.dest && r.dest.startsWith('https://'));
console.log(`Created Build Output API config with ${externalRewrites.length} external rewrites (no check flag)`);
