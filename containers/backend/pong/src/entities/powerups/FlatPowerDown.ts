/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   FlatPowerDown.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 17:03:51 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

export class FlatPowerDown extends Powerup {
	game: PongGame;

	constructor(id: string, layer: string, game: any, x: number, y: number) {
		super(id, layer, game, x, y, {
			despawn: 'time',
			effect: 'flatPowerdown',
			affectation: 'powerDown',
			event: { type: 'flatPowerdown' },
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

		const innerSign = new Container();

		const createArrow = (): Graphics => {
			const arrow = new Graphics();
			const points = [
				{ x: 0, y: 10 },
				{ x: -5, y: 0 },
				{ x: -2, y: 0 },
				{ x: -2, y: -10 },
				{ x: 2, y: -10 },
				{ x: 2, y: 0 },
				{ x: 5, y: 0 },
			];
			arrow.poly(points, true);
			arrow.fill(GAME_COLORS.black);
			return arrow;
		};

		const arrow = createArrow();
		arrow.angle = 90;
		arrow.y = 6.5;
		innerSign.addChild(arrow);

		const botCircle = new Graphics();
		botCircle.circle(0, -2, 2);
		botCircle.fill(GAME_COLORS.black);
		innerSign.addChild(botCircle);

		const topCircle = new Graphics();
		topCircle.circle(0, 16, 2);
		topCircle.fill(GAME_COLORS.black);
		innerSign.addChild(topCircle);

        container.addChild(innerSign);
	
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