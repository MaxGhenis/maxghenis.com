import { describe, expect, it } from 'vitest';
import { blogPath, parseBlogSource, parseFrontmatter } from './blog-sources';

const post = (frontmatter: string, body = 'Body text.\n') => `---\n${frontmatter}\n---\n${body}`;

describe('parseBlogSource draft detection', () => {
	it.each([
		['plain', 'draft: true'],
		// The CLAUDE.md example; the old llms-full parser read this as published (review of #65)
		['with a trailing comment', 'draft: true  # Optional: renders at its URL (noindex)'],
		['capitalised', 'draft: True'],
		['upper case', 'draft: TRUE'],
		['an explicit tag', 'draft: !!bool true'],
	])('reads %s as a draft', (_, line) => {
		expect(parseBlogSource('post.md', post(`title: 'T'\n${line}`)).draft).toBe(true);
	});

	// Astro also reads TOML between +++ fences (review of #65)
	it('reads a TOML draft', () => {
		const source = '+++\ntitle = "Private preview"\npubDate = "2026-10-14"\ndraft = true\n+++\nSecret draft body\n';
		const parsed = parseBlogSource('toml-preview.md', source);
		expect(parsed.draft).toBe(true);
		expect(parsed.data.title).toBe('Private preview');
		expect(parsed.body.trim()).toBe('Secret draft body');
	});

	it.each([
		['no draft key', "title: 'T'"],
		['draft: false', 'draft: false'],
		// The schema rejects a string, so the build would fail before publishing it
		['a quoted string', "draft: 'true'"],
		['the word inside another value', "description: 'draft: true'"],
	])('reads %s as not a draft', (_, line) => {
		expect(parseBlogSource('post.md', post(line)).draft).toBe(false);
	});
});

describe('parseFrontmatter', () => {
	it('unescapes YAML quoting the way Astro does', () => {
		const { data } = parseFrontmatter(post("title: 'What do forecasters say they don''t know?'"));
		expect(data.title).toBe("What do forecasters say they don't know?");
	});

	it('returns the body after the closing fence', () => {
		expect(parseFrontmatter(post('title: T', '\nHello\n')).body.trim()).toBe('Hello');
	});

	it('treats a file without frontmatter as all body', () => {
		expect(parseFrontmatter('Just text')).toEqual({ data: {}, body: 'Just text' });
	});
});

describe('blogPath', () => {
	it.each([
		['expectations.md', '/blog/expectations/'],
		['talkie-1930-math-evals.mdx', '/blog/talkie-1930-math-evals/'],
		['givewell-cea/index.md', '/blog/givewell-cea/'],
		['givewell-cea/social.md', '/blog/givewell-cea/social/'],
		['_which-nut.md', '/blog/_which-nut/'],
		// github-slugger per segment, as Astro's glob loader does (review of #65)
		['My Draft.md', '/blog/my-draft/'],
		['Folder Name/Index.md', '/blog/folder-name/'],
	])('maps %s to %s', (file, path) => {
		expect(blogPath(file, {})).toBe(path);
	});

	it('uses a slug override', () => {
		expect(blogPath('anything.md', { slug: 'chosen/slug' })).toBe('/blog/chosen/slug/');
	});

	// Astro uses any truthy slug and stores the id as String(slug) (review of #65)
	it('uses a numeric slug override as a string', () => {
		expect(blogPath('new-post.md', { slug: 2026 })).toBe('/blog/2026/');
	});

	it('ignores a falsy slug, as Astro does', () => {
		expect(blogPath('new-post.md', { slug: '' })).toBe('/blog/new-post/');
		expect(blogPath('new-post.md', { slug: 0 })).toBe('/blog/new-post/');
	});
});
