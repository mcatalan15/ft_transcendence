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
	private playerNumberAssigned: boolean = false;
    private currentPlayerNumber: number | null = null;
    
    private static instance: WebSocketManager | null = null;

    setPlayerRole(role: 'host' | 'guest') {
        this.playerRole = role;
        console.log('Player role set to:', this.playerRole);
    }

    getPlayerNumber(): number | null {
        return this.currentPlayerNumber;
    }
    
    setPlayerNumber(num: number): void {
        this.currentPlayerNumber = num;
        this.playerNumberAssigned = true;
        sessionStorage.setItem('playerNumber', num.toString());
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

	private isConnecting: boolean = false;

    connect(gameId: string | null): Promise<void> {

		if (this.isConnecting) {
			console.log('Connection attempt already in progress');
			return Promise.reject(new Error('Connection in progress'));
		  }
		  
		this.isConnecting = true;

        return new Promise((resolve, reject) => {
			if (this.socket) {
				console.log(`Closing existing connection before connecting with gameId: ${gameId}`);
				this.socket.onclose = null; // Prevent reconnect attempts during intentional close
				this.socket.close();
				this.socket = null;
			  }
			  
			// Reset reconnection counter when intentionally connecting
			this.reconnectAttempts = 0;
            this.gameId = gameId;
            
            // Log the exact URL
            const wsUrl = `ws://localhost:3100/ws/socket/game/`;
			
			this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connection OPENED successfully');
                this.isConnecting = false;

				const storedPlayerNumber = sessionStorage.getItem('playerNumber');

				this.send({
					type: 'IDENTIFY',
					playerId: this.localPlayerId,
					gameId: this.gameId,
					playerNumber: storedPlayerNumber ? parseInt(storedPlayerNumber) : undefined
				  });

                resolve();
            };
            
            this.socket.onclose = (event) => {
                console.log('WebSocket connection CLOSED', event);
				this.isConnecting = false;
				// Only handle automatic reconnects for unexpected closures
				if (event.code !== 1000) { // Normal closure
				  this.handleDisconnect(event);
				}
                reject(new Error('WebSocket connection closed'));
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket ERROR occurred:', error);
				this.isConnecting = false;
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
            
            if (this.messageHandlers.has(msgType)) {
                handler = this.messageHandlers.get(msgType);
            } else if (msgTypeLower && this.messageHandlers.has(msgTypeLower)) {
                handler = this.messageHandlers.get(msgTypeLower);
            } else if (msgTypeBase && this.messageHandlers.has(msgTypeBase)) {
                handler = this.messageHandlers.get(msgTypeBase);
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

	registerPlayerAssignmentHandler() {
        this.registerHandler('PLAYER_ASSIGNED', (message) => {
            console.log('Server assigned player number:', message.playerNumber);
            this.setPlayerNumber(message.playerNumber);
        });
    }
    
    send(data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('Cannot send message, WebSocket is not open');
        }
    }
    
	async createGame(): Promise<string> {

		try {
			await this.connect(null);
		  } catch (err) {
			console.error('Failed to connect before creating game:', err);
		  }

		return new Promise((resolve, reject) => {

			const timeoutId = setTimeout(() => {
				this.unregisterHandler('GAME_CREATED');
				reject(new Error('Game creation timed out'));
			}, 5000);

			this.registerHandler('GAME_CREATED', (data) => {
				clearTimeout(timeoutId); // Cancel timeout
				this.unregisterHandler('GAME_CREATED'); // Cleanup handler
				const newGameId = data.gameId;
				this.gameId = newGameId;
				resolve(newGameId);
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