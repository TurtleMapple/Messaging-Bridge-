import { config } from '../../common/config/env'
import { MessagingError } from '../../common/utils/errors'
import type { SendTelegramDto } from './telegram.schema'

const TELEGRAM_API = `https://api.telegram.org/bot${config.telegram.token}`

interface TelegramSendResult {
  message_id: number
  chat_id: string | number
}

/**
 * TelegramService handles communication with the Telegram Bot API.
 */
export class TelegramService {
  /**
   * Sends a message to a specific Telegram chat.
   * @param dto The message data (chat_id, content, parse_mode)
   * @returns A promise with the message and chat identifiers
   */
  async sendMessage(dto: SendTelegramDto): Promise<TelegramSendResult> {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: dto.chat_id,
        text: dto.content,
        parse_mode: dto.parse_mode,
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
      message_id: json.result!.message_id,
      chat_id: json.result!.chat.id,
    }
  }
}