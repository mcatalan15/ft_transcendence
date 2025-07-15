/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ButtonSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 12:52:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/11 12:56:04 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { System } from "../engine/System";

import { gameManager } from "../../utils/GameManager";

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
		console.log('Game quit requested - navigating back to /pong');
		
		gameManager.destroyGame(this.game.app.view.id);
		
		window.location.href = '/pong';	
	}
}