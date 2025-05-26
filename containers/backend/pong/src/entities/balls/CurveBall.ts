/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CurveBall.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/29 11:32:16 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 12:23:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { Ball } from './Ball'

import { PhysicsComponent } from '../../components/PhysicsComponent';
import { RenderComponent } from '../../components/RenderComponent';

import { GAME_COLORS } from '../../utils/Types';

export class CurveBall extends Ball {
	constructor(id: string, layer: string, x: number, y: number, isGoodBall: boolean) {
		super(id, layer, x, y, isGoodBall);
	}

	createBallGraphic(): Graphics {
		const ballGraphic = new Graphics();
		ballGraphic.ellipse(10, 10, 14, 8); // Horizontal ellipse = football shape
		ballGraphic.fill(GAME_COLORS.white); // Brownish football color
		ballGraphic.pivot.set(10, 10);
		return ballGraphic;
	}

	initBallPhysicsData(x: number, y: number) {
		const speed = 9;
		const angle = (Math.random() * 120 - 60) * (Math.PI / 180);
		const velocityX = Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1);
		const velocityY = Math.sin(angle) * speed;

		const data = {
			x: x,
			y: y,
			width: 28, // width of ellipse
			height: 16, // height of ellipse
			velocityX: velocityX,
			velocityY: velocityY,
			isStatic: false,
			behaviour: 'bounce' as const,
			restitution: 0.95, // slightly less bouncy
			mass: 1.2, // slightly heavier
		};

		return data;
	}

	clampVelocity(physics: PhysicsComponent, minSpeed: number, maxSpeed: number) {
		const vx = physics.velocityX;
		const vy = physics.velocityY;
		const speed = Math.sqrt(vx * vx + vy * vy);
	
		if (speed < minSpeed || speed > maxSpeed) {
			const clampedSpeed = Math.max(minSpeed, Math.min(maxSpeed, speed));
			const scale = clampedSpeed / speed;
			physics.velocityX *= scale;
			physics.velocityY *= scale;
		}
	}

	moveBall(physics: PhysicsComponent): void {
		// Refined curve (rotates velocity slightly)
		const curveStrength = 0.05;
		const angle = Math.atan2(physics.velocityY, physics.velocityX);
		const curveAngle = angle + Math.PI / 2;
	
		physics.velocityX += Math.cos(curveAngle) * curveStrength;
		physics.velocityY += Math.sin(curveAngle) * curveStrength;
	
		// Clamp speed to avoid too slow/fast
		this.clampVelocity(physics, 5, 15);
	
		// Move
		physics.x += physics.velocityX;
		physics.y += physics.velocityY;
	
		// Rotate sprite to face direction
		const render = this.getComponent('render') as RenderComponent;
		if (render?.graphic) {
			render.graphic.rotation = Math.atan2(physics.velocityY, physics.velocityX);
		}
	}
}