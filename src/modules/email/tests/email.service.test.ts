import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EmailService } from '../email.service'
import { IEmailProvider } from '../interfaces/email-provider.interface'
import { MessagingError } from '../../../common/utils/errors'

// Mock the environment config
vi.mock('../../../common/config/env', () => ({
  config: {
    email: {
      from: 'default@example.com'
    }
  }
}))

describe('EmailService', () => {
  let mockProvider: IEmailProvider
  let emailService: EmailService

  beforeEach(() => {
    mockProvider = {
      send: vi.fn()
    }
    emailService = new EmailService(mockProvider)
  })

  describe('sendEmail()', () => {
    it('should successfully send an email with single recipient', async () => {
      // Arrange
      vi.mocked(mockProvider.send).mockResolvedValue({ id: 'msg_123' })
      const dto = {
        to: 'user@example.com',
        subject: 'Test',
        text_body: 'Hello'
      }

      // Act
      const result = await emailService.sendEmail(dto)

      // Assert
      expect(result).toEqual({ id: 'msg_123' })
      expect(mockProvider.send).toHaveBeenCalledWith({
        from: 'default@example.com',
        to: ['user@example.com'], // converted to array
        subject: 'Test',
        html: undefined,
        text: 'Hello'
      })
    })

    it('should successfully send an email with array of recipients', async () => {
      vi.mocked(mockProvider.send).mockResolvedValue({ id: 'msg_123' })
      const dto = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test',
        html_body: '<p>Hi</p>'
      }

      await emailService.sendEmail(dto)

      expect(mockProvider.send).toHaveBeenCalledWith(expect.objectContaining({
        to: ['user1@example.com', 'user2@example.com'],
        html: '<p>Hi</p>',
        text: undefined
      }))
    })

    it('should throw MessagingError if provider throws an error', async () => {
      // Arrange
      vi.mocked(mockProvider.send).mockRejectedValue(new Error('Provider failure'))
      const dto = {
        to: 'user@example.com',
        subject: 'Test',
        text_body: 'Hello'
      }

      // Act & Assert
      const promise = emailService.sendEmail(dto)
      await expect(promise).rejects.toThrow(MessagingError)
      await expect(promise).rejects.toThrow('Email delivery failure: Provider failure')
    })
  })
})
