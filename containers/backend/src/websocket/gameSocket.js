const WebSocket = require('ws');

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
    const { playerId, gameId } = data;

    console.log(`=== ATTEMPTING TO JOIN GAME ===`);
    console.log(`PlayerId: ${playerId}`);
    console.log(`GameId: ${gameId}`);
    console.log(`Redis service available: ${!!redisService}`);
    console.log(`Redis getGame method: ${!!(redisService && redisService.getGame)}`);

    try {
      // Validate inputs
      if (!playerId || !gameId) {
        console.error('Missing playerId or gameId');
        ws.send(JSON.stringify({
          type: 'JOIN_FAILURE',
          reason: 'Missing player ID or game ID'
        }));
        return;
      }

      // Get game data from Redis with detailed logging
      console.log(`Fetching game data for ${gameId} from Redis...`);
      const gameData = await redisService.getGame(gameId);
      console.log('Game data retrieved:', JSON.stringify(gameData, null, 2));

      if (!gameData) {
        console.error(`Game ${gameId} not found in Redis`);
        ws.send(JSON.stringify({
          type: 'JOIN_FAILURE',
          reason: 'Game not found in database'
        }));
        return;
      }

      // Initialize game if it doesn't exist in memory
      if (!activeGames.has(gameId)) {
        console.log(`Creating new game instance for ${gameId}`);

        let GameCore;
        try {
          // Try to import the GameCore class
          const gameModule = require('../pong/GameCore');
          GameCore = gameModule.GameCore || gameModule.default || gameModule;
        } catch (importError) {
          console.warn('Could not import GameCore, using fallback:', importError.message);
          // Create a simple fallback GameCore
          GameCore = class {
            constructor(width, height) {
              this.width = width || 1800;
              this.height = height || 800;
              this.reset();
            }

            reset() {
              this.state = {
                ball: {
                  x: this.width / 2,     // 900
                  y: this.height / 2,    // 400
                  vx: Math.random() > 0.5 ? 5 : -5,
                  vy: (Math.random() - 0.5) * 6
                },
                paddle1: {
                  x: 60,                 // Left paddle x position (matching frontend paddleOffset)
                  y: this.height / 2 - 40, // Center vertically
                  width: 10,
                  height: 80
                },
                paddle2: {
                  x: this.width - 70,    // Right paddle x position (1800 - 60 - 10)
                  y: this.height / 2 - 40, // Center vertically  
                  width: 10,
                  height: 80
                },
                score1: 0,
                score2: 0
              };
            }

            getState() { return this.state; }

            update(p1Input, p2Input) {
              const PADDLE_SPEED = 8;

              // Update paddle 1 position (left) - updated constraints
              if (p1Input !== 0) {
                this.state.paddle1.y += p1Input * PADDLE_SPEED;
                this.state.paddle1.y = Math.max(60 + 40, Math.min(this.height - 80 - 40, this.state.paddle1.y));
              }

              // Update paddle 2 position (right) - updated constraints  
              if (p2Input !== 0) {
                this.state.paddle2.y += p2Input * PADDLE_SPEED;
                this.state.paddle2.y = Math.max(60 + 40, Math.min(this.height - 80 - 40, this.state.paddle2.y));
              }

              // Update ball position
              this.state.ball.x += this.state.ball.vx;
              this.state.ball.y += this.state.ball.vy;

              // Ball collision with top/bottom walls - updated constraints
              if (this.state.ball.y <= 60 + 10 || this.state.ball.y >= this.height - 80 - 10) {
                this.state.ball.vy = -this.state.ball.vy;
              }

              // Ball collision with paddles
              const ballRadius = 10;

              // Left paddle collision - updated positions
              if (this.state.ball.x - ballRadius <= this.state.paddle1.x + this.state.paddle1.width &&
                  this.state.ball.x + ballRadius >= this.state.paddle1.x &&
                  this.state.ball.y >= this.state.paddle1.y &&
                  this.state.ball.y <= this.state.paddle1.y + this.state.paddle1.height) {
                this.state.ball.vx = Math.abs(this.state.ball.vx); // Ensure ball goes right

                // Add some angle based on where it hits the paddle
                const hitPos = (this.state.ball.y - this.state.paddle1.y) / this.state.paddle1.height;
                this.state.ball.vy = (hitPos - 0.5) * 8;
              }

              // Right paddle collision - updated positions
              if (this.state.ball.x + ballRadius >= this.state.paddle2.x &&
                  this.state.ball.x - ballRadius <= this.state.paddle2.x + this.state.paddle2.width &&
                  this.state.ball.y >= this.state.paddle2.y &&
                  this.state.ball.y <= this.state.paddle2.y + this.state.paddle2.height) {
                this.state.ball.vx = -Math.abs(this.state.ball.vx); // Ensure ball goes left

                // Add some angle based on where it hits the paddle
                const hitPos = (this.state.ball.y - this.state.paddle2.y) / this.state.paddle2.height;
                this.state.ball.vy = (hitPos - 0.5) * 8;
              }

              // Ball out of bounds (scoring)
              if (this.state.ball.x <= 0) {
                this.state.score2++;
                this.resetBall();
              } else if (this.state.ball.x >= this.width) {
                this.state.score1++;
                this.resetBall();
              }
            }

            resetBall() {
              this.state.ball.x = this.width / 2;
              this.state.ball.y = this.height / 2;
              this.state.ball.vx = Math.random() > 0.5 ? 5 : -5;
              this.state.ball.vy = (Math.random() - 0.5) * 6;
            }
          };
        }

        const gameCore = new GameCore(1800, 800);

        activeGames.set(gameId, {
          players: new Map(),
          gameCore: gameCore,
          gameData: gameData,
          gameLoop: null,
          lastUpdate: Date.now()
        });

        console.log(`✅ Created new game instance for ${gameId}`);
      }

      const game = activeGames.get(gameId);
      console.log(`Current players in game: ${game.players.size}`);

      // Determine player number (1 = host/left, 2 = guest/right)
      let playerNumber;
      console.log(`Checking authorization:`);
      console.log(`  PlayerId: ${playerId}`);
      console.log(`  HostId: ${gameData.hostId}`);
      console.log(`  GuestId: ${gameData.guestId}`);

      if (playerId === gameData.hostId) {
        playerNumber = 1; // Left paddle
        console.log(`✅ Player ${playerId} authorized as HOST (player 1 - left paddle)`);
      } else if (playerId === gameData.guestId) {
        playerNumber = 2; // Right paddle
        console.log(`✅ Player ${playerId} authorized as GUEST (player 2 - right paddle)`);
      } else {
        console.error(`❌ Player ${playerId} NOT AUTHORIZED for game ${gameId}`);
        ws.send(JSON.stringify({
          type: 'JOIN_FAILURE',
          reason: `Not authorized for this game. Expected: ${gameData.hostId} or ${gameData.guestId}, got: ${playerId}`
        }));
        return;
      }

      // Check if player is already in the game
      if (game.players.has(playerId)) {
        console.log(`Player ${playerId} already in game ${gameId}, updating connection`);
        // Update the WebSocket connection for this player
        const existingPlayer = game.players.get(playerId);
        existingPlayer.ws = ws;

        // Send updated join success
        ws.send(JSON.stringify({
          type: 'JOIN_SUCCESS',
          gameId: gameId,
          playerNumber: existingPlayer.playerNumber,
          hostName: gameData.hostId,
          guestName: gameData.guestId
        }));
      } else {
        // Add new player to game
        game.players.set(playerId, {
          ws: ws,
          playerNumber: playerNumber,
          ready: false,
          lastInput: 0
        });

        console.log(`✅ Player ${playerId} added to game ${gameId} as player ${playerNumber}`);

        // Send join success with player assignment
        ws.send(JSON.stringify({
          type: 'JOIN_SUCCESS',
          gameId: gameId,
          playerNumber: playerNumber,
          hostName: gameData.hostId,
          guestName: gameData.guestId
        }));
      }

      // Send separate player assignment message
      ws.send(JSON.stringify({
        type: 'PLAYER_ASSIGNED',
        playerNumber: playerNumber,
        isHost: playerNumber === 1
      }));

      // Broadcast player connection to other players
      broadcastToGame(gameId, {
        type: 'PLAYER_CONNECTED',
        playerId: playerId,
        playerNumber: playerNumber,
        playersConnected: game.players.size
      }, activeGames, playerId);

      console.log(`✅ Player ${playerId} successfully joined game ${gameId} as player ${playerNumber}`);
      console.log(`Game ${gameId} now has ${game.players.size} players`);

      // If both players are connected, notify them
      if (game.players.size === 2) {
        console.log(`🎮 Game ${gameId} ready - both players connected!`);
        broadcastToGame(gameId, {
          type: 'GAME_READY',
          hostName: gameData.hostId,
          guestName: gameData.guestId
        }, activeGames);
      }

    } catch (error) {
      console.error('💥 CRITICAL ERROR in handleJoinGame:', error);
      console.error('Error stack:', error.stack);
      ws.send(JSON.stringify({
        type: 'JOIN_FAILURE',
        reason: 'Server error: ' + error.message
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
    if (!game || game.gameLoop) {
      console.log(`Cannot start game ${gameId}: ${!game ? 'game not found' : 'already running'}`);
      return;
    }

    console.log(`🎮 Starting game ${gameId}`);

    // Reset game state
    game.gameCore.reset();

    // Broadcast game start
    const startMessage = {
      type: 'GAME_START',
      gameState: game.gameCore.getState()
    };

    broadcastToGame(gameId, startMessage, activeGames);

    // Start game loop (60 FPS)
    game.gameLoop = setInterval(() => {
      updateGame(gameId, activeGames);
    }, 1000 / 60);

    console.log(`⏰ Game loop started for ${gameId}`);
  }

  function updateGame(gameId, activeGames) {
    const game = activeGames.get(gameId);
    if (!game) return;

    // Get paddle inputs
    let paddle1Input = 0;
    let paddle2Input = 0;

    for (const [playerId, player] of game.players) {
      if (player.playerNumber === 1) {
        paddle1Input = player.lastInput;
      } else if (player.playerNumber === 2) {
        paddle2Input = player.lastInput;
      }
    }

    // Update game physics
    game.gameCore.update(paddle1Input, paddle2Input);

    // Broadcast game state to all players
    broadcastToGame(gameId, {
      type: 'GAME_STATE_UPDATE',
      gameState: game.gameCore.getState(),
      timestamp: Date.now()
    }, activeGames);

    // Check for game end conditions
    const state = game.gameCore.getState();
    if ((state.score1 >= 11 || state.score2 >= 11) && Math.abs(state.score1 - state.score2) >= 2) {
      endGame(gameId, activeGames);
    }
  }

  function handlePaddleInput(data, activeGames) {
    const { gameId, playerId, input } = data;
    const game = activeGames.get(gameId);

    if (!game || !game.players.has(playerId)) {
      console.log(`Invalid paddle input: game or player not found`);
      return;
    }

    const player = game.players.get(playerId);

    // Validate that the player is only controlling their own paddle
    const expectedPlayerNumber = playerId === game.gameData.hostId ? 1 : 2;
    if (player.playerNumber !== expectedPlayerNumber) {
      console.log(`Player ${playerId} trying to control wrong paddle`);
      return;
    }

    player.lastInput = input; // -1 for up, 0 for stop, 1 for down

    console.log(`Player ${playerId} (paddle ${player.playerNumber}) input: ${input}`);
  }

  function endGame(gameId, activeGames) {
    const game = activeGames.get(gameId);
    if (!game) return;

    console.log(`🏁 Ending game ${gameId}`);

    // Clear game loop
    if (game.gameLoop) {
      clearInterval(game.gameLoop);
      game.gameLoop = null;
    }

    const finalState = game.gameCore.getState();
    const winner = finalState.score1 > finalState.score2 ? 1 : 2;

    // Broadcast game end
    broadcastToGame(gameId, {
      type: 'GAME_END',
      winner: winner,
      finalScore: {
        player1: finalState.score1,
        player2: finalState.score2
      }
    }, activeGames);

    console.log(`🎯 Game ${gameId} ended. Winner: Player ${winner} (${finalState.score1}-${finalState.score2})`);

    // Clean up game after a delay
    setTimeout(() => {
      activeGames.delete(gameId);
      console.log(`🧹 Game ${gameId} cleaned up`);
    }, 10000);
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

  function broadcastToGame(gameId, message, activeGames, excludePlayerId = null) {
    const game = activeGames.get(gameId);
    if (!game) {
      console.error(`Cannot broadcast to game ${gameId}: game not found`);
      return;
    }

    let sent = 0;
    for (const [playerId, player] of game.players) {
      if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
        try {
          player.ws.send(JSON.stringify(message));
          sent++;
        } catch (error) {
          console.error(`Failed to send message to player ${playerId}:`, error);
        }
      }
    }
  }
}

module.exports = { setupGameWebSocket };