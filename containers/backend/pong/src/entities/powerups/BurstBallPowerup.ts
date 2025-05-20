/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BurstBallPowerup.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/20 08:46:50 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { PhysicsData } from '../../utils/Types.js';

export class BurstBallPowerup extends Powerup {
    game: PongGame;

    constructor(id: string, layer: string, game: any, x: number, y: number) {
        super(id, layer, game, x, y, {
            despawn: 'time',
            effect: 'spawnBurstBall',
            affectation: 'ballChange',
            event: {type:'spawnBurstBall'},
        });

        this.game = game;
    }

    createPowerupGraphic(): Container {
        const container = new Container();

        const outline = new Graphics();
        outline.circle(0, 0, 15);
        outline.fill(0x171717);
        container.addChild(outline);
        
        const base = new Graphics();
        base.circle(0, 0, 10);
        base.fill(0xfff8e3);
        container.addChild(base);

        const ornament = new Graphics();
        ornament.circle(0, 0, 15);
        ornament.stroke({ color: 0xfff8e3, width: 1.2 });
        container.addChild(ornament);

        const innerSign = new Graphics();

        const r = 7;
        const points = [
            { x: 0, y: -r },
            { x: r * Math.sin(Math.PI / 3), y: r * Math.cos(Math.PI / 3) },
            { x: -r * Math.sin(Math.PI / 3), y: r * Math.cos(Math.PI / 3) },
        ];
        
        innerSign.poly(points, true);
        innerSign.fill(0x171717);
        innerSign.pivot.set(0, 0);
        innerSign.angle = +30;
        container.addChild(innerSign);

        return container;
    }

    initPowerupPhysicsData(x: number, y: number): PhysicsData {
		return {
            x,
            y,
            width: 20,
            height: 20,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'trigger' as const,
            restitution: 1.0,
            mass: 0,
            speed: 0,
        };
	}

    sendPowerupEvent(entitiesMap: Map<string, Entity>, side?: string, ): void {
        if (entitiesMap) {
            this.event.entitiesMap = entitiesMap;
        }
        if (side == 'left' || side == 'right') {
            this.event.side = side;
        }
        this.game.eventQueue.push(this.event);
    }

    
}