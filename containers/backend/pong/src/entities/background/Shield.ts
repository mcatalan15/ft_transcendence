/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Shield.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:37:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 12:23:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { PongGame } from '../../engine/Game';
import { Entity } from '../../engine/Entity';

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';
import { LifetimeComponent } from '../../components/LifetimeComponent';

import { GAME_COLORS } from '../../utils/Types';

export class Shield extends Entity {
	x: number;
	y: number;
	width: number;
	height: number;
	side: string;
	lineHeight: number;
	lineWidth: number = 2;
	lifetime: number = 1000;
	despawn: string = "time";

	constructor(id: string, layer: string, game: PongGame, side: string) {
		super(id, layer);
		
		this.lineHeight = game.height - game.topWallOffset - game.bottomWallOffset

		this.width = game.width;
		this.height = game.height;

		this.side = side;

		this.x = side === 'left' ? 20 : game.width - 20;
		this.y = game.height / 2;

		const graphic = this.generateLine(GAME_COLORS.white);
		const render = new RenderComponent(graphic);
		this.addComponent(render);

		render.graphic.position.set(this.x, this.y);

		const physicsData = this.initPaddlePhysicsData(this.x, this.y);
		const physicsComponent = new PhysicsComponent(physicsData);
		this.addComponent(physicsComponent);

		const lifetimeComp = new LifetimeComponent(this.lifetime, this.despawn);
		this.addComponent(lifetimeComp);

	}

	private generateLine(color: number): Graphics {
		const line = new Graphics();

		line.rect(0, 0, 2, this.lineHeight);
		line.pivot.set(1, this.lineHeight / 2);
		line.fill({ color: color, alpha: 1 });
		return line;
	}

	initPaddlePhysicsData(x: number, y: number){
        const data = {
            x: x,
            y: y,
            width: this.lineWidth,
            height: this.lineHeight,
            velocityX: 0,
            velocityY: 0,
            isStatic: false,
            behaviour: 'block' as const,
            restitution: 1.0,
            mass: 100,
            speed: 20,
        };

        return data;
    }

	public setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;

		const render = this.getComponent('render') as RenderComponent;
		if (render?.graphic) {
			render.graphic.position.set(this.x, this.y);
		}
	}
}