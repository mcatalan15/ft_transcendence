/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ShootPowerup.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 17:04:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

export class ShootPowerup extends Powerup {
    game: PongGame;

    constructor(id: string, layer: string, game: any, x: number, y: number) {
        super(id, layer, game, x, y, {
            despawn: 'time',
            effect: 'ShootPowerup',
            affectation: 'powerUp',
            event: { type: 'ShootPowerup' },
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
    
        const innerSign = new Container();

        const createTriangle = (x: number, y: number): Graphics => {
            const triangle = new Graphics();
            triangle.moveTo(0, -4);       // Top point
            triangle.lineTo(3, 2);        // Bottom-right
            triangle.lineTo(-3, 2);       // Bottom-left
            triangle.closePath();
            triangle.fill(GAME_COLORS.black);
            triangle.position.set(x, y);
            return triangle;
        };

        const innerSignA = createTriangle(0, 0);
        innerSignA.angle = -90;
        const innerSignB = createTriangle(-5, -5);
        innerSignB.angle = -90;
        const innerSignC = createTriangle(5, 5);
        innerSignC.angle = -90;

        innerSign.addChild(innerSignA, innerSignB, innerSignC);

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