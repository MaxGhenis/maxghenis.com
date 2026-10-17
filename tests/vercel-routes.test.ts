import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildRoutes, sourceToRegex, substituteParams } from '../scripts/vercel-routes.js';

const vercelConfig = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8'));

const MEET_HOST = 'meet.maxghenis.com';
// Google Calendar appointment schedules on max@policyengine.org.
const MEET_LINKS = {
	30: 'https://calendar.app.google/REPLACE_30',
	45: 'https://calendar.app.google/2tpvhj6qDA4YMcqN9',
	60: 'https://calendar.app.google/REPLACE_60',
};

type Route = ReturnType<typeof buildRoutes>[number] & Record<string, any>;
type Outcome = { redirect: string; status: number } | 'filesystem';

// Walk the routes the way Vercel does up to the filesystem handle: skip
// header-only routes that continue, and return the first redirect whose path
// regex and host conditions match.
function resolve(routes: Route[], host: string, path: string): Outcome {
	for (const route of routes) {
		if (route.handle === 'filesystem') return 'filesystem';
		if (route.continue || !route.headers?.Location) continue;
		const match = path.match(new RegExp(route.src));
		if (!match) continue;
		const hostOk = (route.has ?? []).every(
			(c: { type: string; value: string }) => c.type !== 'host' || c.value === host,
		);
		const missingOk = (route.missing ?? []).every(
			(c: { type: string; value: string }) => c.type !== 'host' || c.value !== host,
		);
		if (!hostOk || !missingOk) continue;
		const location = route.headers.Location.replace(/\$(\d+)/g, (_: string, i: string) => match[Number(i)] ?? '');
		return { redirect: location, status: route.status };
	}
	throw new Error('no filesystem handle');
}

const isMeetRule = (r: { has?: { type: string; value: string }[] }) =>
	(r.has ?? []).some((c) => c.type === 'host' && c.value === MEET_HOST);

const routes = buildRoutes(vercelConfig) as Route[];
const routesWithoutMeet = buildRoutes({
	...vercelConfig,
	redirects: vercelConfig.redirects.filter((r: any) => !isMeetRule(r)),
}) as Route[];

const segment = fc.stringMatching(/^[A-Za-z0-9._~-]{1,12}$/);
const path = fc
	.tuple(fc.array(segment, { maxLength: 5 }), fc.boolean())
	.map(([segs, slash]) => (segs.length ? `/${segs.join('/')}${slash ? '/' : ''}` : '/'));

describe('meet.maxghenis.com redirects', () => {
	it.each([
		['/30', 30], ['/30/', 30],
		['/45', 45], ['/45/', 45],
		['/60', 60], ['/60/', 60],
		['/', 45], ['/anything', 45], ['/anything/else/', 45], ['/index.html', 45], ['/cv', 45],
	])('%s goes to the %i-minute schedule', (p, minutes) => {
		expect(resolve(routes, MEET_HOST, p)).toEqual({
			redirect: MEET_LINKS[minutes as 30 | 45 | 60],
			status: 307,
		});
	});

	it('every path on the meet host redirects to a booking page, never site content', () => {
		const links = Object.values(MEET_LINKS);
		fc.assert(
			fc.property(path, (p) => {
				const outcome = resolve(routes, MEET_HOST, p);
				expect(outcome).not.toBe('filesystem');
				expect(links).toContain((outcome as { redirect: string }).redirect);
			}),
		);
	});

	it('meet rules never change routing on any other host', () => {
		const otherHost = fc.constantFrom('maxghenis.com', 'www.maxghenis.com', 'maxghenis-git-x.vercel.app');
		fc.assert(
			fc.property(otherHost, path, (host, p) => {
				expect(resolve(routes, host, p)).toEqual(resolve(routesWithoutMeet, host, p));
			}),
		);
	});

	it('maxghenis.com keeps its homepage and short paths', () => {
		for (const p of ['/', '/30', '/45', '/60']) {
			expect(resolve(routes, 'maxghenis.com', p)).toBe('filesystem');
		}
	});
});

describe('existing maxghenis.com redirects', () => {
	it.each([
		['/mita', 'https://mita-iota.vercel.app/'],
		['/mita/a/b', 'https://mita-iota.vercel.app/a/b'],
		['/whatnut', '/whatnut/'],
		['/whatnut-paper/x/y', '/whatnut/'],
		['/whatnut-paper/x/', '/whatnut/'],
		['/ubi/', '/ubi-forecast/'],
		['/2022/11/california', '/blog/voter-guides/2022-11-california'],
	])('%s redirects to %s', (p, location) => {
		expect(resolve(routes, 'maxghenis.com', p)).toMatchObject({ redirect: location });
	});

	it.each(['/mita/', '/whatnut/', '/2022/11/california/'])('%s falls through, as on Vercel today', (p) => {
		expect(resolve(routes, 'maxghenis.com', p)).toBe('filesystem');
	});
});

describe('sourceToRegex', () => {
	it('matches a literal source exactly, with no optional trailing slash', () => {
		fc.assert(
			fc.property(fc.array(segment, { minLength: 1, maxLength: 4 }), (segs) => {
				const source = `/${segs.join('/')}`;
				const re = new RegExp(sourceToRegex(source).src);
				expect(re.test(source)).toBe(true);
				expect(re.test(`${source}/`)).toBe(false);
				expect(re.test(`${source}/x`)).toBe(false);
			}),
		);
	});

	it('round-trips :path* captures into the destination', () => {
		fc.assert(
			fc.property(segment, fc.array(segment, { maxLength: 4 }), (base, rest) => {
				const { src, names } = sourceToRegex(`/${base}/:path*`);
				const dest = substituteParams('https://example.org/:path*', names);
				const p = rest.length ? `/${base}/${rest.join('/')}` : `/${base}`;
				const m = p.match(new RegExp(src));
				expect(m).not.toBeNull();
				expect(dest.replace(/\$(\d+)/g, (_, i) => m![Number(i)] ?? '')).toBe(
					`https://example.org/${rest.join('/')}`,
				);
			}),
		);
	});

	it('leaves URL schemes and unknown names in destinations alone', () => {
		expect(substituteParams('https://host:8080/:path*', ['path'])).toBe('https://host:8080/$1');
	});
});
