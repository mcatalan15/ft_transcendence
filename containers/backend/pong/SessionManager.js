/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SessionManager.js                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/21 17:08:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 17:08:31 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const ClassicGameSession = require('../gameEngine/ClassicGameSession');

class SessionManager {
	constructor() {
		this.sessions = new Map();
		this.waitingPlayers = [];
	}
	
	addPlayerToQueue(player) {
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