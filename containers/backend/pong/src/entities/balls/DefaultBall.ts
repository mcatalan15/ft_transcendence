/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DefaultBall.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/28 11:59:13 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/29 11:37:45 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { Ball } from './Ball'

import { PhysicsComponent } from '../../components/PhysicsComponent';

export class DefaultBall extends Ball {
	constructor(id: string, layer: string, x: number, y: number) {
		super(id, layer, x, y);
	}

	createBallGraphic(): Graphics {
		const ballGraphic = new Graphics();
		ballGraphic.circle(10, 10, 10);
		ballGraphic.fill(0xFFFFFF);
		ballGraphic.pivot.set(10, 10);
		return ballGraphic;
	}

	initBallPhysicsData(x: number, y: number) {
		const speed = 10;
		const angle = (Math.random() * 120 - 60) * (Math.PI / 180);
		const velocityX = Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1);
		const velocityY = Math.sin(angle) * speed;

		const data = {
			x: x,
			y: y,
			width: 20,
			height: 20,
			velocityX: velocityX,
			velocityY: velocityY,
			isStatic: false,
			behaviour: 'bounce' as const,
			restitution: 1.0,
			mass: 1,
		};

		return data;
	}

	moveBall(physics: PhysicsComponent): void {
		physics.x += physics.velocityX;
		physics.y += physics.velocityY;
	}
}