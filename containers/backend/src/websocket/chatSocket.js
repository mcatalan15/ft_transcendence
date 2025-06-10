const WebSocket = require('ws');

function setupChatWebSocket(wss, redisService) {
  // Store connected users
  const connectedUsers = new Map(); // ws -> { userId, username, connectedAt }

  wss.on('connection', (ws) => {
    console.log('Chat WebSocket connection established');
    let userId = null;
    let username = null;

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'server',
      content: 'Connected to Transcendence Chat Server',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle user identification
        if (data.type === 'identify') {
          userId = data.userId;
          username = data.username;
          connectedUsers.set(ws, { userId, username, connectedAt: new Date() });
          
          // Broadcast user joined
          const joinMessage = {
            type: 'server',
            content: `${username} joined the chat`,
            timestamp: new Date().toISOString()
          };
          await redisService.publishChatMessage(JSON.stringify(joinMessage));
          return;
        }

        // Validate message has required fields
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
			gameRoomId: data.gameRoomId
		  };

        // Handle different message types
        switch (data.type) {
          case 'private':
            // Handle private messages (whispers)
            await handlePrivateMessage(enrichedMessage, data.targetUser, wss, redisService, ws);
            break;
            
          case 'friend':
            // Handle friend messages (could check if users are actually friends)
            await redisService.publishChatMessage(JSON.stringify(enrichedMessage));
            break;

		  case 'game_invite':
			// Handle game invitations like private messages
			console.log('PROCESSING GAME_INVITE');

			await handleGameInvite(enrichedMessage, data.targetUser, wss, redisService, ws);
			break;
            
          default:
            // Handle general, game, server messages
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
        // Broadcast user left
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

  // Subscribe to chat messages from Redis
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

  // Helper function for private messages
  async function handlePrivateMessage(message, targetUser, wss, redisService, senderWs) {
    // Find target user's connection
    let targetWs = null;
    for (const [ws, userInfo] of connectedUsers) {
      if (userInfo.username === targetUser) {
        targetWs = ws;
        break;
      }
    }

    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
      // Send to target user
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
	
	// Create the complete message with all required fields
	const gameInviteMessage = {
		...message, // includes id, type, username, content, timestamp, userId
		targetUser: targetUser, // Add the missing targetUser field
		inviteId: message.inviteId || `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Ensure inviteId exists
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

  return wss;
}

module.exports = { setupChatWebSocket };