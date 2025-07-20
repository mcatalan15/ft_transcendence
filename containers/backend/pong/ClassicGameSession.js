const ClassicPhysicsEngine = require('./ClassicPhysicsEngine');
const GameResultsService = require('./GameResultService');

class ClassicGameSession {
	constructor(sessionId, player1, player2) {
		this.sessionId = sessionId;
		this.players = {
			player1: { id: player1.id, socket: player1.socket, ready: false },
			player2: { id: player2.id, socket: player2.socket, ready: false }
		};
		
		this.gameState = {
			ball: { x: 900, y: 400 },
			ballVelocity: { x: 0, y: 0 },
			ballVisible: false,
			paddle1: { x: 60, y: 400 },
			paddle2: { x: 1740, y: 400 },
			paddle1Velocity: 0,
			paddle2Velocity: 0,
			paddleHeight: 80,
			paddleWidth: 10,
			ballRadius: 10,
			width: 1800,
			height: 800,
			score1: 0,
			score2: 0,
			gameTime: 0
		};
		
		this.physicsEngine = new ClassicPhysicsEngine(this.gameState);
		this.physicsEngine.startBallDelay();
		this.gameStarted = false;
		this.gameEnded = false;
		this.winner = null;
		
		this.paddleInputs = { p1: 0, p2: 0 };
		
		this.tickRate = 120;
		this.lastUpdate = Date.now();
		this.gameLoop = null;
		this.externalBroadcast = null;
		this.ballUpdateCounter = 0;
    	this.paddleUpdateCounter = 0;

		this.resultsSaved = false;
	}

	getState() {
		return {
			ball: this.gameState.ball,
			ballVelocity: this.gameState.ballVelocity,
			ballVisible: this.gameState.ballVisible,
			paddle1: this.gameState.paddle1,
			paddle2: this.gameState.paddle2,
			score1: this.gameState.score1,
			score2: this.gameState.score2,
			timestamp: Date.now()
		};
	}

	setExternalBroadcast(broadcastFunction) {
		this.externalBroadcast = broadcastFunction;
	}
	
	addPlayer(player) {
		if (this.players.player1.id === player.id) {
			this.players.player1.socket = player.socket;
			this.players.player1.ready = false;
		} else if (this.players.player2.id === player.id) {
			this.players.player2.socket = player.socket;
			this.players.player2.ready = false;
		} else {
			console.log(`🎮 ERROR: Player ${player.id} not expected in this game!`);
			console.log(`🎮 Expected players:`, {
				player1: this.players.player1.id,
				player2: this.players.player2.id
			});
			return;
		}
		
		this.broadcastToPlayer(player.socket, 'gameJoined', {
			sessionId: this.sessionId,
			yourPlayerNumber: this.players.player1.id === player.id ? 1 : 2
		});
		
		if (this.players.player1.socket && this.players.player2.socket) {
			console.log(`🎮 Both players connected: ${this.players.player1.id} (LEFT) vs ${this.players.player2.id} (RIGHT)`);
			
			this.broadcastToAll('bothPlayersConnected', {
				player1: this.players.player1.id,
				player2: this.players.player2.id
			});
			
			console.log('Both players connected, auto-starting game...');
			this.players.player1.ready = true;
			this.players.player2.ready = true;
			this.startGame();
		}
	}
	
	setPlayerReady(playerId) {
		console.log(`Player ${playerId} setting ready state`);
		
		if (this.players.player1.id === playerId) {
			this.players.player1.ready = true;
			console.log('Player 1 is now ready');
		} else if (this.players.player2.id === playerId) {
			this.players.player2.ready = true;
			console.log('Player 2 is now ready');
		}
		
		this.broadcastToAll('playerReady', { playerId });
		
		console.log(`Ready state: P1=${this.players.player1.ready}, P2=${this.players.player2.ready}`);
		
		if (this.players.player1.ready && this.players.player2.ready && !this.gameStarted) {
			console.log('Both players ready, starting game!');
			this.startGame();
		}
	}
	
	startGame() {
		this.gameStarted = true;
		console.log(`Starting classic game session ${this.sessionId}`);
		
		this.broadcastToAll('gameStarted', {
			gameState: this.getState(),
			timestamp: Date.now()
		});
		
		this.startGameLoop();
	}
	
	startGameLoop() {
		this.gameLoop = setInterval(() => {
			if (this.gameEnded) {
				this.stopGameLoop();
				return;
			}
			
			const now = Date.now();
			const deltaTime = (now - this.lastUpdate) / 1000;
			const clampedDelta = Math.min(deltaTime, 1/60);
			
			this.update(clampedDelta);
			
			this.broadcastGameState();
			
			this.lastUpdate = now;
		}, 1000 / this.tickRate);
	}

	broadcastBallState() {
		const ballUpdate = {
			type: 'BALL_UPDATE',
			ball: this.gameState.ball,
			ballVelocity: this.gameState.ballVelocity,
			timestamp: Date.now()
		};
		
		this.broadcastToAll('ballState', ballUpdate);
		if (this.externalBroadcast) {
			this.externalBroadcast(ballUpdate);
		}
	}
	
	broadcastPaddleState() {
		const paddleUpdate = {
			type: 'PADDLE_UPDATE',
			paddle1: this.gameState.paddle1,
			paddle2: this.gameState.paddle2,
			timestamp: Date.now()
		};
		
		this.broadcastToAll('paddleState', paddleUpdate);
		if (this.externalBroadcast) {
			this.externalBroadcast(paddleUpdate);
		}
	}
	
	update(deltaTime) {
		const goal = this.physicsEngine.update(deltaTime, this.paddleInputs);
		
		if (goal) {
			const goalEvent = {
				type: 'GOAL',
				scorer: goal.scorer,    
				score: goal.score
			};

			this.broadcastToAll('goalScored', goalEvent);

			if (this.externalBroadcast) {
				this.externalBroadcast(goalEvent);
			}
			
			if (this.gameState.score1 >= 3 || this.gameState.score2 >= 3) {
				this.endGame();
			}
		}
	}
	
	handlePlayerInput(playerId, input) {
		if (!this.gameStarted || this.gameEnded) return;    
		
		let playerNumber = 0;
		if (this.players.player1.id === playerId) {
			playerNumber = 1;
		} else if (this.players.player2.id === playerId) {
			playerNumber = 2;
		} else {
			return;
		}
		
		let direction = 0;
		if (input.up) direction = -1;
		else if (input.down) direction = 1;
		
		const oldInput = playerNumber === 1 ? this.paddleInputs.p1 : this.paddleInputs.p2;
		if (oldInput !== direction) {
			console.log(`🎮 Input changed: p${playerNumber} = ${direction}`);
		}
		
		if (playerNumber === 1) {
			this.paddleInputs.p1 = direction;
		} else {
			this.paddleInputs.p2 = direction;
		}
	}
	
	broadcastGameState() {
		if (this.gameEnded) {
			console.log(`Game ${this.sessionId} has ended, skipping state broadcast`);
			return;
		}
		
		const stateUpdate = {
			type: 'GAME_STATE_UPDATE',
			gameState: this.getState(),
			timestamp: Date.now()
		};
	
		this.broadcastToAll('gameState', stateUpdate);
	
		if (this.externalBroadcast) {
			this.externalBroadcast(stateUpdate);
		}
	}
	
	endGame() {
		if (this.gameEnded) {
			console.log(`Game ${this.sessionId} already ended, skipping duplicate endGame call`);
			return;
		}

		this.gameEnded = true;
		
		this.gameState.ball.x = -100;
		this.gameState.ball.y = -100;
		this.gameState.ballVelocity.x = 0;
		this.gameState.ballVelocity.y = 0;
		
		if (!this.players.player1.socket) {
			this.winner = 'player2';
		} else if (!this.players.player2.socket) {
			this.winner = 'player1';
		} else {
			this.winner = this.gameState.score1 > this.gameState.score2 ? 'player1' : 'player2';
		}
		
		console.log(`Game ${this.sessionId} ended. Winner: ${this.winner}`);
	
		const physicsGameData = this.physicsEngine.getGameData();
		
		console.log('=== GAME DATA COLLECTION ===');
		console.log('Raw physics engine data:', JSON.stringify(physicsGameData, null, 2));
		console.log('Game scores:', {
			player1: this.gameState.score1,
			player2: this.gameState.score2
		});
		console.log('Player details:', {
			player1: this.players.player1.id,
			player2: this.players.player2.id
		});
		
		const gameResults = {
			type: 'GAME_END',
			sessionId: this.sessionId,
			winner: this.winner,
			gameEnded: true,
			finalScore: {
				player1: this.gameState.score1,
				player2: this.gameState.score2
			},
			score1: this.gameState.score1,
			score2: this.gameState.score2,
			players: {
				player1: this.players.player1.id,
				player2: this.players.player2.id
			},
	
			gameData: {
				...physicsGameData,
				leftPlayer: {
					...physicsGameData.leftPlayer,
					name: this.players.player1.id,
					score: this.gameState.score1,
					result: this.gameState.score1 > this.gameState.score2 ? 'win' : 'lose'
				},
				rightPlayer: {
					...physicsGameData.rightPlayer,
					name: this.players.player2.id,
					score: this.gameState.score2,
					result: this.gameState.score2 > this.gameState.score1 ? 'win' : 'lose'
				},
				createdAt: new Date().toISOString(),
				endedAt: new Date().toISOString(),
				gameId: this.sessionId,
				config: {
					mode: 'online',
					classicMode: true,
					variant: '1v1'
				}
			}
		};
		
		console.log('=== FINAL GAME RESULTS ===');
		console.log('Complete gameResults object:', JSON.stringify(gameResults, null, 2));
		
		if (this.externalBroadcast) {
			console.log('📡 Broadcasting GAME_END via WebSocket');
			this.externalBroadcast(gameResults);
			console.log('📡 GAME_END broadcast complete');
		} else {
			console.log('❌ No externalBroadcast function available');
		}
		
		
		this.saveGameResults(gameResults);
		this.stopGameLoop();
	}
	
	async saveGameResults(results) {
		if (this.resultsSaved) {
			console.log('Game results already saved, skipping duplicate save');
			return;
		}
		
		try {
			console.log('Saving online game results:', results);
			this.resultsSaved = true;
			
			await GameResultsService.saveOnlineGameResults(results.gameData);
			
			console.log('Online game results saved successfully');
		} catch (error) {
			console.error('Error saving online game results:', error);
			this.resultsSaved = false;
			throw error;
		}
	}
	
	stopGameLoop() {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = null;
			console.log(`🔴 Game loop stopped for session ${this.sessionId}`);
		}
		
		this.gameEnded = true;
	}
	
	broadcastToAll(event, data) {
		if (this.players.player1.socket) {
			this.players.player1.socket.emit(event, data);
		}
		if (this.players.player2.socket) {
			this.players.player2.socket.emit(event, data);
		}
	}
	
	broadcastToPlayer(socket, event, data) {
		if (socket) {
			socket.emit(event, data);
		}
	}
	
	removePlayer(playerId) {
		if (this.players.player1.id === playerId) {
			this.players.player1.socket = null;
		} else if (this.players.player2.id === playerId) {
			this.players.player2.socket = null;
		}
		
		if (this.gameStarted && !this.gameEnded) {
			console.log(`Player ${playerId} disconnected, ending game`);
			this.broadcastToAll('playerDisconnected', { playerId });
			this.endGame();
		} else if (this.gameEnded) {
			console.log(`Player ${playerId} disconnected after game ended, no action needed`);
		}
	}
	
	
	cleanup() {
		this.stopGameLoop();
		console.log(`Cleaned up game session ${this.sessionId}`);
	}
}

module.exports = ClassicGameSession;