import { z } from '@hono/zod-openapi';

/**
 * Schema untuk pengiriman pesan WhatsApp.
 * Mengikuti standar E.164 (tanpa simbol +) untuk penomoran internasional.
 */
export const SendWhatsAppSchema = z.object({
  recipient: z
    .string()
    .describe('Nomor tujuan dalam format E.164 (contoh: 62812345678)')
    .trim()
    .min(7, 'Nomor terlalu pendek')
    .max(15, 'Nomor terlalu panjang')
    .regex(/^\d+$/, 'Format nomor harus berupa angka saja')
    .openapi({
      example: '628123456789',
      description: 'Recipient phone number in E.164 format'
    }),
  
  content: z
    .string()
    .describe('Isi pesan teks yang akan dikirim')
    .min(1, 'Pesan tidak boleh kosong')
    .max(4096, 'Pesan melebihi batas karakter WhatsApp')
    .openapi({
      example: 'Hello from Bridge!',
      description: 'The text message content'
    }),

  // Opsional: Menambahkan metadata untuk tracking di level industri
  metadata: z.record(z.string(), z.any()).optional().openapi({
    example: { source: 'api' },
    description: 'Optional metadata for tracking'
  }),
}).openapi('SendWhatsAppRequest');

/**
 * Enum untuk status lifecycle koneksi WhatsApp.
 */
export const WhatsAppStateSchema = z.enum([
  'INITIALIZING',
  'AUTHENTICATING',
  'READY',
  'DISCONNECTED',
]).openapi('WhatsAppState');

export type WhatsAppState = z.infer<typeof WhatsAppStateSchema>;

/**
 * Schema untuk status koneksi WhatsApp Session.
 */
export const WhatsAppStatusSchema = z.object({
  state: WhatsAppStateSchema.describe('Status lifecycle koneksi'),
  
  qrCode: z.string()
    .optional()
    .describe('String konten QR, base64, atau URL untuk pairing')
    .openapi({ example: '1@abcd...' }),

  info: z.object({
    platform: z.string().optional().openapi({ example: 'web' }),
    pushName: z.string().optional().openapi({ example: 'My Name' }),
    wid: z.string().optional().openapi({ example: '62812345678@s.whatsapp.net' }), // WhatsApp ID
  }).optional(),
  
  updatedAt: z.date().default(new Date()),
}).openapi('WhatsAppStatusResponse');

// Jenis Type Inference untuk penggunaan di Service/Controller
export type SendWhatsAppDto = z.infer<typeof SendWhatsAppSchema>;
export type WhatsAppStatus = z.infer<typeof WhatsAppStatusSchema>;