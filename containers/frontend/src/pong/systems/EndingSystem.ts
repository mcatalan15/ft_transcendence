/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EndingSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/27 16:28:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/30 15:49:24 by hmunoz-g         ###   ########.fr       */
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
	private endingProcessed: boolean = false;

	constructor(game: PongGame) {
		this.game = game;
		
		for (const entity of this.game.entities) {
			if (isUI(entity)) this.UI = entity;
		}
	}

	update(entities: Entity[]) {
		if (!this.endingProcessed) {
			if (this.UI.leftScore >= 5 && this.UI.rightScore < 4) {
				this.game.data.leftPlayer.result = 'win';
				this.game.data.rightPlayer.result = 'lose';
				this.ended = true;
			} else if (this.UI.rightScore >= 5 && this.UI.leftScore < 4) {
				this.game.data.rightPlayer.result = 'win';
				this.game.data.leftPlayer.result = 'lose';
				this.ended = true;
			}
		
			if (this.UI.leftScore > 5 && this.UI.rightScore < this.UI.leftScore - 2) {
				this.game.data.leftPlayer.result = 'win';
				this.game.data.rightPlayer.result = 'lose';
				this.ended = true;
			} else if (this.UI.rightScore > 5 && this.UI.leftScore < this.UI.rightScore - 2) {
				this.game.data.rightPlayer.result = 'win';
				this.game.data.leftPlayer.result = 'lose';
				this.ended = true;
			}
		
			if (this.UI.leftScore >= 20 && this.UI.rightScore >= 20) {
				this.game.data.rightPlayer.result = 'draw';
				this.game.data.leftPlayer.result = 'draw';
				this.ended = true;
			}
		}
	
		if (this.ended && !this.endingProcessed) {
			this.game.data.winner = this.game.data.leftPlayer.result === 'win' ? this.game.data.leftPlayer.name : this.game.data.rightPlayer.name;
			
			this.game.data.finalScore = {
				leftPlayer: this.UI.leftScore,
				rightPlayer: this.UI.rightScore
			};
	
			if (this.game.data.winner === null) {
				this.game.data.generalResult = 'draw';
			} else {
				this.game.data.generalResult = this.game.data.leftPlayer.result === 'win' ? 'leftWin' : 'rightWin';
			}
	
			this.game.data.endedAt = new Date().toISOString();
			this.endingProcessed = true;
			
			this.game.saveGameResults();
		}
	}
}