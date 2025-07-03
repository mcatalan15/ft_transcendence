const WebSocket = require('ws');

function setupChatWebSocket(wss, redisService, gameManager) {
  // Store connected users
  const connectedUsers = new Map(); // ws -> { userId, username, connectedAt }

  wss.on('connection', (ws) => {
    console.log('Chat WebSocket connection established');
    let userId = null;
    let username = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data.type, data);

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
          gameRoomId: data.gameRoomId,
          action: data.action
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

          case 'game_invite_response':
            // Handle game invite responses
            console.log('PROCESSING GAME_INVITE_RESPONSE');
            await handleGameInviteResponse(enrichedMessage, ws, wss, redisService);
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

  async function handleGameInviteResponse(message, senderWs, wss, redisService) {
  console.log(`Handling game invite response from ${message.username} to ${message.targetUser}`);
  console.log('Full message object:', JSON.stringify(message, null, 2));
  console.log('RedisService available:', !!redisService);
  console.log('SenderWs available:', !!senderWs);
  console.log('ConnectedUsers map size:', connectedUsers.size);

  if (message.action === 'accept') {
    try {
      console.log('=== STEP 1: Creating game session ===');
      
      // Create a game session when invitation is accepted
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Created gameId:', gameId);

      console.log('=== STEP 2: Preparing game data ===');
      
      // Create game in Redis/database
      const gameData = {
        gameId: gameId,
        hostId: message.targetUser, // The original inviter becomes host
        guestId: message.username,  // The accepter becomes guest
        status: 'waiting',
        createdAt: new Date().toISOString()
      };
      
      console.log('Game data prepared:', JSON.stringify(gameData, null, 2));

      console.log('=== STEP 3: Saving to Redis ===');
      
      // Save game session
      if (redisService && redisService.createGame) {
        console.log('About to call redisService.createGame...');
        await redisService.createGame(gameId, gameData);
        console.log('Game saved to Redis successfully');
      } else {
        console.error('RedisService.createGame not available');
        console.error('redisService:', !!redisService);
        console.error('redisService.createGame:', !!(redisService && redisService.createGame));
        throw new Error('RedisService not available');
      }

      console.log('=== STEP 4: Finding WebSocket connections ===');

      // Find both players' WebSocket connections
      let hostWs = null;
      let guestWs = senderWs; // The one who accepted

      console.log('Looking for host user:', message.targetUser);
      console.log('Connected users:');
      for (const [ws, userInfo] of connectedUsers) {
        console.log(`  - ${userInfo.username} (${userInfo.userId})`);
      }

      // Find the original inviter (host)
      for (const [ws, userInfo] of connectedUsers) {
        if (userInfo.username === message.targetUser) {
          hostWs = ws;
          console.log('Found host WebSocket for:', userInfo.username);
          break;
        }
      }

      console.log('Found host WS:', !!hostWs, 'Ready state:', hostWs?.readyState);
      console.log('Found guest WS:', !!guestWs, 'Ready state:', guestWs?.readyState);
      
      // Check WebSocket.OPEN constant
      console.log('WebSocket.OPEN constant:', WebSocket.OPEN);

      console.log('=== STEP 5: Sending messages to players ===');

      // Notify the original inviter (host) that invitation was accepted
      if (hostWs && hostWs.readyState === WebSocket.OPEN) {
        const hostMessage = {
          type: 'game_invite_accepted',
          username: message.username,
          gameId: gameId,
          inviteId: message.inviteId
        };
        console.log('Sending to host:', JSON.stringify(hostMessage, null, 2));
        
        try {
          hostWs.send(JSON.stringify(hostMessage));
          console.log('✅ Message sent to host successfully');
        } catch (sendError) {
          console.error('❌ Error sending message to host:', sendError);
        }
      } else {
        console.error('❌ Host WebSocket not available or not open');
        console.error('  hostWs exists:', !!hostWs);
        console.error('  hostWs readyState:', hostWs?.readyState);
        console.error('  WebSocket.OPEN:', WebSocket.OPEN);
      }

      // Notify the accepter that game session was created
      if (guestWs && guestWs.readyState === WebSocket.OPEN) {
        const guestMessage = {
          type: 'game_session_created',
          gameId: gameId,
          fromUser: message.targetUser,
          inviteId: message.inviteId
        };
        console.log('Sending to guest:', JSON.stringify(guestMessage, null, 2));
        
        try {
          guestWs.send(JSON.stringify(guestMessage));
          console.log('✅ Message sent to guest successfully');
        } catch (sendError) {
          console.error('❌ Error sending message to guest:', sendError);
        }
      } else {
        console.error('❌ Guest WebSocket not available or not open');
        console.error('  guestWs exists:', !!guestWs);
        console.error('  guestWs readyState:', guestWs?.readyState);
      }

      console.log(`=== STEP 6: Complete - Game session ${gameId} created for ${message.targetUser} vs ${message.username} ===`);

    } catch (error) {
      console.error('💥 CRITICAL ERROR in handleGameInviteResponse:', error);
      console.error('Error stack:', error.stack);

      // Send error to accepter
      if (senderWs && senderWs.readyState === WebSocket.OPEN) {
        try {
          senderWs.send(JSON.stringify({
            type: 'game_invite_error',
            content: 'Failed to create game session: ' + error.message,
            inviteId: message.inviteId
          }));
        } catch (sendError) {
          console.error('Failed to send error message:', sendError);
        }
      }
    }
  }

  // Handle decline case (existing code)
  if (message.action === 'decline') {
    console.log('=== HANDLING DECLINE ===');
      let inviterWs = null;
      for (const [ws, userInfo] of connectedUsers) {
        if (userInfo.username === message.targetUser) {
          inviterWs = ws;
          break;
        }
      }

      if (inviterWs && inviterWs.readyState === WebSocket.OPEN) {
        inviterWs.send(JSON.stringify({
          type: 'game_invite_declined',
          username: message.username,
          inviteId: message.inviteId
        }));
      }
    }
  }

  return wss;
}

module.exports = { setupChatWebSocket };