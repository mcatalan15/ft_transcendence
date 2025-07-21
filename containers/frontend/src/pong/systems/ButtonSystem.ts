/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ButtonSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 12:52:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:27:27 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { System } from "../engine/System";

import { gameManager } from "../../utils/GameManager";
import { Menu } from "../menu/Menu";
import { TournamentManager } from "../../utils/TournamentManager";
import { TournamentConfig } from "../utils/GameConfig";
import { navigate } from "../../utils/router";

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
					this.handleGameQuit();
				} else if (event) {
					unhandledEvents.push(event);
				}
			}

			this.game.eventQueue.push(...unhandledEvents);
		}
	}

	private handleGameQuit(): void {
		let tournamentConfig;
		if (this.game.config.variant === 'tournament') {
			tournamentConfig = this.game.tournamentManager.getTournament();
		}
		
		if (tournamentConfig) {
			this.returnToMenuWithTournament();
		} else {
			gameManager.destroyGame(this.game.app.view.id);
			navigate('/pong');
		}
	}
	
	private returnToMenuWithTournament(): void {
		this.game.cleanup(false);
		
		const menu = new Menu(
			this.game.app,
			this.game.language,
			this.game.isFirefox,
		);

		gameManager.registerGame(this.game.app.view.id, menu, undefined, this.game.app);
		
		menu.tournamentManager = this.game.tournamentManager;
		
		const config = this.game.tournamentManager.getTournamentConfig();
		if (config) {
			menu.tournamentManager.synchronizeWithConfig(config);
		}
		
		menu.init(false, true);
	}
}