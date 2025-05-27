/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MagnetizePowerup.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 10:56:50 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

export class MagnetizePowerup extends Powerup {
    game: PongGame;

    constructor(id: string, layer: string, game: any, x: number, y: number) {
        super(id, layer, game, x, y, {
            despawn: 'time',
            effect: 'magnetizePowerup',
            affectation: 'powerUp',
            event: { type: 'magnetizePowerup' },
        });

        this.game = game;
    }

    createPowerupGraphic(): Container {
        const container = new Container();
        
        const outline = new Graphics();
        outline.rect(-15, -15, 30, 30);
        outline.fill(GAME_COLORS.black);
        container.addChild(outline);

        const base = new Graphics();
        base.rect(-10, -10, 20, 20);
        base.fill(GAME_COLORS.white);
        container.addChild(base);
    
        const ornament = new Graphics();
        ornament.rect(-15, -15, 30, 30);
        ornament.stroke({ color: GAME_COLORS.white, width: 3 });
        container.addChild(ornament);
    
        const magnet = new Graphics();
        magnet.moveTo(-5, -5);
        magnet.arc(0, -5, 5, Math.PI, 0, false); // Top half-circle
        magnet.lineTo(5, -1);
        magnet.moveTo(-5, -5);
        magnet.lineTo(-5, -1);
        magnet.stroke({width: 3, color: GAME_COLORS.black});
        magnet.y = 3;
        magnet.x = 0;
        container.addChild(magnet);

        // Left tip (black block)
        const leftTip = new Graphics();
        leftTip.rect(-6.5, 4, 3, 4);
        leftTip.fill(GAME_COLORS.black);
        container.addChild(leftTip);

        // Right tip (white with black stroke)
        const rightTip = new Graphics();
        rightTip.rect(3.5, 4, 3, 4);
        rightTip.fill(GAME_COLORS.black);
        container.addChild(rightTip);
        
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