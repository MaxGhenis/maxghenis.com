// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Comments, raw-text elements and tags, in document order. Quoted attribute
// values may hold ">" or anything else that looks like markup.
const TOKEN =
	/<!--[\s\S]*?-->|<(script|style|template|title|noscript)\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?<\/\1\s*>|<(\/?)([a-z][^\s/>]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
// Elements allowed in <head>; any other start tag means the body has begun
const HEAD_ELEMENTS = new Set([
	'html', 'head', 'base', 'basefont', 'bgsound', 'link', 'meta', 'noframes', 'noscript', 'script', 'style', 'template', 'title',
]);
// One attribute: name, then an optional double-quoted, single-quoted or bare value
const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/**
 * A tag's attributes, names lower-cased. Values are compared raw: the robots
 * values that matter (`robots`, `noindex`, `none`) have no entities to decode.
 * @param {string} attributes the text between the tag name and `>`
 * @returns {Map<string, string>}
 */
function parseAttributes(attributes) {
	const parsed = new Map();
	for (const [, name, doubleQuoted, singleQuoted, bare] of attributes.matchAll(ATTRIBUTE)) {
		const key = name.toLowerCase();
		// HTML keeps the first of duplicate attributes
		if (!parsed.has(key)) parsed.set(key, doubleQuoted ?? singleQuoted ?? bare ?? '');
	}
	return parsed;
}

/**
 * Whether an HTML document's head has `<meta name="robots">` whose content
 * includes noindex (or none, which implies it). Comments and the contents of
 * scripts, styles, templates, titles and noscript (as a browser with scripts
 * on reads them) are not markup. As in an HTML
 * parser, the head runs until the body begins: a `<body>` tag or any other
 * element that cannot sit in the head, so a meta after `</head>` still
 * counts. Astro's redirect stubs, which have no head or body tags, work too.
 * Tests check it against parse5, a spec-conformant HTML parser, on generated
 * pages and on every built page.
 * @param {string} html
 * @returns {boolean}
 */
export function hasNoindexMeta(html) {
	for (const [, , closing, tag, attributes] of html.matchAll(TOKEN)) {
		if (!tag || closing) continue;
		const name = tag.toLowerCase();
		if (!HEAD_ELEMENTS.has(name)) return false;
		if (name !== 'meta') continue;
		const meta = parseAttributes(attributes);
		if (meta.get('name')?.trim().toLowerCase() !== 'robots') continue;
		const directives = (meta.get('content') ?? '').toLowerCase().split(',').map((d) => d.trim());
		if (directives.includes('noindex') || directives.includes('none')) return true;
	}
	return false;
}

/**
 * The built HTML file for a page URL. Throws when there is none, so the
 * sitemap fails the build instead of listing a page it could not check.
 * @param {string} pageUrl absolute URL, as @astrojs/sitemap passes it
 * @param {URL} outDir Astro's resolved outDir
 * @returns {string}
 */
export function builtPagePath(pageUrl, outDir) {
	const pathname = decodeURIComponent(new URL(pageUrl).pathname);
	const candidates = pathname.endsWith('/')
		? [`${pathname}index.html`]
		: [`${pathname}/index.html`, `${pathname}.html`];
	for (const candidate of candidates) {
		const file = fileURLToPath(new URL(`.${candidate}`, outDir));
		if (existsSync(file)) return file;
	}
	throw new Error(`sitemap: no built page for ${pageUrl} under ${fileURLToPath(outDir)}`);
}

/**
 * Filter for @astrojs/sitemap. Drops crosspost staging pages, unlisted
 * underscore-prefixed slugs, and every page whose own robots meta says
 * noindex: draft posts, and Astro's redirect stubs. Reading the page keeps one
 * source of truth for drafts (the content collection, via BaseHead) instead
 * of a second list here. The sitemap runs its filter at astro:build:done,
 * after every page is written.
 * @param {() => URL | undefined} getOutDir read lazily, once astro:config:done has set it
 * @returns {(page: string) => boolean}
 */
export function sitemapFilter(getOutDir) {
	return (page) => {
		if (page.includes('/crosspost/') || page.includes('/_')) return false;
		const outDir = getOutDir();
		if (!outDir) throw new Error('sitemap: filter ran before astro:config:done set outDir');
		return !hasNoindexMeta(readFileSync(builtPagePath(page, outDir), 'utf-8'));
	};
}
