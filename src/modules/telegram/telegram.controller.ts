import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { sendTelegramSchema } from './telegram.schema'
import { sendTelegramMessage } from './telegram.service'
import { successResponse } from '../../common/utils/response'
import { ValidationError } from '../../common/utils/errors'

const telegramRouter = new Hono()

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
    const result = await sendTelegramMessage(dto)
    return c.json(successResponse(result, 'Message sent via Telegram'), 200)
  }
)

export { telegramRouter }
