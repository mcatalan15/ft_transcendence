/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ShrinkPowerDown.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/29 17:24:58 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { AnimationOptions, GameEvent } from '../../utils/Types.js';

export class ShrinkPowerDown extends Powerup {
	game: PongGame;

	constructor(id: string, layer: string, game: any, x: number, y: number) {
		super(id, layer, game, x, y, {
			despawn: 'time',
			effect: 'shrinkPaddle',
			affectation: 'powerDown',
			event: { type: 'shrinkPaddle' },
		});

		this.game = game;
	}

	sendPowerupEvent(entitiesMap: Map<string, Entity>): void {
		if (entitiesMap) {
			this.event.entitiesMap = entitiesMap;
		}
		this.game.eventQueue.push(this.event);
	}

	createPowerupGraphic(): Container {
		const container = new Container();
	
		// Base triangle
		const base = new Graphics();
		base.moveTo(0, 12);        // Bottom center
		base.lineTo(-12, -12);     // Top left
		base.lineTo(12, -12);      // Top right
		base.lineTo(0, 12);        // Close path
		base.fill(0xFFFBEB);
		container.addChild(base);
	
		const offset = 5;
		
		const ornament = new Graphics();
		ornament.moveTo(0, 12 + offset);
		ornament.lineTo(-12 - offset * Math.cos(Math.PI/6), -12 - offset * Math.sin(Math.PI/6));
		ornament.lineTo(12 + offset * Math.cos(Math.PI/6), -12 - offset * Math.sin(Math.PI/6));
		ornament.lineTo(0, 12 + offset);
		ornament.stroke(0xFFFBEB);
		container.addChild(ornament);
	
		return container;
	}
}