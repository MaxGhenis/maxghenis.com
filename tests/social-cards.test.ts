import { describe, it, expect } from 'vitest';
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Social cards', () => {
	it('project pages and blog posts have custom og:image (not fallback)', async () => {
		const distDir = join(process.cwd(), 'dist');
		const htmlFiles = await glob('**/index.html', { cwd: distDir });

		expect(htmlFiles.length).toBeGreaterThan(0);

		// Pages that should have custom social card images
		const requiresCustomImage = (file: string) => {
			// Exclude utility/internal pages
			const utilityPages = [
				'blog', 'cv', 'projects', 'voter-guides', 'elections', 'rss.xml', '404',
				'style', 'lab', 'feed', 'brand', 'whatnut', 'mita', // utility/experimental pages
			];

			// Project pages (top-level pages like /rambar, /terminalgrid, /opencollective-py)
			const isProjectPage = /^[^/]+\/index\.html$/.test(file) &&
				!utilityPages.some(p => file.startsWith(p));

			// Blog posts (but not crosspost variants, not drafts starting with _, not example posts)
			const isBlogPost = file.startsWith('blog/') &&
				!file.includes('/crosspost/') &&
				!file.includes('/_') &&
				!file.includes('/using-mdx/') &&
				file !== 'blog/index.html';

			return isProjectPage || isBlogPost;
		};

		const pagesWithoutOgImage: string[] = [];
		const pagesWithFallbackImage: string[] = [];

		for (const file of htmlFiles) {
			if (!requiresCustomImage(file)) continue;

			const filePath = join(distDir, file);
			const html = readFileSync(filePath, 'utf-8');

			// Check for og:image meta tag
			const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);

			if (!ogImageMatch) {
				pagesWithoutOgImage.push(file);
				continue;
			}

			const ogImageUrl = ogImageMatch[1];

			// Check if it's using the fallback placeholder image
			if (ogImageUrl.includes('blog-placeholder')) {
				pagesWithFallbackImage.push(file);
			}
		}

		const issues: string[] = [];

		if (pagesWithoutOgImage.length > 0) {
			issues.push(`Pages missing og:image:\n  - ${pagesWithoutOgImage.join('\n  - ')}`);
		}

		if (pagesWithFallbackImage.length > 0) {
			issues.push(`Pages using fallback placeholder image:\n  - ${pagesWithFallbackImage.join('\n  - ')}`);
		}

		expect(issues, issues.join('\n\n')).toHaveLength(0);
	});
});
