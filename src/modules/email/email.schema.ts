import { z } from 'zod'

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
  ]),
  
  /**
   * The subject line of the email.
   */
  subject: z.string().min(1, 'subject is required'),
  
  /**
   * The HTML-formatted body of the email.
   */
  html_body: z.string().min(1, 'html_body is required').optional(),
  
  /**
   * The plain-text fallback body of the email.
   */
  text_body: z.string().min(1).optional(),
}).refine((data) => data.html_body || data.text_body, {
  message: 'Either html_body or text_body is required',
  path: ['html_body', 'text_body'], // highlight which fields failed
})

export type SendEmailDto = z.infer<typeof sendEmailSchema>

export const sendEmailResponseSchema = z.object({
  id: z.string(),
})
