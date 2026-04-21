import { IEmailProvider, EmailOptions } from '../interfaces/email-provider.interface'

/**
 * Mock implementation of IEmailProvider for unit testing.
 * Does not perform real network calls.
 */
export class MockEmailProvider implements IEmailProvider {
  async send(options: EmailOptions): Promise<{ id: string }> {
    console.log('[MockEmailProvider] Sending email...')
    console.log(`  To: ${options.to.join(', ')}`)
    console.log(`  Subject: ${options.subject}`)
    
    // Simulate a successful API response
    return { id: `mock-id-${Date.now()}` }
  }
}
