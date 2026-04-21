import { z } from 'zod'

export const sendTelegramSchema = z.object({
  chatId: z.string().min(1, 'chatId is required'),
  message: z.string().min(1, 'message is required').max(4096, 'message is too long (max 4096 chars)'),
  parseMode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional(),
})

export type SendTelegramDto = z.infer<typeof sendTelegramSchema>

export const sendTelegramResponseSchema = z.object({
  messageId: z.number(),
  chatId: z.union([z.string(), z.number()]),
})
