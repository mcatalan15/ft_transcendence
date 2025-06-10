/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Obstacle.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:37:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/16 15:03:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { PongGame } from '../../engine/Game';
import { Entity } from '../../engine/Entity';

import { RenderComponent } from '../../components/RenderComponent';
import { LifetimeComponent } from '../../components/LifetimeComponent';
import { AnimationComponent } from '../../components/AnimationComponent';

import { ObstacleOptions, ObstacleBehavior } from '../../utils/Types';

export class Obstacle extends Entity {
	game: PongGame;
	initialized: boolean;
	initialY: number;
	x: number;
	y: number;
	width: number;
	height: number;
	alpha: number;
	targetAlpha: number;
	initialScale: number;
    targetScale: number;
	alphaIncrease: number;
	behavior: ObstacleBehavior;
	type: string;

	constructor(game: PongGame, id: string, layer: string, options: ObstacleOptions) {
		super(id, layer);

		this.initialized = options.initialized;
        this.initialY = options.initialY;
        this.width = options.width;
        this.height = options.height;
        this.alpha = options.alpha;
        this.targetAlpha = options.targetAlpha;
        this.initialScale = options.initialScale;
        this.targetScale = options.targetScale;
        this.behavior = options.behavior;
        this.type = options.type;

		this.behavior = options.behavior;

		this.game = game;

		this.initialized = options.initialized;
		this.initialY = options.initialY;
		
		this.width = game.width;
		this.height = game.height;

		this.x = game.width / 2;
		this.y = game.height / 2;

		this.alpha = 0;
		this.targetAlpha = options.alpha || 1;
		this.alphaIncrease = this.targetAlpha / 50;

		const graphic = this.generateLine(this.width, game.currentWorld.color);
		const render = new RenderComponent(graphic);
		this.addComponent(render);

		render.graphic.position.set(this.x, this.y);

		const lifetimeComp = new LifetimeComponent(options.lifetime, options.despawn);
		this.addComponent(lifetimeComp);

		const animationComp = new AnimationComponent();
		this.addComponent(animationComp);
	}

	private generateLine(width: number, color: number): Graphics {
		const line = new Graphics();
		line.rect(-width / 2, 0, width, 2);
		line.fill({ color: color, alpha: 1 });
		return line;
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