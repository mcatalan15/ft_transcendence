/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InvertPowerDown.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 16:14:17 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game';
import { Entity } from '../../engine/Entity';
import { Powerup } from './Powerup';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

export class InvertPowerDown extends Powerup {
	game: PongGame;

	constructor(id: string, layer: string, game: any, x: number, y: number) {
		super(id, layer, game, x, y, {
			despawn: 'time',
			effect: 'invertPowerdown',
			affectation: 'powerDown',
			event: { type: 'invertPowerdown' },
		});

		this.game = game;
	}

	createPowerupGraphic(): Container {
		const container = new Container();
	
		const outline = new Graphics();
        outline.rect(-15, -15, 30, 30);
        outline.fill(GAME_COLORS.black);
		outline.pivot.set(-5, -5);
		outline.angle = 45;
        container.addChild(outline);
		
		// Base diamond (rotated square)
		const base = new Graphics();
		base.rect(-10, -10, 20, 20);
		base.fill(GAME_COLORS.white);
		base.pivot.set(-5, -5);
		base.angle = 45;
		container.addChild(base);
	
		// Ornament stroke, matching the base rotation
		const ornament = new Graphics();
		ornament.rect(-15, -15, 30, 30);
		ornament.stroke({ color: GAME_COLORS.white, width: 3 });
		ornament.pivot.set(-5, -5);
		ornament.angle = 45;
		container.addChild(ornament);
	
		const innerSign = new Graphics();
        innerSign.ellipse(0, 7, 8.5, 6.5);
        innerSign.stroke({width: 2.2,color: GAME_COLORS.black});
        container.addChild(innerSign);
		
		const topStar = new Graphics();
		topStar.star(1.3, 1.6, 5, 5.5);
		topStar.fill(GAME_COLORS.black);
		topStar.stroke({width: 1, color: GAME_COLORS.white})
		
		container.addChild(topStar);
		
		const botStar = new Graphics();
		botStar.star(-1.1, 13, 5, 4);
		botStar.fill(GAME_COLORS.black);
		botStar.stroke({width: 1, color: GAME_COLORS.white})
		container.addChild(botStar);
	
		return container;
	}

    initPowerupPhysicsData(x: number, y: number): PhysicsData {
        return {
            x,
            y,
            width: 30,
            height: 30,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'trigger' as const,
            restitution: 1.0,
            mass: 0,
            speed: 0,
        };
    }

	sendPowerupEvent(entitiesMap: Map<string, Entity>, side: string): void {
		if (entitiesMap) {
			this.event.entitiesMap = entitiesMap;
		}
		if (side == 'left' || side == 'right') {
            this.event.side = side;
        }
		this.game.eventQueue.push(this.event);
	}
}