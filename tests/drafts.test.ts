import { beforeAll, describe, expect, it } from 'vitest';
import { glob } from 'glob';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { BLOG_DIR, readBlogSources } from '../src/lib/blog-sources';
import { hasNoindexMeta } from '../src/lib/sitemap-filter.mjs';
import { domSaysNoindex } from './robots-oracle';

/**
 * Drafts (`draft: true` in frontmatter) render at their URLs so preview links
 * work, but must stay out of every syndication surface: rss.xml, the sitemap,
 * the home page and /blog, llms-full.txt, and links from published pages.
 * Like social-cards.test.ts, this reads the built site, so run
 * `bun run build` first.
 *
 * Drafts are found by reading frontmatter the way Astro does
 * (src/lib/blog-sources.ts), not through the pages, so the test also checks
 * that the two agree: the noindex pages in dist must be exactly these drafts
 * and their crossposts.
 */

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const SITE = 'https://maxghenis.com';
const NOINDEX_TAG = '<meta name="robots" content="noindex">';

/** `/blog/foo` and `https://maxghenis.com/blog/foo/?x#y` both become `/blog/foo/`. */
function sitePath(url: string, base = SITE): string {
	const { pathname } = new URL(url, base);
	return decodeURIComponent(pathname.endsWith('/') ? pathname : `${pathname}/`);
}

function builtHtml(path: string): string | undefined {
	const file = join(DIST, path, 'index.html');
	return existsSync(file) ? readFileSync(file, 'utf-8') : undefined;
}

const isRedirectStub = (html: string) => html.includes('http-equiv="refresh"');

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

/** Same-site paths a page links to, resolved against the page's own URL. */
function linkedPaths(html: string, pagePath: string): string[] {
	return [...html.matchAll(/\shref="([^"]*)"/g)].flatMap(([, href]) => {
		const url = new URL(href.replaceAll('&amp;', '&'), `${SITE}${pagePath}`);
		return url.origin === SITE ? [sitePath(url.href)] : [];
	});
}

describe('Drafts', () => {
	let drafts: string[];
	let draftPages: Set<string>;
	let pages: string[];
	let rss: Set<string>;
	let sitemap: Set<string>;

	beforeAll(async () => {
		if (!existsSync(DIST)) throw new Error('dist/ is missing: run `bun run build` first');
		drafts = (await readBlogSources(join(ROOT, BLOG_DIR))).filter((s) => s.draft).map((s) => s.path);
		draftPages = new Set(drafts.flatMap((path) => [path, `${path}crosspost/`]));
		pages = (await glob('**/index.html', { cwd: DIST })).map((file) => sitePath(`/${file.replace(/index\.html$/, '')}`));
		rss = new Set(rssItemPaths(readFileSync(join(DIST, 'rss.xml'), 'utf-8')));
		sitemap = new Set(sitemapPaths());
	});

	it('reads a built site', () => {
		expect(pages.length).toBeGreaterThan(0);
		expect(rss.size).toBeGreaterThan(0);
		expect(sitemap.size).toBeGreaterThan(0);
	});

	it('finds a built page for every source file, as Astro names it', async () => {
		const sources = await readBlogSources(join(ROOT, BLOG_DIR));
		const missing = sources.filter((s) => builtHtml(s.path) === undefined).map((s) => `${s.file} -> ${s.path}`);
		expect(sources.length).toBeGreaterThan(0);
		expect(missing, `no built page at the expected path:\n${missing.join('\n')}`).toEqual([]);
	});

	it('still renders every draft and its crosspost, marked noindex', () => {
		const problems = [...draftPages].flatMap((page) => {
			const html = builtHtml(page);
			if (html === undefined) return [`${page}: no built page`];
			return html.includes(NOINDEX_TAG) ? [] : [`${page}: missing noindex`];
		});
		expect(problems, problems.join('\n')).toEqual([]);
	});

	it('marks no page noindex except drafts, their crossposts and redirect stubs', () => {
		const unexpected = pages.filter((path) => {
			const html = builtHtml(path)!;
			return domSaysNoindex(html) && !isRedirectStub(html) && !draftPages.has(path);
		});
		expect(unexpected, `noindex pages that are not drafts:\n${unexpected.join('\n')}`).toEqual([]);
	});

	it("reads every built page's robots tag the way an HTML parser does", () => {
		const disagree = pages.filter((path) => {
			const html = builtHtml(path)!;
			return hasNoindexMeta(html) !== domSaysNoindex(html);
		});
		expect(disagree, `sitemap filter and parse5 disagree on:\n${disagree.join('\n')}`).toEqual([]);
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
		const noindexed = [...sitemap].filter((path) => {
			const html = builtHtml(path);
			return html !== undefined && domSaysNoindex(html);
		});
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

	it('links to drafts only from other drafts', () => {
		// The home page and /blog are listings; check they were read, not skipped
		expect(pages).toEqual(expect.arrayContaining(['/', '/blog/']));
		const leaks = pages
			.filter((path) => !draftPages.has(path))
			.flatMap((path) =>
				linkedPaths(builtHtml(path)!, path)
					.filter((target) => draftPages.has(target))
					.map((target) => `${path} links to ${target}`),
			);
		expect([...new Set(leaks)], `published pages linking to drafts:\n${[...new Set(leaks)].join('\n')}`).toEqual([]);
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
