import { prisma } from '#/db'
import { authFnMiddleware } from '#/middlewares/auth.middleware'
import { aiSummaryItemSchema, itemIdSchema } from '#/schemas/items.schema'
import { createClientOnlyFn, createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { generateText } from 'ai'
import { openRouter } from '#/lib/open-router'

export const getItemsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const items = await prisma.savedItem.findMany({
      where: { userId: context.session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return items
  })

export const copyItemFn = createClientOnlyFn(async (url: string) => {
  await navigator.clipboard.writeText(url)
})

export const getItemByIdFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .inputValidator(itemIdSchema)
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.findUnique({
      where: { id: data.id, userId: context.session.user.id },
    })

    if (!item) throw notFound()

    return item
  })

export const saveSummaryAndGenerateTagsFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .inputValidator(aiSummaryItemSchema)
  .handler(async ({ context, data }) => {
    const existing = await prisma.savedItem.findUnique({
      where: {
        id: data.id,
        userId: context.session.user.id,
      },
    })

    if (!existing) throw notFound()

    const { text } = await generateText({
      model: openRouter.chat('arcee-ai/trinity-large-preview:free'),
      system: `You are a helpful assistant that extracts relevant tags from content summaries.
Extract 3-5 short, relevant tags that categorize the content.
Return ONLY a comma-separated list of tags, nothing else.
Example: technology, programming, web development, javascript`,
      prompt: `Extract tags from this summary: \n\n${data.summary}`,
    })

    const tags = text
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .slice(0, 5)

    const item = await prisma.savedItem.update({
      where: {
        userId: context.session.user.id,
        id: data.id,
      },
      data: {
        summary: data.summary,
        tags: tags,
      },
    })

    return item
  })
