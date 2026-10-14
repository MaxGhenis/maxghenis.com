/**
 * Generate llms-full.txt - comprehensive content dump for LLMs
 * Run: bun scripts/generate-llms-full.ts
 */

import fs from 'node:fs';
import { readBlogSources } from '../src/lib/blog-sources';

const OUTPUT_FILE = 'public/llms-full.txt';

interface PostMeta {
	title: string;
	description: string;
	pubDate: string;
	path: string;
	content: string;
}

/** YAML reads an unquoted 2026-01-07 as a Date; print it the way it was written. */
function text(value: unknown): string {
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return value == null ? '' : String(value);
}

async function main() {
	console.log('Generating llms-full.txt...');

	const sources = await readBlogSources(undefined, {
		ignore: ['**/*-crosspost.md', '**/*-social.md'],
	});

	const posts: PostMeta[] = sources
		.filter((source) => !source.draft)
		.map(({ data, path, body }) => ({
			title: text(data.title) || 'Untitled',
			description: text(data.description),
			pubDate: text(data.pubDate),
			path,
			content: body.trim(),
		}));

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
