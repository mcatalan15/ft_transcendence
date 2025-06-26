/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ShootPowerup.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/12 12:18:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { PongGame } from '../../engine/Game';
import { Entity } from '../../engine/Entity';
import { Powerup } from './Powerup';

import { RenderComponent } from '../../components/RenderComponent';

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
        base.fill(this.game.config.filters ? GAME_COLORS.white : GAME_COLORS.green);
        container.addChild(base);
    
        const ornament = new Graphics();
        ornament.rect(-15, -15, 30, 30);
        ornament.stroke({ color: this.game.config.filters ? GAME_COLORS.white : GAME_COLORS.green, width: 3 });
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
                color = GAME_COLORS.green;
            }
        }
    
        const container = renderComponent.graphic as Container;
        container.removeChildren();
        
        const outline = new Graphics();
        outline.rect(-15, -15, 30, 30);
        outline.fill(GAME_COLORS.black);
        container.addChild(outline);
    
        const base = new Graphics();
        base.rect(-10, -10, 20, 20);
        base.fill(color);
        container.addChild(base);
    
        const ornament = new Graphics();
        ornament.rect(-15, -15, 30, 30);
        ornament.stroke({ color: color, width: 3 });
        container.addChild(ornament);
    
        const innerSign = new Container();
    
        const createTriangle = (x: number, y: number): Graphics => {
            const triangle = new Graphics();
            triangle.moveTo(0, -4);
            triangle.lineTo(3, 2);
            triangle.lineTo(-3, 2);
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
    }
}