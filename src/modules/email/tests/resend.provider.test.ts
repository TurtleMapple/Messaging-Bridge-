import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ResendProvider } from '../providers/resend.provider'

// Mock the 'resend' module
const mockSend = vi.fn()
vi.mock('resend', () => {
  return {
    Resend: class {
      emails = { send: mockSend }
    }
  }
})

describe('ResendProvider', () => {
  let provider: ResendProvider

  beforeEach(() => {
    vi.clearAllMocks()
    provider = new ResendProvider('fake-api-key')
  })

  describe('send()', () => {
    it('should send email with html and text body', async () => {
      mockSend.mockResolvedValue({ data: { id: 'test-id' }, error: null })

      const options = {
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Subject',
        html: '<p>HTML</p>',
        text: 'Text'
      }

      const result = await provider.send(options)

      expect(result).toEqual({ id: 'test-id' })
      expect(mockSend).toHaveBeenCalledWith({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
    })

    it('should send email with only text body', async () => {
      mockSend.mockResolvedValue({ data: { id: 'test-id' }, error: null })

      const options = {
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Subject',
        text: 'Text only'
      }

      await provider.send(options)

      expect(mockSend).toHaveBeenCalledWith({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text
      })
    })

    it('should throw error if both html and text are missing', async () => {
      const options = {
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Subject'
      }

      await expect(provider.send(options)).rejects.toThrow('Email body (html or text) is required')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should throw error if Resend API returns an error object', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'API Error' } })

      const options = {
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Subject',
        text: 'Text'
      }

      await expect(provider.send(options)).rejects.toThrow('API Error')
    })
  })
})
