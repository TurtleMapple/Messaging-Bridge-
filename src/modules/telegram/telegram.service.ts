import { config } from '../../common/config/env'
import { MessagingError } from '../../common/utils/errors'
import type { SendTelegramDto } from './telegram.schema'

const TELEGRAM_API = `https://api.telegram.org/bot${config.telegram.token}`

interface TelegramSendResult {
  messageId: number
  chatId: string | number
}

export async function sendTelegramMessage(dto: SendTelegramDto): Promise<TelegramSendResult> {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: dto.chatId,
      text: dto.message,
      parse_mode: dto.parseMode,
    }),
  })

  const json = (await response.json()) as {
    ok: boolean
    result?: { message_id: number; chat: { id: number } }
    description?: string
  }

  if (!json.ok) {
    throw new MessagingError(
      `Telegram API error: ${json.description ?? 'Unknown error'}`,
      response.status === 400 ? 400 : 502,
    )
  }

  return {
    messageId: json.result!.message_id,
    chatId: json.result!.chat.id,
  }
}