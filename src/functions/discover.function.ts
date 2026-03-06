import { prisma } from '#/db'
import { firecrawl } from '#/lib/firecrawl'
import type { BulkScrapeProgress } from '#/lib/types'
import { authFnMiddleware } from '#/middlewares/auth.middleware'
import { searchSchema } from '#/schemas/discover.schema'
import { extractSchema } from '#/schemas/imports.schema'
import type { SearchResultWeb } from '@mendable/firecrawl-js'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

export const searchWebFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(searchSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.search(data.query, {
      limit: 15,
    })

    return result.web?.map((item) => ({
      url: (item as SearchResultWeb).url,
      title: (item as SearchResultWeb).title,
      description: (item as SearchResultWeb).description,
    }))
  })

export const bulkScrapeUrlsFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(
    z.object({
      urls: z.array(z.url()),
    }),
  )
  .handler(async function* ({ data, context }) {
    const total = data.urls.length
    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i]

      const item = await prisma.savedItem.create({
        data: {
          url: url,
          userId: context.session.user.id,
          status: 'PENDING',
        },
      })

      let status: BulkScrapeProgress['status'] = 'success'

      try {
        const result = await firecrawl.scrape(url, {
          formats: [
            'markdown',
            {
              type: 'json',
              schema: extractSchema,
              prompt:
                'please extract the author and also publishedAt timestamp',
            },
          ],
          location: { country: 'US', languages: ['en'] },
          onlyMainContent: true,
          proxy: 'auto',
        })

        const jsonData = result.json as z.infer<typeof extractSchema>

        let publishedAt = null

        if (jsonData.publishedAt) {
          const parsed = new Date(jsonData.publishedAt)

          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed
          }
        }

        await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            title: result.metadata?.title || null,
            content: result.markdown || null,
            ogImage: result.metadata?.ogImage || null,
            author: jsonData.author || null,
            publishedAt: publishedAt,
            status: 'COMPLETED',
          },
        })
      } catch {
        status = 'failed'
        await prisma.savedItem.update({
          where: {
            id: item.id,
          },
          data: {
            status: 'FAILED',
          },
        })
      }

      const progress: BulkScrapeProgress = {
        completed: i + 1,
        total: total,
        url: url,
        status: status,
      }

      yield progress
    }
  })
