import app from './index'
import { whatsAppConnection } from './modules/whatsapp/whatsapp.connection'
import { config } from './common/config/env'

/**
 * Bootstrap the application, initialize infrastructure, and start the server.
 */
async function bootstrap() {
  try {
    // 1. Initialize WhatsApp (Baileys) connection
    console.log('🔌 Initializing WhatsApp (Baileys)...')
    await whatsAppConnection.init()

    // 2. Start Bun server
    const server = Bun.serve({
      port: config.app.port,
      fetch: app.fetch,
    })

    console.log(`🚀 Hono Messaging Bridge running on http://localhost:${server.port}`)
    console.log(`📖 API Reference: http://localhost:${server.port}/reference`)
  } catch (error) {
    console.error('❌ Failed to bootstrap application:', error)
    process.exit(1)
  }
}

// Start the bootstrap sequence
bootstrap()
