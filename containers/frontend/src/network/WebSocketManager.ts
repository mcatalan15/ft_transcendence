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
    
    connect(gameId: string | null): Promise<void> {
        return new Promise((resolve, reject) => {
            this.gameId = gameId;
            
            // Log the exact URL
            const wsUrl = `ws://localhost:3100/ws/socket/game/${gameId}`;       
            this.socket = new WebSocket(wsUrl);

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

        try {
            const message = JSON.parse(event.data);
            
            // IMPORTANT: Try different variations of the type to match
            const msgType = message.type;
            const msgTypeLower = typeof msgType === 'string' ? msgType.toLowerCase() : null;
            const msgTypeBase = typeof msgType === 'string' ? msgType.split(' ')[0] : null;
            
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
                const handlerData = message.data !== undefined ? message.data : message;
                handler(handlerData);
            } else {
            
            if (message.type && message.type.includes('GAME_STATE_UPDATE')) {
                const gameUpdateHandler = this.messageHandlers.get('GAME_STATE_UPDATE');
                if (gameUpdateHandler) {
                gameUpdateHandler(message.data || message);
                }
            }
            }
        } catch (error) {
            console.error('Error in handleMessage:', error);
        }
    }
    
    registerHandler(messageType: string, handler: (data: any) => void) {
        this.messageHandlers.set(messageType, handler);
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