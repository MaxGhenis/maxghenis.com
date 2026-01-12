/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { prepareContentForCopy } from './crosspost-copy';

describe('prepareContentForCopy', () => {
	const baseUrl = 'https://maxghenis.com';

	beforeEach(() => {
		document.body.innerHTML = '';
	});

	describe('image handling', () => {
		it('replaces images with [Image: alt] placeholders', () => {
			document.body.innerHTML = '<div><img src="test.png" alt="Test image" /></div>';
			const result = prepareContentForCopy(document.body.querySelector('div')!, baseUrl);

			expect(result.innerHTML).toContain('[Image: Test image]');
			expect(result.querySelector('img')).toBeNull();
		});

		it('uses "Image" as default alt text when alt is missing', () => {
			document.body.innerHTML = '<div><img src="test.png" /></div>';
			const result = prepareContentForCopy(document.body.querySelector('div')!, baseUrl);

			expect(result.innerHTML).toContain('[Image: Image]');
		});
	});

	describe('list structure fix', () => {
		it('unwraps <p> nested inside <li>', () => {
			document.body.innerHTML = '<ul><li><p>Item 1</p></li><li><p>Item 2</p></li></ul>';
			const result = prepareContentForCopy(document.body.querySelector('ul')!, baseUrl);

			// Should have li elements with text directly, no p wrappers
			const lis = result.querySelectorAll('li');
			expect(lis.length).toBe(2);
			expect(lis[0].querySelector('p')).toBeNull();
			expect(lis[0].textContent).toBe('Item 1');
			expect(lis[1].querySelector('p')).toBeNull();
			expect(lis[1].textContent).toBe('Item 2');
		});

		it('preserves links inside list items after unwrapping', () => {
			document.body.innerHTML =
				'<ul><li><p><a href="/test">Link text</a></p></li></ul>';
			const result = prepareContentForCopy(document.body.querySelector('ul')!, baseUrl);

			const li = result.querySelector('li');
			expect(li?.querySelector('p')).toBeNull();
			expect(li?.querySelector('a')?.textContent).toBe('Link text');
		});

		it('handles nested content inside paragraphs in list items', () => {
			document.body.innerHTML =
				'<ul><li><p><strong>Bold</strong> and <em>italic</em></p></li></ul>';
			const result = prepareContentForCopy(document.body.querySelector('ul')!, baseUrl);

			const li = result.querySelector('li');
			expect(li?.querySelector('p')).toBeNull();
			expect(li?.querySelector('strong')?.textContent).toBe('Bold');
			expect(li?.querySelector('em')?.textContent).toBe('italic');
		});
	});

	describe('div removal', () => {
		it('removes wrapper divs, keeping their content', () => {
			document.body.innerHTML =
				'<section><div class="wrapper"><p>Content inside div</p></div></section>';
			const result = prepareContentForCopy(
				document.body.querySelector('section')!,
				baseUrl
			);

			expect(result.querySelector('div')).toBeNull();
			expect(result.querySelector('p')?.textContent).toBe('Content inside div');
		});

		it('handles nested divs', () => {
			document.body.innerHTML =
				'<section><div><div><span>Nested content</span></div></div></section>';
			const result = prepareContentForCopy(
				document.body.querySelector('section')!,
				baseUrl
			);

			expect(result.querySelector('div')).toBeNull();
			expect(result.querySelector('span')?.textContent).toBe('Nested content');
		});
	});

	describe('URL conversion', () => {
		it('converts relative URLs to absolute', () => {
			document.body.innerHTML = '<div><a href="/blog/post">Link</a></div>';
			const result = prepareContentForCopy(document.body.querySelector('div')!, baseUrl);

			expect(result.querySelector('a')?.getAttribute('href')).toBe(
				'https://maxghenis.com/blog/post'
			);
		});

		it('leaves absolute URLs unchanged', () => {
			document.body.innerHTML =
				'<div><a href="https://example.com/page">External</a></div>';
			const result = prepareContentForCopy(document.body.querySelector('div')!, baseUrl);

			expect(result.querySelector('a')?.getAttribute('href')).toBe(
				'https://example.com/page'
			);
		});
	});

	describe('combined transformations', () => {
		it('handles real-world crosspost content', () => {
			document.body.innerHTML = `
				<article>
					<div class="crosspost-static-content">
						<h2>Timeline</h2>
						<p><strong>Feb 24, 2025</strong> — <a href="/blog/claude-code">Anthropic launches Claude Code</a></p>
						<ul>
							<li><p>First item with <a href="/link1">link</a></p></li>
							<li><p>Second item</p></li>
						</ul>
						<img src="./image.png" alt="Timeline screenshot" />
					</div>
				</article>
			`;
			const result = prepareContentForCopy(
				document.body.querySelector('article')!,
				baseUrl
			);

			// No divs
			expect(result.querySelector('div')).toBeNull();

			// No images, but placeholder exists
			expect(result.querySelector('img')).toBeNull();
			expect(result.innerHTML).toContain('[Image: Timeline screenshot]');

			// List items have no p wrappers
			const lis = result.querySelectorAll('li');
			lis.forEach((li) => {
				expect(li.querySelector('p')).toBeNull();
			});

			// Links are preserved
			expect(result.querySelector('a[href="https://maxghenis.com/blog/claude-code"]')).not.toBeNull();
		});
	});
});
