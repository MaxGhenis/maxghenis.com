import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';
import { domSaysNoindex } from '../../tests/robots-oracle';
import { builtPagePath, hasNoindexMeta, sitemapFilter } from './sitemap-filter.mjs';

const SITE = 'https://maxghenis.com';
const ROBOTS_NOINDEX = '<meta name="robots" content="noindex">';
const page = (head: string, body = '') => `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

describe('hasNoindexMeta', () => {
	it.each([
		['the tag BaseHead renders', page(ROBOTS_NOINDEX)],
		['content before name', page('<meta content="noindex" name="robots">')],
		['single quotes and self-closing', page("<meta name='robots' content='noindex' />")],
		['unquoted values', page('<meta name=robots content=noindex>')],
		['noindex among other directives', page('<meta name="robots" content="nofollow, noindex">')],
		['none, which implies noindex', page('<meta name="robots" content="none">')],
		['upper case', page('<META NAME="ROBOTS" CONTENT="NOINDEX">')],
		['a quoted ">" in an earlier tag', page(`<meta name="description" content="a > b">${ROBOTS_NOINDEX}`)],
		['"</head>" quoted in an earlier tag', page(`<link rel="x" title="</head>">${ROBOTS_NOINDEX}`)],
		['"<!--" quoted in an earlier tag', page(`<meta name="description" content="<!--">${ROBOTS_NOINDEX}<meta name="x" content="-->">`)],
		['a meta after </head>, which parsers still put in the head', `<html><head></head>${ROBOTS_NOINDEX}<body></body></html>`],
		[
			"Astro's redirect stub, with no head or body tags",
			'<!doctype html><title>Redirecting</title><meta http-equiv="refresh" content="0;url=/x"><meta name="robots" content="noindex"><body></body>',
		],
	])('finds %s', (_, html) => {
		expect(hasNoindexMeta(html)).toBe(true);
		expect(domSaysNoindex(html)).toBe(true);
	});

	it.each([
		['no robots tag', page('<meta name="description" content="noindex is a word">')],
		// Review of #65: both attribute values together read like a robots tag
		['robots words inside a description', page('<meta name="description" content="Use noindex with name=robots to hide drafts">')],
		['a fake tag inside a quoted value', page('<meta name="description" content="x> <meta name=robots content=noindex>">')],
		['robots allowing indexing', page('<meta name="robots" content="index, follow">')],
		['another robot name', page('<meta name="robotstxt" content="noindex">')],
		['a crawler-specific tag', page('<meta name="googlebot" content="noindex">')],
		['a directive that only contains the word', page('<meta name="robots" content="max-snippet:-1, noindexing">')],
		['a commented-out tag', page(`<!-- ${ROBOTS_NOINDEX} -->`)],
		['a tag in a script string', page(`<script>document.write('${ROBOTS_NOINDEX}')</script>`)],
		['a tag in a title', page('<title>&lt;meta name="robots" content="noindex"&gt;</title>')],
		['a tag in noscript, which browsers with scripts on skip', page(`<noscript>${ROBOTS_NOINDEX}</noscript>`)],
		['the tag inside the body', page('', ROBOTS_NOINDEX)],
		['escaped markup in a code sample', page('', '&lt;meta name="robots" content="noindex"&gt;')],
	])('ignores %s', (_, html) => {
		expect(hasNoindexMeta(html)).toBe(false);
		expect(domSaysNoindex(html)).toBe(false);
	});
});

/**
 * Property tests. Attribute values are escaped only as far as HTML requires
 * inside double quotes (& and "), which is weaker than Astro's escaping, so
 * raw <, >, ', =, comments and whole fake tags reach the parser.
 */
const attr = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const nasty = fc.array(
	fc.oneof(
		fc.string(),
		fc.constantFrom(
			'noindex', 'none', 'robots', 'name=robots', 'content=noindex', 'name="robots"', ROBOTS_NOINDEX,
			'<', '>', "'", '"', '=', '/', ' ', ',', '<!--', '-->', '</head>', '<body>', '<script>', '</script>',
		),
	),
	{ maxLength: 12 },
).map((parts) => parts.join(''));
const directive = fc.constantFrom('index', 'noindex', 'follow', 'nofollow', 'none', 'noarchive', 'max-snippet:-1', ' NoIndex ');
const robotsMeta = fc
	.tuple(fc.constantFrom('robots', 'ROBOTS', ' robots ', 'googlebot', 'robot'), fc.array(directive, { maxLength: 3 }))
	.map(([name, directives]) => `<meta name="${name}" content="${directives.join(',')}">`);
const otherMeta = fc
	.tuple(fc.constantFrom('description', 'og:title', 'twitter:description', 'author'), nasty)
	.map(([name, value]) => `<meta name="${name}" content="${attr(value)}">`);
const commentOrScript = fc
	.tuple(fc.constantFrom('<!-- ', '<script>var s = "'), fc.constantFrom(ROBOTS_NOINDEX, 'name=robots content=noindex'))
	.map(([open, text]) => (open.startsWith('<!--') ? `${open}${text} -->` : `${open}${text}";</script>`));
const headTag = fc.oneof(otherMeta, robotsMeta, commentOrScript, fc.constant('<link rel="icon" href="/favicon.svg">'));

describe('hasNoindexMeta properties', () => {
	it('never finds noindex in a head without a robots tag, whatever the other values hold', () => {
		fc.assert(
			fc.property(fc.array(fc.oneof(otherMeta, commentOrScript), { maxLength: 6 }), (tags) => {
				expect(hasNoindexMeta(page(tags.join('')))).toBe(false);
			}),
			{ numRuns: 2000 },
		);
	});

	it("always finds BaseHead's tag, wherever it sits among other head tags", () => {
		fc.assert(
			fc.property(fc.array(headTag, { maxLength: 6 }), fc.nat(), (tags, at) => {
				const position = at % (tags.length + 1);
				const head = [...tags.slice(0, position), ROBOTS_NOINDEX, ...tags.slice(position)].join('');
				expect(hasNoindexMeta(page(head))).toBe(true);
			}),
			{ numRuns: 2000 },
		);
	});

	it('agrees with a DOM parse on generated heads', () => {
		fc.assert(
			fc.property(fc.array(headTag, { maxLength: 6 }), (tags) => {
				const html = page(tags.join(''));
				expect(hasNoindexMeta(html)).toBe(domSaysNoindex(html));
			}),
			{ numRuns: 2000 },
		);
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
		write('blog/robots-words/index.html', page('<meta name="description" content="Use noindex with name=robots to hide drafts">'));
		write('blog/draft/index.html', page(ROBOTS_NOINDEX));
		write('blog/folder/social/index.html', page(ROBOTS_NOINDEX));
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
		expect(keep(`${SITE}/blog/robots-words/`)).toBe(true);
		expect(keep(`${SITE}/blog/draft/`)).toBe(false);
		expect(keep(`${SITE}/blog/folder/social/`)).toBe(false);
		// Excluded by URL alone, so no built file is needed
		expect(keep(`${SITE}/blog/published/crosspost/`)).toBe(false);
		expect(keep(`${SITE}/blog/_unlisted/`)).toBe(false);
	});
});
