/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EnlargePowerup.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/30 09:06:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { PhysicsData, AnimationOptions, GameEvent } from '../../utils/Types.js';

export class EnlargePowerup extends Powerup {
    game: PongGame;

    constructor(id: string, layer: string, game: any, x: number, y: number) {
        super(id, layer, game, x, y, {
            despawn: 'time',
            effect: 'enlargePaddle',
            affectation: 'powerUp',
            event: { type: 'enlargePaddle' },
        });

        this.game = game;
    }

    createPowerupGraphic(): Container {
        const container = new Container();

        const base = new Graphics();
        base.rect(-10, -10, 20, 20);
        base.fill(0xFFFBEB);
        container.addChild(base);

        const ornament = new Graphics();
        ornament.rect(-15, -15, 30, 30);
        ornament.stroke(0xFFFBEB);
        container.addChild(ornament);

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

    sendPowerupEvent(entitiesMap: Map<string, Entity>): void {
        if (entitiesMap) {
            this.event.entitiesMap = entitiesMap;
        }
        this.game.eventQueue.push(this.event);
    }
}