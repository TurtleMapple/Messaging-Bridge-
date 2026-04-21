export interface EmailOptions {
  from: string
  to: string[]
  subject: string
  html?: string
  text?: string
}

export interface IEmailProvider {
  /**
   * Sends an email using the specified provider implementation.
   * @param options The email details (from, to, subject, body)
   * @returns A promise resolving to an object with a unique message ID.
   */
  send(options: EmailOptions): Promise<{ id: string }>
}
