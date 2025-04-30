/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ShrinkPowerDown.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/30 17:23:24 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { PhysicsData, AnimationOptions, GameEvent } from '../../utils/Types.js';

export class ShrinkPowerDown extends Powerup {
	game: PongGame;

	constructor(id: string, layer: string, game: any, x: number, y: number) {
		super(id, layer, game, x, y, {
			despawn: 'time',
			effect: 'shrinkPowerdown',
			affectation: 'powerDown',
			event: { type: 'shrinkPowerdown' },
		});

		this.game = game;
	}

	createPowerupGraphic(): Container {
	const container = new Container();

	// Base diamond (rotated square)
	const base = new Graphics();
	base.rect(-10, -10, 20, 20);
	base.fill(0xFFFBEB);
	base.pivot.set(-5, -5);
	base.angle = 45;
	container.addChild(base);

	// Ornament stroke, matching the base rotation
	const ornament = new Graphics();
	ornament.rect(-15, -15, 30, 30);
	ornament.stroke({ color: 0xFFFBEB, width: 1.2 });
	ornament.pivot.set(-5, -5);
	ornament.angle = 45;
	container.addChild(ornament);

	// Define reusable inward arrow (same shape as before, flipped upside down)
	const createArrow = (): Graphics => {
		const arrow = new Graphics();
		const points = [
			{ x: 0, y: 4 },    // Tip (inward now)
			{ x: -3, y: 0 },
			{ x: -1, y: 0 },
			{ x: -1, y: -4 },
			{ x: 1, y: -4 },
			{ x: 1, y: 0 },
			{ x: 3, y: 0 },
		];
		arrow.poly(points, true);
		arrow.fill(0x171717);
		return arrow;
	};

	// Diagonals pointing inward (shorter vectors)
	const diagonals = [
		{ x: 0, y: 0, rotation: Math.PI + Math.PI},
		{ x: 7.5, y: 7, rotation: Math.PI - Math.PI / 2 },
		{ x: -7.5, y: 7, rotation: -Math.PI + Math.PI / 2},
		{ x: 0, y: 14, rotation: -Math.PI},
	];

	for (const diag of diagonals) {
		const arrow = createArrow();
		arrow.position.set(diag.x, diag.y);
		arrow.rotation = diag.rotation;
		container.addChild(arrow);
	}

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
	
	/*createPowerupGraphic(): Container {
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



	initPowerupPhysicsData(x: number, y: number): PhysicsData {
		return {
            x,
            y,
            width: 24,
            height: 24,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'trigger' as const,
            restitution: 1.0,
            mass: 0,
            speed: 0,
        };
	}*/

	sendPowerupEvent(entitiesMap: Map<string, Entity>): void {
		if (entitiesMap) {
			this.event.entitiesMap = entitiesMap;
		}
		this.game.eventQueue.push(this.event);
	}
}