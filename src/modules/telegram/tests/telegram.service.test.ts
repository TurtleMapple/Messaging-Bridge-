import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TelegramService } from '../telegram.service'
import { MessagingError } from '../../../common/utils/errors'

// Mock the environment config
vi.mock('../../../common/config/env', () => ({
  config: {
    telegram: {
      token: 'fake-bot-token'
    }
  }
}))

describe('TelegramService', () => {
  let telegramService: TelegramService

  beforeEach(() => {
    vi.clearAllMocks()
    telegramService = new TelegramService()
    
    // Mock global fetch
    global.fetch = vi.fn() as any
  })

  describe('sendMessage()', () => {
    it('should send a message successfully and return message_id and chat_id', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch).mockResolvedValue({
        json: async () => ({
          ok: true,
          result: {
            message_id: 1234,
            chat: { id: 5678 }
          }
        })
      } as Response)

      const dto = {
        chat_id: 5678,
        content: 'Test message',
        parse_mode: 'HTML' as const
      }

      // Act
      const result = await telegramService.sendMessage(dto)

      // Assert
      expect(result).toEqual({
        message_id: 1234,
        chat_id: 5678
      })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/botfake-bot-token/sendMessage',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            chat_id: 5678,
            text: 'Test message',
            parse_mode: 'HTML'
          })
        })
      )
    })

    it('should throw MessagingError (400) if Telegram returns ok: false with 400 status', async () => {
      // Arrange
      vi.mocked(global.fetch).mockResolvedValue({
        status: 400,
        json: async () => ({
          ok: false,
          description: 'Bad Request: chat not found'
        })
      } as Response)

      const dto = {
        chat_id: 'invalid-chat',
        content: 'Test'
      }

      // Act & Assert
      const promise = telegramService.sendMessage(dto)
      await expect(promise).rejects.toThrow(MessagingError)
      await expect(promise).rejects.toThrow('Telegram API error: Bad Request: chat not found')
      
      // Verify status code inside error
      try {
        await promise
      } catch (err: any) {
        expect(err.statusCode).toBe(400)
      }
    })

    it('should throw MessagingError (502) if Telegram returns ok: false with non-400 status', async () => {
      // Arrange
      vi.mocked(global.fetch).mockResolvedValue({
        status: 500,
        json: async () => ({
          ok: false,
          description: 'Internal Server Error'
        })
      } as Response)

      const dto = {
        chat_id: 123,
        content: 'Test'
      }

      // Act & Assert
      try {
        await telegramService.sendMessage(dto)
        expect(true).toBe(false) // Should not reach here
      } catch (err: any) {
        expect(err).toBeInstanceOf(MessagingError)
        expect(err.message).toBe('Telegram API error: Internal Server Error')
        expect(err.statusCode).toBe(502)
      }
    })

    it('should throw native error if fetch fails (network error)', async () => {
      // Arrange
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network failure'))

      const dto = {
        chat_id: 123,
        content: 'Test'
      }

      // Act & Assert
      await expect(telegramService.sendMessage(dto)).rejects.toThrow('Network failure')
    })
  })
})
