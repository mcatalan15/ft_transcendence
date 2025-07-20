const WebSocket = require('ws');

function setupChatWebSocket(wss, redisService, gameManager) {
const connectedUsers = new Map(); // ws -> { userId, username, connectedAt }

function heartbeat() {
	this.isAlive = true;
}

wss.on('connection', (ws) => {
	console.log('Chat WebSocket connection established');

	ws.isAlive = true;
	ws.on('pong', heartbeat);

	let userId = null;
	let username = null;

	ws.on('message', async (message) => {
	try {
		const data = JSON.parse(message.toString());
		console.log('Received message:', data.type, data);

		if (data.type === 'identify') {
			userId = data.userId;
			username = data.username;
			connectedUsers.set(ws, { userId, username, connectedAt: new Date() });

			ws.username = username;

			const joinMessage = {
				type: 'server',
				content: `${username} joined the chat`,
				timestamp: new Date().toISOString()
			};
			await redisService.publishChatMessage(JSON.stringify(joinMessage));
			return;
		}

		if (!data.content || !data.type) {
			ws.send(JSON.stringify({
				type: 'system',
				content: 'Invalid message format',
				timestamp: new Date().toISOString()
			}));
			return;
		}

		const enrichedMessage = {
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
			type: data.type,
			username: data.username || username || 'Anonymous',
			content: data.content,
			timestamp: new Date().toISOString(),
			userId: userId,
			targetUser: data.targetUser,
			inviteId: data.inviteId,
			gameRoomId: data.gameRoomId,
			action: data.action
		};

		switch (data.type) {
			case 'private':
				await handlePrivateMessage(enrichedMessage, data.targetUser, wss, redisService, ws);
				break;

			case 'friend':
				await redisService.publishChatMessage(JSON.stringify(enrichedMessage));
				break;

			case 'game_invite':
				console.log('PROCESSING GAME_INVITE');

				await handleGameInvite(enrichedMessage, data.targetUser, wss, redisService, ws);
				break;

			case 'game_invite_response':
				console.log('PROCESSING GAME_INVITE_RESPONSE');
				await handleGameInviteResponse(enrichedMessage, ws, wss, redisService);
				break;

			case 'PING':
				ws.send(JSON.stringify({ type: 'PONG' }));
				break;

			default:
				await redisService.publishChatMessage(JSON.stringify(enrichedMessage));
				break;
		}

	} catch (error) {
		console.error('Error processing chat message:', error);
		ws.send(JSON.stringify({
		type: 'system',
		content: 'Error processing message',
		timestamp: new Date().toISOString()
		}));
	}
	});

	ws.on('close', () => {
		const userInfo = connectedUsers.get(ws);
		if (userInfo) {
			const leaveMessage = {
			type: 'server',
			content: `${userInfo.username} left the chat`,
			timestamp: new Date().toISOString()
			};
			redisService.publishChatMessage(JSON.stringify(leaveMessage));
			connectedUsers.delete(ws);
		}
		console.log('Chat WebSocket connection closed');
	});

	ws.on('error', (error) => {
		console.error('Chat WebSocket error:', error);
	});
});

	const pingInterval = setInterval(() => {
		wss.clients.forEach((ws) => {
			if (ws.isAlive === false) {
			console.log('Terminating dead WebSocket connection');
			return ws.terminate();
			}
			
			ws.isAlive = false;
			ws.ping();
		});
	}, 30000); // 30 seconds

	wss.on('close', () => {
		clearInterval(pingInterval);
	});

redisService.subscribeToChatMessages((message) => {
	try {
		const parsedMessage = JSON.parse(message);

		wss.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message);
				}
		});
	} catch (error) {
			console.error('Error broadcasting message:', error);
	}
});

wss.notifyMatchmakingSuccess = (gameId, hostId, guestId) => {
	console.log(`Notifying matchmaking success: ${hostId} vs ${guestId} in game ${gameId}`);
	
	let hostWs = null;
	let guestWs = null;
	
	for (const [ws, userInfo] of connectedUsers) {
		if (userInfo.username === hostId) {
			hostWs = ws;
		}
		if (userInfo.username === guestId) {
			guestWs = ws;
		}
	}
	
	if (hostWs && hostWs.readyState === 1) {
		hostWs.send(JSON.stringify({
			type: 'matchmaking_success',
			gameId: gameId,
			opponent: guestId,
			role: 'host'
		}));
	}
	
	if (guestWs && guestWs.readyState === 1) {
		guestWs.send(JSON.stringify({
			type: 'matchmaking_success',
			gameId: gameId,
			opponent: hostId,
			role: 'guest'
		}));
	}
}

async function handlePrivateMessage(message, targetUser, wss, redisService, senderWs) {
	let targetWs = null;
	for (const [ws, userInfo] of connectedUsers) {
		if (userInfo.username === targetUser) {
			targetWs = ws;
			break;
		}
	}

	if (targetWs && targetWs.readyState === WebSocket.OPEN) {
		targetWs.send(JSON.stringify(message));

		if (senderWs && senderWs.readyState === WebSocket.OPEN) {
			senderWs.send(JSON.stringify({
			...message,
			content: `[To ${targetUser}] ${message.content}`
			}));
		}
		} else {
			if (senderWs && senderWs.readyState === WebSocket.OPEN) {
				senderWs.send(JSON.stringify({
				type: 'system',
				content: `User ${targetUser} is not online`,
				timestamp: new Date().toISOString()
			}));
		}
	}
}

async function handleGameInvite(message, targetUser, wss, redisService, senderWs) {
	console.log(`Handling game invite from ${message.username} to ${targetUser}`);

	const gameInviteMessage = {
	...message,
	targetUser: targetUser,
	inviteId: message.inviteId || `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
	};

	let targetWs = null;
	for (const [ws, userInfo] of connectedUsers) {
		if (userInfo.username === targetUser) {
			targetWs = ws;
			break;
		}
	}

	if (targetWs && targetWs.readyState === WebSocket.OPEN) {
		console.log(`Sending game invite to ${targetUser}:`, gameInviteMessage);
		targetWs.send(JSON.stringify(gameInviteMessage));
	} else {
		console.log(`User ${targetUser} is not online`);
		if (senderWs && senderWs.readyState === WebSocket.OPEN) {
			senderWs.send(JSON.stringify({
			type: 'system',
			content: `User ${targetUser} is not online`,
			timestamp: new Date().toISOString()
			}));
		}
	}
}

async function handleGameInviteResponse(message, senderWs, wss, redisService) {
    console.log(`Handling game invite response from ${message.username} to ${message.targetUser}`);

    if (message.action === 'accept') {
		console.log('=== HANDLING ACCEPT - Create Game Session & Navigate ===');
		
		const gameId = message.inviteId;
		const hostId = message.targetUser; // The original inviter  
		const guestId = message.username; // The one accepting
		
		const gameData = {
			gameId: gameId,
			hostId: hostId,
			guestId: guestId,
			status: 'waiting',
			createdAt: new Date().toISOString(),
			mode: 'classic',
			variant: '1v1'
		};
		
		// Store in Redis (keep existing logic)
		try {
			const success = await redisService.createGame(gameId, gameData);
			if (success) {
			} else {
				throw new Error('Redis createGame returned false');
			}
		} catch (error) {
			console.error('Failed to create game session:', error);
			return;
		}

		let hostWs = null;
		let guestWs = senderWs;
	
		for (const [ws, userInfo] of connectedUsers) {
			if (userInfo.username === message.targetUser) {
				hostWs = ws;
				break;
			}
		}

		if (hostWs && hostWs.readyState === WebSocket.OPEN) {
			const hostMessage = {
				type: 'game_invite_accepted',
				username: message.username,
				inviteId: message.inviteId,
				gameId: gameId,
				action: 'navigate_to_pong',
				hostName: hostId,
				guestName: guestId
			};
			
			hostWs.send(JSON.stringify(hostMessage));
		}
	
		if (guestWs && guestWs.readyState === WebSocket.OPEN) {
			const guestMessage = {
				type: 'game_invite_accepted',
				fromUser: message.targetUser,
				inviteId: message.inviteId,
				gameId: gameId,
				action: 'navigate_to_pong',
				hostName: hostId,
				guestName: guestId
			};
			
			guestWs.send(JSON.stringify(guestMessage));
		}
	}
}

return wss;
}

module.exports = { setupChatWebSocket };