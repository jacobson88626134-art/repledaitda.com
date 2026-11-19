import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['chanel', 'hermes', 'louisvuitton', 'guide']),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    readingTime: z.string().default('4분'),
    image: z.string().optional(), // ← 이 줄 추가
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .default([]),
  }),
});

export const collections = { posts };