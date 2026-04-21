import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { sendWhatsAppSchema } from './whatsapp.schema'
import { sendWhatsAppMessage, getWhatsAppStatus } from './whatsapp.service'
import { successResponse } from '../../common/utils/response'
import { ValidationError } from '../../common/utils/errors'

const whatsappRouter = new Hono()

// GET /whatsapp/status — check connection & get QR code if not connected
whatsappRouter.get('/status', (c) => {
  const status = getWhatsAppStatus()
  return c.json(
    successResponse(status, status.connected ? 'WhatsApp connected' : 'Waiting for QR scan'),
  )
})

// POST /whatsapp/send — send a WhatsApp message
whatsappRouter.post(
  '/send',
  zValidator('json', sendWhatsAppSchema, (result) => {
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
    const result = await sendWhatsAppMessage(dto)
    return c.json(successResponse(result, 'Message sent via WhatsApp'), 200)
  }
)

export { whatsappRouter }
