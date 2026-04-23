import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// ─── Mocking Environment Config ─────────────────────────────────────────────
vi.mock('../../../common/config/env', () => ({
  config: {
    app: {
      nodeEnv: 'development'
    }
  }
}));

// ─── Mocking Dependencies ───────────────────────────────────────────────────
const { mockGetStatus, mockSendMessage } = vi.hoisted(() => ({
  mockGetStatus: vi.fn(),
  mockSendMessage: vi.fn(),
}));

vi.mock('../whatsapp.service', () => {
  return {
    WhatsAppService: class {
      getStatus = mockGetStatus;
      sendMessage = mockSendMessage;
    }
  };
});

// Mocking Connection singleton directly
vi.mock('../whatsapp.connection', () => {
  return {
    whatsAppConnection: {
      init: vi.fn().mockResolvedValue(undefined),
      getStatus: vi.fn(), // We use service in router, but just in case
    }
  };
});

import { whatsappRouter } from '../whatsapp.controller';
import { errorHandler } from '../../../common/middleware/error-handler';
import { whatsAppConnection } from '../whatsapp.connection';

describe('WhatsApp Controller (Integration)', () => {
  const app = new Hono();
  app.onError(errorHandler);
  app.route('/whatsapp', whatsappRouter);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /whatsapp/status', () => {
    it('should return 200 and success status', async () => {
      // Arrange
      mockGetStatus.mockReturnValue({
        state: 'READY',
        info: { pushName: 'Tester', platform: 'web' },
        updatedAt: new Date()
      });

      // Act
      const res = await app.request('/whatsapp/status');

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('success');
      expect(body.data.state).toBe('READY');
      expect(body.message).toBe('WhatsApp terhubung dan siap digunakan');
    });
  });

  describe('POST /whatsapp/send', () => {
    it('should return 200 when sending is successful', async () => {
      // Arrange
      mockSendMessage.mockResolvedValue({ id: 'wa-msg-123' });
      const payload = { recipient: '62812345678', content: 'Integration Test' };

      // Act
      const res = await app.request('/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Assert
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.id).toBe('wa-msg-123');
      expect(mockSendMessage).toHaveBeenCalledWith(payload);
    });

    it('should return 400 when validation fails (invalid phone format)', async () => {
      // Arrange: non-numeric phone
      const payload = { recipient: '+628123', content: 'Hi' };

      // Act
      const res = await app.request('/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Assert
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.status).toBe('fail');
      expect(body.message).toBe('Validasi input gagal');
    });
  });

  describe('POST /whatsapp/reconnect', () => {
    it('should trigger init and return 200 if state is not READY', async () => {
      // Arrange
      mockGetStatus.mockReturnValue({ state: 'DISCONNECTED' });

      // Act
      const res = await app.request('/whatsapp/reconnect', { method: 'POST' });

      // Assert
      expect(res.status).toBe(200);
      expect(whatsAppConnection.init).toHaveBeenCalled();
    });

    it('should return 400 if WhatsApp is already connected', async () => {
      // Arrange
      mockGetStatus.mockReturnValue({ state: 'READY' });

      // Act
      const res = await app.request('/whatsapp/reconnect', { method: 'POST' });

      // Assert
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.status).toBe('fail');
      expect(body.message).toBe('WhatsApp sudah terhubung');
      expect(whatsAppConnection.init).not.toHaveBeenCalled();
    });
  });
});
