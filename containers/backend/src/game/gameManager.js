const WebSocket = require('ws');
const { GameSession } = require('../../dist/pong/GameSession');

class GameManager {
  constructor() {
    this.gameSessions = new Map();
  }

  createSession(gameId) {
    if (!this.gameSessions.has(gameId)) {
      this.gameSessions.set(gameId, {
        session: new GameSession(),
        sockets: new Map(),
        interval: null
      });
    }
    return this.gameSessions.get(gameId);
  }

  getSession(gameId) {
    return this.gameSessions.get(gameId);
  }

  addPlayerToSession(gameId, playerId, ws) {
    const session = this.createSession(gameId);
    session.sockets.set(playerId, ws);
    return session;
  }

  removePlayerFromSession(gameId, playerId) {
    if (!this.gameSessions.has(gameId)) return false;
    
    const session = this.gameSessions.get(gameId);
    session.sockets.delete(playerId);
    
    if (session.sockets.size === 0) {
      if (session.interval) {
        clearInterval(session.interval);
      }
      this.gameSessions.delete(gameId);
      return true;
    }
    return false;
  }

  startGameLoop(gameId) {
    const entry = this.gameSessions.get(gameId);
    if (!entry || entry.interval) return;

    entry.interval = setInterval(() => {
      try {
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

  notifyGameStart(gameId) {
    if (!gameId || !this.gameSessions.has(gameId)) {
      console.log('GAME_START NOT SENT: Invalid gameId or session:', gameId);
      return;
    }

    const entry = this.gameSessions.get(gameId);

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

  setPlayerInput(gameId, player, direction) {
    const entry = this.gameSessions.get(gameId);
    if (entry) {
      entry.session.setInput(player, direction);
    } else {
      console.log('No game session found');
    }
  }
}

module.exports = GameManager;