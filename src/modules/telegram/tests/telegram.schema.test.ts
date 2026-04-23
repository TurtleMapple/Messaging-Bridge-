import { describe, it, expect } from 'vitest'
import { sendTelegramSchema } from '../telegram.schema'

describe('Telegram Schema', () => {
  describe('sendTelegramSchema', () => {
    it('should validate successfully with string chat_id and content', () => {
      // Arrange
      const input = {
        chat_id: '@channel_name',
        content: 'Hello World'
      }

      // Act
      const result = sendTelegramSchema.safeParse(input)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should validate successfully with numeric chat_id, content, and parse_mode', () => {
      const input = {
        chat_id: 123456789,
        content: '<b>Hello</b>',
        parse_mode: 'HTML'
      }
      
      const result = sendTelegramSchema.safeParse(input)
      
      expect(result.success).toBe(true)
    })

    it('should fail if content is empty', () => {
      const input = {
        chat_id: 123456789,
        content: ''
      }
      
      const result = sendTelegramSchema.safeParse(input)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('content is required')
      }
    })

    it('should fail if content exceeds 4096 characters', () => {
      const input = {
        chat_id: 123456789,
        content: 'A'.repeat(4097)
      }
      
      const result = sendTelegramSchema.safeParse(input)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('content is too long (max 4096 chars)')
      }
    })

    it('should fail if parse_mode is invalid', () => {
      const input = {
        chat_id: 123456789,
        content: 'Test',
        parse_mode: 'InvalidMode'
      }
      
      const result = sendTelegramSchema.safeParse(input)
      
      expect(result.success).toBe(false)
    })

    it('should fail if chat_id is missing', () => {
      const input = {
        content: 'Test'
      }
      
      const result = sendTelegramSchema.safeParse(input)
      
      expect(result.success).toBe(false)
    })
  })
})
