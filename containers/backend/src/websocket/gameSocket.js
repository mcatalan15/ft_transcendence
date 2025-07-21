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

					case 'CANCEL_MATCHMAKING':
						handleCancelMatchmaking(data, redisService, activeGames, playerConnections);
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
			}

			handlePlayerDisconnect(playerId, gameId, activeGames, playerConnections);
		});

		ws.on('error', (error) => {

		});
	});

	async function handleCancelMatchmaking(data, redisService, activeGames, playerConnections) {
		console.log(`Player ${data.playerId} cancelled matchmaking`);
		if (data.playerId) {
			playerConnections.delete(data.playerId);
			try {
				const waitingGames = await redisService.getWaitingGames('1v1');

				for (const gameId of waitingGames) {
					const gameData = await redisService.getGameData(gameId);

					if (gameData && gameData.hostId === data.playerId) {
						await redisService.deleteGame(gameId);
					}
				}
				for (const [gameId, game] of activeGames.entries()) {
					if (game.players && game.players.has(data.playerId)) {
						game.players.delete(data.playerId);
						if (game.players.size === 0) {
							activeGames.delete(gameId);
						}
					}
				}
			} catch (error) {
				console.error('Error cancelling matchmaking:', error);
			}
		}
	}

	async function handleJoinGame(data, ws, activeGames, redisService) {
		const { gameId, playerId } = data;
		
		console.log('🔍 === handleJoinGame START ===');
		console.log('🔍 Input data:', { gameId, playerId });

		if (!gameId || !playerId) {
			console.error('❌ Invalid gameId or playerId:', { gameId, playerId });
			ws.send(JSON.stringify({
				type: 'ERROR',
				message: 'Invalid game data'
			}));
			return;
		}

		try {
			const gameData = await redisService.getGameData(gameId);

			if (!gameData) {
				console.error('❌ Game not found in Redis');
				ws.send(JSON.stringify({
					type: 'ERROR',
					message: 'Game not found'
				}));
				return;
			}

			const sessionExists = activeGames.has(gameId);
			console.log('🔍 Session exists in activeGames:', sessionExists);

			if (!sessionExists) {
				console.log(`🔍 Creating new ClassicGameSession for ${gameId}`);

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

				console.log(`✅ Created new ClassicGameSession for ${gameId}`);
			}

			const game = activeGames.get(gameId);

			let playerNumber;
			if (playerId === gameData.hostId) {
				playerNumber = 1;
				console.log('🔍 Player is HOST (1)');
			} else if (playerId === gameData.guestId) {
				playerNumber = 2;
				console.log('🔍 Player is GUEST (2)');
			} else {
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

			const connectedPlayers = game.players.size;
			console.log(`🔍 Game ${gameId} now has ${connectedPlayers}/2 players connected`);
			console.log('🔍 Game status is:', gameData.status);

			if (gameData.status === 'ready' && connectedPlayers === 2) {
				game.players.forEach((player, pid) => {
					console.log(`🚀 Marking player ${pid} as ready`);
					player.ready = true;
				});

				startGame(gameId, activeGames);
			} else {
				console.log(`⏳ Not auto-starting: status=${gameData.status}, players=${connectedPlayers}/2`);
			}
		} catch (error) {
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

		console.log(`✅ Player ${playerId} is ready`);

		const allReady = Array.from(game.players.values()).every(p => p.ready);
		const playerCount = game.players.size;

		console.log(`Game ${gameId} readiness: ${Array.from(game.players.values()).filter(p => p.ready).length}/${playerCount} players ready`);

		// Start the game if all players are ready AND we have 2 players
		if (allReady && playerCount === 2) {
			console.log(`🚀 Starting game ${gameId} - all players ready!`);
			startGame(gameId, activeGames);
		} else {
			console.log(`⏳ Game ${gameId} waiting for more players or ready signals`);
		}
	}

	function startGame(gameId, activeGames) {

		const game = activeGames.get(gameId);
		if (!game || game.session.gameStarted) {
			return;
		}

		if (game.session.gameStarted) {
			console.log('⚠️ Game already started');
			return;
		}

		console.log('🎮 Game session exists, players count:', game.players.size);
		console.log('🎮 All players ready:', Array.from(game.players.values()).every(p => p.ready));

		console.log(`🎮 Starting game ${gameId} with ClassicGameSession`);

		game.session.setExternalBroadcast((message) => {
			broadcastToGame(gameId, message, activeGames);
		});

		try {
			console.log('🎮 Calling session.startGame()...');
			game.session.startGame();
			console.log('✅ Game session started successfully');
		} catch (error) {
			console.error('❌ Error starting game session:', error);
		}
		
		console.log(`⏰ Game started for ${gameId}`);
		console.log('🎮 === startGame END ===');
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

		game.session.endGame();

		setTimeout(() => {
			activeGames.delete(gameId);
		}, 5000);
	}

	function handlePlayerDisconnect(playerId, gameId, activeGames, playerConnections = null) {
		if (!playerId) return;

		console.log(`Handling disconnect for player ${playerId}`);

		// Remove from player connections if provided
		if (playerConnections) {
			playerConnections.delete(playerId);
		}

		// Find and clean up ALL games this player was in
		const gamesToDelete = [];

		for (const [currentGameId, game] of activeGames.entries()) {
			if (game.players && game.players.has(playerId)) {
				console.log(`Found player ${playerId} in game ${currentGameId}`);

				// Remove player from this game
				game.players.delete(playerId);

				// Broadcast disconnect message to remaining players
				broadcastToGame(currentGameId, {
					type: 'PLAYER_DISCONNECTED',
					playerId: playerId
				}, activeGames);

				// Mark game for cleanup
				gamesToDelete.push(currentGameId);
			}
		}

		// End all games the player was in
		for (const gameIdToDelete of gamesToDelete) {
			console.log(`Ending game ${gameIdToDelete} due to player ${playerId} disconnect`);
			endGame(gameIdToDelete, activeGames);
		}
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
				console.log(`⚠️ Player ${playerId} WebSocket not ready`);
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

				if (gameData && !gameData.guestId && gameData.hostId !== playerId) {
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
						console.log(`✅ Notified host ${gameData.hostId} that guest ${gameData.guestId} joined`);
					}
					return;
				}
			}

			const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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