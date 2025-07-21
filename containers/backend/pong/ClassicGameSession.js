/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ClassicGameSession.js                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/21 17:04:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 17:25:48 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
			console.log(`ERROR: Player ${player.id} not expected in this game!`);
			console.log(`Expected players:`, {
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
			
			this.broadcastToAll('bothPlayersConnected', {
				player1: this.players.player1.id,
				player2: this.players.player2.id
			});
			
			this.players.player1.ready = true;
			this.players.player2.ready = true;
			this.startGame();
		}
	}
	
	setPlayerReady(playerId) {
		if (this.players.player1.id === playerId) {
			this.players.player1.ready = true;
		} else if (this.players.player2.id === playerId) {
			this.players.player2.ready = true;
		}
		
		this.broadcastToAll('playerReady', { playerId });
		
		if (this.players.player1.ready && this.players.player2.ready && !this.gameStarted) {
			this.startGame();
		}
	}
	
	startGame() {
		this.gameStarted = true;
		
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
			
			const isDraw = (this.gameState.score1 === 20 && this.gameState.score2 === 20);
			const isHighScoreWin = (this.gameState.score1 >= 11 || this.gameState.score2 >= 11) && 
								  Math.abs(this.gameState.score1 - this.gameState.score2) >= 2;
			const isOldRuleWin = (this.gameState.score1 >= 11 || this.gameState.score2 >= 11);
			
			if (isDraw || isHighScoreWin || isOldRuleWin) {
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
		
		if (playerNumber === 1) {
			this.paddleInputs.p1 = direction;
		} else {
			this.paddleInputs.p2 = direction;
		}
	}
	
	broadcastGameState() {
		if (this.gameEnded) {
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
		} else if (this.gameState.score1 > this.gameState.score2) {
			this.winner = 'player1';
		} else if (this.gameState.score2 > this.gameState.score1) {
			this.winner = 'player2';
		} else {
			this.winner = 'draw';
		}
		
	
		const physicsGameData = this.physicsEngine.getGameData();
		
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
					result: this.gameState.score1 > this.gameState.score2 ? 'win' : 
							this.gameState.score1 < this.gameState.score2 ? 'lose' : 'draw'
				},
				rightPlayer: {
					...physicsGameData.rightPlayer,
					name: this.players.player2.id,
					score: this.gameState.score2,
					result: this.gameState.score2 > this.gameState.score1 ? 'win' : 
							this.gameState.score2 < this.gameState.score1 ? 'lose' : 'draw'
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
		
		
		if (this.externalBroadcast) {
			this.externalBroadcast(gameResults);
		}

		this.saveGameResults(gameResults);
		this.stopGameLoop();
	}
	
	async saveGameResults(results) {
		if (this.resultsSaved) {
			return;
		}
		
		try {
			this.resultsSaved = true;
			
			await GameResultsService.saveOnlineGameResults(results.gameData);
			
		} catch (error) {
			this.resultsSaved = false;
			throw error;
		}
	}
	
	stopGameLoop() {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = null;
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
			this.broadcastToAll('playerDisconnected', { playerId });
			this.endGame();
		} 
	}
	
	cleanup() {
		this.stopGameLoop();
	}
}

module.exports = ClassicGameSession;