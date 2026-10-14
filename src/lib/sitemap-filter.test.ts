import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';
import { builtPagePath, hasNoindexMeta, sitemapFilter } from './sitemap-filter.mjs';

const SITE = 'https://maxghenis.com';
const page = (head: string, body = '') => `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

describe('hasNoindexMeta', () => {
	it.each([
		['the tag BaseHead renders', page('<meta name="robots" content="noindex">')],
		['content before name', page('<meta content="noindex" name="robots">')],
		['single quotes and self-closing', page("<meta name='robots' content='noindex' />")],
		['noindex among other directives', page('<meta name="robots" content="nofollow, noindex">')],
		['upper case', page('<META NAME="ROBOTS" CONTENT="NOINDEX">')],
		[
			"Astro's redirect stub, which has no </head>",
			'<!doctype html><title>Redirecting</title><meta http-equiv="refresh" content="0;url=/x"><meta name="robots" content="noindex"><body></body>',
		],
	])('finds %s', (_, html) => {
		expect(hasNoindexMeta(html)).toBe(true);
	});

	it.each([
		['no robots tag', page('<meta name="description" content="noindex is a word">')],
		['robots allowing indexing', page('<meta name="robots" content="index, follow">')],
		['another robot name', page('<meta name="robotstxt" content="noindex">')],
		['a crawler-specific tag', page('<meta name="googlebot" content="noindex">')],
		['the tag after </head>', page('', '<meta name="robots" content="noindex">')],
		['escaped markup in a code sample', page('', '&lt;meta name="robots" content="noindex"&gt;')],
	])('ignores %s', (_, html) => {
		expect(hasNoindexMeta(html)).toBe(false);
	});
});

describe('sitemap filter over a built site', () => {
	let root: string;
	let outDir: URL;

	const write = (path: string, html: string) => {
		const file = join(root, path);
		mkdirSync(dirname(file), { recursive: true });
		writeFileSync(file, html);
	};

	beforeAll(() => {
		root = mkdtempSync(join(tmpdir(), 'sitemap-filter-'));
		outDir = pathToFileURL(`${root}/`);
		write('index.html', page('<title>Home</title>'));
		write('blog/published/index.html', page('<title>Published</title>'));
		write('blog/draft/index.html', page('<meta name="robots" content="noindex">'));
		write('blog/folder/social/index.html', page('<meta name="robots" content="noindex">'));
		write('blog/café/index.html', page('<title>Encoded</title>'));
		write('flat.html', page('<title>Flat file</title>'));
	});

	afterAll(() => rmSync(root, { recursive: true, force: true }));

	it('maps page URLs to their built files', () => {
		expect(builtPagePath(`${SITE}/`, outDir)).toBe(join(root, 'index.html'));
		expect(builtPagePath(`${SITE}/blog/published/`, outDir)).toBe(join(root, 'blog/published/index.html'));
		expect(builtPagePath(`${SITE}/blog/published`, outDir)).toBe(join(root, 'blog/published/index.html'));
		expect(builtPagePath(`${SITE}/flat`, outDir)).toBe(join(root, 'flat.html'));
		expect(builtPagePath(`${SITE}/blog/caf%C3%A9/`, outDir)).toBe(join(root, 'blog/café/index.html'));
	});

	it('fails closed when a page has no built file', () => {
		expect(() => builtPagePath(`${SITE}/blog/missing/`, outDir)).toThrow(/no built page/);
		expect(() => sitemapFilter(() => outDir)(`${SITE}/blog/missing/`)).toThrow(/no built page/);
	});

	it('fails closed before outDir is known', () => {
		expect(() => sitemapFilter(() => undefined)(`${SITE}/blog/published/`)).toThrow(/outDir/);
	});

	it('keeps indexable pages and drops noindex, crosspost and underscore pages', () => {
		const keep = sitemapFilter(() => outDir);
		expect(keep(`${SITE}/`)).toBe(true);
		expect(keep(`${SITE}/blog/published/`)).toBe(true);
		expect(keep(`${SITE}/blog/draft/`)).toBe(false);
		expect(keep(`${SITE}/blog/folder/social/`)).toBe(false);
		// Excluded by URL alone, so no built file is needed
		expect(keep(`${SITE}/blog/published/crosspost/`)).toBe(false);
		expect(keep(`${SITE}/blog/_unlisted/`)).toBe(false);
	});
});
