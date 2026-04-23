import { describe, it, expect } from 'vitest'
import { sendEmailSchema } from '../email.schema'

describe('Email Schema', () => {
  describe('sendEmailSchema', () => {
    it('should validate successfully with valid single email and html_body', () => {
      // Arrange
      const input = {
        to: 'test@example.com',
        subject: 'Hello',
        html_body: '<h1>Test</h1>'
      }

      // Act
      const result = sendEmailSchema.safeParse(input)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should validate successfully with array of emails and text_body', () => {
      const input = {
        to: ['test@example.com', 'test2@example.com'],
        subject: 'Hello',
        text_body: 'Test'
      }
      const result = sendEmailSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('should fail if neither html_body nor text_body is provided', () => {
      const input = {
        to: 'test@example.com',
        subject: 'Hello'
      }
      const result = sendEmailSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Either html_body or text_body is required')
      }
    })

    it('should fail on invalid email format', () => {
      const input = {
        to: 'invalid-email',
        subject: 'Hello',
        text_body: 'Test'
      }
      const result = sendEmailSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })
})
