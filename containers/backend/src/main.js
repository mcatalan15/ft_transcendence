const serverConfig = require('./config/serverConfiguration');
const { buildApp } = require('./app');
const { db } = require('./api/db/database');
const { createClient } = require('redis');
const WebSocket = require('ws');
const { GameSession } = require('../dist/pong/GameSession');

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
						const entry = gameSessions.get(currentGameId);
						if (entry) {
							entry.session.setInput(data.player, data.dir);
						} else {
							console.log('No game session found');
						}
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

	if (!gameSessions.has(gameId)) {
		gameSessions.set(gameId, {
			session: new GameSession(),
			sockets: new Map(),
			interval: null
		});
	}
	gameSessions.get(gameId).sockets.set(hostId, ws);

	// Send confirmation to creator
	ws.send(JSON.stringify({
		type: 'GAME_CREATED',
		gameId: gameId
	}));

    ws.send(JSON.stringify({
        type: 'PLAYER_ASSIGNED',
        playerNumber: 1  // Host is always Player 1
    }));

	console.log(`Game created: ${gameId} by player: ${hostId}`);
}

// Join an existing game
async function handleJoinGame(ws, data) {
	const { gameId, playerId } = data;

	try {
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

		if (!gameSessions.has(gameId)) {
			gameSessions.set(gameId, {
				session: new GameSession(),
				sockets: new Map(),
				interval: null
			});
		}
		gameSessions.get(gameId).sockets.set(playerId, ws);

		// Notify joiner
		ws.send(JSON.stringify({
			type: 'JOIN_SUCCESS'
		}));

		// Notify host that someone joined
		const hostWs = gameSessions.get(gameId).sockets.get(game.hostId);
		if (hostWs && hostWs.readyState === WebSocket.OPEN) {
			hostWs.send(JSON.stringify({
				type: 'PLAYER_JOINED',
				playerName: playerId
			}));
		}

		const playerNumber = playerId === game.hostId ? 1 : 2;
			ws.send(JSON.stringify({
				type: 'PLAYER_ASSIGNED',
				playerNumber: playerNumber
		}));

		notifyGameStart(gameId);

		// Start the backend game loop if not already started
		const entry = gameSessions.get(gameId);

		if (!entry.interval) {
			entry.interval = setInterval(() => {
			try {				
				// Check if session exists
				if (!entry.session) {
					console.error('No session object found!');
					return;
				}
				
 				const state = entry.session.tick();

				entry.sockets.forEach((clientWs) => {
					if (clientWs.readyState === WebSocket.OPEN) {
						clientWs.send(JSON.stringify({
							type: 'GAME_STATE_UPDATE',
							data: state
						}));
					}
				});
				
				} catch (error) {
					console.error('ERROR IN GAME LOOP:', error);
				}
			}, 1000 / 60);
		}

	} catch (err) {
		console.error(`Error joining game: ${err}`);
		ws.send(JSON.stringify({
			type: 'JOIN_FAILURE',
			reason: 'Server error'
		}));
	}
}

// Notify both players to start the game
function notifyGameStart(gameId) {
  if (!gameId || !gameSessions.has(gameId)) {
    console.log('GAME_START NOT SENT: Invalid gameId or session:', gameId);
    return;
  }

  const entry = gameSessions.get(gameId);

  entry.sockets.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      console.log('Sending GAME_START to a client');
      clientWs.send(JSON.stringify({
        type: 'GAME_START'
      }));
    } else {
      console.log('Client WebSocket not open, readyState:', clientWs.readyState);
    }
  });
}

// Handle player disconnection
async function handlePlayerDisconnect(playerId, gameId) {
	if (gameSessions.has(gameId)) {
		const entry = gameSessions.get(gameId);

		entry.sockets.forEach((clientWs, clientId) => {
			if (clientId !== playerId && clientWs.readyState === WebSocket.OPEN) {
				clientWs.send(JSON.stringify({
					type: 'PLAYER_DISCONNECTED',
					playerId: playerId
				}));
			}
		});

		// Remove player from game session
		entry.sockets.delete(playerId);

		// If game is empty, clear interval and remove session
		if (entry.sockets.size === 0) {
			if (entry.interval) {
				clearInterval(entry.interval);
			}
			gameSessions.delete(gameId);
			await redisPublisher.del(`game:${gameId}`);
		}
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