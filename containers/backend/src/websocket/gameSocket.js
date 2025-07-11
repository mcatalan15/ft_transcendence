const WebSocket = require('ws');
const ClassicGameSession = require('../../pong/ClassicGameSession'); 

function setupGameWebSocket(wss, redisService, gameManager) {
	const activeGames = new Map();

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
					console.log(`Player ${playerId} identified for game ${gameId}`);

					ws.send(JSON.stringify({
						type: 'IDENTIFY_SUCCESS',
						playerId: playerId,
						gameId: gameId
					}));

					await handleJoinGame({ playerId, gameId }, ws, activeGames, redisService);
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

			console.log(`Player ${playerId} attempting to join game ${gameId}`);

			if (!activeGames.has(gameId)) {
				console.log(`Creating new ClassicGameSession for ${gameId}`);

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
			} else if (playerId === gameData.guestId) {
				playerNumber = 2;
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
				gameState: game.session.getState()
			}));

			console.log(`Player ${playerId} joined game ${gameId} as player ${playerNumber}`);

		} catch (error) {
			console.error('Error in handleJoinGame:', error);
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

		if (allReady && playerCount === 2) {
			console.log(`🚀 Starting game ${gameId} - all players ready!`);
			startGame(gameId, activeGames);
		}
	}

	function startGame(gameId, activeGames) {
		const game = activeGames.get(gameId);
		if (!game || game.session.gameStarted) {
			console.log(`Cannot start game ${gameId}: ${!game ? 'game not found' : 'already running'}`);
			return;
		}

		console.log(`🎮 Starting game ${gameId} with ClassicGameSession`);

		game.session.setExternalBroadcast((message) => {
			broadcastToGame(gameId, message, activeGames);
		});

		game.session.startGame();
		
		console.log(`⏰ Game started for ${gameId}`);
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

		console.log(`🏁 Ending game ${gameId}`);

		game.session.endGame();

		setTimeout(() => {
			activeGames.delete(gameId);
			console.log(`🧹 Cleaned up game ${gameId}`);
		}, 5000);
	}

	function handlePlayerDisconnect(playerId, gameId, activeGames) {
		if (!gameId || !playerId) return;

		console.log(`❌ Player ${playerId} disconnected from game ${gameId}`);

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
		
		console.log(`📡 Broadcasting to game ${gameId}:`, messageToSend.type);
		console.log(`📡 Full message:`, messageStr);
		
		game.players.forEach((player, playerId) => {
			if (player.ws && player.ws.readyState === WebSocket.OPEN) {
				console.log(`📡 Sending to player ${playerId}`);
				player.ws.send(messageStr);
			} else {
				console.log(`⚠️ Player ${playerId} WebSocket not ready`);
			}
		});

		console.log(`Broadcasted message to game ${gameId}:`, messageToSend.type);
	}
}

module.exports = { setupGameWebSocket };