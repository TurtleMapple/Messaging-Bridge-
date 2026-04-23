import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { sendEmailSchema, sendEmailResponseSchema } from './email.schema'
import { EmailService } from './email.service'
import { ResendProvider } from './providers/resend.provider'
import { config } from '../../common/config/env'
import { successResponse } from '../../common/utils/response'
import { ValidationError } from '../../common/utils/errors'

const emailRouter = new OpenAPIHono({
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

// Dependency Injection: Initialize the provider and service
const emailProvider = new ResendProvider(config.email.apiKey)
const emailService = new EmailService(emailProvider)

const sendRoute = createRoute({
  method: 'post',
  path: '/send',
  tags: ['Email'],
  summary: 'Send email via Resend',
  description: 'Endpoint to send an email using the Resend provider. Validates input using a Zod schema.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: sendEmailSchema
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
            data: sendEmailResponseSchema
          })
        }
      },
      description: 'Email successfully sent'
    },
    400: {
      description: 'Validation failed'
    },
    502: {
      description: 'Resend API error'
    }
  }
})

emailRouter.openapi(sendRoute, async (c) => {
  const dto = c.req.valid('json')
  
  // Call the service method
  const result = await emailService.sendEmail(dto)
  
  return c.json(successResponse(result, 'Email sent successfully') as any, 200)
})

export { emailRouter }
