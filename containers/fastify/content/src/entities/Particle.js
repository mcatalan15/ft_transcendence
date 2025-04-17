/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Particle.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/14 09:56:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/17 17:20:53 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity.js";
import { RenderComponent } from "../components/RenderComponent.js";
import { PhysicsComponent } from "../components/PhysicsComponent.js";
import { LifetimeComponent } from "../components/LifetimeComponent.js";
import { ParticleBehaviorComponent } from "../components/ParticleBehaviorComponent.js";

export class Particle extends Entity {
	constructor(id, layer, x, y, options = {}) {
		super(id, layer);

		const {
			velocityX = 0,
			velocityY = 0,
			lifetime = 30,
			size = 4,
			type = 'square',
			color = 0xFFFFFF,
			shrink = false,
			rotate = false,
			alpha = 1,
			alphaDecay = 0,
			fadeOut = false,
			despawn = 'time',
		} = options;

		this.alpha = alpha;
		this.fadeOut = fadeOut;
		this.alphaDecay = alphaDecay;

		// Basic particle: white square
		const graphic = this.generateParticleGraphic(type, size, color, x, y);

		const render = new RenderComponent(graphic);
		this.addComponent(render);
		
		const physics = new PhysicsComponent ({
			x: x,
			y: y,
			velocityX: velocityX,
			velocityY: velocityY,
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

	generateParticleGraphic(type, size, color, x, y){
		const graphic = new PIXI.Graphics();

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
				graphic.regularPoly(0, 0, size * 2, 3, 0);;
				graphic.fill(color);
				graphic.pivot.set(0, 0);
				break ;
			
			default:
				console.log("Invalid particle information. Generation failed");
		}
		return (graphic);
	}
}