import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppConnection } from '../whatsapp.connection';

// Mock Baileys
const { mockOn, mockWASocket } = vi.hoisted(() => {
  const mockOn = vi.fn();
  const mockWASocket = {
    ev: { on: mockOn },
    authState: { creds: { me: { id: 'test-jid', name: 'Test User' }, platform: 'web' } },
    sendMessage: vi.fn(),
  };
  return { mockOn, mockWASocket };
});

vi.mock('@whiskeysockets/baileys', async () => {
  return {
    default: vi.fn().mockReturnValue(mockWASocket),
    DisconnectReason: { loggedOut: 401 },
    fetchLatestBaileysVersion: vi.fn().mockResolvedValue({ version: [2, 3000, 1] }),
    useMultiFileAuthState: vi.fn().mockResolvedValue({
      state: { creds: {} },
      saveCreds: vi.fn(),
    }),
  };
});

describe('WhatsAppConnection', () => {
  let connection: WhatsAppConnection;

  beforeEach(() => {
    vi.clearAllMocks();
    connection = new WhatsAppConnection();
  });

  it('should initialize correctly and register event listeners', async () => {
    // Arrange & Act
    await connection.init();

    // Assert
    expect(mockOn).toHaveBeenCalledWith('creds.update', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('connection.update', expect.any(Function));
  });

  it('should update state to READY when connection is open', async () => {
    // Arrange
    await connection.init();
    const handler = mockOn.mock.calls.find(call => call[0] === 'connection.update')![1];
    
    // Act
    handler({ connection: 'open' });

    // Assert
    const status = connection.getStatus();
    expect(status.state).toBe('READY');
    expect(status.info?.pushName).toBe('Test User');
    expect(status.info?.wid).toBe('test-jid');
  });

  it('should update state to AUTHENTICATING and store qr code when qr is received', async () => {
    // Arrange
    await connection.init();
    const handler = mockOn.mock.calls.find(call => call[0] === 'connection.update')![1];
    
    // Act
    handler({ qr: 'test-qr-string' });

    // Assert
    const status = connection.getStatus();
    expect(status.state).toBe('AUTHENTICATING');
    expect(status.qrCode).toBe('test-qr-string');
  });

  it('should reconnect when connection is closed and reason is not loggedOut', async () => {
    // Arrange
    const initSpy = vi.spyOn(WhatsAppConnection.prototype, 'init');
    const conn = new WhatsAppConnection();
    await conn.init();
    const handler = mockOn.mock.calls.find(call => call[0] === 'connection.update')![1];
    
    // Act
    handler({ 
      connection: 'close', 
      lastDisconnect: { error: { output: { statusCode: 500 } } } 
    });

    // Assert
    // State goes DISCONNECTED -> INITIALIZING during reconnect call
    expect(conn.getStatus().state).toBe('INITIALIZING');
    // init called once for manual start, once for auto-reconnect
    expect(initSpy).toHaveBeenCalledTimes(2);
  });

  it('should NOT reconnect when connection is closed due to logout', async () => {
    // Arrange
    const initSpy = vi.spyOn(WhatsAppConnection.prototype, 'init');
    const conn = new WhatsAppConnection();
    await conn.init();
    const handler = mockOn.mock.calls.find(call => call[0] === 'connection.update')![1];
    
    // Act
    handler({ 
      connection: 'close', 
      lastDisconnect: { error: { output: { statusCode: 401 } } } 
    });

    // Assert
    expect(conn.getStatus().state).toBe('DISCONNECTED');
    // Should NOT call init again
    expect(initSpy).toHaveBeenCalledTimes(1);
  });
});
