export class WebSocketManager {
    private socket: WebSocket | null = null;
    private url: string;
    private gameId: string | null = null;
    private hostId: string;
    private localPlayerId: string;
    private playerRole: 'host' | 'guest' | null = null;
    private messageHandlers: Map<string, (data: any) => void> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    
    private static instance: WebSocketManager | null = null;

    setPlayerRole(role: 'host' | 'guest') {
        this.playerRole = role;
        console.log('Player role set to:', this.playerRole);
    }

    public static getInstance(playerId: string): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager(playerId);
        } else {
            WebSocketManager.instance.localPlayerId = playerId;
        }
        return WebSocketManager.instance;
    }

    private constructor(playerId: string) {
        this.hostId = playerId;
        this.localPlayerId = playerId;
        this.url = `ws://localhost:3100/ws/socket/game`;
    }
    
    connect(gameId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.gameId = gameId;
            
            // Log the exact URL
            const wsUrl = `ws://localhost:3100/ws/socket/game/${gameId}`;
            console.log('Connecting to WebSocket URL:', wsUrl);
            
            this.socket = new WebSocket(wsUrl);
            

                        setTimeout(() => {
                        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                            console.log('🧪 Sending test ping message');
                            this.socket.send(JSON.stringify({type: 'PING', timestamp: Date.now()}));
                        } else {
                            console.error('⚠️ Cannot send test message, socket not ready:', 
                                        this.socket ? this.socket.readyState : 'null');
                        }
                        }, 1000);
                        
                        this.socket.onopen = () => {
                        console.log('🟢 WebSocket connection OPENED successfully');
                        this.reconnectAttempts = 0;
                        resolve();
                        };
                        
                        // Add more verbose onmessage directly here to bypass any potential issues
                        this.socket.onmessage = (event) => {
                        console.log('📥 RAW MESSAGE RECEIVED:', event.data);
                        try {
                            const parsed = JSON.parse(event.data);
                            console.log('📄 PARSED MESSAGE:', parsed);
                        } catch (e) {
                            console.error('❌ Failed to parse message:', e);
                        }
                        // Still call the regular handler
                        this.handleMessage(event);
                        };

            this.socket.onopen = () => {
                console.log('WebSocket connection OPENED successfully');
                this.reconnectAttempts = 0;
                resolve();
            };
            
            this.socket.onclose = (event) => {
                console.error('WebSocket connection CLOSED', event);
                this.handleDisconnect(event);
                reject(new Error('WebSocket connection closed'));
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket ERROR occurred:', error);
                reject(error);
            };
            
            this.socket.onmessage = this.handleMessage.bind(this);
        });
    }
    
    private handleDisconnect(event: CloseEvent) {
        console.log('WebSocket connection closed:', event.code, event.reason);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`Attempting to reconnect...`);
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect(this.gameId);
            }, 1000 * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }
private handleMessage(event: MessageEvent) {

  console.log(`🔍 HANDLER received message for game ${this.gameId}, local player: ${this.hostId}`);

  try {
    const message = JSON.parse(event.data);
    
    // Print everything for clarity
    console.log('🧾 Full message object:', message);
    console.log('📝 Message type:', message.type, '(typeof:', typeof message.type, ')');
    console.log('🗂️ All registered handlers:', Array.from(this.messageHandlers.keys()));
    
    // IMPORTANT: Try different variations of the type to match
    const msgType = message.type;
    const msgTypeLower = typeof msgType === 'string' ? msgType.toLowerCase() : null;
    const msgTypeBase = typeof msgType === 'string' ? msgType.split(' ')[0] : null;
    
    console.log('🔤 Trying to match against:', {
      original: msgType,
      lowercase: msgTypeLower,
      baseType: msgTypeBase
    });
    
    // Try all combinations to find a match
    let handler = null;
    let matchedType = null;
    
    if (this.messageHandlers.has(msgType)) {
      handler = this.messageHandlers.get(msgType);
      matchedType = msgType;
    } else if (msgTypeLower && this.messageHandlers.has(msgTypeLower)) {
      handler = this.messageHandlers.get(msgTypeLower);
      matchedType = msgTypeLower;
    } else if (msgTypeBase && this.messageHandlers.has(msgTypeBase)) {
      handler = this.messageHandlers.get(msgTypeBase);
      matchedType = msgTypeBase;
    }
    
    if (handler) {
      console.log('✅ Found handler for type:', matchedType);
      const handlerData = message.data !== undefined ? message.data : message;
      handler(handlerData);
    } else {
      console.warn('❌ NO HANDLER FOUND for any version of type:', msgType);
      
      // FALLBACK - try using a special handler for everything for testing
      console.log('🆘 Attempting fallback handling...');
      
      if (message.type && message.type.includes('GAME_STATE_UPDATE')) {
        console.log('🎮 Detected GAME_STATE_UPDATE, forcing handler call');
        const gameUpdateHandler = this.messageHandlers.get('GAME_STATE_UPDATE');
        if (gameUpdateHandler) {
          gameUpdateHandler(message.data || message);
        }
      }
    }
  } catch (error) {
    console.error('💥 Error in handleMessage:', error);
  }
}
    
    registerHandler(messageType: string, handler: (data: any) => void) {
        console.log('Registering handler for:', messageType);
        this.messageHandlers.set(messageType, handler);
        console.log('Handlers after registration:', Array.from(this.messageHandlers.keys()));
    }
    
    unregisterHandler(messageType: string) {
        this.messageHandlers.delete(messageType);
    }
    
    send(data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('Cannot send message, WebSocket is not open');
        }
    }
    
	createGame(): Promise<string> {
		return new Promise((resolve, reject) => {

			const timeoutId = setTimeout(() => {
				this.unregisterHandler('GAME_CREATED');
				reject(new Error('Game creation timed out'));
			}, 5000);

			this.registerHandler('GAME_CREATED', (data) => {
				clearTimeout(timeoutId); // Cancel timeout
				this.unregisterHandler('GAME_CREATED'); // Cleanup handler
				this.gameId = data.gameId;
				resolve(data.gameId);
			});
			
			this.send({
				type: 'CREATE_GAME',
				playerId: this.hostId
			});
			
		});
	}
    
    joinGame(gameId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.registerHandler('JOIN_SUCCESS', () => {
                resolve(true);
            });
            
            this.registerHandler('JOIN_FAILURE', (data) => {
                reject(new Error(data.reason));
            });
            
            this.send({
                type: 'JOIN_GAME',
                playerId: this.hostId,
                gameId
            });
        });
    }
    
    close() {
        this.socket?.close();
        this.socket = null;
    }
	  
    sendPaddleInput(player: number, direction: number) {
        this.send({
            type: 'PADDLE_INPUT',
            player: player,
            playerId: this.localPlayerId,
            dir: direction
        });
    }
}