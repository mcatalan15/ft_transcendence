import { WebSocketManager } from '../../utils/network/WebSocketManager';
import { PongGame } from '../engine/Game';
import { getWsUrl } from '../../config/api';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { RenderComponent } from '../components/RenderComponent';

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

	constructor(game: PongGame, gameId: string) {
		this.game = game;
		this.gameId = gameId;
		
		// Create a new WebSocketManager instance specifically for this game
		this.wsManager = new WebSocketManager(
		sessionStorage.getItem('username') ?? 'undefined',
		getWsUrl('/socket/game') // Base URL, gameId will be appended
		);

		this.game.networkManager = this;
		this.setupHandlers();
		this.connect(gameId);
	}

	private setupHandlers() {
		this.wsManager.registerHandler('CONNECTION_SUCCESS', (message) => {
		console.log('Connected to game WebSocket:', message);
		
		// Validate that we have the gameId
		const gameIdToUse = message.gameId || this.gameId;
		if (!gameIdToUse) {
			console.error('No gameId available for identification');
			return;
		}
		
		// Send identification after successful connection
		this.wsManager.send({
			type: 'IDENTIFY',
			playerId: sessionStorage.getItem('username'),
			gameId: gameIdToUse
		});
		});

		this.wsManager.registerHandler('IDENTIFY_SUCCESS', (message) => {
		console.log('Identification successful:', message);
		// The backend will automatically trigger JOIN_GAME after IDENTIFY
		});

		this.wsManager.registerHandler('JOIN_SUCCESS', (message) => {
		console.log('Successfully joined game:', message);
		this.playerNumber = message.playerNumber;
		this.isHost = message.playerNumber === 1;
		this.hostName = message.hostName;
		this.guestName = message.guestName;
		
		// Update game UI with player names
		this.updatePlayerNames();
		this.setupInputHandlers();
		
		// Send ready signal
		this.wsManager.send({
			type: 'PLAYER_READY',
			gameId: this.gameId,
			playerId: sessionStorage.getItem('username')
		});
		});

		this.wsManager.registerHandler('JOIN_FAILURE', (message) => {
		console.error('Failed to join game:', message.reason);
		
		// Show error in UI instead of throwing
		this.showConnectionStatus(`Failed to join game: ${message.reason}`);
		
		// Update connection status div to show error
		const statusDiv = document.getElementById('connection-status');
		if (statusDiv) {
			statusDiv.className = 'text-center text-red-400 text-lg mb-4';
		}
		});

		this.wsManager.registerHandler('PLAYER_ASSIGNED', (message) => {
		this.playerNumber = message.playerNumber;
		this.isHost = message.isHost;
		this.game.localPlayerNumber = message.playerNumber;
		
		console.log('Player assignment:', {
			playerNumber: this.playerNumber,
			isHost: this.isHost,
			role: this.isHost ? 'Host (Left Paddle)' : 'Guest (Right Paddle)'
		});
		
		this.showPlayerAssignment();
		});
		
		this.wsManager.registerHandler('PLAYER_CONNECTED', (message) => {
		console.log('Player connected:', message);
		this.showConnectionStatus(`Player ${message.playerId} connected (${message.playersConnected}/2)`);
		});

		this.wsManager.registerHandler('GAME_JOINED', (message) => {
		console.log('Successfully joined game:', message);
		
		this.playerNumber = message.playerNumber;
		this.isHost = message.playerNumber === 1;
		this.game.localPlayerNumber = message.playerNumber;
		
		console.log('🎮 DETAILED Player assignment DEBUG:', {
			playerId: sessionStorage.getItem('username'),
			playerNumber: this.playerNumber,
			isHost: this.isHost,
			gameLocalPlayerNumber: this.game.localPlayerNumber,
			expectedPaddle: this.isHost ? 'LEFT (paddleL)' : 'RIGHT (paddleR)',
			controls: this.isHost ? 'W/S keys' : 'Arrow keys',
			role: this.isHost ? 'Host (Left Paddle)' : 'Guest (Right Paddle)'
		});
		
		this.showPlayerAssignment();
		this.setupInputHandlers();
		});
		
		this.wsManager.registerHandler('GAME_READY', (message) => {
		console.log('Both players connected, game is ready');
		this.hostName = message.hostName;
		this.guestName = message.guestName;
		this.updatePlayerNames();
		this.showConnectionStatus('Both players connected! Game starting...');
		});

		this.wsManager.registerHandler('GAME_START', (message) => {
		console.log('Game started!');
		this.game.start();
		this.game.updateFromServer(message.gameState);
		this.showConnectionStatus('Game in progress');
		});
		
		this.wsManager.registerHandler('GAME_STATE_UPDATE', (message) => {
		// Update game state from server
		if (message.gameState) {
			this.game.updateFromServer(message.gameState);
		}
		});

		this.wsManager.registerHandler('PLAYER_DISCONNECTED', (message) => {
		console.log('Player disconnected:', message.playerId);
		this.showDisconnectionMessage();
		});

		this.wsManager.registerHandler('GAME_END', (message) => {
		console.log('Game ended:', message);
		this.handleGameEnd(message);
		});

		// Add error handler for WebSocket errors
		this.wsManager.registerHandler('ERROR', (message) => {
		console.error('WebSocket error:', message);
		this.showConnectionStatus(`Connection error: ${message.message || 'Unknown error'}`);
		const statusDiv = document.getElementById('connection-status');
		if (statusDiv) {
			statusDiv.className = 'text-center text-red-400 text-lg mb-4';
		}
		});
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

	private updatePlayerNames() {
		// Update the game UI to show player names
		const playerNamesDiv = document.getElementById('player-names');
		if (playerNamesDiv) {
		playerNamesDiv.innerHTML = `
			<div class="flex justify-between text-white text-lg font-semibold">
			<div>🏓 ${this.hostName} (Host)</div>
			<div class="text-gray-400">VS</div>
			<div>${this.guestName} (Guest) 🏓</div>
			</div>
		`;
		}
	}

	private showConnectionStatus(message: string) {
		const statusDiv = document.getElementById('connection-status');
		if (statusDiv) {
		statusDiv.textContent = message;
		// Only change to green if it's a success message
		if (message.includes('connected') || message.includes('ready') || message.includes('progress')) {
			statusDiv.className = 'text-center text-green-400 text-lg mb-4';
		}
		// Red class is set by individual handlers for errors
		}
	}

	private showPlayerAssignment() {
		const role = this.isHost ? 'Host (Left Paddle)' : 'Guest (Right Paddle)';
		const controls = this.isHost ? 'W/S keys' : '↑/↓ arrow keys';
		const playerText = `You are: ${role}`;
		
		const assignmentDiv = document.getElementById('player-assignment');
		if (assignmentDiv) {
		assignmentDiv.innerHTML = `
			<div class="text-center text-blue-400 text-lg mb-2">
			${playerText}
			</div>
			<div class="text-center text-gray-400 text-sm mb-2">
			Controls: ${controls}
			</div>
		`;
		}
	}

	private showDisconnectionMessage() {
		const statusDiv = document.getElementById('connection-status');
		if (statusDiv) {
		statusDiv.textContent = 'Opponent disconnected from the game';
		statusDiv.className = 'text-center text-red-400 text-lg mb-4';
		}
	}

	private handleGameEnd(message: any) {
		const { winner, finalScore } = message;
		const winnerName = winner === 1 ? this.hostName : this.guestName;
		
		// Clean up input handlers since game is over
		this.cleanupInputHandlers();
		
		// Show game end screen
		const statusDiv = document.getElementById('connection-status');
		if (statusDiv) {
		statusDiv.innerHTML = `
			<div class="text-center text-yellow-400 text-xl mb-4">
			🎉 Game Over! 🎉
			</div>
			<div class="text-center text-white text-lg mb-2">
			Winner: ${winnerName}
			</div>
			<div class="text-center text-gray-400 text-md">
			Final Score: ${finalScore.player1} - ${finalScore.player2}
			</div>
		`;
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
			console.log(`🎮 Key released: ${e.key}, stopping input`);
		}
	};

	private sendPaddleInput(input: number) {
		const message = {
			type: 'PADDLE_INPUT',
			gameId: this.gameId,
			playerId: sessionStorage.getItem('username'),
			input: input
		};
		
		console.log('🎮 Sending paddle input to server:', message);
		this.wsManager.send(message);
	}

	getPlayerNumber(): number {
		return this.playerNumber;
	}

	disconnect() {
		// Clean up event listeners
		this.cleanupInputHandlers();
		
		// Close WebSocket connection
		if (this.wsManager) {
		this.wsManager.disconnect();
		}
	}
}