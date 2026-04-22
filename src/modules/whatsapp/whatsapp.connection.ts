import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  ConnectionState,
  WASocket,
} from '@whiskeysockets/baileys';
import type { Boom } from '@hapi/boom';
import { WhatsAppStatus, WhatsAppState } from './whatsapp.schema';

const AUTH_FOLDER = './baileys_auth_info';

/**
 * WhatsAppConnection encapsulates the full Baileys socket lifecycle.
 * Manages state transitions, session info, and auto-reconnection.
 *
 * @version 2.0.0
 */
export class WhatsAppConnection {
  private socket: WASocket | null = null;

  private state: WhatsAppState = 'DISCONNECTED';
  private sessionInfo: WhatsAppStatus['info'] = {};
  public qrCode: string | null = null;

  /**
   * Initializes the WhatsApp connection, sets up auth state, and binds events.
   * @returns {Promise<void>}
   */
  public async init(): Promise<void> {
    this.updateState('INITIALIZING');

    const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: authState,
      printQRInTerminal: true,
    });

    this.socket = sock;

    // Listen for credential updates to persist session
    sock.ev.on('creds.update', saveCreds);

    // Listen for connection lifecycle updates
    sock.ev.on('connection.update', (update: Partial<ConnectionState>) => {
      this.handleConnectionUpdate(update);
    });
  }

  /**
   * Internal handler for connection state changes and QR generation.
   * @param {Partial<ConnectionState>} update
   * @private
   */
  private handleConnectionUpdate(update: Partial<ConnectionState>): void {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.qrCode = qr;
      this.updateState('AUTHENTICATING');
      console.log('📱 Scan the QR code in the terminal to connect WhatsApp');
    }

    if (connection === 'open') {
      const user = this.socket?.authState.creds.me;

      this.sessionInfo = {
        pushName: user?.name,
        wid: user?.id,
        platform: this.socket?.authState.creds.platform,
      };

      this.qrCode = null;
      this.updateState('READY');
      console.log(
        `✅ WhatsApp Connected as ${this.sessionInfo.pushName} (${this.sessionInfo.platform})`
      );
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      this.updateState('DISCONNECTED');
      this.sessionInfo = {};

      console.error(
        `⚠️ Connection Closed. Reason: ${statusCode}, Reconnecting: ${shouldReconnect}`
      );

      if (shouldReconnect) {
        this.init();
      }
    }
  }

  /**
   * Updates the internal state and logs the transition.
   * @param {WhatsAppState} newState
   * @private
   */
  private updateState(newState: WhatsAppState): void {
    this.state = newState;
  }

  /**
   * Returns the current Baileys socket instance.
   * @returns {WASocket | null}
   */
  public getSocket(): WASocket | null {
    return this.socket;
  }

  /**
   * Returns the current connection status and session metadata.
   * Follows the WhatsAppStatusSchema structure.
   * @returns {WhatsAppStatus}
   */
  public getStatus(): WhatsAppStatus {
    return {
      state: this.state,
      qrCode: this.qrCode ?? undefined,
      info: this.sessionInfo,
      updatedAt: new Date(),
    };
  }
}

/**
 * Singleton instance shared across the app lifecycle.
 */
export const whatsAppConnection = new WhatsAppConnection();