// Turn vercel.json redirects and rewrites into Build Output API routes.
// fix-vercel-rewrites.js writes the result to .vercel/output/config.json;
// tests/vercel-routes.test.ts checks it without a build.

/**
 * @typedef {{ type: string, key?: string, value?: string }} Condition
 * @typedef {{ src?: string, dest?: string, headers?: Record<string, string>, status?: number, continue?: boolean, handle?: string, has?: Condition[], missing?: Condition[] }} Route
 */

/** @param {string} s */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// One or more path segments, captured as a group (what `:name*` matches).
const SEGMENTS = '((?:[^/]+?)(?:/(?:[^/]+?))*)';

/**
 * Compile a vercel.json `source` into an anchored regex, matching the way
 * Vercel does: literal segments match exactly, `:name` matches one segment,
 * `:name*` matches zero or more segments (with its leading slash), and a
 * trailing slash is never optional. Returns the regex and the parameter
 * names in capture order.
 *
 * @param {string} source
 * @returns {{ src: string, names: string[] }}
 */
export function sourceToRegex(source) {
	/** @type {string[]} */
	const names = [];
	let pattern = '';
	for (const segment of source.split('/').slice(1)) {
		const param = segment.match(/^:(\w+)(\*)?$/);
		if (!param) {
			pattern += `/${escapeRegex(segment)}`;
		} else if (param[2]) {
			names.push(param[1]);
			pattern += `(?:/${SEGMENTS})?`;
		} else {
			names.push(param[1]);
			pattern += '/([^/]+?)';
		}
	}
	return { src: `^${pattern}$`, names };
}

/**
 * Replace `:name` and `:name*` in a destination with the capture groups
 * that sourceToRegex returned for those names.
 *
 * @param {string} destination
 * @param {string[]} names
 */
export function substituteParams(destination, names) {
	return destination.replace(/:(\w+)\*?/g, (match, name) => {
		const index = names.indexOf(name);
		return index === -1 ? match : `$${index + 1}`;
	});
}

/**
 * @param {{ redirects?: Array<{ source: string, destination: string, permanent?: boolean, has?: Condition[], missing?: Condition[] }>, rewrites?: Array<{ source: string, destination: string }> }} vercelConfig
 * @returns {Route[]}
 */
export function buildRoutes(vercelConfig) {
	/** @type {Route[]} */
	const routes = [
		// Cache headers for hashed assets
		{ src: '^/assets/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
		{ src: '^/_astro/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
	];

	// Redirects run before the filesystem, so a host-scoped "/" beats index.html.
	for (const r of vercelConfig.redirects || []) {
		const { src, names } = sourceToRegex(r.source);
		/** @type {Route} */
		const route = {
			src,
			headers: { Location: substituteParams(r.destination, names) },
			status: r.permanent ? 308 : 307,
		};
		if (r.has) route.has = r.has;
		if (r.missing) route.missing = r.missing;
		routes.push(route);
	}

	// Filesystem check (serve static files first)
	routes.push({ handle: 'filesystem' });

	// Add rewrites (NO check flag for external URLs)
	for (const r of vercelConfig.rewrites || []) {
		const source = r.source;
		const dest = r.destination;

		if (source.includes(':path*')) {
			// Wildcard rewrite: /foo/:path* -> https://ext/foo/:path*
			// Also matches bare trailing slash: /foo/ -> /foo/
			const base = source.replace('/:path*', '');
			const destBase = dest.replace('/:path*', '');
			routes.push({
				src: `^${escapeRegex(base)}(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?/?$`,
				dest: `${destBase}/$1`,
			});
		} else {
			// Exact path rewrite (with optional trailing slash)
			routes.push({
				src: `^${escapeRegex(source)}/?$`,
				dest: dest,
			});
		}
	}

	// Error handling
	routes.push({ handle: 'error' });
	routes.push({ status: 404, src: '^(?!/api).*$', dest: '/404.html' });

	return routes;
}
