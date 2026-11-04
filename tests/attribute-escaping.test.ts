/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { glob } from 'glob';
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

// A character reference left in an attribute value after decoding, meaning
// the HTML escaped the value twice (`&amp;amp;`, `&amp;#x27;`). Alt text that
// is literally about entities would trip this; rephrase it.
const LEFTOVER_REFERENCE = /&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);/i;

function doubleEscapedAttributes(html: string): string[] {
	return elements(parse(html)).flatMap((element) =>
		element.attrs
			.filter((attr) => LEFTOVER_REFERENCE.test(attr.value))
			.map((attr) => `<${element.tagName} ${attr.name}="${attr.value}">`),
	);
}

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
	// and ampersand references. AGENTS.md keeps backticks out of image text
	// until a release fixes this.
	const BACKTICK = 'Back`tick';

	// Backslash-escape all ASCII punctuation so Markdown keeps every character
	// literal: no entity decoding, code spans, or smart quotes
	const escapeMarkdown = (text: string) => text.replace(/[!-/:-@[-`{-~]/g, '\\$&');

	const images = [...CASES, BACKTICK]
		.map((text) => `![${escapeMarkdown(text)}](../assets/pixel.svg "${escapeMarkdown(text)}")`)
		.join('\n\n');

	// A content collection entry (.md and .mdx, as blog posts use) and a
	// Markdown page each take a different path through Astro. Only MDX keeps
	// a backtick intact today.
	const ROUTES = [
		{ route: 'post-md', keepsBacktick: false },
		{ route: 'post-mdx', keepsBacktick: true },
		{ route: 'page-md', keepsBacktick: false },
	];

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
		'src/assets/pixel.svg': '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
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

	for (const { route, keepsBacktick } of ROUTES) {
		describe(route, () => {
			let imgs: Element[];

			beforeAll(() => {
				const html = readFileSync(join(root, 'dist', route, 'index.html'), 'utf-8');
				imgs = elements(parse(html)).filter((element) => element.tagName === 'img');
			});

			it('renders every image', () => {
				expect(imgs).toHaveLength(CASES.length + 1);
			});

			for (const name of ['alt', 'title']) {
				it(`decodes each ${name} to its source text`, () => {
					expect(imgs.slice(0, CASES.length).map((img) => attribute(img, name))).toEqual(CASES);
				});

				// When an Astro release fixes .md backticks, the it.fails cases
				// start failing: move BACKTICK into CASES and drop the AGENTS.md rule
				(keepsBacktick ? it : it.fails)(`decodes a backtick in ${name}`, () => {
					expect(attribute(imgs[CASES.length], name)).toBe(BACKTICK);
				});
			}
		});
	}
});
