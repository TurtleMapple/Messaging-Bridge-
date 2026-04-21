import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { apiReference } from '@scalar/hono-api-reference'
import { apiKeyAuth } from './common/middleware/auth'
import { errorHandler } from './common/middleware/error-handler'
import { telegramRouter } from './modules/telegram/telegram.controller'
import { emailRouter } from './modules/email/email.controller'
import { whatsappRouter } from './modules/whatsapp/whatsapp.controller'
import { NotFoundError } from './common/utils/errors'

const app = new Hono()

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use('*', logger())

// ─── Health Check (no auth) ──────────────────────────────────────────────────
app.get('/', (c) => c.json({ status: 'ok', service: 'Hono Messaging Bridge' }))

// ─── API Reference UI (no auth) ─────────────────────────────────────────────
app.get(
  '/reference',
  apiReference({
    theme: 'purple',
    spec: {
      content: {
        openapi: '3.0.0',
        info: { title: 'Hono Messaging Bridge', version: '1.0.0' },
        components: {
          securitySchemes: {
            ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
          },
        },
        security: [{ ApiKeyAuth: [] }],
        paths: {
          '/telegram/send': {
            post: {
              tags: ['Telegram'],
              summary: 'Send Telegram message',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['chatId', 'message'],
                      properties: {
                        chatId: { type: 'string', example: '123456789' },
                        message: { type: 'string', example: 'Hello from Hono!' },
                        parseMode: { type: 'string', enum: ['HTML', 'Markdown', 'MarkdownV2'] },
                      },
                    },
                  },
                },
              },
              responses: { '200': { description: 'Message sent' }, '401': { description: 'Unauthorized' }, '502': { description: 'Telegram API error' } },
            },
          },
          '/email/send': {
            post: {
              tags: ['Email'],
              summary: 'Send email via Resend',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['to', 'subject'],
                      properties: {
                        to: { oneOf: [{ type: 'string', example: 'user@example.com' }, { type: 'array', items: { type: 'string' } }] },
                        subject: { type: 'string', example: 'Hello!' },
                        html: { type: 'string', example: '<h1>Hello!</h1>' },
                        text: { type: 'string', example: 'Hello!' },
                      },
                    },
                  },
                },
              },
              responses: { '200': { description: 'Email sent' }, '401': { description: 'Unauthorized' }, '502': { description: 'Resend API error' } },
            },
          },
          '/whatsapp/status': {
            get: {
              tags: ['WhatsApp'],
              summary: 'Check WhatsApp connection status',
              responses: { '200': { description: 'Connection status + QR if disconnected' } },
            },
          },
          '/whatsapp/send': {
            post: {
              tags: ['WhatsApp'],
              summary: 'Send WhatsApp message via Baileys',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      required: ['to', 'message'],
                      properties: {
                        to: { type: 'string', example: '628123456789' },
                        message: { type: 'string', example: 'Hello from Hono!' },
                      },
                    },
                  },
                },
              },
              responses: { '200': { description: 'Message sent' }, '401': { description: 'Unauthorized' }, '502': { description: 'WhatsApp error' } },
            },
          },
        },
      },
    },
  })
)

// ─── Protected API Routes ────────────────────────────────────────────────────
const api = new Hono()
api.use('*', apiKeyAuth)

api.route('/telegram', telegramRouter)
api.route('/email', emailRouter)
api.route('/whatsapp', whatsappRouter)

app.route('/', api)

// ─── Global Error Handler ────────────────────────────────────────────────────
app.onError(errorHandler)

export default app
