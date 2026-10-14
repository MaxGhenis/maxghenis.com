// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const META_TAG = /<meta\b[^>]*>/gi;
const ROBOTS_NAME = /\bname\s*=\s*["']?robots["']?(?=[\s/>])/i;
const NOINDEX_CONTENT = /\bcontent\s*=\s*["'][^"']*\bnoindex\b/i;

/**
 * Whether an HTML document's head has `<meta name="robots">` with noindex.
 * Pages without a `</head>` (Astro's redirect stubs) are searched whole.
 * @param {string} html
 * @returns {boolean}
 */
export function hasNoindexMeta(html) {
	const headEnd = html.search(/<\/head>/i);
	const head = headEnd === -1 ? html : html.slice(0, headEnd);
	return [...head.matchAll(META_TAG)].some(
		([tag]) => ROBOTS_NAME.test(tag) && NOINDEX_CONTENT.test(tag),
	);
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
