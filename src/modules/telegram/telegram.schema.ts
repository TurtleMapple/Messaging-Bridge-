import { z } from '@hono/zod-openapi'

/**
 * Validation schema for sending a Telegram message.
 * Enforces snake_case for API consistency.
 */
export const sendTelegramSchema = z.object({
  /**
   * Unique identifier for the target chat or username of the target channel
   */
  chat_id: z.union([z.string(), z.number()]).describe('Unique identifier for the target chat').openapi({
    example: '123456789',
    description: 'Unique identifier for the target chat or username'
  }),
  
  /**
   * Text of the message to be sent
   */
  content: z.string()
    .min(1, 'content is required')
    .max(4096, 'content is too long (max 4096 chars)').openapi({
      example: 'Hello from Bridge!',
      description: 'Text of the message to be sent'
    }),
  
  /**
   * Mode for parsing entities in the message text
   */
  parse_mode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional().openapi({
    example: 'HTML',
    description: 'Mode for parsing entities in the message text'
  }),
}).openapi('SendTelegramRequest')

export type SendTelegramDto = z.infer<typeof sendTelegramSchema>

/**
 * Schema for Telegram API response mapping.
 */
export const sendTelegramResponseSchema = z.object({
  message_id: z.number().openapi({ example: 1234 }),
  chat_id: z.union([z.string(), z.number()]).openapi({ example: '123456789' }),
}).openapi('SendTelegramResponse')
