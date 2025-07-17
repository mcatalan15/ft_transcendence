import { WebSocketManager } from '../../utils/network/WebSocketManager';
import { PongGame } from '../engine/Game';
import { getWsUrl } from '../../config/api';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { RenderComponent } from '../components/RenderComponent';
import { navigate } from '../../utils/router';

export class PongNetworkManager {
	private wsManager: WebSocketManager;
	private game: PongGame;
	private playerNumber: number = 0;
	private isHost: boolean = false;
	private hostName: string = '';
	private guestName: string = '';
	private gameId: string = '';

	private inputBuffer: Array<{input: number, timestamp: number}> = [];
	private lastInputSent: number = 0;

	constructor(game: PongGame | null, gameId: string) {
		this.game = game;
		this.gameId = gameId;
		
		this.wsManager = new WebSocketManager(
			sessionStorage.getItem('username') ?? 'undefined',
			getWsUrl('/socket/game')
		);

		// Only set networkManager if game exists
		if (this.game) {
			this.game.networkManager = this.wsManager;
		}
		
		this.setupHandlers();
		
		// Only connect immediately if we have a gameId (actual game)
		if (gameId) {
			this.connect(gameId);
		}
	}

	private setupHandlers() {
		this.wsManager.registerHandler('CONNECTION_SUCCESS', (message) => {
			console.log('Connected to game WebSocket:', message);
			
			const gameIdToUse = message.gameId || this.gameId;
			if (gameIdToUse && gameIdToUse !== '') {
				console.log('Identifying with gameId:', gameIdToUse);
				this.wsManager.send({
					type: 'IDENTIFY',
					playerId: sessionStorage.getItem('username'),
					gameId: gameIdToUse
				});
			} else {
				console.log('Connected for matchmaking - no gameId to identify with yet');
			}
		});

		this.wsManager.registerHandler('IDENTIFY_SUCCESS', (message) => {
			console.log('Identification successful:', message);
		});

		this.wsManager.registerHandler('JOIN_SUCCESS', (message) => {
			console.log('Successfully joined game:', message);
			this.playerNumber = message.playerNumber;
			this.isHost = message.playerNumber === 1;
			this.hostName = message.hostName;
			this.guestName = message.guestName;

			this.setupInputHandlers();
			
			this.wsManager.send({
				type: 'PLAYER_READY',
				gameId: this.gameId,
				playerId: sessionStorage.getItem('username')
			});
		});

		this.wsManager.registerHandler('JOIN_FAILURE', (message) => {
			console.error('Failed to join game:', message.reason);
		});

		this.wsManager.registerHandler('PLAYER_ASSIGNED', (message) => {
			this.playerNumber = message.playerNumber;
			this.isHost = message.isHost;
			this.game.localPlayerNumber = message.playerNumber;
		});
		
		this.wsManager.registerHandler('PLAYER_CONNECTED', (message) => {
			console.log('Player connected:', message);
			});

		this.wsManager.registerHandler('GAME_JOINED', (message) => {
			
			this.playerNumber = message.playerNumber;
			this.isHost = message.playerNumber === 1;
			
			if (this.game) {
				this.game.localPlayerNumber = message.playerNumber;
			} else {
				console.warn('No game instance when GAME_JOINED received');
			}

			this.setupInputHandlers();
			
			this.wsManager.send({
				type: 'PLAYER_READY',
				gameId: this.gameId,
				playerId: sessionStorage.getItem('username')
			});
			});
		
		this.wsManager.registerHandler('GAME_READY', (message) => {
			console.log('Both players connected, game is ready');
			this.hostName = message.hostName;
			this.guestName = message.guestName;
			});

		this.wsManager.registerHandler('GAME_START', (message) => {
			if (this.game) {
				this.game.start();
				if (message.gameState) {
					this.game.updateFromServer(message.gameState);
				}
			} else {
				console.error('No game instance when GAME_START received');
			}
		});
		
		this.wsManager.registerHandler('GAME_STATE_UPDATE', (message) => {

			if (message.gameState) {
				this.game.updateFromServer(message.gameState);
			}
		});

		this.wsManager.registerHandler('PLAYER_DISCONNECTED', (message) => {
			console.log('Player disconnected:', message.playerId);
			this.handlePlayerDisconnection(message.playerId);
		});

		this.wsManager.registerHandler('ERROR', (message) => {
			console.error('WebSocket error:', message);
		});

		this.wsManager.registerHandler('GAME_END', (message) => {
			this.handleGameEndMessage(message);
		});

		this.wsManager.registerHandler('MATCHMAKING_SUCCESS', (message) => {

			this.gameId = message.gameId;
			this.hostName = message.hostName;
			this.guestName = message.guestName;
			
			const currentUsername = sessionStorage.getItem('username');
			this.isHost = message.hostName === currentUsername;
			this.playerNumber = this.isHost ? 1 : 2;
			
			this.transitionToGame();
		});

		this.wsManager.registerHandler('MATCHMAKING_WAITING', (message) => {
			console.log('Waiting for opponent...', message);
			this.gameId = message.gameId;
		});
	}

	private async transitionToGame() {
		const params = new URLSearchParams({
			gameId: this.gameId,
			hostName: this.hostName,
			guestName: this.guestName,
			mode: 'online'
		});
		
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
		await sleep(1000); 
		navigate(`/pong?${params.toString()}`);
	}

	handlePlayerDisconnection(id: string) {
		const leftPlayerId = this.game.data.leftPlayer.name;
		const rightPlayerId = this.game.data.rightPlayer.name;

		if (id === leftPlayerId) {
			this.game.leftPlayer.isDisconnected = true;
			console.log(`Player ${leftPlayerId} has disconnected in handlePlayerDisconnection`);
		} else if (id === rightPlayerId) {
			this.game.rightPlayer.isDisconnected = true;
			console.log(`Player ${rightPlayerId} has disconnected in handlePlayerDisconnection`);
		}

		//! MIGHT NEED TO HANDLE THE DATA SEND OF ONLINE GAMES BY ONLY HOST (AND CHANGE OF HOSTS) FROM HERE
	}

	async connect(gameId: string) {
		try {
		console.log('Connecting to game session:', gameId);
		
		// Connect to WebSocket - the backend will send CONNECTION_SUCCESS
		await this.wsManager.connect(gameId);
		
		console.log('WebSocket connection established, waiting for join confirmation...');
		
		} catch (error) {
		console.error('Failed to connect to game:', error);
		
		// Show connection error in UI
		this.showConnectionStatus(`Connection failed: ${error.message}`);
		const statusDiv = document.getElementById('connection-status');
		if (statusDiv) {
			statusDiv.className = 'text-center text-red-400 text-lg mb-4';
		}
		
		throw error;
		}
	}

	private handleGameEndMessage(message: any): void {
		console.log('Processing game end...');
		
		// Update UI scores
		const uiEntity = this.game.entities.find(e => e.id === 'UI') as any;
		if (uiEntity && message.finalScore) {
			uiEntity.leftScore = message.finalScore.player1;
			uiEntity.rightScore = message.finalScore.player2;
		}
		
		// Update game data
		if (message.gameData) {
			this.game.data.leftPlayer = { ...this.game.data.leftPlayer, ...message.gameData.leftPlayer };
			this.game.data.rightPlayer = { ...this.game.data.rightPlayer, ...message.gameData.rightPlayer };
			this.game.data.finalScore = {
				leftPlayer: message.gameData.leftPlayer.score,
				rightPlayer: message.gameData.rightPlayer.score
			};
			this.game.data.winner = message.gameData.leftPlayer.result === 'win' ? 
				message.gameData.leftPlayer.name : message.gameData.rightPlayer.name;
		}
		
		// Trigger ending system
		const endingSystem = this.game.systems.find(s => s.constructor.name === 'EndingSystem') as any;
		if (endingSystem && !this.game.hasEnded) {
			(endingSystem as any).ended = true;
			this.game.hasEnded = true;
		}
	}

	private setupInputHandlers() {
		// Remove any existing listeners first
		this.cleanupInputHandlers();
		
		// Add new listeners
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
		
		console.log('Input handlers set up for player', this.playerNumber, this.isHost ? '(Host)' : '(Guest)');
	}

	private cleanupInputHandlers() {
		document.removeEventListener('keydown', this.handleKeyDown);
		document.removeEventListener('keyup', this.handleKeyUp);
	}

	private handleKeyDown = (e: KeyboardEvent) => {
		if (!this.game.isOnline) return;
	
		let input = 0;
		
		if (this.isHost) {
			if (e.key === 'w' || e.key === 'W') input = -1;
			if (e.key === 's' || e.key === 'S') input = 1;
		} else {
			if (e.key === 'ArrowUp') input = -1;
			if (e.key === 'ArrowDown') input = 1;
		}
	
		// Remove the input change check - send input every keydown event
		if (input !== 0) {
			// Apply input locally immediately (client-side prediction)
			this.applyLocalInput(input);
			
			// Send to server every time (not just on change)
			this.sendPaddleInput(input);
			this.lastInputSent = input;
			
			// Buffer for potential rollback
			this.inputBuffer.push({
				input: input,
				timestamp: Date.now()
			});
			
			// Keep buffer small
			if (this.inputBuffer.length > 10) {
				this.inputBuffer.shift();
			}
		}
	};

	private applyLocalInput(input: number): void {
		const localPaddleId = this.isHost ? 'paddleL' : 'paddleR';
		const localPaddle = this.game.entities.find(e => e.id === localPaddleId);
		
		if (localPaddle) {
			const physics = localPaddle.getComponent('physics') as PhysicsComponent;
			const render = localPaddle.getComponent('render') as RenderComponent;
			
			if (physics && render) {
				const speed = 10; // Match server paddle speed
				
				if (input === -1) {
					physics.y -= speed;
				} else if (input === 1) {
					physics.y += speed;
				}
				
				// Apply same constraints as server
				const minY = 110; // topWallBottom + paddleHeight/2
				const maxY = 670; // bottomWallTop - paddleHeight/2
				physics.y = Math.max(minY, Math.min(maxY, physics.y));
				
				render.graphic.y = physics.y;
			}
		}
	}

	private handleKeyUp = (e: KeyboardEvent) => {
		if (!this.game.isOnline) return;
	
		let shouldStop = false;
		
		if (this.isHost) {
			if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
				shouldStop = true;
			}
		} else {
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
				shouldStop = true;
			}
		}
	
		if (shouldStop) {
			// Send stop input immediately
			this.sendPaddleInput(0);
			this.lastInputSent = 0;
		}
	};

	private sendPaddleInput(input: number) {
		const message = {
			type: 'PADDLE_INPUT',
			gameId: this.gameId,
			playerId: sessionStorage.getItem('username'),
			input: input
		};
		
		this.wsManager.send(message);
	}

	getPlayerNumber(): number {
		return this.playerNumber;
	}

	disconnect() {
		this.cleanupInputHandlers();
		
		if (this.wsManager) {
			this.wsManager.close();
		}
	}

	public async startMatchmaking() {
		try {
			console.log('Starting matchmaking...');
			
			if (!this.wsManager.socket || this.wsManager.socket.readyState !== WebSocket.OPEN) {
				await this.wsManager.connect(null); // Connect without gameId for matchmaking
			}
			
			// Send matchmaking request
			this.wsManager.send({
				type: 'FIND_MATCH',
				gameType: '1v1',
				playerId: sessionStorage.getItem('username')
			});
			
		} catch (error) {
			console.error('Matchmaking connection failed:', error);
			throw error;
		}
	}

	public cancelMatchmaking() {
		this.wsManager.send({
			type: 'CANCEL_MATCHMAKING',
			playerId: sessionStorage.getItem('username')
		});
	}
}