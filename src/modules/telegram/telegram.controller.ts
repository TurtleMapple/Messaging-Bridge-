import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { sendTelegramSchema } from './telegram.schema'
import { TelegramService } from './telegram.service'
import { successResponse } from '../../common/utils/response'
import { ValidationError } from '../../common/utils/errors'

const telegramRouter = new Hono()

// Dependency Injection: Initialize the service
const telegramService = new TelegramService()

/**
 * Endpoint to send a message via Telegram Bot.
 * Uses the snake_case schema for API consistency.
 */
telegramRouter.post(
  '/send',
  zValidator('json', sendTelegramSchema, (result) => {
    if (!result.success) {
      const data = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }))
      throw new ValidationError('Validation failed', data)
    }
  }),
  async (c) => {
    const dto = c.req.valid('json')
    
    // Call the service method
    const result = await telegramService.sendMessage(dto)
    
    return c.json(successResponse(result, 'Message sent via Telegram'), 200)
  }
)

export { telegramRouter }
