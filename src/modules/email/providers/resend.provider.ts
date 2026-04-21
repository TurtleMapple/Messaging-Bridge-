import { Resend } from 'resend'
import { IEmailProvider, EmailOptions } from '../interfaces/email-provider.interface'

/**
 * Concrete implementation of IEmailProvider using the Resend SDK.
 */
export class ResendProvider implements IEmailProvider {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(options: EmailOptions): Promise<{ id: string }> {
    const { data, error } = await this.client.emails.send({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { id: data!.id }
  }
}
