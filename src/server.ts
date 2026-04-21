import app from './index'
import { initWhatsApp } from './modules/whatsapp/whatsapp.service'
import { config } from './common/config/env'

// ─── Bootstrap WhatsApp connection ───────────────────────────────────────────
console.log('🔌 Initializing WhatsApp (Baileys)...')
await initWhatsApp()

// ─── Start Bun server ─────────────────────────────────────────────────────────
const server = Bun.serve({
  port: config.app.port,
  fetch: app.fetch,
})

console.log(`🚀 Hono Messaging Bridge running on http://localhost:${server.port}`)
console.log(`📖 API Reference: http://localhost:${server.port}/reference`)
