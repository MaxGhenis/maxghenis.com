#!/usr/bin/env bun
/**
 * Script to check and fix links in imported blog posts.
 * Compares local markdown files against original Substack/Medium posts.
 *
 * Usage:
 *   bun run scripts/check-links.ts [--fix]
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const CONTENT_DIR = './src/content/blog';

interface LinkInfo {
  text: string;
  url: string;
}

// Extract markdown links from content
function extractMarkdownLinks(content: string): LinkInfo[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: LinkInfo[] = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }
  return links;
}

// Fetch and extract links from a URL
async function fetchOriginalLinks(url: string): Promise<LinkInfo[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`  Failed to fetch ${url}: ${response.status}`);
      return [];
    }
    const html = await response.text();

    // Extract links from HTML (simplified - looks for <a href="...">...</a>)
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    const links: LinkInfo[] = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      const text = match[2].trim();
      // Filter out navigation/social links
      if (url.startsWith('http') &&
          !url.includes('substack.com/subscribe') &&
          !url.includes('twitter.com/share') &&
          !url.includes('facebook.com/sharer') &&
          text.length > 0) {
        links.push({ text, url });
      }
    }
    return links;
  } catch (error) {
    console.error(`  Error fetching ${url}:`, error);
    return [];
  }
}

// Map of local files to their original URLs
const sourceUrls: Record<string, string> = {
  'substack/ai-models-nyc-housing.md': 'https://maxghenis.substack.com/p/ai-models-favor-cuomo-over-mamdani',
  'substack/house-ways-means-tuesday.md': 'https://maxghenis.substack.com/p/what-will-the-house-ways-and-means',
  'substack/vat-thresholds.md': 'https://maxghenis.substack.com/p/vat-thresholds-revenues-and-the-role',
  'substack/my-2024-in-code.md': 'https://maxghenis.substack.com/p/my-2024-in-code',
  'substack/why-im-a-neoliberal.md': 'https://maxghenis.substack.com/p/why-im-a-neoliberal',
  'medium/elon-musk-ai-harris.md': 'https://maxghenis.medium.com/elon-musks-ai-predicts-americans-will-be-800-richer-under-harris',
};

async function checkFile(relativePath: string, originalUrl: string) {
  console.log(`\nChecking: ${relativePath}`);

  const filePath = join(CONTENT_DIR, relativePath);
  const content = await readFile(filePath, 'utf-8');
  const localLinks = extractMarkdownLinks(content);

  console.log(`  Local links: ${localLinks.length}`);
  localLinks.forEach(l => console.log(`    - ${l.text}: ${l.url}`));

  const originalLinks = await fetchOriginalLinks(originalUrl);
  console.log(`  Original links: ${originalLinks.length}`);

  // Find links in original that aren't in local
  const localUrls = new Set(localLinks.map(l => l.url));
  const missingLinks = originalLinks.filter(l => !localUrls.has(l.url));

  if (missingLinks.length > 0) {
    console.log(`  ⚠️  Missing ${missingLinks.length} links:`);
    missingLinks.forEach(l => console.log(`    - ${l.text}: ${l.url}`));
  } else {
    console.log(`  ✓ All original links present`);
  }

  return { relativePath, localLinks, originalLinks, missingLinks };
}

async function main() {
  console.log('Link Checker for Imported Blog Posts\n');
  console.log('=====================================');

  const results = [];

  for (const [relativePath, originalUrl] of Object.entries(sourceUrls)) {
    try {
      const result = await checkFile(relativePath, originalUrl);
      results.push(result);
    } catch (error) {
      console.error(`  Error processing ${relativePath}:`, error);
    }
  }

  // Summary
  console.log('\n\n=== SUMMARY ===');
  const totalMissing = results.reduce((sum, r) => sum + r.missingLinks.length, 0);
  console.log(`Total files checked: ${results.length}`);
  console.log(`Total missing links: ${totalMissing}`);

  if (totalMissing > 0) {
    console.log('\nFiles with missing links:');
    results.filter(r => r.missingLinks.length > 0).forEach(r => {
      console.log(`  ${r.relativePath}: ${r.missingLinks.length} missing`);
    });
  }
}

main().catch(console.error);
