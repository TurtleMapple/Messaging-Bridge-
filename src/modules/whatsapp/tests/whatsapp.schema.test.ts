import { describe, it, expect } from 'vitest';
import { SendWhatsAppSchema } from '../whatsapp.schema';

describe('WhatsApp Schema', () => {
  describe('SendWhatsAppSchema', () => {
    it('should validate successfully with valid recipient and content', () => {
      // Arrange
      const input = {
        recipient: '62812345678',
        content: 'Hello from WhatsApp bridge'
      };

      // Act
      const result = SendWhatsAppSchema.safeParse(input);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail if recipient is too short', () => {
      const input = {
        recipient: '123456',
        content: 'Hi'
      };
      const result = SendWhatsAppSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nomor terlalu pendek');
      }
    });

    it('should fail if recipient contains non-digit characters', () => {
      const input = {
        recipient: '62812345-678',
        content: 'Hi'
      };
      const result = SendWhatsAppSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Format nomor harus berupa angka saja');
      }
    });

    it('should fail if content is empty', () => {
      const input = {
        recipient: '62812345678',
        content: ''
      };
      const result = SendWhatsAppSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should validate successfully with metadata', () => {
      const input = {
        recipient: '62812345678',
        content: 'Hi',
        metadata: { source: 'unit-test', priority: 'high' }
      };
      const result = SendWhatsAppSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
