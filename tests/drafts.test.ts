import { beforeAll, describe, expect, it } from 'vitest';
import { glob } from 'glob';
import { existsSync, readFileSync } from 'fs';
import { join, relative } from 'path';

/**
 * Drafts (`draft: true` in frontmatter) render at their URLs so preview links
 * work, but must stay out of every syndication surface: rss.xml, the sitemap,
 * the /blog listing and llms-full.txt. Like social-cards.test.ts, this reads
 * the built site, so run `bun run build` first.
 *
 * Drafts are found by reading frontmatter directly rather than through the
 * site's own code, so the test also checks that the two agree: the set of
 * noindex pages in dist must be exactly these drafts and their crossposts.
 */

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const BLOG_SOURCE = join(ROOT, 'src/content/blog');
const SITE = 'https://maxghenis.com';
const NOINDEX_TAG = '<meta name="robots" content="noindex">';

/** `/blog/foo` and `https://maxghenis.com/blog/foo/` both become `/blog/foo/`. */
function sitePath(url: string): string {
	const { pathname } = new URL(url, SITE);
	return decodeURIComponent(pathname.endsWith('/') ? pathname : `${pathname}/`);
}

function builtHtml(path: string): string | undefined {
	const file = join(DIST, path, 'index.html');
	return existsSync(file) ? readFileSync(file, 'utf-8') : undefined;
}

function frontmatter(source: string): string {
	return source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
}

/** YAML 1.2 spells boolean true as true, True or TRUE; the schema rejects anything else. */
function isDraft(fm: string): boolean {
	return /^draft:\s*(?:true|True|TRUE)\s*(?:#.*)?$/m.test(fm);
}

/** The glob loader's id: a `slug` override, else the path without extension or trailing /index. */
function postPath(file: string, fm: string): string {
	const slug = fm.match(/^slug:\s*(['"]?)(.+?)\1\s*$/m)?.[2];
	const id = slug ?? relative(BLOG_SOURCE, file).replace(/\.mdx?$/, '').replace(/\/index$/, '');
	return `/blog/${id}/`;
}

function rssItemPaths(xml: string): string[] {
	return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap(([, item]) =>
		[...item.matchAll(/<(?:link|guid)\b[^>]*>([^<]+)</g)].map(([, url]) => sitePath(url)),
	);
}

function sitemapPaths(): string[] {
	const index = readFileSync(join(DIST, 'sitemap-index.xml'), 'utf-8');
	return [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].flatMap(([, sitemapUrl]) => {
		const sitemap = readFileSync(join(DIST, new URL(sitemapUrl).pathname), 'utf-8');
		return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => sitePath(url));
	});
}

describe('Drafts', () => {
	let drafts: string[];
	let rss: Set<string>;
	let sitemap: Set<string>;

	beforeAll(async () => {
		if (!existsSync(DIST)) throw new Error('dist/ is missing: run `bun run build` first');
		const sources = await glob('**/*.{md,mdx}', { cwd: BLOG_SOURCE, absolute: true });
		drafts = sources.flatMap((file) => {
			const fm = frontmatter(readFileSync(file, 'utf-8'));
			return isDraft(fm) ? [postPath(file, fm)] : [];
		});
		rss = new Set(rssItemPaths(readFileSync(join(DIST, 'rss.xml'), 'utf-8')));
		sitemap = new Set(sitemapPaths());
	});

	it('reads a built site', () => {
		expect(rss.size).toBeGreaterThan(0);
		expect(sitemap.size).toBeGreaterThan(0);
	});

	it('still renders every draft and its crosspost, marked noindex', () => {
		const problems = drafts.flatMap((path) =>
			[path, `${path}crosspost/`].flatMap((page) => {
				const html = builtHtml(page);
				if (html === undefined) return [`${page}: no built page`];
				return html.includes(NOINDEX_TAG) ? [] : [`${page}: missing noindex`];
			}),
		);
		expect(problems, problems.join('\n')).toEqual([]);
	});

	it('marks no page noindex except drafts, their crossposts and redirect stubs', async () => {
		const expected = new Set(drafts.flatMap((path) => [path, `${path}crosspost/`]));
		const pages = await glob('**/index.html', { cwd: DIST });
		const unexpected = pages
			.map((file) => sitePath(`/${file.replace(/index\.html$/, '')}`))
			.filter((path) => {
				const html = builtHtml(path)!;
				return html.includes(NOINDEX_TAG) && !html.includes('http-equiv="refresh"') && !expected.has(path);
			});
		expect(unexpected, `noindex pages that are not drafts:\n${unexpected.join('\n')}`).toEqual([]);
	});

	it('keeps drafts out of rss.xml', () => {
		const leaked = drafts.filter((path) => rss.has(path));
		expect(leaked, `drafts in rss.xml:\n${leaked.join('\n')}`).toEqual([]);
	});

	it('keeps drafts out of the sitemap', () => {
		const leaked = drafts.filter((path) => sitemap.has(path));
		expect(leaked, `drafts in the sitemap:\n${leaked.join('\n')}`).toEqual([]);
	});

	it('lists no noindex page in the sitemap', () => {
		const noindexed = [...sitemap].filter((path) => builtHtml(path)?.includes(NOINDEX_TAG));
		expect(noindexed, `noindex pages in the sitemap:\n${noindexed.join('\n')}`).toEqual([]);
	});

	it('lists every RSS post in the sitemap', () => {
		const missing = [...rss].filter((path) => !sitemap.has(path));
		expect(missing, `RSS posts missing from the sitemap:\n${missing.join('\n')}`).toEqual([]);
	});

	it('puts the same posts in rss.xml as on /blog', () => {
		const listing = builtHtml('/blog/')!;
		const listed = [...listing.matchAll(/<a href="([^"]+)" class="post-row"/g)].map(([, href]) => sitePath(href));
		expect(listed.length).toBeGreaterThan(0);
		expect([...rss].sort()).toEqual([...new Set(listed)].sort());
	});

	it('keeps drafts out of llms-full.txt', () => {
		const text = readFileSync(join(DIST, 'llms-full.txt'), 'utf-8');
		const linked = new Set(
			[...text.matchAll(/(?:\]\(|\*\*URL:\*\* https:\/\/maxghenis\.com)(\/blog\/[^)\s]*)/g)].map(([, path]) => sitePath(path)),
		);
		expect(linked.size).toBeGreaterThan(0);
		const leaked = drafts.filter((path) => linked.has(path));
		expect(leaked, `drafts in llms-full.txt:\n${leaked.join('\n')}`).toEqual([]);
	});
});
