/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EndingSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/27 16:28:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/30 12:20:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import { PongGame } from '../engine/Game';

import { System } from '../engine/System';
import { UI } from '../entities/UI';

import { isUI } from '../utils/Guards';

export class EndingSystem implements System {
	private game: PongGame;
	private UI!: UI;
	private ended: boolean = false;

	constructor(game: PongGame) {
		this.game = game;
		
		for (const entity of this.game.entities) {
			if (isUI(entity)) this.UI = entity;
		}
	}

	update(entities: Entity[]) {
		if (this.UI.leftScore == 11 && this.UI.rightScore < 10) {
			this.game.data.leftPlayer.result = 'win';
			this.game.data.rightPlayer.result = 'lose';
			this.ended = true;
		} else if (this.UI.rightScore == 11 && this.UI.leftScore < 10) {
			this.game.data.rightPlayer.result = 'win';
			this.game.data.leftPlayer.result = 'lose';
			this.ended = true;
		}

		if (this.UI.leftScore > 11 && this.UI.rightScore < this.UI.leftScore - 2) {
			this.game.data.leftPlayer.result = 'win';
			this.game.data.rightPlayer.result = 'lose';
			this.ended = true;
		} else if (this.UI.rightScore > 11 && this.UI.leftScore < this.UI.rightScore - 2) {
			this.game.data.rightPlayer.result = 'win';
			this.game.data.leftPlayer.result = 'lose';
			this.ended = true;
		}

		if (this.UI.leftScore >= 20 && this.UI.rightScore >= 20) {
			this.game.data.rightPlayer.result = 'draw';
			this.game.data.leftPlayer.result = 'draw';
			this.ended = true;
		}

		if (this.ended) {
			this.game.data.winner = this.game.leftPlayer.result === 'win' ? this.game.leftPlayer.name : this.game.rightPlayer.name;
			
			this.game.data.finalScore = {
				leftPlayer: this.UI.leftScore,
				rightPlayer: this.UI.rightScore
			};

			if (this.game.data.winner === null) {
				this.game.data.generalResult = 'draw';
			} else {
				this.game.data.generalResult = this.game.leftPlayer.result === 'win' ? 'leftWin' : 'rightWin';
			}

			this.game.data.endedaAt = new Date().toISOString();

			//TODO send data to server?
		}
	}
}