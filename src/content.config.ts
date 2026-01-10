import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const recommendationSchema = z.object({
	id: z.string(),
	title: z.string(),
	position: z.enum(['yes', 'no', 'candidate']),
	candidate: z.string().optional(),
	summary: z.string(),
});

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			category: z.enum(['blog', 'voter-guide']).optional().default('blog'),
			// Structured recommendations for voter guides
			recommendations: z.array(recommendationSchema).optional(),
		}),
});

export const collections = { blog };
