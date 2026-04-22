import { z } from 'zod';

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
    .regex(/^\d+$/, 'Format nomor harus berupa angka saja'),
  
  content: z
    .string()
    .describe('Isi pesan teks yang akan dikirim')
    .min(1, 'Pesan tidak boleh kosong')
    .max(4096, 'Pesan melebihi batas karakter WhatsApp'),

  // Opsional: Menambahkan metadata untuk tracking di level industri
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Enum untuk status lifecycle koneksi WhatsApp.
 */
export const WhatsAppStateSchema = z.enum([
  'INITIALIZING',
  'AUTHENTICATING',
  'READY',
  'DISCONNECTED',
]);

export type WhatsAppState = z.infer<typeof WhatsAppStateSchema>;

/**
 * Schema untuk status koneksi WhatsApp Session.
 */
export const WhatsAppStatusSchema = z.object({
  state: WhatsAppStateSchema.describe('Status lifecycle koneksi'),
  
  qrCode: z.string()
    .optional()
    .describe('String konten QR, base64, atau URL untuk pairing'),

  info: z.object({
    platform: z.string().optional(),
    pushName: z.string().optional(),
    wid: z.string().optional(), // WhatsApp ID
  }).optional(),
  
  updatedAt: z.date().default(new Date()),
});

// Jenis Type Inference untuk penggunaan di Service/Controller
export type SendWhatsAppDto = z.infer<typeof SendWhatsAppSchema>;
export type WhatsAppStatus = z.infer<typeof WhatsAppStatusSchema>;