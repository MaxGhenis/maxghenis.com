/**
 * Utility functions for preparing crosspost content for clipboard copy.
 * These transformations help content paste correctly into platforms like Medium.
 */

/**
 * Prepares HTML content for clipboard copy by applying platform-friendly transformations:
 * - Replaces images with [Image: alt text] placeholders
 * - Unwraps <p> elements nested inside <li> (Medium renders these incorrectly)
 * - Removes wrapper <div> elements (Medium renders these as blockquotes)
 * - Converts relative URLs to absolute
 */
export function prepareContentForCopy(element: Element, baseUrl: string): Element {
	const clone = element.cloneNode(true) as Element;

	// Fix link URLs (in case any are relative)
	clone.querySelectorAll('a').forEach((a) => {
		const href = a.getAttribute('href');
		if (href && href.startsWith('/')) {
			a.setAttribute('href', baseUrl + href);
		}
	});

	// Remove images from the copy (platforms don't support pasted HTML images)
	// Users should add images manually using each platform's upload
	clone.querySelectorAll('img').forEach((img) => {
		const alt = img.getAttribute('alt') || 'Image';
		const placeholder = document.createElement('p');
		placeholder.innerHTML = `<em>[Image: ${alt}]</em>`;
		placeholder.style.color = '#666';
		img.replaceWith(placeholder);
	});

	// Fix list structure: unwrap <p> inside <li> (Medium misinterprets nested structure)
	clone.querySelectorAll('li > p').forEach((p) => {
		const li = p.parentElement;
		if (li && p.parentElement === li) {
			// Move p's children directly into li, remove the p wrapper
			while (p.firstChild) {
				li.insertBefore(p.firstChild, p);
			}
			p.remove();
		}
	});

	// Remove any wrapper divs that might cause formatting issues
	clone.querySelectorAll('div').forEach((div) => {
		// Replace div with its children
		const parent = div.parentElement;
		if (parent) {
			while (div.firstChild) {
				parent.insertBefore(div.firstChild, div);
			}
			div.remove();
		}
	});

	return clone;
}
