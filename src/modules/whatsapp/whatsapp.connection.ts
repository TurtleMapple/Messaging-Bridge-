import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'
import type { Boom } from '@hapi/boom'

const AUTH_FOLDER = './baileys_auth_info'

/**
 * WhatsAppConnection encapsulates the full Baileys socket lifecycle:
 * - auth state persistence
 * - QR code handling
 * - auto-reconnect on disconnect
 *
 * Single Responsibility: this class ONLY manages the connection.
 * Message sending is handled separately in whatsapp.service.ts.
 */
export class WhatsAppConnection {
  private socket: ReturnType<typeof makeWASocket> | null = null
  private store = makeInMemoryStore({})

  public connected = false
  public qrCode: string | null = null

  async init(): Promise<void> {
    const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: authState,
      printQRInTerminal: true,
    })

    this.store.bind(sock.ev)
    this.socket = sock

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        this.qrCode = qr
        this.connected = false
        console.log('📱 Scan the QR code in the terminal to connect WhatsApp')
      }

      if (connection === 'open') {
        this.connected = true
        this.qrCode = null
        console.log('✅ WhatsApp connected!')
      }

      if (connection === 'close') {
        this.connected = false
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut

        console.log(`⚠️  WhatsApp disconnected. Reconnecting: ${shouldReconnect}`)
        if (shouldReconnect) {
          this.init()
        }
      }
    })
  }

  getSocket() {
    return this.socket
  }

  getStatus() {
    return {
      connected: this.connected,
      qr: this.qrCode ?? undefined,
    }
  }
}

// Singleton instance shared across the app lifecycle
export const whatsAppConnection = new WhatsAppConnection()
