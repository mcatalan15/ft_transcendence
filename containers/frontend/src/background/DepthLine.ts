/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DepthLine.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:37:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:29 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';

import { RenderComponent } from '../components/RenderComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';
import { AnimationComponent } from '../components/AnimationComponent';

type DepthLineBehavior = {
	movement?: 'vertical' | 'horizontal';
	direction?: 'upwards' | 'downwards' | 'left' | 'right';
	fade?: 'in' | 'out' | 'none';
};

interface DepthLineOptions {
	initialized?: boolean;
	initialY?: number;
	velocityX?: number;
	velocityY?: number;
	width?: number;
	height?: number;
	upperLimit?: number;
	lowerLimit?: number;
	alpha?: number;
	alphaDecay?: number;
	alphaIncrease?: number;
	lifetime?: number;
	type?: 'top' | 'bottom' | string;
	despawn?: 'time' | 'offscreen' | string;
	behavior?: DepthLineBehavior;
}

export class DepthLine extends Entity {
	initialized: boolean;
	initialY: number;
	x: number;
	y: number;
	width: number;
	height: number;
	velocityX: number;
	velocityY: number;
	upperLimit: number;
	lowerLimit: number;
	alpha: number;
	targetAlpha: number;
	alphaIncrease: number;
	behavior: DepthLineBehavior;

	constructor(id: string, layer: string, game: PongGame, options: DepthLineOptions = {}) {
		super(id, layer);

		const {
			initialized = false,
			initialY = 0,
			velocityX = 0,
			velocityY = 0,
			width = 0,
			height = 0,
			upperLimit = 0,
			lowerLimit = 0,
			alpha = 1,
			alphaDecay = 0,
			alphaIncrease = 0,
			lifetime = 90,
			type = '',
			despawn = '',
			behavior = { movement: 'vertical', direction: 'upwards', fade: 'in' },
		} = options;

		this.initialized = initialized;
		this.initialY = initialY;
		
		this.width = width;
		this.height = height;

		this.x = width / 2;
		this.y = type === 'top' ? height / 2 - height / 10 : height / 2 + height / 10;

		this.upperLimit = upperLimit;
		this.lowerLimit = lowerLimit;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.behavior = behavior;

		this.alpha = 0;
		this.targetAlpha = alpha || 1;
		this.alphaIncrease = this.targetAlpha / 50;

		const graphic = this.generateLine(width, game.currentWorld.color);
		const render = new RenderComponent(graphic);
		this.addComponent(render);

		render.graphic.position.set(this.x, this.y);

		const lifetimeComp = new LifetimeComponent(lifetime, despawn);
		this.addComponent(lifetimeComp);

		const animationComp = new AnimationComponent();
		this.addComponent(animationComp);
	}

	private generateLine(width: number, color: number): Graphics {
		const line = new Graphics();
		line.rect(-width / 2, 0, width, 0.5);
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