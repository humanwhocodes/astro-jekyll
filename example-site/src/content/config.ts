import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z
			.string()
			.optional()
			.transform((str) => str ? new Date(str + " 00:00:00") : undefined),
		tags: z.array(z.string()).optional(),
		categories: z.array(z.string()).optional(),
		permalink: z.string().optional(),
		published: z.boolean().optional(),
		// Common Astro schemas
		pubDate: z
			.string()
			.or(z.date())
			.optional()
			.transform((val) => val ? new Date(val) : undefined),
		updatedDate: z
			.string()
			.optional()
			.transform((str) => (str ? new Date(str) : undefined)),
		heroImage: z.string().optional(),
	}),
});

export const collections = { blog };
