import { createStart } from '@tanstack/react-start'
import { authReqMiddleware } from './middlewares/auth.middleware'

export const startInstance = createStart(() => {
  return { requestMiddleware: [authReqMiddleware] }
})
