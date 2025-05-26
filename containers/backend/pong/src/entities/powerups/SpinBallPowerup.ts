/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SpinBallPowerup.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 19:18:13 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

export class SpinBallPowerup extends Powerup {
    game: PongGame;

    constructor(id: string, layer: string, game: any, x: number, y: number) {
        super(id, layer, game, x, y, {
            despawn: 'time',
            effect: 'spawnSpinBall',
            affectation: 'ballChange',
            event: {type:'spawnSpinBall'},
        });

        this.game = game;
    }

    createPowerupGraphic(): Container {
        const container = new Container();

        const outline = new Graphics();
        outline.circle(0, 0, 15);
        outline.fill(GAME_COLORS.black);
        container.addChild(outline);

        const base = new Graphics();
        base.circle(0, 0, 10);
        base.fill(GAME_COLORS.white);
        container.addChild(base);

        const ornament = new Graphics();
        ornament.circle(0, 0, 15);
        ornament.stroke({ color: GAME_COLORS.white, width: 3 });
        container.addChild(ornament);

        const innerSign = new Graphics();

        innerSign.rect(-6.5, -6.5, 13, 13);
        innerSign.fill(GAME_COLORS.black);
        innerSign.angle = 45;
        
        innerSign.moveTo(4.5, 0);
        innerSign.arc(0, 0, 4, 0, 1.75 * Math.PI, false);
        innerSign.stroke({ color: GAME_COLORS.white, width: 1.5 });
        
        const angle = 1.75 * Math.PI;
        const arrowX = Math.cos(angle) * 5;
        const arrowY = Math.sin(angle) * 5;
        const tipSize = 2;
        
        innerSign.moveTo(arrowX, arrowY);
        innerSign.lineTo(
            arrowX + Math.cos(angle - Math.PI / 2) * tipSize,
            arrowY + Math.sin(angle - Math.PI / 2) * tipSize
        );
        innerSign.lineTo(
            arrowX + Math.cos(angle + Math.PI / 2) * tipSize,
            arrowY + Math.sin(angle + Math.PI / 2) * tipSize
        );
        innerSign.closePath();
        innerSign.fill(GAME_COLORS.black);
        
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

    sendPowerupEvent(entitiesMap: Map<string, Entity>, side: string, ): void {
        if (entitiesMap) {
            this.event.entitiesMap = entitiesMap;
        }
        if (side == 'left' || side == 'right') {
            this.event.side = side;
        }
        this.game.eventQueue.push(this.event);
    }

    
}