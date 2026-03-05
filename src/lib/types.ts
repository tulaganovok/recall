import type { itemsSearchSchema } from '#/schemas/items.schema'
import type { LucideIcon } from 'lucide-react'
import type z from 'zod'

export interface NavItems {
  title: string
  to: string
  icon: LucideIcon
  activeOptions: { exact: boolean }
}

export type ItemsSearchSchema = z.infer<typeof itemsSearchSchema>

export interface BulkScrapeProgress {
  completed: number
  total: number
  url: string
  status: 'success' | 'failed'
}
