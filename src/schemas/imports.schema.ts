import { z } from 'zod'

export const urlFormSchema = z.object({
  url: z.url(),
})

export const bulkFormSchema = z.object({
  url: z.url(),
  search: z.string(),
})

export const extractSchema = z.object({
  author: z.string().nullable(),
  publishedAt: z.string().nullable(),
})

export const bulkUrlsSchema = z.object({
  urls: z.array(z.url()),
})
