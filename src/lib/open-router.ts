import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export const openRouter = createOpenRouter({ apiKey: process.env.AI_KEY })
