import { getWsUrl } from '../../config/api';

export class WebSocketManager {
    private socket: WebSocket | null = null;
    private gameWebSocketUrl: string;
    private gameId: string | null = null;
    private hostId: string;
    private localPlayerId: string;
    private playerRole: 'host' | 'guest' | null = null;
    private messageHandlers: Map<string, (data: any) => void> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private currentPlayerNumber: number | null = null;
    private isConnecting: boolean = false;
    private hostName: string | null = null;
    private guestName: string | null = null;
    
    // Heartbeat properties
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private heartbeatTimeout: NodeJS.Timeout | null = null;
    private isAlive: boolean = true;
    private heartbeatIntervalMs = 30000; // 30 seconds
    private heartbeatTimeoutMs = 5000; // 5 seconds to wait for pong
    
    private static instance: WebSocketManager | null = null;

    getGameWebSocketUrl(): string {
        return this.gameWebSocketUrl;
    }

    setGameInfo(hostName: string, guestName: string, isHost: boolean): void {
        this.hostName = hostName;
        this.guestName = guestName;
        this.playerRole = isHost ? 'host' : 'guest';
        
        console.log('Game info set:', { hostName, guestName, isHost });
    }
    
    getHostName(): string | null { return this.hostName; }
    getGuestName(): string | null { return this.guestName; }

    setPlayerRole(role: 'host' | 'guest') {
        this.playerRole = role;
        console.log('Player role set to:', this.playerRole);
    }

    getPlayerNumber(): number | null {
        return this.currentPlayerNumber;
    }
    
    setPlayerNumber(num: number): void {
        this.currentPlayerNumber = num;
        sessionStorage.setItem('playerNumber', num.toString());
    }

    public static getInstance(playerId: string): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager(playerId);
        } else {
            WebSocketManager.instance.hostId = playerId;
            WebSocketManager.instance.localPlayerId = playerId;
        }
        return WebSocketManager.instance;
    }

    constructor(hostId: string, customUrl?: string) {
        this.hostId = hostId;
        this.localPlayerId = hostId;
        this.gameWebSocketUrl = customUrl || getWsUrl('/socket/game');
    }

    connect(gameId: string | null): Promise<void> {
        if (this.isConnecting) {
            console.log('Connection attempt already in progress');
            return Promise.reject(new Error('Connection in progress'));
        }
          
        this.isConnecting = true;

        return new Promise((resolve, reject) => {
            if (this.socket) {
                console.log(`Closing existing connection before connecting with gameId: ${gameId}`);
                this.cleanupConnection();
            }
              
            // Reset reconnection counter when intentionally connecting
            this.reconnectAttempts = 0;
            this.gameId = gameId;
            
            // Construct the proper WebSocket URL
            let wsUrl: string;
            if (gameId) {
                wsUrl = `${this.gameWebSocketUrl}/${gameId}`;
            } else {
                wsUrl = this.gameWebSocketUrl;
            }
            
            console.log('Connecting to WebSocket URL:', wsUrl);
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connection OPENED successfully to:', wsUrl);
                this.isConnecting = false;
                this.isAlive = true;

                const storedPlayerNumber = sessionStorage.getItem('playerNumber');

                this.send({
                    type: 'IDENTIFY',
                    playerId: this.localPlayerId,
                    gameId: this.gameId,
                    playerNumber: storedPlayerNumber ? parseInt(storedPlayerNumber) : undefined
                });

                // Start heartbeat after successful connection
                this.startHeartbeat();
                resolve();
            };
            
            this.socket.onclose = (event) => {
                console.log('WebSocket connection CLOSED', event);
                this.isConnecting = false;
                this.stopHeartbeat();
                
                // Only handle automatic reconnects for unexpected closures
                if (event.code !== 1000 && event.code !== 1001) { // Not normal closure or going away
                    this.handleDisconnect(event);
                }
                reject(new Error('WebSocket connection closed'));
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket ERROR occurred:', error);
                this.isConnecting = false;
                this.stopHeartbeat();
                reject(error);
            };
            
            this.socket.onmessage = this.handleMessage.bind(this);
        });
    }

    private startHeartbeat(): void {
        this.stopHeartbeat(); // Clear any existing heartbeat
        
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                // Send ping
                this.isAlive = false;
                this.socket.send(JSON.stringify({ type: 'PING' }));
                
                // Set timeout to check for pong response
                this.heartbeatTimeout = setTimeout(() => {
                    if (!this.isAlive) {
                        console.log('Heartbeat timeout - closing connection');
                        this.socket?.close();
                    }
                }, this.heartbeatTimeoutMs);
            }
        }, this.heartbeatIntervalMs);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    private cleanupConnection(): void {
        this.stopHeartbeat();
        if (this.socket) {
            this.socket.onclose = null; // Prevent reconnect attempts during intentional close
            this.socket.close();
            this.socket = null;
        }
    }
    
    private handleDisconnect(event: CloseEvent) {
        console.log('WebSocket connection closed unexpectedly:', event.code, event.reason);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect(this.gameId).catch((error) => {
                    console.error('Reconnection attempt failed:', error);
                });
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
            // Optionally emit an event or call a callback to notify the application
        }
    }

    private handleMessage(event: MessageEvent) {
        try {
            const message = JSON.parse(event.data);
            
            // Handle pong response for heartbeat
            if (message.type === 'PONG') {
                this.isAlive = true;
                if (this.heartbeatTimeout) {
                    clearTimeout(this.heartbeatTimeout);
                    this.heartbeatTimeout = null;
                }
                return;
            }
            
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
            throw err;
        }

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.unregisterHandler('GAME_CREATED');
                reject(new Error('Game creation timed out'));
            }, 5000);

            this.registerHandler('GAME_CREATED', (data) => {
                clearTimeout(timeoutId);
                this.unregisterHandler('GAME_CREATED');
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
    
    async joinGame(gameId: string): Promise<boolean> {
        try {
            await this.connect(gameId);
            
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    this.unregisterHandler('JOIN_SUCCESS');
                    this.unregisterHandler('JOIN_FAILURE');
                    reject(new Error('Join game timed out'));
                }, 10000);
                
                this.registerHandler('JOIN_SUCCESS', () => {
                    clearTimeout(timeoutId);
                    this.unregisterHandler('JOIN_SUCCESS');
                    this.unregisterHandler('JOIN_FAILURE');
                    resolve(true);
                });
                
                this.registerHandler('JOIN_FAILURE', (data) => {
                    clearTimeout(timeoutId);
                    this.unregisterHandler('JOIN_SUCCESS'); 
                    this.unregisterHandler('JOIN_FAILURE');
                    reject(new Error(data.reason || 'Failed to join game'));
                });
                
                this.send({
                    type: 'JOIN_GAME',
                    playerId: this.hostId,
                    gameId: gameId
                });
            });
        } catch (error) {
            console.error('Failed to connect to game WebSocket:', error);
            throw error;
        }
    }
    
    close() {
        this.cleanupConnection();
    }
      
    sendPaddleInput(player: number, direction: number) {
        this.send({
            type: 'PADDLE_INPUT',
            player: player,
            playerId: this.localPlayerId,
            dir: direction
        });
    }

    // Method to check connection status
    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    // Method to get current reconnection attempts
    getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }
}