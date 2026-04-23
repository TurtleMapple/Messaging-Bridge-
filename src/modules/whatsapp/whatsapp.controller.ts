import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { SendWhatsAppSchema } from './whatsapp.schema';
import { WhatsAppService } from './whatsapp.service';
import { whatsAppConnection } from './whatsapp.connection';
import { successResponse, failResponse } from '../../common/utils/response';
import { ValidationError } from '../../common/utils/errors';

const whatsappRouter = new Hono();
const whatsappService = new WhatsAppService();

/**
 * GET /whatsapp/status
 * Memeriksa status koneksi WhatsApp dan mengambil metadata sesi atau QR code.
 */
whatsappRouter.get('/status', (c) => {
  const status = whatsappService.getStatus();
  
  let message = 'Status WhatsApp diambil';
  switch (status.state) {
    case 'READY':
      message = 'WhatsApp terhubung dan siap digunakan';
      break;
    case 'AUTHENTICATING':
      message = 'Menunggu pemindaian QR Code';
      break;
    case 'INITIALIZING':
      message = 'Sedang menginisialisasi sesi WhatsApp';
      break;
    case 'DISCONNECTED':
      message = 'WhatsApp terputus. Silakan lakukan pemicuan ulang (reconnect)';
      break;
  }

  console.log(`[WhatsApp] Status Check: ${status.state}`);
  return c.json(successResponse(status, message));
});

/**
 * POST /whatsapp/send
 * Mengirim pesan teks WhatsApp ke nomor tujuan.
 */
whatsappRouter.post(
  '/send',
  zValidator('json', SendWhatsAppSchema, (result) => {
    if (!result.success) {
      console.warn('[WhatsApp] Validation failed for /send');
      const data = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      throw new ValidationError('Validasi input gagal', data);
    }
  }),
  async (c) => {
    const dto = c.req.valid('json');
    console.log(`[WhatsApp] Sending message to ${dto.recipient}`);
    
    const result = await whatsappService.sendMessage(dto);
    return c.json(successResponse(result, 'Pesan berhasil dikirim ke WhatsApp'), 200);
  }
);

/**
 * POST /whatsapp/reconnect
 * Memicu inisialisasi ulang koneksi WhatsApp jika terputus.
 */
whatsappRouter.post('/reconnect', async (c) => {
  const status = whatsappService.getStatus();
  
  if (status.state === 'READY') {
    return c.json(failResponse('WhatsApp sudah terhubung', 'ALREADY_CONNECTED'), 400);
  }

  console.log('[WhatsApp] Manual reconnection triggered');
  // Menjalankan init() secara asinkron tanpa menunggu selesai sepenuhnya untuk response cepat
  whatsAppConnection.init().catch(err => {
    console.error('[WhatsApp] Reconnection error:', err);
  });

  return c.json(successResponse(null, 'Proses inisialisasi ulang telah dimulai'), 200);
});

export { whatsappRouter };
