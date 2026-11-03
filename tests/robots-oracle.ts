import { parse } from 'parse5';

type Parse5Node = { nodeName: string; childNodes?: Parse5Node[]; attrs?: { name: string; value: string }[] };

/**
 * What a browser concludes about a page, via parse5 (the WHATWG parsing
 * algorithm, scripts on): whether a robots meta in the parsed head says
 * noindex or none. The reference for src/lib/sitemap-filter.mjs's lighter
 * scanner, which the build uses.
 */
export function domSaysNoindex(html: string): boolean {
	const children = (node: Parse5Node | undefined) => node?.childNodes ?? [];
	const root = children(parse(html) as Parse5Node).find((node) => node.nodeName === 'html');
	const head = children(root).find((node) => node.nodeName === 'head');
	return children(head).some((node) => {
		if (node.nodeName !== 'meta') return false;
		const attribute = (name: string) => node.attrs?.find((a) => a.name === name)?.value;
		if (attribute('name')?.trim().toLowerCase() !== 'robots') return false;
		const directives = (attribute('content') ?? '').toLowerCase().split(',').map((d) => d.trim());
		return directives.includes('noindex') || directives.includes('none');
	});
}
