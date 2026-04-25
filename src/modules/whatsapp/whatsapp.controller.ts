import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { SendWhatsAppSchema, WhatsAppStatusSchema } from './whatsapp.schema';
import { WhatsAppService } from './whatsapp.service';
import { whatsAppConnection } from './whatsapp.connection';
import { successResponse, failResponse } from '../../common/utils/response';
import { ValidationError } from '../../common/utils/errors';

const whatsappRouter = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success && 'error' in result) {
      console.warn('[WhatsApp] Validation failed');
      const data = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      throw new ValidationError('Validasi input gagal', data);
    }
  }
});
const whatsappService = new WhatsAppService();

/**
 * GET /whatsapp/status
 */
const statusRoute = createRoute({
  method: 'get',
  path: '/status',
  tags: ['WhatsApp'],
  summary: 'Check WhatsApp connection status',
  description: 'Memeriksa status koneksi WhatsApp dan mengambil metadata sesi atau QR code.',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('success'),
            message: z.string(),
            data: WhatsAppStatusSchema
          })
        }
      },
      description: 'Status WhatsApp diambil'
    }
  }
});

whatsappRouter.openapi(statusRoute, (c) => {
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
  return c.json({
    status: 'success',
    message,
    data: status
  } as const, 200);
});

/**
 * POST /whatsapp/send
 */
const sendRoute = createRoute({
  method: 'post',
  path: '/send',
  tags: ['WhatsApp'],
  summary: 'Send WhatsApp message',
  description: 'Mengirim pesan teks WhatsApp ke nomor tujuan.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SendWhatsAppSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('success'),
            message: z.string(),
            data: z.object({ id: z.string() })
          })
        }
      },
      description: 'Pesan berhasil dikirim ke WhatsApp'
    },
    400: {
      description: 'Validasi input gagal'
    },
    503: {
      description: 'WhatsApp is not connected'
    }
  }
});

whatsappRouter.openapi(sendRoute, async (c) => {
  const dto = c.req.valid('json');
  console.log(`[WhatsApp] Sending message to ${dto.recipient}`);
  
  const result = await whatsappService.sendMessage(dto);
  return c.json({
    status: 'success',
    message: 'Pesan berhasil dikirim ke WhatsApp',
    data: result
  } as const, 200);
});

/**
 * POST /whatsapp/reconnect
 */
const reconnectRoute = createRoute({
  method: 'post',
  path: '/reconnect',
  tags: ['WhatsApp'],
  summary: 'Trigger WhatsApp reconnect',
  description: 'Memicu inisialisasi ulang koneksi WhatsApp jika terputus.',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('success'),
            message: z.string(),
            data: z.null()
          })
        }
      },
      description: 'Proses inisialisasi ulang telah dimulai'
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('fail'),
            message: z.string(),
            code: z.string().optional()
          })
        }
      },
      description: 'WhatsApp sudah terhubung'
    }
  }
});

whatsappRouter.openapi(reconnectRoute, async (c) => {
  const status = whatsappService.getStatus();
  
  if (status.state === 'READY') {
    return c.json({
      status: 'fail',
      message: 'WhatsApp sudah terhubung',
      code: 'ALREADY_CONNECTED'
    } as const, 400);
  }

  console.log('[WhatsApp] Manual reconnection triggered');
  // Menjalankan init() secara asinkron tanpa menunggu selesai sepenuhnya untuk response cepat
  whatsAppConnection.init().catch(err => {
    console.error('[WhatsApp] Reconnection error:', err);
  });

  return c.json({
    status: 'success',
    message: 'Proses inisialisasi ulang telah dimulai',
    data: null
  } as const, 200);
});

export { whatsappRouter };
