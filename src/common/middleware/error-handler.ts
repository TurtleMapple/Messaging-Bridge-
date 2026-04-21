import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { MessagingError } from '../utils/errors'
import { failResponse, errorResponse } from '../utils/response'
import { config } from '../config/env'

export const errorHandler = (err: Error, c: Context) => {
  const isDev = config.app.nodeEnv === 'development'
  const stack = isDev ? err.stack : undefined

  // 1. Handle our custom MessagingError hierarchy
  if (err instanceof MessagingError) {
    const isClientError = err.statusCode >= 400 && err.statusCode < 500

    if (isClientError) {
      return c.json(
        {
          ...failResponse(err.message, err.errorCode, err.data),
          ...(stack && { stack }),
        },
        err.statusCode as any
      )
    }

    return c.json(
      {
        ...errorResponse(err.message, err.errorCode, err.data),
        ...(stack && { stack }),
      },
      err.statusCode as any
    )
  }

  // 2. Handle Hono's built-in HTTPException
  if (err instanceof HTTPException) {
    return c.json(
      {
        ...failResponse(err.message, 'CLIENT_ERROR'),
        ...(stack && { stack }),
      },
      err.status
    )
  }

  // 3. Handle Generic Errors
  console.error('[Unhandled Error]', err)
  return c.json(
    {
      ...errorResponse('Internal Server Error', 'INTERNAL_SERVER_ERROR'),
      ...(stack && { stack }),
    },
    500
  )
}
