/**
 * PostgreSQL LISTEN/NOTIFY bridge for metrics cache invalidation
 * 
 * This module listens to PostgreSQL NOTIFY events and emits them
 * to the application layer for cache invalidation.
 */

import { EventEmitter } from 'events';

export interface MetricsUpdatePayload {
  views: string[];
  timestamp: string;
  success: number;
  failed: number;
}

export interface PostgresNotification {
  channel: string;
  payload: string;
}

// Use Prisma's raw connection instead of pg Client
interface PgClient {
  connect(): Promise<void>;
  query(sql: string): Promise<any>;
  on(event: 'notification', listener: (msg: any) => void): void;
  on(event: 'error', listener: (err: Error) => void): void;
  on(event: 'end', listener: () => void): void;
  removeAllListeners(): void;
  end(): Promise<void>;
}

class PostgresListener extends EventEmitter {
  private client: PgClient | null = null;
  private isConnected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 5000; // 5 seconds

  constructor() {
    super();
  }

  /**
   * Connect to PostgreSQL and start listening
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('[PG-LISTENER] Already connected');
      return;
    }

    try {
      // Use dynamic import to avoid issues
      const { Client } = await import('pg');
      
      // Create a dedicated connection for LISTEN
      this.client = new Client({
        connectionString: process.env.DATABASE_URL,
      }) as unknown as PgClient;

      await this.client.connect();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      console.log('[PG-LISTENER] Connected to PostgreSQL');

      // Set up notification handler
      this.client.on('notification', (msg: any) => {
        this.handleNotification(msg);
      });

      // Handle connection errors
      this.client.on('error', (err: Error) => {
        console.error('[PG-LISTENER] Connection error:', err);
        this.handleDisconnect();
      });

      this.client.on('end', () => {
        console.log('[PG-LISTENER] Connection ended');
        this.handleDisconnect();
      });

      // Start listening to channels
      await this.listenToChannels();

      console.log('[PG-LISTENER] Listening for metrics updates');
    } catch (error) {
      console.error('[PG-LISTENER] Failed to connect:', error);
      this.handleDisconnect();
      throw error;
    }
  }

  /**
   * Subscribe to PostgreSQL channels
   */
  private async listenToChannels(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.query('LISTEN metrics_update');
      console.log('[PG-LISTENER] Subscribed to metrics_update channel');
    } catch (error) {
      console.error('[PG-LISTENER] Failed to subscribe to channels:', error);
      throw error;
    }
  }

  /**
   * Handle incoming notifications
   */
  private handleNotification(msg: PostgresNotification): void {
    try {
      console.log('[PG-LISTENER] Received notification:', msg.channel);

      if (msg.channel === 'metrics_update') {
        const payload: MetricsUpdatePayload = JSON.parse(msg.payload);
        console.log('[PG-LISTENER] Metrics updated:', payload);
        
        // Emit event for cache invalidation
        this.emit('metrics:update', payload);
      }
    } catch (error) {
      console.error('[PG-LISTENER] Failed to handle notification:', error);
    }
  }

  /**
   * Handle disconnection and reconnect
   */
  private handleDisconnect(): void {
    this.isConnected = false;

    if (this.client) {
      this.client.removeAllListeners();
      this.client = null;
    }

    // Clear existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[PG-LISTENER] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch((err) => {
          console.error('[PG-LISTENER] Reconnection failed:', err);
        });
      }, this.reconnectDelay);
    } else {
      console.error('[PG-LISTENER] Max reconnection attempts reached. Stopping listener.');
    }
  }

  /**
   * Disconnect from PostgreSQL
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.client) {
      try {
        await this.client.query('UNLISTEN *');
        await this.client.end();
        console.log('[PG-LISTENER] Disconnected from PostgreSQL');
      } catch (error) {
        console.error('[PG-LISTENER] Error during disconnect:', error);
      } finally {
        this.client = null;
        this.isConnected = false;
      }
    }
  }

  /**
   * Check if listener is connected
   */
  isListening(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let listenerInstance: PostgresListener | null = null;

/**
 * Get or create the PostgreSQL listener instance
 */
export function getPostgresListener(): PostgresListener {
  if (!listenerInstance) {
    listenerInstance = new PostgresListener();
    
    // Auto-connect in server environment
    if (typeof window === 'undefined') {
      listenerInstance.connect().catch((err) => {
        console.error('[PG-LISTENER] Failed to auto-connect:', err);
      });
    }
  }
  
  return listenerInstance;
}

/**
 * Clean up listener on process exit
 */
if (typeof window === 'undefined') {
  process.on('beforeExit', () => {
    if (listenerInstance) {
      listenerInstance.disconnect().catch((err) => {
        console.error('[PG-LISTENER] Error during cleanup:', err);
      });
    }
  });
}
