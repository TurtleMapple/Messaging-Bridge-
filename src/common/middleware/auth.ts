import { createMiddleware } from 'hono/factory'
import { config } from '../config/env'
import { UnauthorizedError } from '../utils/errors'

export const apiKeyAuth = createMiddleware(async (c, next) => {
  const apiKey = c.req.header('X-API-Key')

  if (!apiKey || apiKey !== config.auth.apiKey) {
    throw new UnauthorizedError()
  }

  await next()
})
