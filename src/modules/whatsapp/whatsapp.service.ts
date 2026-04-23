import { whatsAppConnection } from './whatsapp.connection'
import { MessagingError, ServiceUnavailableError } from '../../common/utils/errors'
import type { SendWhatsAppDto, WhatsAppStatus } from './whatsapp.schema'

/**
 * WhatsAppService orchestrates sending messages and retrieving status.
 * Follows the same class-based pattern as Email and Telegram modules.
 */
export class WhatsAppService {
  /**
   * Retrieves the current connection status and metadata.
   */
  public getStatus(): WhatsAppStatus {
    return whatsAppConnection.getStatus()
  }

  /**
   * Sends a WhatsApp message using the active Baileys socket.
   */
  public async sendMessage(dto: SendWhatsAppDto): Promise<{ id: string }> {
    const socket = whatsAppConnection.getSocket();
    const { state } = whatsAppConnection.getStatus();

    if (!socket || state !== 'READY') {
      throw new ServiceUnavailableError(
        'WhatsApp is not connected. Check GET /whatsapp/status for QR code.'
      );
    }

    try {
      const jid = `${dto.recipient}@s.whatsapp.net`;
      const result = await socket.sendMessage(jid, { text: dto.content });

      if (!result) {
        throw new MessagingError('Failed to send WhatsApp message');
      }

      return { id: result.key.id ?? 'unknown' };
    } catch (error: any) {
      if (error instanceof MessagingError || error instanceof ServiceUnavailableError) {
        throw error;
      }
      throw new MessagingError(`WhatsApp delivery failure: ${error.message}`);
    }
  }
}
