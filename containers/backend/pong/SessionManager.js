const ClassicGameSession = require('../gameEngine/ClassicGameSession');

class SessionManager {
	constructor() {
		this.sessions = new Map();
		this.waitingPlayers = [];
	}
	
	addPlayerToQueue(player) {
		console.log(`Adding player ${player.id} to queue`);
		
		if (this.waitingPlayers.length > 0) {
			const opponent = this.waitingPlayers.shift();
			this.createGameSession(opponent, player);
		} else {
			this.waitingPlayers.push(player);
			player.socket.emit('waitingForOpponent');
		}
	}
	
	createGameSession(player1, player2) {
		const sessionId = `classic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		const session = new ClassicGameSession(sessionId, player1, player2);
		this.sessions.set(sessionId, session);
		
		session.addPlayer(player1);
		session.addPlayer(player2);
		
		console.log(`Created game session ${sessionId} for players:`, player1.id, player2.id);
		
		return session;
	}
	
	handlePlayerInput(sessionId, playerId, input) {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.handlePlayerInput(playerId, input);
		}
	}
	
	setPlayerReady(sessionId, playerId) {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.setPlayerReady(playerId);
		}
	}
	
	removePlayer(sessionId, playerId) {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.removePlayer(playerId);
			
			if (!session.players.player1.socket && !session.players.player2.socket) {
				session.cleanup();
				this.sessions.delete(sessionId);
			}
		}
		
		this.waitingPlayers = this.waitingPlayers.filter(p => p.id !== playerId);
	}
	
	getSession(sessionId) {
		return this.sessions.get(sessionId);
	}
	
	cleanup() {
		this.sessions.forEach(session => session.cleanup());
		this.sessions.clear();
		this.waitingPlayers = [];
	}
}

module.exports = SessionManager;