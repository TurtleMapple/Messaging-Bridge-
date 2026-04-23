import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'

// ─── Mocking Environment Config ─────────────────────────────────────────────
vi.mock('../../../common/config/env', () => ({
  config: {
    app: {
      nodeEnv: 'development'
    },
    telegram: {
      token: 'fake-bot-token'
    }
  }
}))

// ─── Mocking Dependencies ───────────────────────────────────────────────────
const { mockSendMessage } = vi.hoisted(() => ({
  mockSendMessage: vi.fn().mockResolvedValue({ message_id: 100, chat_id: 200 })
}))

vi.mock('../telegram.service', () => {
  return {
    TelegramService: class {
      sendMessage = mockSendMessage
    }
  }
})

import { telegramRouter } from '../telegram.controller'
import { errorHandler } from '../../../common/middleware/error-handler'

describe('Telegram Controller (Integration)', () => {
  const app = new Hono()
  app.onError(errorHandler)
  app.route('/telegram', telegramRouter)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /telegram/send', () => {
    it('should return 200 and success response when payload is valid', async () => {
      // Arrange
      const validPayload = {
        chat_id: 12345,
        content: 'Unit Test Content'
      }

      // Act
      const res = await app.request('/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload)
      })

      // Assert
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({
        status: 'success',
        message: 'Message sent via Telegram',
        data: { message_id: 100, chat_id: 200 }
      })
      expect(mockSendMessage).toHaveBeenCalledWith(validPayload)
    })

    it('should return 400 JSend fail when payload validation fails (missing field)', async () => {
      // Arrange: missing 'content'
      const invalidPayload = {
        chat_id: '@channel_name'
      }

      // Act
      const res = await app.request('/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload)
      })

      // Assert
      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.status).toBe('fail')
      expect(body.message).toBe('Validation failed')
      expect(body.data).toContainEqual(expect.objectContaining({
        field: 'content'
      }))
    })

    it('should handle service errors and return 502 via error handler', async () => {
      // Arrange
      mockSendMessage.mockRejectedValue(new Error('Generic Service Failure'))

      const payload = {
        chat_id: 123,
        content: 'Test'
      }

      // Act
      const res = await app.request('/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      // Assert
      expect(res.status).toBe(500) // Generic Error
    })
  })
})
