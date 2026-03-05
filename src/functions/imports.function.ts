import { prisma } from '#/db'
import { firecrawl } from '#/lib/firecrawl'
import { authFnMiddleware } from '#/middlewares/auth.middleware'
import {
  bulkFormSchema,
  bulkUrlsSchema,
  extractSchema,
  urlFormSchema,
} from '#/schemas/imports.schema'
import { createServerFn } from '@tanstack/react-start'
import type z from 'zod'

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(urlFormSchema)
  .handler(async ({ data, context }) => {
    const newSavedItem = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: context.session.user.id,
        status: 'PROCESSING',
      },
    })

    try {
      const result = await firecrawl.scrape(data.url, {
        formats: ['markdown', { type: 'json', schema: extractSchema }],
        onlyMainContent: true,
        proxy: 'auto',
        location: { country: 'US', languages: ['en'] },
      })

      const jsonData = result.json as z.infer<typeof extractSchema>

      const updatedItem = await prisma.savedItem.update({
        where: { id: newSavedItem.id },
        data: {
          title: result.metadata?.title ?? null,
          content: result.markdown,
          ogImage: result.metadata?.ogImage ?? null,
          author: jsonData.author,
          publishedAt: jsonData.publishedAt
            ? new Date(jsonData.publishedAt)
            : null,
          status: 'COMPLETED',
        },
      })

      return updatedItem
    } catch (error) {
      const failedItem = await prisma.savedItem.update({
        where: { id: newSavedItem.id },
        data: { status: 'FAILED' },
      })

      return failedItem
    }
  })

export const mapUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(bulkFormSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.map(data.url, {
      limit: 25,
      search: data.search,

      location: { country: 'US', languages: ['en'] },
    })

    return result.links
  })

export const bulkScrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(bulkUrlsSchema)
  .handler(async ({ data, context }) => {
    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i]

      const newSavedItem = await prisma.savedItem.create({
        data: { url, userId: context.session.user.id, status: 'PENDING' },
      })

      try {
        const result = await firecrawl.scrape(url, {
          formats: ['markdown', { type: 'json', schema: extractSchema }],
          onlyMainContent: true,
          proxy: 'auto',
          location: { country: 'US', languages: ['en'] },
        })

        const jsonData = result.json as z.infer<typeof extractSchema>

        await prisma.savedItem.update({
          where: { id: newSavedItem.id },
          data: {
            title: result.metadata?.title ?? null,
            content: result.markdown,
            ogImage: result.metadata?.ogImage ?? null,
            author: jsonData.author,
            publishedAt: jsonData.publishedAt
              ? new Date(jsonData.publishedAt)
              : null,
            status: 'COMPLETED',
          },
        })
      } catch (error) {
        await prisma.savedItem.update({
          where: { id: newSavedItem.id },
          data: { status: 'FAILED' },
        })
      }
    }
  })
