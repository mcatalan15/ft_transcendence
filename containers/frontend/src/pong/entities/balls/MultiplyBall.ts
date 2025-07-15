/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MultiplyBall.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/30 10:08:52 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 12:23:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { Ball } from './Ball'

import { PhysicsComponent } from '../../components/PhysicsComponent';

import { GAME_COLORS } from '../../utils/Types';


export class MultiplyBall extends Ball {
	flashColor: number;
	
	constructor(id: string, layer: string, x: number, y: number, isGoodBall: boolean) {
		super(id, layer, x, y, isGoodBall);

		this.flashColor = GAME_COLORS.greenParticle;
	}

	createBallGraphic(): Graphics {
		const ballGraphic = new Graphics();
		ballGraphic.circle(5, 5, 5);
		ballGraphic.fill(GAME_COLORS.white);
		ballGraphic.pivot.set(2.5, 2.5);
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
			width: 10,
			height: 10,
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