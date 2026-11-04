/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { glob } from 'glob';
import { decodeHTMLAttribute } from 'entities';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { execFileSync } from 'child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

/**
 * Attribute escaping tests
 *
 * Astro stores each Markdown image's props as JSON in a placeholder
 * attribute, then decodes the character references in it, parses the JSON
 * and escapes the values again. Astro 5.16 decoded only `&#x22;`, so an
 * apostrophe in alt text reached the page as `&amp;#x27;`. Astro 7.1.3 also
 * decoded apostrophes but not `&`, which came out as `&amp;amp;` until 7.3.4.
 * A browser decodes an attribute once, so `img.alt` held the reference as
 * text and screen readers read it out.
 */

type Element = DefaultTreeAdapterMap['element'];
type ParentNode = DefaultTreeAdapterMap['parentNode'];

// parse5 decodes attribute values the way a browser does and, unlike a DOM,
// never fetches the stylesheets or scripts a page links to
function elements(node: ParentNode): Element[] {
	return node.childNodes.flatMap((child) =>
		'tagName' in child ? [child, ...elements('content' in child ? child.content : child)] : [],
	);
}

const attribute = (element: Element, name: string) =>
	element.attrs.find((attr) => attr.name === name)?.value;

// Attributes that hold text a person reads or a screen reader speaks, or a
// URL a browser follows. Serialized data, such as astro-island props or data-*
// attributes, can hold character references legitimately, so the scan skips it.
const TEXT_AND_URL_ATTRIBUTES = new Set([
	'abbr',
	'alt',
	'aria-description',
	'aria-label',
	'aria-placeholder',
	'aria-roledescription',
	'aria-valuetext',
	'content',
	'label',
	'placeholder',
	'title',
	'action',
	'cite',
	'data',
	'formaction',
	'href',
	'ping',
	'poster',
	'src',
	'srcset',
]);

// The browser decodes each attribute value once. If decoding the result again
// would change it, the value still holds a character reference (`&amp;`,
// `&#x27;`), so the build escaped it twice. Text about entities, and a URL
// parameter whose name starts with a legacy entity name (`&copy_id=`), trip
// this too.
function doubleEscapedAttributes(html: string): string[] {
	// With scripting on, a browser reads <noscript> content as text; with it
	// off, as markup. Check both.
	const found = [true, false].flatMap((scriptingEnabled) =>
		elements(parse(html, { scriptingEnabled })).flatMap((element) =>
			element.attrs
				.filter(
					(attr) =>
						TEXT_AND_URL_ATTRIBUTES.has(attr.name) &&
						decodeHTMLAttribute(attr.value) !== attr.value,
				)
				.map((attr) => `<${element.tagName} ${attr.name}="${attr.value}">`),
		),
	);
	return [...new Set(found)];
}

describe('Double-escape scan', () => {
	const scan = (html: string) => doubleEscapedAttributes(`<!doctype html><body>${html}`);

	it.each([
		['<img alt="Tom &amp;amp; Jerry">', 'an ampersand'],
		['<img alt="The forecasters&amp;#x27; average">', 'an apostrophe'],
		['<img alt="Copyright &amp;copy; 2026">', 'a named reference'],
		['<a href="/?a=1&amp;amp;b=2">', 'a URL'],
		['<meta content="Tom &amp;amp; Jerry">', 'meta content'],
		['<noscript><img alt="Tom &amp;amp; Jerry"></noscript>', 'markup inside noscript'],
	])('flags %s (%s)', (html) => {
		expect(scan(html)).toHaveLength(1);
	});

	it.each([
		['<img alt="Tom &amp; Jerry">', 'a single escape'],
		['<img alt="Tom &amp;aMp; Jerry">', 'a misspelled reference'],
		['<a href="/?a=1&amp;b=2">', 'a query string'],
		['<astro-island props="{&quot;html&quot;:[0,&quot;Tom &amp;amp; Jerry&quot;]}">', 'island props'],
		['<div data-html="&lt;p&gt;Tom &amp;amp; Jerry&lt;/p&gt;">', 'a data attribute'],
	])('passes %s (%s)', (html) => {
		expect(scan(html)).toEqual([]);
	});
});

describe('Built pages', () => {
	it('have no double-escaped attribute values', async () => {
		const distDir = join(process.cwd(), 'dist');
		const htmlFiles = await glob('**/*.html', { cwd: distDir });

		expect(htmlFiles.length).toBeGreaterThan(0);

		const issues = htmlFiles.flatMap((file) =>
			doubleEscapedAttributes(readFileSync(join(distDir, file), 'utf-8')).map(
				(found) => `${file}: ${found}`,
			),
		);

		expect(issues, `Double-escaped attributes:\n  - ${issues.join('\n  - ')}`).toEqual([]);
	});
});

describe('Markdown image pipeline', () => {
	// Each string serves as an image's alt and title text. The build must hand
	// each one to the browser unchanged.
	const CASES = [
		"The forecasters' average forecast",
		'Tom & Jerry',
		'"Quoted," she said',
		'a < b > c',
		'Literal &amp; and &#x27; stay literal',
		'Café — 50% off; #1 pick 🧪',
		// Every ASCII punctuation character but the backtick
		'!"#$%&\'()*+,-./:;<=>?@[\\]^_{|}~',
	];

	// In .md files Astro 7.4.5 still escapes a backtick in image text twice, so
	// the browser gets `&#x60;`: its round trip decodes only quote, apostrophe
	// and ampersand references. Only images Astro processes take that round
	// trip: relative paths, and remote hosts that the image config allows (the
	// fixture allows none). Images under public/ and other remote images skip
	// it. AGENTS.md keeps backticks out of .md image text until a release fixes
	// this.
	const BACKTICK = 'Back`tick';
	const BACKTICK_SOURCES = ['../assets/pixel.svg', '/pixel.svg', 'https://example.com/pixel.svg'];

	// Backslash-escape all ASCII punctuation so Markdown keeps every character
	// literal: no entity decoding, code spans, or smart quotes
	const escapeMarkdown = (text: string) => text.replace(/[!-/:-@[-`{-~]/g, '\\$&');
	const image = (text: string, src: string) =>
		`![${escapeMarkdown(text)}](${src} "${escapeMarkdown(text)}")`;

	const images = [
		...CASES.map((text) => image(text, '../assets/pixel.svg')),
		...BACKTICK_SOURCES.map((src) => image(BACKTICK, src)),
		// Backticks that pair into a code span drop out of alt text
		'![Run `bun test` first](../assets/pixel.svg)',
	].join('\n\n');

	// A content collection entry (.md and .mdx, as blog posts use) and a
	// Markdown page each take a different path through Astro. Only MDX keeps
	// a backtick intact in a processed image today.
	const ROUTES = [
		{ route: 'post-md', processedBacktick: 'Back&#x60;tick' },
		{ route: 'post-mdx', processedBacktick: BACKTICK },
		{ route: 'page-md', processedBacktick: 'Back&#x60;tick' },
	];

	const PIXEL = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';

	const FIXTURE: Record<string, string> = {
		'package.json': JSON.stringify({ name: 'attribute-escaping-fixture', private: true, type: 'module' }),
		// Astro and Vite both cache under node_modules by default, and this
		// node_modules links to the site's, which a running dev server reads
		'astro.config.mjs': [
			"import mdx from '@astrojs/mdx';",
			"import { defineConfig } from 'astro/config';",
			'export default defineConfig({',
			"\tcacheDir: './.cache/astro',",
			'\tintegrations: [mdx()],',
			"\tvite: { cacheDir: './.cache/vite' },",
			'});',
		].join('\n'),
		'src/content.config.ts': [
			"import { defineCollection } from 'astro:content';",
			"import { glob } from 'astro/loaders';",
			"const posts = defineCollection({ loader: glob({ base: './src/posts', pattern: '*.{md,mdx}' }) });",
			'export const collections = { posts };',
		].join('\n'),
		'src/pages/[slug].astro': [
			'---',
			"import { getCollection, render } from 'astro:content';",
			'export async function getStaticPaths() {',
			"\tconst posts = await getCollection('posts');",
			'\treturn posts.map((post) => ({ params: { slug: post.id }, props: { post } }));',
			'}',
			'const { Content } = await render(Astro.props.post);',
			'---',
			'<Content />',
		].join('\n'),
		'src/assets/pixel.svg': PIXEL,
		'public/pixel.svg': PIXEL,
		'src/posts/post-md.md': images,
		'src/posts/post-mdx.mdx': images,
		'src/pages/page-md.md': images,
	};

	let root: string;

	beforeAll(() => {
		root = realpathSync(mkdtempSync(join(tmpdir(), 'attribute-escaping-')));
		for (const [file, contents] of Object.entries(FIXTURE)) {
			mkdirSync(dirname(join(root, file)), { recursive: true });
			writeFileSync(join(root, file), contents);
		}
		symlinkSync(join(process.cwd(), 'node_modules'), join(root, 'node_modules'), 'dir');

		execFileSync(
			process.execPath,
			[join(process.cwd(), 'node_modules/astro/bin/astro.mjs'), 'build', '--root', root],
			{ env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' },
		);
	}, 120_000);

	afterAll(() => {
		if (root) rmSync(root, { recursive: true, force: true });
	});

	for (const { route, processedBacktick } of ROUTES) {
		describe(route, () => {
			let imgs: Element[];

			beforeAll(() => {
				const html = readFileSync(join(root, 'dist', route, 'index.html'), 'utf-8');
				imgs = elements(parse(html)).filter((element) => element.tagName === 'img');
			});

			it('renders every image', () => {
				expect(imgs).toHaveLength(CASES.length + BACKTICK_SOURCES.length + 1);
			});

			for (const name of ['alt', 'title']) {
				it(`decodes each ${name} to its source text`, () => {
					expect(imgs.slice(0, CASES.length).map((img) => attribute(img, name))).toEqual(CASES);
				});

				// The .md routes pin today's double escape, so this fails once an
				// Astro release fixes it: then move BACKTICK into CASES and drop
				// the AGENTS.md rule
				it(`renders a backtick in ${name} as ${processedBacktick} in a processed image, intact in public and remote ones`, () => {
					const backtickImgs = imgs.slice(CASES.length, CASES.length + BACKTICK_SOURCES.length);
					expect(backtickImgs.map((img) => attribute(img, name))).toEqual([
						processedBacktick,
						BACKTICK,
						BACKTICK,
					]);
				});
			}

			it('drops code span backticks from alt text', () => {
				expect(attribute(imgs[CASES.length + BACKTICK_SOURCES.length], 'alt')).toBe(
					'Run bun test first',
				);
			});
		});
	}
});
