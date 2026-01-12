/**
 * Generate llms-full.txt - comprehensive content dump for LLMs
 * Run: npx tsx scripts/generate-llms-full.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

const CONTENT_DIR = 'src/content/blog';
const OUTPUT_FILE = 'public/llms-full.txt';

interface PostMeta {
	title: string;
	description: string;
	pubDate: string;
	path: string;
	content: string;
}

function extractFrontmatter(content: string): { data: Record<string, string>; content: string } {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) {
		return { data: {}, content };
	}

	const frontmatter = match[1];
	const body = match[2];

	const data: Record<string, string> = {};
	for (const line of frontmatter.split('\n')) {
		const colonIndex = line.indexOf(':');
		if (colonIndex > 0) {
			const key = line.slice(0, colonIndex).trim();
			let value = line.slice(colonIndex + 1).trim();
			// Remove quotes
			if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
				value = value.slice(1, -1);
			}
			data[key] = value;
		}
	}

	return { data, content: body };
}

async function main() {
	console.log('Generating llms-full.txt...');

	// Find all blog posts
	const files = await glob(`${CONTENT_DIR}/**/*.{md,mdx}`, {
		ignore: ['**/*-crosspost.md', '**/*-social.md'],
	});

	const posts: PostMeta[] = [];

	for (const file of files) {
		const content = fs.readFileSync(file, 'utf-8');
		const { data, content: body } = extractFrontmatter(content);

		// Skip drafts
		if (data.draft === 'true') continue;

		// Generate URL path from file path
		const relativePath = path.relative(CONTENT_DIR, file);
		const urlPath = relativePath
			.replace(/\.mdx?$/, '')
			.replace(/\/index$/, '');

		posts.push({
			title: data.title || 'Untitled',
			description: data.description || '',
			pubDate: data.pubDate || '',
			path: `/blog/${urlPath}/`,
			content: body.trim(),
		});
	}

	// Sort by date (newest first)
	posts.sort((a, b) => {
		const dateA = new Date(a.pubDate).getTime() || 0;
		const dateB = new Date(b.pubDate).getTime() || 0;
		return dateB - dateA;
	});

	// Generate output
	const output = `# Max Ghenis - Full Content

> This file contains the full text of all blog posts from maxghenis.com, formatted for LLM consumption.
> Generated: ${new Date().toISOString()}
> See also: /llms.txt for a curated overview

---

## Table of Contents

${posts.map((p, i) => `${i + 1}. [${p.title}](${p.path})`).join('\n')}

---

${posts
	.map(
		(post) => `## ${post.title}

**URL:** https://maxghenis.com${post.path}
**Published:** ${post.pubDate}
**Description:** ${post.description}

${post.content}

---
`
	)
	.join('\n')}
`;

	// Write output
	fs.writeFileSync(OUTPUT_FILE, output);
	console.log(`Generated ${OUTPUT_FILE} with ${posts.length} posts`);
}

main().catch(console.error);
