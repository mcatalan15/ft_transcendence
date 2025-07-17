const WebSocket = require('ws');
const ClassicGameSession = require('../../pong/ClassicGameSession'); 

function setupGameWebSocket(wss, redisService, gameManager) {
	const activeGames = new Map();
	const playerConnections = new Map();

	wss.on('connection', (ws, request, connectionInfo) => {
		console.log('Game WebSocket connection established');

		const gameIdFromUrl = connectionInfo?.gameId || ws.gameId;
		console.log('GameId from URL:', gameIdFromUrl);

		let playerId = null;
		let gameId = gameIdFromUrl;
		let playerNumber = null;

		if (gameId) {
			ws.send(JSON.stringify({
				type: 'CONNECTION_SUCCESS',
				gameId: gameId,
				message: 'Connected to game WebSocket'
			}));
		}

		ws.on('message', async (message) => {
			try {
				const data = JSON.parse(message.toString());
				console.log('Game WebSocket received:', data.type, data);

				switch (data.type) {

					case 'IDENTIFY':
						playerId = data.playerId;
						gameId = data.gameId || gameId;
						
						// Store the WebSocket connection for this player
						playerConnections.set(playerId, ws);
						
						console.log(`Player ${playerId} identified for game ${gameId}`);
					
						ws.send(JSON.stringify({
							type: 'IDENTIFY_SUCCESS',
							playerId: playerId,
							gameId: gameId
						}));
					
						// Only attempt to join game if we have a valid gameId
						if (gameId && gameId !== '' && gameId !== 'undefined' && gameId !== 'null') {
							console.log(`Attempting to join game ${gameId} for player ${playerId}`);
							await handleJoinGame({ playerId, gameId }, ws, activeGames, redisService);
						} else {
							console.log(`Player ${playerId} identified but no valid gameId (${gameId}) - likely for matchmaking`);
						}
						break;

					case 'JOIN_GAME':
						await handleJoinGame(data, ws, activeGames, redisService);
						break;

					case 'PADDLE_INPUT':
						handlePaddleInput(data, activeGames);
						break;

					case 'PLAYER_READY':
						handlePlayerReady(data, activeGames);
						break;

					case 'PING':
						ws.send(JSON.stringify({ type: 'PONG' }));
						break;
					
					case 'FIND_MATCH':
						console.log('Player requesting matchmaking:', data);
						if (data.playerId) {
							playerConnections.set(data.playerId, ws);
						}
						await handleFindMatch(data, ws, redisService, playerConnections);
						break;

					default:
						console.log('Unknown game message type:', data.type);
					}
			} catch (error) {
				console.error('Error processing game message:', error);
				console.error('Error stack:', error.stack);
				ws.send(JSON.stringify({
					type: 'ERROR',
					message: 'Invalid message format: ' + error.message
				}));
			}
		});

		ws.on('close', () => {
			console.log(`Game WebSocket closed for player ${playerId} in game ${gameId}`);

			if (playerId) {
				playerConnections.delete(playerId);
				console.log(`Removed connection for player ${playerId}`);
			}
			
			handlePlayerDisconnect(playerId, gameId, activeGames);
		});

		ws.on('error', (error) => {
			
		});
	});

	async function handleJoinGame(data, ws, activeGames, redisService) {
		const { gameId, playerId } = data;

		if (!gameId || !playerId) {
			ws.send(JSON.stringify({
				type: 'ERROR',
				message: 'Invalid game data'
			}));
			return;
		}

		try {
			const gameData = await redisService.getGameData(gameId);
			
			if (!gameData) {
				ws.send(JSON.stringify({
					type: 'ERROR',
					message: 'Game not found'
				}));
				return;
			}

			// Check if session exists
			const sessionExists = activeGames.has(gameId);

			if (!sessionExists) {

				const session = new ClassicGameSession(gameId, 
					{ id: gameData.hostId, socket: null },
					{ id: gameData.guestId, socket: null }
				);

				session.setExternalBroadcast((message) => {
					broadcastToGame(gameId, message, activeGames);
				});

				activeGames.set(gameId, {
					session: session,
					players: new Map(),
					gameData: gameData,
					gameLoop: null,
					lastUpdate: Date.now()
				});
			}

			const game = activeGames.get(gameId);
			
			let playerNumber;
			if (playerId === gameData.hostId) {
				playerNumber = 1;
			} else if (playerId === gameData.guestId) {
				playerNumber = 2;
			} else {
				console.error('Unauthorized player:', playerId);
				ws.send(JSON.stringify({
					type: 'ERROR',
					message: 'Unauthorized player'
				}));
				return;
			}

			game.players.set(playerId, {
				ws: ws,
				playerNumber: playerNumber,
				ready: false
			});

			const playerObject = {
				id: playerId,
				socket: ws
			};
			game.session.addPlayer(playerObject);

			ws.send(JSON.stringify({
				type: 'GAME_JOINED',
				gameId: gameId,
				playerNumber: playerNumber,
				hostName: gameData.hostId,
				guestName: gameData.guestId,
				gameState: game.session.getState()
			}));

			console.log(`Player ${playerId} joined game ${gameId} as player ${playerNumber}`);

			// Check if both players are now connected
			const connectedPlayers = game.players.size;


			// Auto-start logic for matchmaking games
			if (gameData.status === 'ready' && connectedPlayers === 2) {
				// Mark all players as ready
				game.players.forEach((player, pid) => {
					player.ready = true;
				});
				
				startGame(gameId, activeGames);
			} else {
				console.log(`Not auto-starting: status=${gameData.status}, players=${connectedPlayers}/2`);
			}

		} catch (error) {
			console.error('Error in handleJoinGame:', error);
			console.error('Error stack:', error.stack);
			ws.send(JSON.stringify({
				type: 'ERROR',
				message: 'Failed to join game'
			}));
		}
	}

	function handlePlayerReady(data, activeGames) {
		const { gameId, playerId } = data;
		console.log(`Player ${playerId} signaling ready for game ${gameId}`);

		const game = activeGames.get(gameId);

		if (!game || !game.players.has(playerId)) {
			console.error(`Player ${playerId} not found in game ${gameId}`);
			return;
		}

		const player = game.players.get(playerId);
		player.ready = true;

		const allReady = Array.from(game.players.values()).every(p => p.ready);
		const playerCount = game.players.size;

		console.log(`Game ${gameId} readiness: ${Array.from(game.players.values()).filter(p => p.ready).length}/${playerCount} players ready`);

		// Start the game if all players are ready AND we have 2 players
		if (allReady && playerCount === 2) {
			startGame(gameId, activeGames);
		} else {
			console.log(`Game ${gameId} waiting for more players or ready signals`);
		}
	}

	function startGame(gameId, activeGames) {
		
		const game = activeGames.get(gameId);
		if (!game) {
			console.error('Game not found in activeGames');
			return;
		}
		
		if (game.session.gameStarted) {
			console.log('Game already started');
			return;
		}

		game.session.setExternalBroadcast((message) => {
			broadcastToGame(gameId, message, activeGames);
		});

		try {
			game.session.startGame();
		} catch (error) {
			console.error('Error starting game session:', error);
		}
	}

	function updateGame(gameId, activeGames) {
		const game = activeGames.get(gameId);
		if (!game) return;
	}

	function handlePaddleInput(data, activeGames) {
		const { gameId, playerId, input } = data;
		const game = activeGames.get(gameId);

		if (!game || !game.session) {
			console.log(`Invalid paddle input: game or session not found for ${gameId}`);
			return;
		}

		const inputState = {
			up: input === -1,
			down: input === 1
		};

		game.session.handlePlayerInput(playerId, inputState);

		console.log(`Player ${playerId} input: ${input} processed by ClassicGameSession`);
	}

	function endGame(gameId, activeGames) {
		const game = activeGames.get(gameId);
		if (!game) return;

		console.log(`Ending game ${gameId}`);

		game.session.endGame();

		setTimeout(() => {
			activeGames.delete(gameId);
			console.log(`Cleaned up game ${gameId}`);
		}, 5000);
	}

	function handlePlayerDisconnect(playerId, gameId, activeGames) {
		if (!gameId || !playerId) return;

		const game = activeGames.get(gameId);
		if (!game) return;

		game.players.delete(playerId);	

		broadcastToGame(gameId, {
		type: 'PLAYER_DISCONNECTED',
		playerId: playerId
		}, activeGames);

		endGame(gameId, activeGames);
	}

	function broadcastToGame(gameId, message, activeGames) {
		const game = activeGames.get(gameId);
		if (!game) return;

		const messageToSend = {
			type: message.type || 'UNKNOWN',
			...message
		};
		
		const messageStr = JSON.stringify(messageToSend);

		game.players.forEach((player, playerId) => {
			if (player.ws && player.ws.readyState === WebSocket.OPEN) {
				player.ws.send(messageStr);
			} else {
				console.log(`Player ${playerId} WebSocket not ready`);
			}
		});

		console.log(`Broadcasted message to game ${gameId}:`, messageToSend.type);
	}

	async function handleFindMatch(data, ws, redisService, playerConnections) {
		const { playerId, gameType = '1v1' } = data;
		
		if (!playerId) {
			ws.send(JSON.stringify({
				type: 'ERROR',
				message: 'Player ID is required for matchmaking'
			}));
			return;
		}

		try {
			console.log(`Finding match for player ${playerId}, game type: ${gameType}`);
			
			const waitingGames = await redisService.getWaitingGames(gameType);

			if (waitingGames && waitingGames.length > 0) {

				const gameId = waitingGames[0];
				const gameData = await redisService.getGameData(gameId);
				
				if (gameData && !gameData.guestId) {
					gameData.guestId = playerId;
					gameData.status = 'ready';
					await redisService.setGameData(gameId, gameData);
					
					ws.send(JSON.stringify({
						type: 'MATCHMAKING_SUCCESS',
						gameId: gameId,
						hostName: gameData.hostId,
						guestName: gameData.guestId,
						role: 'guest'
					}));
					
					const hostConnection = playerConnections.get(gameData.hostId);
					if (hostConnection && hostConnection.readyState === 1) {
						hostConnection.send(JSON.stringify({
							type: 'MATCHMAKING_SUCCESS',
							gameId: gameId,
							hostName: gameData.hostId,
							guestName: gameData.guestId,
							role: 'host'
						}));
					}
				}
			} else {
				const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				const gameData = {
					gameId: gameId,
					hostId: playerId,
					guestId: null,
					status: 'waiting',
					gameType: gameType,
					createdAt: new Date().toISOString()
				};
				
				await redisService.setGameData(gameId, gameData);
				
				ws.send(JSON.stringify({
					type: 'MATCHMAKING_WAITING',
					gameId: gameId,
					message: 'Waiting for opponent...'
				}));
			}

		} catch (error) {
			console.error('Matchmaking error:', error);
			ws.send(JSON.stringify({
				type: 'ERROR',
				message: 'Failed to find match: ' + error.message
			}));
		}
	}
}

module.exports = { setupGameWebSocket };