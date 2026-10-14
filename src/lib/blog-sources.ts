import { readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { slug as githubSlug } from 'github-slugger';
import { glob } from 'glob';
import yaml from 'js-yaml';

/**
 * Reads blog posts straight from src/content/blog the way Astro's content
 * layer does, for code that runs outside Astro: the llms-full.txt generator
 * and tests. Frontmatter uses Astro's own pattern and YAML parser
 * (@astrojs/internal-helpers/frontmatter: js-yaml), and ids follow the glob
 * loader's default (astro/dist/content/loaders/glob.js): a `slug` override,
 * else each path segment through github-slugger, minus a trailing /index.
 * tests/drafts.test.ts checks these paths against the built site.
 */

export const BLOG_DIR = 'src/content/blog';

const FRONTMATTER = /(?:^﻿?|^\s*\n)---([\s\S]*?\n)---/;

export interface BlogSource {
	/** Path relative to the content directory, e.g. `givewell-cea/social.md`. */
	file: string;
	/** Site path, e.g. `/blog/givewell-cea/social/`. */
	path: string;
	data: Record<string, unknown>;
	body: string;
	/** Same test as the schema's `draft: z.boolean()`: only a YAML boolean true. */
	draft: boolean;
}

export function parseFrontmatter(source: string): { data: Record<string, unknown>; body: string } {
	const match = FRONTMATTER.exec(source);
	if (!match) return { data: {}, body: source };
	const parsed = yaml.load(match[1]);
	const data = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
	return { data, body: source.slice(match.index + match[0].length) };
}

export function blogPath(file: string, data: Record<string, unknown>): string {
	const id =
		typeof data.slug === 'string' && data.slug
			? data.slug
			: file
					.replace(/\.mdx?$/, '')
					.split(/[\\/]/)
					.map((segment) => githubSlug(segment))
					.join('/')
					.replace(/\/index$/, '');
	return `/blog/${id}/`;
}

export function parseBlogSource(file: string, source: string): BlogSource {
	const { data, body } = parseFrontmatter(source);
	return { file, path: blogPath(file, data), data, body, draft: data.draft === true };
}

export async function readBlogSources(
	dir = BLOG_DIR,
	options: { ignore?: string[] } = {},
): Promise<BlogSource[]> {
	const files = await glob('**/*.{md,mdx}', { cwd: dir, ignore: options.ignore });
	return files
		.sort()
		.map((file) => parseBlogSource(file.split(sep).join('/'), readFileSync(join(dir, file), 'utf-8')));
}
