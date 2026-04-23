import { Resend, CreateEmailOptions } from 'resend'
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
    const { from, to, subject, html, text } = options;

    let payload: CreateEmailOptions;

    if (html) {
      payload = { from, to, subject, html, text };
    } else if (text) {
      payload = { from, to, subject, text };
    } else {
      throw new Error('Email body (html or text) is required');
    }

    const { data, error } = await this.client.emails.send(payload)

    if (error) {
      throw new Error(error.message)
    }

    return { id: data!.id }
  }
}
