/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SlowPowerDown.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 17:04:55 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

export class SlowPowerDown extends Powerup {
	game: PongGame;

	constructor(id: string, layer: string, game: any, x: number, y: number) {
		super(id, layer, game, x, y, {
			despawn: 'time',
			effect: 'slowPowerdown',
			affectation: 'powerDown',
			event: { type: 'slowPowerdown' },
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
	
		const innerSign = new Container;
		innerSign.y = 6.5;
		
		const rightTri = new Graphics();
        const rightRadius = 7.5;
        const rightPoints = [
            { x: 0, y: -rightRadius },
            { x: rightRadius * Math.sin(Math.PI / 3), y: rightRadius * Math.cos(Math.PI / 3) },
            { x: -rightRadius * Math.sin(Math.PI / 3), y: rightRadius * Math.cos(Math.PI / 3) },
        ];
        
        rightTri.poly(rightPoints, true);
		rightTri.x = -3;
        rightTri.fill(GAME_COLORS.black);
        rightTri.pivot.set(0, 0);
        rightTri.angle = 30;

		innerSign.addChild(rightTri);

		const leftTri = new Graphics();
        const leftRadius = 6;
        const leftPoints = [
            { x: 0, y: -leftRadius },
            { x: leftRadius * Math.sin(Math.PI / 3), y: leftRadius * Math.cos(Math.PI / 3) },
            { x: -leftRadius * Math.sin(Math.PI / 3), y: leftRadius * Math.cos(Math.PI / 3) },
        ];

        leftTri.poly(leftPoints, true);
		leftTri.x = 4;
        leftTri.fill(GAME_COLORS.black);
        leftTri.pivot.set(0, 0);
        leftTri.angle = 30;

		innerSign.addChild(leftTri);


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