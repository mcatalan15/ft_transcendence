/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BurstBallPowerup.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/12 12:37:46 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Entity } from '../../engine/Entity.js';
import { Powerup } from './Powerup.js';

import { RenderComponent } from '../../components/RenderComponent.js';

import { PhysicsData, GAME_COLORS } from '../../utils/Types.js';

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
        outline.fill(GAME_COLORS.black);
        container.addChild(outline);
        
        const base = new Graphics();
        base.circle(0, 0, 10);
        base.fill(this.game.config.filters ? GAME_COLORS.white : GAME_COLORS.menuOrange);
        container.addChild(base);

        const ornament = new Graphics();
        ornament.circle(0, 0, 15);
        ornament.stroke({ color: this.game.config.filters ? GAME_COLORS.white : GAME_COLORS.menuOrange, width : 3 });
        container.addChild(ornament);

        const innerSign = new Graphics();

        const r = 7;
        const points = [
            { x: 0, y: -r },
            { x: r * Math.sin(Math.PI / 3), y: r * Math.cos(Math.PI / 3) },
            { x: -r * Math.sin(Math.PI / 3), y: r * Math.cos(Math.PI / 3) },
        ];
        
        innerSign.poly(points, true);
        innerSign.fill(GAME_COLORS.black);
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

    sendPowerupEvent(entitiesMap: Map<string, Entity>, side: string, ): void {
        if (entitiesMap) {
            this.event.entitiesMap = entitiesMap;
        }
        if (side == 'left' || side == 'right') {
            this.event.side = side;
        }
        this.game.eventQueue.push(this.event);
    }

    public redrawPowerup(): void {
        const renderComponent = this.getComponent('render') as RenderComponent;
        if (!renderComponent || !renderComponent.graphic) return;

        let color;

        if (this.game.config.classicMode) {
            color = GAME_COLORS.white;
        } else {
            if (this.game.config.filters) {
                color = GAME_COLORS.white;
            } else {
                color = GAME_COLORS.menuOrange;
            }
        }
    
        const container = renderComponent.graphic as Container;
        container.removeChildren();
    
        const outline = new Graphics();
        outline.circle(0, 0, 15);
        outline.fill(GAME_COLORS.black);
        container.addChild(outline);
        
        const base = new Graphics();
        base.circle(0, 0, 10);
        base.fill(color);
        container.addChild(base);
    
        const ornament = new Graphics();
        ornament.circle(0, 0, 15);
        ornament.stroke({ color: color, width : 3 });
        container.addChild(ornament);
    
        const innerSign = new Graphics();
        const r = 7;
        const points = [
            { x: 0, y: -r },
            { x: r * Math.sin(Math.PI / 3), y: r * Math.cos(Math.PI / 3) },
            { x: -r * Math.sin(Math.PI / 3), y: r * Math.cos(Math.PI / 3) },
        ];
        
        innerSign.poly(points, true);
        innerSign.fill(GAME_COLORS.black);
        innerSign.pivot.set(0, 0);
        innerSign.angle = +30;
        container.addChild(innerSign);
    }
}