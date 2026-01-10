#!/usr/bin/env bun
/**
 * Split a combined voter guide into individual recommendation files.
 *
 * Usage:
 *   bun run scripts/split-voter-guide.ts <source-file> <election-slug>
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import * as yaml from 'yaml';

interface Recommendation {
  id: string;
  title: string;
  position: 'yes' | 'no' | 'candidate';
  candidate?: string;
  summary: string;
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('No frontmatter found');
  }
  return {
    frontmatter: yaml.parse(match[1]),
    body: match[2],
  };
}

function extractSections(body: string, recommendations: Recommendation[]): Map<string, string> {
  const sections = new Map<string, string>();

  // Split body into lines for easier processing
  const lines = body.split('\n');

  for (const rec of recommendations) {
    // Find the header line for this recommendation
    let startIdx = -1;
    let endIdx = lines.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match "### YES on Prop 1" or "### NO on Prop 26" or "### GAVIN NEWSOM for Governor"
      const isYesNo = line.match(new RegExp(`^### (?:YES|NO) on ${rec.id.replace(/\s+/g, '\\s+')}$`, 'i'));
      const isCandidate = rec.candidate && line.match(new RegExp(`^### ${rec.candidate.replace(/\s+/g, '\\s+')} for`, 'i'));

      if (isYesNo || isCandidate) {
        startIdx = i + 1; // Start after the header
        // Find the end (next h2 or h3)
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].match(/^##[#]? /)) {
            endIdx = j;
            break;
          }
        }
        break;
      }
    }

    if (startIdx !== -1) {
      const sectionLines = lines.slice(startIdx, endIdx);
      // Remove trailing empty lines
      while (sectionLines.length > 0 && sectionLines[sectionLines.length - 1].trim() === '') {
        sectionLines.pop();
      }
      sections.set(rec.id, sectionLines.join('\n').trim());
    }
  }

  return sections;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function splitVoterGuide(sourceFile: string, electionSlug: string) {
  console.log(`Splitting ${sourceFile} into ${electionSlug}/...`);

  const content = await readFile(sourceFile, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  const recommendations = frontmatter.recommendations as Recommendation[] | undefined;
  if (!recommendations || recommendations.length === 0) {
    console.error('No recommendations found in frontmatter');
    process.exit(1);
  }

  console.log(`Found ${recommendations.length} recommendations`);

  // Extract sections for each recommendation
  const sections = extractSections(body, recommendations);
  console.log(`Extracted ${sections.size} sections with content`);

  // Create output directory
  const outDir = `./src/content/elections/${electionSlug}`;
  await mkdir(outDir, { recursive: true });

  // Find intro text (before "## Elected officials" or first "##")
  const introMatch = body.match(/^([\s\S]*?)(?=## )/);
  const introText = introMatch ? introMatch[1].trim() : '';

  // Write election index
  const electionDate = frontmatter.pubDate;
  const indexContent = `---
title: '${frontmatter.title}'
description: '${frontmatter.description}'
electionDate: '${electionDate}'
location: 'California'
---

${introText}
`;

  await writeFile(join(outDir, 'index.md'), indexContent);
  console.log(`Created ${outDir}/index.md`);

  // Write individual recommendations
  for (const rec of recommendations) {
    const slug = slugify(rec.id);
    const sectionContent = sections.get(rec.id) || '';

    const candidateLine = rec.candidate ? `candidate: '${rec.candidate}'` : '';
    const summaryEscaped = rec.summary.replace(/'/g, "''");

    const recContent = `---
title: '${rec.title}'
measureId: '${rec.id}'
position: '${rec.position}'
${candidateLine}
summary: '${summaryEscaped}'
election: '${electionSlug}'
---

${sectionContent}
`.replace(/\n\n\n+/g, '\n\n'); // Remove extra blank lines

    await writeFile(join(outDir, `${slug}.md`), recContent);
    console.log(`Created ${outDir}/${slug}.md (${sectionContent.length} chars)`);
  }

  console.log(`\nDone! Created ${recommendations.length + 1} files in ${outDir}/`);
}

// Main
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: bun run scripts/split-voter-guide.ts <source-file> <election-slug>');
  process.exit(1);
}

splitVoterGuide(args[0], args[1]).catch(console.error);
