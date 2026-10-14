import { readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { parseFrontmatter as astroParseFrontmatter } from '@astrojs/internal-helpers/frontmatter';
import { slug as githubSlug } from 'github-slugger';
import { glob } from 'glob';

/**
 * Reads blog posts straight from src/content/blog the way Astro's content
 * layer does, for code that runs outside Astro: the llms-full.txt generator
 * and tests. Frontmatter goes through Astro's own parser
 * (@astrojs/internal-helpers/frontmatter: YAML between ---, TOML between +++),
 * and ids follow the glob loader's default (astro/dist/content/loaders/glob.js
 * and the data store's String(id)): any truthy `slug`, as a string, else each
 * path segment through github-slugger, minus a trailing /index.
 * tests/drafts.test.ts checks these paths against the built site.
 */

export const BLOG_DIR = 'src/content/blog';

export interface BlogSource {
	/** Path relative to the content directory, e.g. `givewell-cea/social.md`. */
	file: string;
	/** Site path, e.g. `/blog/givewell-cea/social/`. */
	path: string;
	data: Record<string, unknown>;
	body: string;
	/** Same test as the schema's `draft: z.boolean()`: only a boolean true. */
	draft: boolean;
}

export function parseFrontmatter(source: string): { data: Record<string, unknown>; body: string } {
	const { frontmatter, content } = astroParseFrontmatter(source);
	return { data: frontmatter, body: content };
}

export function blogPath(file: string, data: Record<string, unknown>): string {
	const id = data.slug
		? String(data.slug)
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
