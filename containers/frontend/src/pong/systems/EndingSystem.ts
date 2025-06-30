/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EndingSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/27 16:28:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/27 17:17:04 by hmunoz-g         ###   ########.fr       */
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

	constructor(game: PongGame) {
		this.game = game;
		
		for (const entity of this.game.entities) {
			if (isUI(entity)) this.UI = entity;
		}
	}

	update(entities: Entity[]) {
		if (this.UI.leftScore >= 11 && this.UI.rightScore < 11) {
			console.log('LEFT PLAYER WINS');
		} else if (this.UI.rightScore >= 11 && this.UI.leftScore < 11) {
			console.log('RIGHT PLAYER WINS');
		}

		if (this.UI.leftScore > 11 && this.UI.rightScore < this.UI.leftScore - 2) {
			console.log('LEFT PLAYER WINS');
		} else if (this.UI.rightScore > 11 && this.UI.leftScore < this.UI.rightScore - 2) {
			console.log('RIGHT PLAYER WINS');
		}

		if (this.UI.leftScore >= 20 && this.UI.rightScore >= 20) {
			console.log('DRAW');
		}
	}
}