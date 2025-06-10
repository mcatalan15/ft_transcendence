/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EnlargePowerup.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 16:13:54 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game';
import { Entity } from '../../engine/Entity';
import { Powerup } from './Powerup';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

export class EnlargePowerup extends Powerup {
    game: PongGame;

    constructor(id: string, layer: string, game: any, x: number, y: number) {
        super(id, layer, game, x, y, {
            despawn: 'time',
            effect: 'enlargePowerup',
            affectation: 'powerUp',
            event: { type: 'enlargePowerup' },
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
    
        const createArrow = (): Graphics => {
            const arrow = new Graphics();
            const points = [
                { x: 0, y: -4 },
                { x: -3, y: 0 },
                { x: -1, y: 0 },
                { x: -1, y: 4 },
                { x: 1, y: 4 },
                { x: 1, y: 0 },
                { x: 3, y: 0 },
            ];
            arrow.poly(points, true);
            arrow.fill(GAME_COLORS.black);
            return arrow;
        };
    
        const diagonals = [
            { x: -5, y: -5, rotation: -Math.PI / 4 },
            { x: 5, y: -5, rotation: Math.PI / 4 },
            { x: 5, y: 5, rotation: (3 * Math.PI) / 4 },
            { x: -5, y: 5, rotation: -(3 * Math.PI) / 4 }
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