import { OpenAPIHono } from '@hono/zod-openapi'
import { logger } from 'hono/logger'
import { apiReference } from '@scalar/hono-api-reference'
import { apiKeyAuth } from './common/middleware/auth'
import { errorHandler } from './common/middleware/error-handler'
import { telegramRouter } from './modules/telegram/telegram.controller'
import { emailRouter } from './modules/email/email.controller'
import { whatsappRouter } from './modules/whatsapp/whatsapp.controller'

const app = new OpenAPIHono()

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use('*', logger())

// ─── Health Check (no auth) ──────────────────────────────────────────────────
app.get('/', (c) => c.json({ status: 'ok', service: 'Hono Messaging Bridge' }))

// ─── OpenAPI Setup ───────────────────────────────────────────────────────────
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Hono Messaging Bridge',
    description: 'API for bridging messages across multiple platforms (WhatsApp, Telegram, Email)',
  },
})

// ─── API Reference UI (no auth) ─────────────────────────────────────────────
app.get(
  '/reference',
  apiReference({
    theme: 'purple',
    spec: {
      url: '/doc',
    },
  })
)

// ─── Protected API Routes ────────────────────────────────────────────────────
const api = new OpenAPIHono()
api.use('*', apiKeyAuth)

// Register sub-routers
api.route('/telegram', telegramRouter)
api.route('/email', emailRouter)
api.route('/whatsapp', whatsappRouter)

// Register protected API group
app.route('/', api)

// ─── Global Error Handler ────────────────────────────────────────────────────
app.onError(errorHandler)

export default app
