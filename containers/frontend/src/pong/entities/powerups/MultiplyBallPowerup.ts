/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MultiplyBallPowerup.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 16:14:30 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game';
import { Entity } from '../../engine/Entity';
import { Powerup } from './Powerup';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

export class MultiplyBallPowerup extends Powerup {
    game: PongGame;

    constructor(id: string, layer: string, game: any, x: number, y: number) {
        super(id, layer, game, x, y, {
            despawn: 'time',
            effect: 'spawnCurveBall',
            affectation: 'ballChange',
            event: {type:'spawnMultiplyBall'},
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

        const innerSign = new Container;

        const innerSignA = new Graphics();
        innerSignA.circle(0, 0, 2);
        innerSignA.fill(GAME_COLORS.black);
        innerSign.addChild(innerSignA);
        
        const innerSignB = new Graphics();
        innerSignB.circle(-4.5, -4.5, 2);
        innerSignB.fill(GAME_COLORS.black);
        innerSign.addChild(innerSignB);

        const innerSignC = new Graphics();
        innerSignC.circle(4.5, 4.5, 2);
        innerSignC.fill(GAME_COLORS.black);
        innerSign.addChild(innerSignC);
        
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