import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Auth
  API_KEY: z.string().min(1, 'API_KEY is required'),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email'),

  // WhatsApp (Baileys - no token, uses QR session)
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const env = parsed.data

export const config = {
  app: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  },
  auth: {
    apiKey: env.API_KEY,
  },
  telegram: {
    token: env.TELEGRAM_BOT_TOKEN,
  },
  email: {
    apiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
  },
} as const
