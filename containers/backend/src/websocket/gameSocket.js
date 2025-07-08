const WebSocket = require('ws');
const ClassicGameSession = require('../../pong/ClassicGameSession'); 

function setupGameWebSocket(wss, redisService, gameManager) {
  const activeGames = new Map(); // gameId -> { players: Map, gameCore: GameCore, gameLoop: interval }

  // Update connection handler to receive gameId from wsServer
  wss.on('connection', (ws, request, connectionInfo) => {
    console.log('Game WebSocket connection established');

    // Extract gameId from connection info or WebSocket instance
    const gameIdFromUrl = connectionInfo?.gameId || ws.gameId;
    console.log('GameId from URL:', gameIdFromUrl);

    let playerId = null;
    let gameId = gameIdFromUrl; // Initialize with URL gameId
    let playerNumber = null;

    // Send initial connection success message
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
            // Use gameId from message if provided, otherwise use URL gameId
            gameId = data.gameId || gameId;
            console.log(`Player ${playerId} identified for game ${gameId}`);

            // Send identification confirmation
            ws.send(JSON.stringify({
              type: 'IDENTIFY_SUCCESS',
              playerId: playerId,
              gameId: gameId
            }));

            // Automatically trigger JOIN_GAME after successful identification
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
      console.error('Game WebSocket error:', error);
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

      // Initialize game if it doesn't exist in memory
      if (!activeGames.has(gameId)) {
          console.log(`Creating new ClassicGameSession for ${gameId}`);

          const session = new ClassicGameSession(gameId, 
              { id: gameData.hostId, socket: null },
              { id: gameData.guestId, socket: null }
          );

          // Set up external broadcasting
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
      
      // Determine player number
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

      // Store player info in the Map
      game.players.set(playerId, {
          ws: ws,
          playerNumber: playerNumber,
          ready: false
      });

      // **ADD THIS: Call addPlayer on the ClassicGameSession**
      const playerObject = {
          id: playerId,
          socket: ws
      };
      game.session.addPlayer(playerObject);

      // Send join confirmation
      ws.send(JSON.stringify({
          type: 'GAME_JOINED',
          gameId: gameId,
          playerNumber: playerNumber,
          gameState: game.session.getState()
      }));

      console.log(`Player ${playerId} joined game ${gameId} as player ${playerNumber}`);

      // The ClassicGameSession.addPlayer() method will handle the auto-start logic

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

    // Check if all players are ready
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

    // Set up external broadcasting for the session
    game.session.setExternalBroadcast((message) => {
        broadcastToGame(gameId, message, activeGames);
    });

    // Start the ClassicGameSession
    game.session.startGame();  // This starts the internal game loop
    
    console.log(`⏰ Game started for ${gameId}`);
  }

  function updateGame(gameId, activeGames) {
    const game = activeGames.get(gameId);
    if (!game) return;

    // ClassicGameSession handles its own updates now
    // This function might not be needed anymore since the session
    // broadcasts its own state updates
    
    // Optional: You can add any additional WebSocket-specific logic here
    // like logging, metrics, etc.
  }

  function handlePaddleInput(data, activeGames) {
    const { gameId, playerId, input } = data;
    const game = activeGames.get(gameId);

    if (!game || !game.session) {
        console.log(`Invalid paddle input: game or session not found for ${gameId}`);
        return;
    }

    // Convert input format to what ClassicGameSession expects
    const inputState = {
        up: input === -1,
        down: input === 1
    };

    // Use ClassicGameSession's input handling
    game.session.handlePlayerInput(playerId, inputState);

    console.log(`Player ${playerId} input: ${input} processed by ClassicGameSession`);
  }

  function endGame(gameId, activeGames) {
    const game = activeGames.get(gameId);
    if (!game) return;

    console.log(`🏁 Ending game ${gameId}`);

    // Let ClassicGameSession handle the end game logic
    game.session.endGame();

    // Clean up after a delay
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

    // Notify remaining players
    broadcastToGame(gameId, {
      type: 'PLAYER_DISCONNECTED',
      playerId: playerId
    }, activeGames);

    // End game if a player disconnects
    endGame(gameId, activeGames);
  }

  function broadcastToGame(gameId, message, activeGames) {
    const game = activeGames.get(gameId);
    if (!game) return;

    const messageStr = JSON.stringify(message);
    
    // Broadcast to all WebSocket clients
    game.players.forEach((player, playerId) => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(messageStr);
        }
    });

    console.log(`Broadcasted message to game ${gameId}:`, message.type);
  }
}

module.exports = { setupGameWebSocket };