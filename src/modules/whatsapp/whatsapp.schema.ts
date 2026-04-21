import { z } from 'zod'

export const sendWhatsAppSchema = z.object({
  to: z
    .string()
    .min(1, 'Recipient number is required')
    .regex(/^\d+$/, 'Phone number must contain only digits (e.g. 628123456789)'),
  message: z.string().min(1, 'message is required'),
})

export type SendWhatsAppDto = z.infer<typeof sendWhatsAppSchema>

export const whatsAppStatusSchema = z.object({
  connected: z.boolean(),
  qr: z.string().optional(),
})
