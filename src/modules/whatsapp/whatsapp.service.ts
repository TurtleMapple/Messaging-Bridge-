import { whatsAppConnection } from './whatsapp.connection'
import { MessagingError, ServiceUnavailableError } from '../../common/utils/errors'
import type { SendWhatsAppDto } from './whatsapp.schema'

export function getWhatsAppStatus() {
  return whatsAppConnection.getStatus()
}

export async function sendWhatsAppMessage(dto: SendWhatsAppDto): Promise<{ id: string }> {
  const socket = whatsAppConnection.getSocket();
  const { state } = whatsAppConnection.getStatus();

  if (!socket || state !== 'READY') {
    throw new ServiceUnavailableError(
      'WhatsApp is not connected. Check GET /whatsapp/status for QR code.'
    );
  }

  const jid = `${dto.recipient}@s.whatsapp.net`;
  const result = await socket.sendMessage(jid, { text: dto.content });

  if (!result) {
    throw new MessagingError('Failed to send WhatsApp message');
  }

  return { id: result.key.id ?? 'unknown' };
}
