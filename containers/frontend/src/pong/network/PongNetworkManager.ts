import { WebSocketManager } from '../../utils/network/WebSocketManager';
import { PongGame } from '../engine/Game';
import { getWsUrl } from '../../config/api';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { RenderComponent } from '../components/RenderComponent';
import { navigate } from '../../utils/router';
import { Menu } from '../menu/Menu';

export class PongNetworkManager {
	private wsManager: WebSocketManager;
	private game: PongGame;
	private playerNumber: number = 0;
	private isHost: boolean = false;
	private hostName: string = '';
	private guestName: string = '';
	private gameId: string = '';
	private menu: Menu | null = null;

	private inputBuffer: Array<{input: number, timestamp: number}> = [];
	private lastInputSent: number = 0;

	constructor(game: PongGame | null, gameId: string, menu?: Menu) {
		this.game = game;;
		this.menu = menu;
		this.gameId = gameId;
		
		this.wsManager = new WebSocketManager(
			sessionStorage.getItem('username') ?? 'undefined',
			getWsUrl('/socket/game')
		);

		if (this.game) {
			this.game.networkManager = this.wsManager;
		}
		
		this.setupHandlers();
		
		if (gameId) {
			this.connect(gameId);
		}
	}

	private setupHandlers() {
		this.wsManager.registerHandler('CONNECTION_SUCCESS', (message) => {
			
			const gameIdToUse = message.gameId || this.gameId;
			if (gameIdToUse && gameIdToUse !== '') {
				this.wsManager.send({
					type: 'IDENTIFY',
					playerId: sessionStorage.getItem('username'),
					gameId: gameIdToUse
				});
			}
		});

		this.wsManager.registerHandler('IDENTIFY_SUCCESS', (message) => {
			console.log('Identification successful:', message);
		});

		this.wsManager.registerHandler('JOIN_SUCCESS', (message) => {
			this.playerNumber = message.playerNumber;
			this.isHost = message.playerNumber === 1;
			this.hostName = message.hostName;
			this.guestName = message.guestName;
			
			this.updatePlayerNames();
			this.setupInputHandlers();
			
			this.wsManager.send({
				type: 'PLAYER_READY',
				gameId: this.gameId,
				playerId: sessionStorage.getItem('username')
			});
		});

		this.wsManager.registerHandler('JOIN_FAILURE', (message) => {
			console.error('Failed to join game:', message.reason);
			
			this.showConnectionStatus(`Failed to join game: ${message.reason}`);
			
			const statusDiv = document.getElementById('connection-status');
			if (statusDiv) {
				statusDiv.className = 'text-center text-red-400 text-lg mb-4';
			}
		});

		this.wsManager.registerHandler('PLAYER_ASSIGNED', (message) => {
			this.playerNumber = message.playerNumber;
			this.isHost = message.isHost;
			this.game.localPlayerNumber = message.playerNumber;
			
			this.showPlayerAssignment();
		});
		
		this.wsManager.registerHandler('PLAYER_CONNECTED', (message) => {
			this.showConnectionStatus(`Player ${message.playerId} connected (${message.playersConnected}/2)`);
			});

		this.wsManager.registerHandler('GAME_JOINED', (message) => {
			
			this.playerNumber = message.playerNumber;
			this.isHost = message.playerNumber === 1;
			
			if (this.game) {
				this.game.localPlayerNumber = message.playerNumber;
			} else {
				console.warn('No game instance when GAME_JOINED received');
			}
			
			this.showPlayerAssignment();
			this.setupInputHandlers();
			
			this.wsManager.send({
				type: 'PLAYER_READY',
				gameId: this.gameId,
				playerId: sessionStorage.getItem('username')
			});
			});
		
		this.wsManager.registerHandler('GAME_READY', (message) => {
			this.hostName = message.hostName;
			this.guestName = message.guestName;
			this.updatePlayerNames();
			this.showConnectionStatus('Both players connected! Game starting...');
			});

		this.wsManager.registerHandler('GAME_START', (message) => {
			if (this.game) {
				this.game.start();
				if (message.gameState) {
					this.game.updateFromServer(message.gameState);
				}
				this.showConnectionStatus('Game in progress');
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
			this.handlePlayerDisconnection(message.playerId);
		});

		this.wsManager.registerHandler('ERROR', (message) => {
			console.error('WebSocket error:', message);
			this.showConnectionStatus(`Connection error: ${message.message || 'Unknown error'}`);
			const statusDiv = document.getElementById('connection-status');
			if (statusDiv) {
				statusDiv.className = 'text-center text-red-400 text-lg mb-4';
			}
		});

		this.wsManager.registerHandler('GAME_END', (message) => {
			this.handleGameEndMessage(message);
		});

		this.wsManager.registerHandler('MATCHMAKING_SUCCESS', (message) => {

			this.menu?.readyButton.setClicked(false);

			this.gameId = message.gameId;
			this.hostName = message.hostName;
			this.guestName = message.guestName;
			
			const currentUsername = sessionStorage.getItem('username');
			this.isHost = message.hostName === currentUsername;
			this.playerNumber = this.isHost ? 1 : 2;

			this.menu?.eventQueue.push({ 
				type: 'MATCH_FOUND',
			});
		});

		this.wsManager.registerHandler('MATCHMAKING_WAITING', (message) => {
			this.gameId = message.gameId;
			this.showConnectionStatus('Searching for opponent...');
		});

		this.wsManager.registerHandler('GAME_WIN_BY_DEFAULT', (message) => {
			if (this.menu) {
				alert(message.message || 'You win! Opponent disconnected.');
				this.menu.readyButton.resetButton();
				this.menu.readyButton.updateText('READY');
				return;
			}

			if (this.game && !this.game.hasEnded) {
				const endingSystem = this.game.systems.find(s => s.constructor.name === 'EndingSystem') as any;
				if (endingSystem) {
					const currentUsername = sessionStorage.getItem('username');
					
					if (currentUsername === this.hostName) {
						this.game.data.leftPlayer.result = 'win';
						this.game.data.rightPlayer.result = 'lose';
						this.game.data.winner = this.hostName;
					} else {
						this.game.data.leftPlayer.result = 'lose';
						this.game.data.rightPlayer.result = 'win';
						this.game.data.winner = this.guestName;
					}

					const uiEntity = this.game.entities.find(e => e.id === 'UI') as any;
					if (uiEntity) {
						uiEntity.leftScore = 0;
						uiEntity.rightScore = 0;
						this.game.data.leftPlayer.score = 0;
						this.game.data.rightPlayer.score = 0;
					}
					
					endingSystem.ended = true;
					this.game.hasEnded = true;
				}
			}
		});
	}

	public addMessageListener(listener: (event: any) => void) {
		this.wsManager.registerHandler('GAME_WIN_BY_DEFAULT', (data) => {
			listener({ data: JSON.stringify({ type: 'GAME_WIN_BY_DEFAULT', ...data }) });
		});
	}
	
	public removeMessageListener(listener: (event: any) => void) {
		this.wsManager.unregisterHandler('GAME_WIN_BY_DEFAULT');
	}

	private async transitionToGame() {
		const params = new URLSearchParams({
			gameId: this.gameId,
			hostName: this.hostName,
			guestName: this.guestName,
			mode: 'online'
		});
		
		navigate(`/pong?${params.toString()}`);
	}

	private handlePlayerDisconnection(id: string) {
		const leftPlayerId = this.game.data.leftPlayer.name;
		const rightPlayerId = this.game.data.rightPlayer.name;
	
		if (id === leftPlayerId) {
			this.game.leftPlayer.isDisconnected = true;
		} else if (id === rightPlayerId) {
			this.game.rightPlayer.isDisconnected = true;
		}

		this.game.hasEnded = true;
		const endingSystem = this.game.systems.find(s => s.constructor.name === 'EndingSystem') as any;
		if (endingSystem) {
			endingSystem.ended = true;
		}
	}

	async connect(gameId: string) {
		try {
			await this.wsManager.connect(gameId);
			} catch (error) {
			console.error('Failed to connect to game:', error);

			const statusDiv = document.getElementById('connection-status');
			if (statusDiv) {
				statusDiv.className = 'text-center text-red-400 text-lg mb-4';
			}
			
			throw error;
		}
	}

	private updatePlayerNames() {
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
			if (message.includes('connected') || message.includes('ready') || message.includes('progress')) {
				statusDiv.className = 'text-center text-green-400 text-lg mb-4';
			}
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

	private handleGameEndMessage(message: any): void {
		const uiEntity = this.game.entities.find(e => e.id === 'UI') as any;
		if (uiEntity && message.finalScore) {
			uiEntity.leftScore = message.finalScore.player1;
			uiEntity.rightScore = message.finalScore.player2;
		}

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
		
		const endingSystem = this.game.systems.find(s => s.constructor.name === 'EndingSystem') as any;
		if (endingSystem && !this.game.hasEnded) {
			(endingSystem as any).ended = true;
			this.game.hasEnded = true;
		}
	}

	private setupInputHandlers() {
		this.cleanupInputHandlers();

		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('keyup', this.handleKeyUp);
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

		if (input !== 0) {
			this.applyLocalInput(input);

			this.sendPaddleInput(input);
			this.lastInputSent = input;

			this.inputBuffer.push({
				input: input,
				timestamp: Date.now()
			});
			
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
				const speed = 10;
				
				if (input === -1) {
					physics.y -= speed;
				} else if (input === 1) {
					physics.y += speed;
				}

				const minY = 110;
				const maxY = 670;
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
			if (!this.wsManager.isSocket() || !this.wsManager.isConnected()) {
				await this.wsManager.connect(null);
			}
			
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

	public async cancelMatchmaking() {
		this.wsManager.send({
			type: 'CANCEL_MATCHMAKING',
			playerId: sessionStorage.getItem('username')
		});
		this.disconnect();
	}

	public async playerDisconnected() {
		const playerId = sessionStorage.getItem('username') || null;
		this.wsManager.send({
			type: 'PLAYER_DISCONNECTED',
			playerId: playerId
		});
		this.handlePlayerDisconnection(playerId || '');
		this.disconnect();
	}

	public getIsHost(): boolean {
		return this.isHost;
	}
	public getGameId(): string {
		return this.gameId;
	}
	public getHostName(): string {
		return this.hostName;
	}
	public getGuestName(): string {
		return this.guestName;
	}
}