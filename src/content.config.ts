import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			category: z.enum(['blog', 'voter-guide']).optional().default('blog'),
		}),
});

// Election collection - index pages for each election
const elections = defineCollection({
	loader: glob({ base: './src/content/elections', pattern: '**/index.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		electionDate: z.coerce.date(),
		location: z.string(), // e.g., "California", "San Francisco"
		updatedDate: z.coerce.date().optional(),
	}),
});

// Individual recommendations - one per ballot measure or race
const recommendations = defineCollection({
	loader: glob({ base: './src/content/elections', pattern: '**/[!index]*.{md,mdx}' }),
	schema: z.object({
		title: z.string(), // e.g., "Reproductive Rights"
		measureId: z.string(), // e.g., "Prop 1", "Governor"
		position: z.enum(['yes', 'no', 'candidate']),
		candidate: z.string().optional(),
		summary: z.string(),
		election: z.string(), // slug of parent election, e.g., "2022-11-california"
	}),
});

export const collections = { blog, elections, recommendations };
