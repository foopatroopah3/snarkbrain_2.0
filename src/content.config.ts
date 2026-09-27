import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"
import { TOPIC_SLUGS, VERDICT_NAMES } from "./site"

const articles = defineCollection({
  loader: glob({
    pattern: "*/index.md",
    base: "./content/blog",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      claim: z.string(),
      claimant: z.string().optional(),
      verdict: z.enum(VERDICT_NAMES),
      tags: z.array(z.enum(TOPIC_SLUGS)).min(1),
      featuredImage: image(),
      corrections: z.array(z.object({ date: z.coerce.date(), note: z.string() })).default([]),
    }),
})

export const collections = { articles }
