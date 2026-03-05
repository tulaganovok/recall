import { ItemStatus } from '#/generated/prisma/enums'
import { z } from 'zod'

export const itemsSearchSchema = z.object({
  query: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})

export const itemIdSchema = z.object({
  id: z.string(),
})

export const aiSummaryItemSchema = z.object({
  id: z.string(),
  summary: z.string(),
})
