import { whatsAppConnection } from './whatsapp.connection'
import { MessagingError, ServiceUnavailableError } from '../../common/utils/errors'
import type { SendWhatsAppDto } from './whatsapp.schema'

export function getWhatsAppStatus() {
  return whatsAppConnection.getStatus()
}

export async function sendWhatsAppMessage(dto: SendWhatsAppDto): Promise<{ id: string }> {
  const socket = whatsAppConnection.getSocket()

  if (!socket || !whatsAppConnection.connected) {
    throw new ServiceUnavailableError(
      'WhatsApp is not connected. Check GET /whatsapp/status for QR code.',
    )
  }

  const jid = `${dto.to}@s.whatsapp.net`
  const result = await socket.sendMessage(jid, { text: dto.message })

  if (!result) {
    throw new MessagingError('Failed to send WhatsApp message')
  }

  return { id: result.key.id ?? 'unknown' }
}
