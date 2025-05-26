/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Bullet.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:45:07 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 12:23:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';

import { GAME_COLORS } from '../utils/Types.js';

export class Bullet extends Entity {
	direction: string;
	
	constructor(id: string, layer: string, x: number, y: number, direction: string) {
		super(id, layer);

		this.direction = direction;

		const graphic = this.generateBulletGraphic();
		const render = new RenderComponent(graphic);
		this.addComponent(render);

		const physicsData = this.initBulletPhysicsData(x, y);
		const physics = new PhysicsComponent(physicsData);
		this.addComponent(physics);
	}

	private generateBulletGraphic(): Graphics {
		const ballGraphic = new Graphics();
		const tip = { x: 5, y: 20 };
		const left = { x: 0, y: 0 };
		const right = { x: 10, y: 0 };

		ballGraphic.poly([tip, right, left], true);
		ballGraphic.fill(GAME_COLORS.white);
		return ballGraphic;
	}

	initBulletPhysicsData(x: number, y: number) {
		const data = {
			x,
			y,
			width: 10,
			height: 20,
			velocityX: 0,
			velocityY: 0,
			isStatic: false,
			behaviour: 'bounce' as const,
			restitution: 1.0,
			mass: 1,
			speed: 10,
		};

		return (data);
	}

	moveBullet(physics: PhysicsComponent){
		if (physics.speed) {
			if (this.direction === 'right') {
				physics.x += physics.speed;
			} else {
				physics.x -= physics.speed;
			}
		}
	}
}