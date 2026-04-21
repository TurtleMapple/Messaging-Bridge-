import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { sendEmailSchema } from './email.schema'
import { EmailService } from './email.service'
import { ResendProvider } from './providers/resend.provider'
import { config } from '../../common/config/env'
import { successResponse } from '../../common/utils/response'
import { ValidationError } from '../../common/utils/errors'

const emailRouter = new Hono()

// Dependency Injection: Initialize the provider and service
const emailProvider = new ResendProvider(config.email.apiKey)
const emailService = new EmailService(emailProvider)

emailRouter.post(
  '/send',
  zValidator('json', sendEmailSchema, (result) => {
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
    
    // Use the instantiated service
    const result = await emailService.sendEmail(dto)
    
    return c.json(successResponse(result, 'Email sent successfully'), 200)
  }
)

export { emailRouter }
