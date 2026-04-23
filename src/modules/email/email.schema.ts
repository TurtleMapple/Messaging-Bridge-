import { z } from '@hono/zod-openapi'

/**
 * Normalized validation schema for an Email Object.
 * Enforces snake_case for multi-word attributes.
 */
export const sendEmailSchema = z.object({
  /**
   * Recipient(s) of the email. Resolves to 1:N EMAIL_RECIPIENTS relation.
   */
  to: z.union([
    z.string().email('Invalid email address'),
    z.array(z.string().email('Invalid email address')).min(1),
  ]).openapi({
    example: 'user@example.com',
    description: 'Email address or array of email addresses'
  }),
  
  /**
   * The subject line of the email.
   */
  subject: z.string().min(1, 'subject is required').openapi({
    example: 'Hello from Bridge!',
    description: 'Subject of the email'
  }),
  
  /**
   * The HTML-formatted body of the email.
   */
  html_body: z.string().min(1, 'html_body is required').optional().openapi({
    example: '<h1>Welcome</h1>',
    description: 'HTML content of the email'
  }),
  
  /**
   * The plain-text fallback body of the email.
   */
  text_body: z.string().min(1).optional().openapi({
    example: 'Welcome',
    description: 'Plain text content of the email'
  }),
}).refine((data) => data.html_body || data.text_body, {
  message: 'Either html_body or text_body is required',
  path: ['html_body', 'text_body'], // highlight which fields failed
}).openapi('SendEmailRequest')

export type SendEmailDto = z.infer<typeof sendEmailSchema>

export const sendEmailResponseSchema = z.object({
  id: z.string().openapi({
    example: 'resend_id_123',
    description: 'Provider specific message ID'
  }),
}).openapi('SendEmailResponse')
