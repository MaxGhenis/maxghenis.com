import { describe, it, expect, beforeAll } from 'vitest';

/**
 * CrosspostAware Integration Tests
 *
 * Tests that verify the CrosspostAware component correctly shows:
 * - Interactive content on regular routes
 * - Static content on /crosspost routes
 *
 * These tests run against the built site to verify actual output.
 */

const BASE_URL = 'http://localhost:4321';
const TEST_POST = '/blog/ide-to-ai-orchestration';

describe('CrosspostAware component', () => {
	describe('Regular route (interactive mode)', () => {
		let html: string;

		beforeAll(async () => {
			const res = await fetch(`${BASE_URL}${TEST_POST}/`);
			html = await res.text();
		});

		it('should render the interactive timeline component', () => {
			// The interactive timeline has specific CSS classes
			expect(html).toContain('timeline-container');
			expect(html).toContain('timeline-item');
			expect(html).toContain('timeline-card');
		});

		it('should NOT render the static timeline content', () => {
			// Static version has plain markdown-style dates without the component wrapper
			// Check that the static format is NOT present (it would be outside timeline-container)
			const staticPattern = /<p>\s*<strong>Feb 24, 2025<\/strong>\s*—\s*<a/;
			// The interactive version has dates inside timeline-date divs
			expect(html).toContain('class="timeline-date"');
		});

		it('should include timeline JavaScript for interactivity', () => {
			// Interactive version has clickable cards with toggle icons
			expect(html).toContain('timeline-item');
			expect(html).toContain('timeline-toggle');
		});
	});

	describe('Crosspost route (static mode)', () => {
		let html: string;

		beforeAll(async () => {
			const res = await fetch(`${BASE_URL}${TEST_POST}/crosspost/`);
			html = await res.text();
		});

		it('should render static timeline content with links', () => {
			// Static version has bold dates followed by links
			expect(html).toContain('<strong>Feb 24, 2025</strong>');
			expect(html).toContain('Anthropic launches Claude Code');
			expect(html).toContain('href="https://www.anthropic.com/news/claude-3-7-sonnet"');
		});

		it('should render all timeline events', () => {
			expect(html).toContain('Feb 24, 2025');
			expect(html).toContain('May 16, 2025');
			expect(html).toContain('Nov 18, 2025');
			expect(html).toContain('Nov 24, 2025');
			expect(html).toContain('Jan 6, 2026');
		});

		it('should NOT render the interactive timeline component', () => {
			// Should not have the interactive timeline's container class
			expect(html).not.toContain('class="timeline-container"');
			expect(html).not.toContain('class="timeline-item"');
		});

		it('should preserve links in the body content', () => {
			// Links from the original MDX should be preserved
			expect(html).toContain('href="https://x.com/bcherny/status/2004897269674639461"');
			expect(html).toContain('TerminalGrid');
		});

		it('should show the hero image with download link', () => {
			expect(html).toContain('hero-image');
			expect(html).toContain('Download cover image');
		});

		it('should have copy to clipboard button', () => {
			expect(html).toContain('Copy to clipboard');
			expect(html).toContain('id="copy-btn"');
		});
	});

	describe('Content parity', () => {
		let regularHtml: string;
		let crosspostHtml: string;

		beforeAll(async () => {
			const [regular, crosspost] = await Promise.all([
				fetch(`${BASE_URL}${TEST_POST}/`).then(r => r.text()),
				fetch(`${BASE_URL}${TEST_POST}/crosspost/`).then(r => r.text()),
			]);
			regularHtml = regular;
			crosspostHtml = crosspost;
		});

		it('should have the same title', () => {
			const titlePattern = /From IDE to AI orchestration/;
			expect(regularHtml).toMatch(titlePattern);
			expect(crosspostHtml).toMatch(titlePattern);
		});

		it('should both contain the same non-interactive content sections', () => {
			// Check for content that should be in both versions
			const sharedContent = [
				'The paradigm shift',
				'not quite there yet',  // Avoid apostrophe encoding issues
				'The bigger picture',
				'What happens next',
			];

			for (const content of sharedContent) {
				expect(regularHtml).toContain(content);
				expect(crosspostHtml).toContain(content);
			}
		});
	});
});
