const serverConfig = require('./config/serverConfiguration');
const { buildApp } = require('./app');
const { db } = require('./api/db/database');
const { createClient } = require('redis');
const WebSocket = require('ws');
let redisPublisher;

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const gameWss = new WebSocket.Server({ noServer: true });
const gameSessions = new Map();

async function startServer() {
	const app = buildApp();

	redisPublisher = createClient({ url: redisUrl });
	const redisSubscriber = redisPublisher.duplicate();

	try {
		await redisPublisher.connect();
		await redisSubscriber.connect();
		console.log('Connected to Redis');
		
		await redisPublisher.set('games:active', '0');
		const oldGames = await redisPublisher.keys('game:*');
		if (oldGames.length > 0) {
		  await redisPublisher.del(oldGames);
		}
	  } catch (err) {
		console.error('Redis connection failed:', err);
		process.exit(1);
	  }

	const wss = new WebSocket.Server({ noServer: true });

	wss.on('connection', (ws) => {
		console.log('WebSocket connection established');

		ws.on('message', async (message) => {
			await redisPublisher.publish('chat', message.toString());
		});

		ws.on('close', () => {
			console.log('WebSocket connection closed');
		});
	});

	await app.listen({ host: serverConfig.ADDRESS, port: serverConfig.PORT });

	const nodeServer = app.server;

	nodeServer.on('upgrade', (request, socket, head) => {
		const { pathname } = new URL(request.url, 'http://localhost');
		console.log(`WebSocket upgrade request for: ${pathname}`);

		if (pathname === '/ws') {
			// Existing chat websocket
			wss.handleUpgrade(request, socket, head, (ws) => {
				wss.emit('connection', ws, request);
			});
		}
		else if (pathname.startsWith('/ws/socket/game')) {
			// Game-specific websocket
			gameWss.handleUpgrade(request, socket, head, (ws) => {
			  // Extract gameId from URL if present - fix the index
			  const segments = pathname.split('/');
			  const gameId = segments.length >= 5 ? segments[4] : undefined;
			  console.log(`Game websocket connection with ID: ${gameId}`);
			  gameWss.emit('connection', ws, request, gameId);
			});
		}
		else {
			socket.destroy();
		}
	});

	await redisSubscriber.subscribe('chat', (message) => {
		wss.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
	});

	gameWss.on('connection', (ws, request, gameId) => {
		console.log('Game WebSocket connection established');
		let playerId = null;
		let currentGameId = gameId;

		// Set up heartbeat to detect disconnections
		ws.isAlive = true;
		ws.on('pong', () => { ws.isAlive = true; });

		ws.on('message', async (message) => {
			try {
				const data = JSON.parse(message.toString());

				// Extract player ID and game ID from message
				if (data.playerId) playerId = data.playerId;
				if (data.gameId) currentGameId = data.gameId;

				// Handle different message types
				switch (data.type) {
					case 'CREATE_GAME':
						await handleCreateGame(ws, data);
						break;

					case 'JOIN_GAME':
						await handleJoinGame(ws, data);
						break;

					case 'PADDLE_INPUT':
						// Relay paddle input to the other player in the same game
						relayToGame(currentGameId, message.toString(), playerId);
						break;

					case 'GAME_STATE_UPDATE':
						// Relay game state to the other player in the same game
						relayToGame(currentGameId, message.toString(), playerId);
						break;
				}
			} catch (err) {
				console.error('Error handling game message:', err);
			}
		});

		ws.on('close', () => {
			handlePlayerDisconnect(playerId, currentGameId);
			console.log('Game WebSocket connection closed');
		});
	});

	['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
		process.on(signal, () => serverConfig.gracefulShutdown(app, db, signal));
	});
}

startServer().catch(err => {
	console.error('Fatal startup error:', err);
	process.exit(1);
});

async function handleCreateGame(ws, data) {
	const gameId = generateGameId();
	const hostId = data.playerId;

	await redisPublisher.setEx(`game:${gameId}`, 3600, JSON.stringify({
		hostId: hostId,
		status: 'waiting',
		created: Date.now()
	}));

	// Store connection in memory
	if (!gameSessions.has(gameId)) {
		gameSessions.set(gameId, new Map());
	}
	gameSessions.get(gameId).set(hostId, ws);

	// Send confirmation to creator
	ws.send(JSON.stringify({
		type: 'GAME_CREATED',
		gameId: gameId
	}));

	console.log(`Game created: ${gameId} by player: ${hostId}`);
}

// Join an existing game
async function handleJoinGame(ws, data) {
	const { gameId, playerId } = data;

	try {
		// Check if game exists in Redis
		const gameData = await redisPublisher.get(`game:${gameId}`);

		if (!gameData) {
			ws.send(JSON.stringify({
				type: 'JOIN_FAILURE',
				reason: 'Game not found'
			}));
			return;
		}

		const game = JSON.parse(gameData);

		if (game.status !== 'waiting') {
			ws.send(JSON.stringify({
				type: 'JOIN_FAILURE',
				reason: 'Game already full'
			}));
			return;
		}

		// Update game status in Redis
		game.guestId = playerId;
		game.status = 'active';
		await redisPublisher.set(`game:${gameId}`, JSON.stringify(game));

		// Store connection in memory
		if (!gameSessions.has(gameId)) {
			gameSessions.set(gameId, new Map());
		}
		gameSessions.get(gameId).set(playerId, ws);

		// Notify joiner
		ws.send(JSON.stringify({
			type: 'JOIN_SUCCESS'
		}));

		// Notify host that someone joined
		const hostWs = gameSessions.get(gameId).get(game.hostId);
		if (hostWs && hostWs.readyState === WebSocket.OPEN) {
			hostWs.send(JSON.stringify({
				type: 'PLAYER_JOINED',
				playerName: playerId
			}));
		}

		// Tell both players to start the game
		notifyGameStart(gameId);

		console.log(`Player ${playerId} joined game ${gameId}`);
	} catch (err) {
		console.error(`Error joining game: ${err}`);
		ws.send(JSON.stringify({
			type: 'JOIN_FAILURE',
			reason: 'Server error'
		}));
	}
}

// Relay message to other players in the same game
function relayToGame(gameId, message, senderId) {
	if (!gameId || !gameSessions.has(gameId)) return;

	const gameSession = gameSessions.get(gameId);

	gameSession.forEach((clientWs, clientId) => {
		// Only send to other players in the same game
		if (clientId !== senderId && clientWs.readyState === WebSocket.OPEN) {
			clientWs.send(message);
		}
	});
}

// Notify both players to start the game
function notifyGameStart(gameId) {
	if (!gameId || !gameSessions.has(gameId)) return;

	const gameSession = gameSessions.get(gameId);

	gameSession.forEach((clientWs) => {
		if (clientWs.readyState === WebSocket.OPEN) {
			clientWs.send(JSON.stringify({
				type: 'GAME_START'
			}));
		}
	});
}

// Handle player disconnection
async function handlePlayerDisconnect(playerId, gameId) {
	if (!gameId || !playerId) return;

	try {
		// Notify other player
		if (gameSessions.has(gameId)) {
			const gameSession = gameSessions.get(gameId);

			gameSession.forEach((clientWs, clientId) => {
				if (clientId !== playerId && clientWs.readyState === WebSocket.OPEN) {
					clientWs.send(JSON.stringify({
						type: 'PLAYER_DISCONNECTED',
						playerId: playerId
					}));
				}
			});

			// Remove player from game session
			gameSession.delete(playerId);

			// If game is empty, remove game session
			if (gameSession.size === 0) {
				gameSessions.delete(gameId);
				await redisPublisher.del(`game:${gameId}`);
			}
		}

		console.log(`Player ${playerId} disconnected from game ${gameId}`);
	} catch (err) {
		console.error(`Error handling disconnection: ${err}`);
	}
}

// Generate a unique game ID
function generateGameId() {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const pingInterval = setInterval(() => {
	gameWss.clients.forEach(ws => {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping();
	});
}, 30000);

gameWss.on('close', () => {
	clearInterval(pingInterval);
});