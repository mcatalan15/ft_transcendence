/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Particle.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:45:07 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 12:50:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';
import { ParticleBehaviorComponent } from '../components/ParticleBehaviorComponent';

// Options interface
interface ParticleOptions {
	velocityX?: number;
	velocityY?: number;
	lifetime?: number;
	size?: number;
	type?: 'square' | 'circle' | 'triangle';
	color?: number;
	shrink?: boolean;
	rotate?: boolean;
	alpha?: number;
	alphaDecay?: number;
	fadeOut?: boolean;
	despawn?: 'time' | 'offscreen' | string;
}

export class Particle extends Entity {
	size: number;
	alpha: number;
	fadeOut: boolean;
	alphaDecay: number;

	constructor(id: string, layer: string, x: number, y: number, options: ParticleOptions = {}) {
		super(id, layer);

		const {
			velocityX = 0,
			velocityY = 0,
			lifetime = 30,
			size = 4,
			type = 'square',
			color = 0xFFFBEB,
			shrink = false,
			rotate = false,
			alpha = 1,
			alphaDecay = 0,
			fadeOut = false,
			despawn = 'time',
		} = options;

		this.size = size;

		this.alpha = alpha;
		this.fadeOut = fadeOut;
		this.alphaDecay = alphaDecay;

		const graphic = this.generateParticleGraphic(type, size, color);
		const render = new RenderComponent(graphic);
		this.addComponent(render);

		const physics = new PhysicsComponent({
			x: x,
			y: y,
			width: this.size / 2,
			height: this.size / 2,
			velocityX: velocityX,
			velocityY: velocityY,
			isStatic: false,
			behaviour: 'none' as const,
			restitution: 1.0,
			mass: 1,
		});
		this.addComponent(physics);

		const lifetimeComp = new LifetimeComponent(lifetime, despawn);
		this.addComponent(lifetimeComp);

		const behaviour = new ParticleBehaviorComponent({
			rotate: rotate,
			shrink: shrink,
		});
		this.addComponent(behaviour);
	}

	private generateParticleGraphic(
		type: 'square' | 'circle' | 'triangle',
		size: number,
		color: number
	): Graphics {
		const graphic = new Graphics();

		switch (type) {
			case 'square':
				graphic.rect(0, 0, size, size);
				graphic.fill(color);
				graphic.pivot.set(size / 2, size / 2);
				break;

			case 'circle':
				graphic.circle(size, size, size);
				graphic.fill(color);
				graphic.pivot.set(size, size);
				break;

			case 'triangle':
				graphic.regularPoly(0, 0, size * 2, 3, 0);
				graphic.fill(color);
				graphic.pivot.set(0, 0);
				break;

			default:
				console.warn("Invalid particle type. Generation failed.");
		}

		return graphic;
	}
}