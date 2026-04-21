import { config } from '../../common/config/env'
import { MessagingError } from '../../common/utils/errors'
import { IEmailProvider } from './interfaces/email-provider.interface'
import type { SendEmailDto } from './email.schema'

export interface EmailSendResult {
  id: string
}

/**
 * EmailService orchestrates the email sending process.
 * Follows SOLID principles by injecting an IEmailProvider.
 */
export class EmailService {
  constructor(private provider: IEmailProvider) {}

  /**
   * Logic for sending an email according to the standardized DTO.
   */
  async sendEmail(dto: SendEmailDto): Promise<EmailSendResult> {
    try {
      const result = await this.provider.send({
        from: config.email.from,
        to: Array.isArray(dto.to) ? dto.to : [dto.to],
        subject: dto.subject,
        html: dto.html_body,
        text: dto.text_body,
      })

      return { id: result.id }
    } catch (error: any) {
      // Wrap provider-specific errors into our domain-specific MessagingError
      throw new MessagingError(
        `Email delivery failure: ${error.message}`,
        502,
        'PROVIDER_ERROR'
      )
    }
  }
}
