import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppService } from '../whatsapp.service';
import { whatsAppConnection } from '../whatsapp.connection';
import { ServiceUnavailableError, MessagingError } from '../../../common/utils/errors';

vi.mock('../whatsapp.connection', () => {
  return {
    whatsAppConnection: {
      getSocket: vi.fn(),
      getStatus: vi.fn(),
    }
  };
});

describe('WhatsAppService', () => {
  let service: WhatsAppService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WhatsAppService();
  });

  describe('getStatus()', () => {
    it('should return status from connection singleton', () => {
      const mockStatus = { state: 'READY', updatedAt: new Date() };
      vi.mocked(whatsAppConnection.getStatus).mockReturnValue(mockStatus as any);

      const result = service.getStatus();
      expect(result).toEqual(mockStatus);
    });
  });

  describe('sendMessage()', () => {
    it('should throw ServiceUnavailableError if socket is missing or state is not READY', async () => {
      // Arrange
      vi.mocked(whatsAppConnection.getSocket).mockReturnValue(null);
      vi.mocked(whatsAppConnection.getStatus).mockReturnValue({ state: 'DISCONNECTED' } as any);

      // Act & Assert
      await expect(service.sendMessage({ recipient: '62812345678', content: 'hi' }))
        .rejects.toThrow(ServiceUnavailableError);
    });

    it('should send message successfully when socket is ready', async () => {
      // Arrange
      const mockSocket = {
        sendMessage: vi.fn().mockResolvedValue({ key: { id: 'msg-123' } })
      };
      vi.mocked(whatsAppConnection.getSocket).mockReturnValue(mockSocket as any);
      vi.mocked(whatsAppConnection.getStatus).mockReturnValue({ state: 'READY' } as any);

      const dto = { recipient: '62812345678', content: 'Hello WhatsApp' };

      // Act
      const result = await service.sendMessage(dto);

      // Assert
      expect(result).toEqual({ id: 'msg-123' });
      expect(mockSocket.sendMessage).toHaveBeenCalledWith(
        '62812345678@s.whatsapp.net', 
        { text: 'Hello WhatsApp' }
      );
    });

    it('should wrap socket errors in MessagingError', async () => {
      // Arrange
      const mockSocket = {
        sendMessage: vi.fn().mockRejectedValue(new Error('Baileys error'))
      };
      vi.mocked(whatsAppConnection.getSocket).mockReturnValue(mockSocket as any);
      vi.mocked(whatsAppConnection.getStatus).mockReturnValue({ state: 'READY' } as any);

      // Act & Assert
      await expect(service.sendMessage({ recipient: '62812345678', content: 'hi' }))
        .rejects.toThrow('WhatsApp delivery failure: Baileys error');
    });

    it('should throw MessagingError if result is null', async () => {
      // Arrange
      const mockSocket = {
        sendMessage: vi.fn().mockResolvedValue(null)
      };
      vi.mocked(whatsAppConnection.getSocket).mockReturnValue(mockSocket as any);
      vi.mocked(whatsAppConnection.getStatus).mockReturnValue({ state: 'READY' } as any);

      // Act & Assert
      await expect(service.sendMessage({ recipient: '62812345678', content: 'hi' }))
        .rejects.toThrow('Failed to send WhatsApp message');
    });
  });
});
