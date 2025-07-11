const WebSocket = require('ws');

function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function handleCreateGame(ws, data, redisService, gameManager) {
  const gameId = generateGameId();
  const hostId = data.playerId;

  await redisService.createGame(gameId, hostId);
  gameManager.addPlayerToSession(gameId, hostId, ws);

  ws.send(JSON.stringify({
    type: 'GAME_CREATED',
    gameId: gameId
  }));

  ws.send(JSON.stringify({
    type: 'PLAYER_ASSIGNED',
    playerNumber: 1
  }));

  console.log(`Game created: ${gameId} by player: ${hostId}`);
}

async function handleJoinGame(ws, data, redisService, gameManager) {
  const { gameId, playerId } = data;

  try {
    const game = await redisService.getGame(gameId);

    if (!game) {
      ws.send(JSON.stringify({
        type: 'JOIN_FAILURE',
        reason: 'Game not found'
      }));
      return;
    }

    if (game.status !== 'waiting') {
      ws.send(JSON.stringify({
        type: 'JOIN_FAILURE',
        reason: 'Game already full'
      }));
      return;
    }

    game.guestId = playerId;
    game.status = 'active';
    await redisService.updateGame(gameId, game);

    gameManager.addPlayerToSession(gameId, playerId, ws);

    ws.send(JSON.stringify({
      type: 'JOIN_SUCCESS'
    }));

    const session = gameManager.getSession(gameId);
    const hostWs = session.sockets.get(game.hostId);
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

    gameManager.notifyGameStart(gameId);
    gameManager.startGameLoop(gameId);

  } catch (err) {
    console.error(`Error joining game: ${err}`);
    ws.send(JSON.stringify({
      type: 'JOIN_FAILURE',
      reason: 'Server error'
    }));
  }
}

async function handlePlayerDisconnect(playerId, gameId, redisService, gameManager) {
  const session = gameManager.getSession(gameId);
  if (!session) return;

  session.sockets.forEach((clientWs, clientId) => {
    if (clientId !== playerId && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'PLAYER_DISCONNECTED',
        playerId: playerId
      }));
    }
  });

  if (gameManager.removePlayerFromSession(gameId, playerId)) {
    await redisService.deleteGame(gameId);
  }
}

module.exports = {
  handleCreateGame,
  handleJoinGame,
  handlePlayerDisconnect,
  generateGameId
};