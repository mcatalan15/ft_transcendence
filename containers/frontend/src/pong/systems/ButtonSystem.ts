/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ButtonSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 12:52:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/17 21:33:14 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { System } from "../engine/System";

import { gameManager } from "../../utils/GameManager";
import { Menu } from "../menu/Menu";
import { TournamentManager } from "../../utils/TournamentManager";
import { TournamentConfig } from "../utils/GameConfig";

export class ButtonSystem implements System {
	private game: PongGame;

	constructor(game: PongGame) {
		this.game = game;
	}

	update(){
		if (this.game.hasEnded) {
			const unhandledEvents = [];

			while (this.game.eventQueue.length > 0) {
				const event = this.game.eventQueue.shift();
				if (event && event.type === 'GAME_QUIT') {
					console.log('Game quit requested - cleaning up and returning to menu');
					this.handleGameQuit();
				} else if (event) {
					unhandledEvents.push(event);
				}
			}

			this.game.eventQueue.push(...unhandledEvents);
		}
	}

	private handleGameQuit(): void {
		console.log('Game quit requested');
		
		const tournamentConfig = this.game.tournamentManager.getTournament();
		
		if (tournamentConfig) {
			this.returnToMenuWithTournament();
		} else {
			gameManager.destroyGame(this.game.app.view.id);
			window.location.href = '/pong';
		}
	}
	
	private returnToMenuWithTournament(): void {
		this.game.cleanup(false);

		//!update tournamentManager
		
		const menu = new Menu(
			this.game.app,
			this.game.language,
			this.game.isFirefox,
		);
		
		gameManager.registerGame(this.game.app.view.id, menu, undefined, this.game.app);
		menu.tournamentManager = this.game.tournamentManager;
		menu.init(false, true);
	}
}