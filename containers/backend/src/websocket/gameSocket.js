const WebSocket = require('ws');
const { handleCreateGame, handleJoinGame, handlePlayerDisconnect } = require('../game/gameHandlers');

function setupGameWebSocket(gameWss, redisService, gameManager) {
  gameWss.on('connection', (ws, request, gameId) => {
    console.log('Game WebSocket connection established');
    let playerId = null;
    let currentGameId = gameId;

    // heartbeat to detect disconnections
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

		if (data.type === 'IDENTIFY') {
			currentGameId = data.gameId;
			playerId = data.playerId;
			
			const gameSession = gameManager.getSession(currentGameId);
			if (gameSession) {
				gameManager.addPlayerToSession(currentGameId, playerId, ws);
				console.log(`Player ${playerId} reconnected to game ${currentGameId}`);
				
				if (data.playerNumber) {
					ws.send(JSON.stringify({
						type: 'PLAYER_ASSIGNED',
						playerNumber: data.playerNumber
					}));
				}
			}
		}

        if (data.playerId) playerId = data.playerId;
        if (data.gameId) currentGameId = data.gameId;

        switch (data.type) {
          case 'CREATE_GAME':
            await handleCreateGame(ws, data, redisService, gameManager);
            break;

          case 'JOIN_GAME':
            await handleJoinGame(ws, data, redisService, gameManager);
            break;

          case 'PADDLE_INPUT':
            gameManager.setPlayerInput(currentGameId, data.player, data.dir);
            break;
        }
      } catch (err) {
        console.error('Error handling game message:', err);
      }
    });

    ws.on('close', () => {
      handlePlayerDisconnect(playerId, currentGameId, redisService, gameManager);
      console.log('Game WebSocket connection closed');
    });
  });

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

  return gameWss;
}

module.exports = { setupGameWebSocket };