import { PongGame } from "../pong/engine/Game";

export class WebSocketManager {
    private socket: WebSocket | null = null;
    private url: string;
    private gameId: string | null = null;
    private playerId: string;
    private messageHandlers: Map<string, (data: any) => void> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    
    constructor(playerId: string) {
        this.playerId = playerId;
        this.url = `ws://${window.location.host}/ws/socket/game`;
    }
    
	connect(gameId?: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let connectionUrl = this.url;
	
			if (gameId) {
				this.gameId = gameId;
				connectionUrl = `${this.url}/${gameId}`; 
			}
				
			console.log(`Attempting to connect to: ${connectionUrl}`);
			this.socket = new WebSocket(connectionUrl); // Create WS once with correct URL
				
			this.socket.onopen = () => {
				console.log('WebSocket connection established');
				this.reconnectAttempts = 0;
					
				// Send initial identification
				this.send({
					type: 'PLAYER_CONNECTED',
					playerId: this.playerId,
					gameId: this.gameId
				});
					
				resolve(true);
			};
				
			this.socket.onclose = this.handleDisconnect.bind(this);
			this.socket.onerror = (error) => {
				console.error('WebSocket error:', error);
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
            
            if (this.messageHandlers.has(message.type)) {
                this.messageHandlers.get(message.type)!(message);
            } else {
                console.warn('No handler for message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
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
				playerId: this.playerId
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
                playerId: this.playerId,
                gameId
            });
        });
    }
    
    close() {
        this.socket?.close();
        this.socket = null;
    }

	initializeAsHost(game: PongGame) {
		game.setHostStatus(true);
		
		// Listen for opponent inputs
		this.registerHandler('PADDLE_INPUT', (data) => {
		  if (data.playerId !== this.playerId) {
			game.updateRemotePlayerInput(data.moveUp, data.moveDown);
		  }
		});
		
		// Send game state to client periodically
		setInterval(() => {
		  this.send({
			type: 'GAME_STATE_UPDATE',
			gameState: game.getSerializableState()
		  });
		}, 50); // 20 times per second
	  }
	  
	  initializeAsClient(game: PongGame) {
		game.setHostStatus(false);
		
		// Receive and apply game state from host
		this.registerHandler('GAME_STATE_UPDATE', (data) => {
		  game.applyRemoteState(data.gameState);
		});
	  }
	  
	  // Send paddle input to server (both host and client use this)
	  sendPaddleInput(moveUp: boolean, moveDown: boolean) {
		this.send({
		  type: 'PADDLE_INPUT',
		  playerId: this.playerId,
		  gameId: this.gameId,
		  moveUp,
		  moveDown
		});
	  }
}