import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { sendTelegramSchema, sendTelegramResponseSchema } from './telegram.schema'
import { TelegramService } from './telegram.service'
import { successResponse } from '../../common/utils/response'
import { ValidationError } from '../../common/utils/errors'

const telegramRouter = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      const data = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }))
      throw new ValidationError('Validation failed', data)
    }
  }
})

// Dependency Injection: Initialize the service
const telegramService = new TelegramService()

const sendRoute = createRoute({
  method: 'post',
  path: '/send',
  tags: ['Telegram'],
  summary: 'Send a Telegram message',
  description: 'Endpoint to send a message via Telegram Bot. Uses the snake_case schema for API consistency.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: sendTelegramSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('success'),
            message: z.string(),
            data: sendTelegramResponseSchema
          })
        }
      },
      description: 'Message sent via Telegram'
    },
    400: {
      description: 'Validation failed'
    },
    502: {
      description: 'Telegram API error'
    }
  }
})

telegramRouter.openapi(sendRoute, async (c) => {
  const dto = c.req.valid('json')
  
  // Call the service method
  const result = await telegramService.sendMessage(dto)
  
  return c.json(successResponse(result, 'Message sent via Telegram') as any, 200)
})

export { telegramRouter }
