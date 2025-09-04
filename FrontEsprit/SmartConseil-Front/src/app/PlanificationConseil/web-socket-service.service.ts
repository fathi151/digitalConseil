import { Injectable, OnDestroy } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private roomId: string = '';
  private isConnected = false;
  private isInitialized = false;
  private isAvailableFlag = true;

  constructor() {
    // Don't auto-connect in constructor to prevent blocking the app
    // Check if WebSocket dependencies are available
    try {
      if (!SockJS || !Client) {
        this.isAvailableFlag = false;
        console.warn('[WebSocket] WebSocket dependencies not available');
      }
    } catch (error) {
      this.isAvailableFlag = false;
      console.warn('[WebSocket] WebSocket dependencies check failed:', error);
    }
  }

  /**
   * Initialize the WebSocket connection
   */
  private initializeConnection() {
    if (this.isInitialized || !this.isAvailableFlag) return;

    try {
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8090/ws'),
        reconnectDelay: 5000,
        debug: (str: any) => console.log('[WebSocket] ' + str),

        // Add error handling
        onStompError: (frame: any) => {
          console.error('[WebSocket] STOMP Error:', frame);
        },

        onWebSocketError: (error: any) => {
          console.error('[WebSocket] WebSocket Error:', error);
        }
      });

      this.client.onDisconnect = () => {
        console.log('[WebSocket] Disconnected');
        this.isConnected = false;
      };

      this.isInitialized = true;
    } catch (error) {
      console.error('[WebSocket] Failed to initialize connection:', error);
      this.isAvailableFlag = false;
    }
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isAvailableFlag) {
        console.warn('[WebSocket] WebSocket not available, skipping connection');
        resolve(false);
        return;
      }

      this.initializeConnection();
      if (this.client && !this.client.active) {
        try {
          // Set up connection handlers before activating
          this.client.onConnect = () => {
            console.log('[WebSocket] Connected');
            this.isConnected = true;
            resolve(true);
          };

          this.client.onStompError = () => {
            console.error('[WebSocket] Connection failed');
            this.isConnected = false;
            resolve(false);
          };

          this.client.activate();
        } catch (error) {
          console.error('[WebSocket] Failed to activate connection:', error);
          this.isAvailableFlag = false;
          resolve(false);
        }
      } else if (this.isConnected) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Check if WebSocket is available and connected
   */
  isAvailable(): boolean {
    return this.isAvailableFlag && this.client !== null && this.isConnected;
  }


  setRoomId(id: string) {
    this.roomId = id;
  }

 join(username: string): void {
  if (!this.isAvailableFlag || !this.roomId || !this.isConnected || !this.client) {
    console.warn('[WebSocket] Cannot join - conditions not met:', {
      isAvailable: this.isAvailableFlag,
      roomId: this.roomId,
      isConnected: this.isConnected,
      hasClient: !!this.client
    });
    return;
  }

  const joinRequest = {
    username: username,
    idRoom: this.roomId
  };

  console.log('[WebSocket] Sending join message:', joinRequest);

  this.client.publish({
    destination: '/app/join',
    body: JSON.stringify(joinRequest)
  });

  console.log('[WebSocket] Join message sent');
}



  leave(username: string) {
    if (!this.isAvailableFlag || !this.roomId || !this.isConnected || !this.client) return;

    try {
      this.client.publish({
        destination: '/app/leave',
        body: JSON.stringify({
          roomId: this.roomId,
          username: username
        })
      });
    } catch (error) {
      console.error('[WebSocket] Failed to leave room:', error);
    }
  }

  /**
   * Subscribe to real-time updates for room participants
   */
onRoomUpdate(callback: (participants: string[]) => void) {
  if (!this.isAvailableFlag) {
    console.warn('[WebSocket] WebSocket not available, skipping room update subscription');
    return;
  }

  if (!this.client) {
    console.error('[WebSocket] Client not initialized');
    return;
  }

  const subscribeToRoom = () => {
    if (!this.roomId) {
      console.error('[WebSocket] roomId is not set, cannot subscribe');
      return;
    }
    try {
      this.client?.subscribe('/topic/room/' + this.roomId, (message: Message) => {
        const participants = JSON.parse(message.body);
        callback(participants);
      });
    } catch (error) {
      console.error('[WebSocket] Failed to subscribe to room updates:', error);
    }
  };

  if (this.isConnected) {
    subscribeToRoom();
  } else {
    const originalOnConnect = this.client.onConnect;
    this.client.onConnect = (frame) => {
      if (originalOnConnect) {
        originalOnConnect(frame);
      }
      subscribeToRoom();
    };
  }
}


  /**
   * Disconnect manually (optional)
   */
  disconnect() {
    if (this.client && this.client.active) {
      try {
        console.log('[WebSocket] Disconnecting...');
        this.client.deactivate();
        this.isConnected = false;
        this.isInitialized = false;
        this.client = null;
      } catch (error) {
        console.error('[WebSocket] Failed to disconnect:', error);
      }
    }
  }

  /**
   * Clean up resources when the service is destroyed
   */
  ngOnDestroy() {
    this.disconnect();
  }
}
