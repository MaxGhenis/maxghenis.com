import { type CollectionEntry, getCollection } from 'astro:content';

/**
 * Blog posts without `draft: true`. Drafts still render at their URLs (marked
 * noindex) so preview links work, but every listing and feed reads from here:
 * the home page, /blog, and rss.xml. The sitemap drops them by their noindex
 * tag (see src/lib/sitemap-filter.mjs).
 */
export function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
	return getCollection('blog', ({ data }) => !data.draft);
}
