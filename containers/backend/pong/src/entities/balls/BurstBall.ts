/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BurstBall.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/28 11:59:13 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 12:23:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { Ball } from './Ball'

import { PhysicsComponent } from '../../components/PhysicsComponent';
import { RenderComponent } from '../../components/RenderComponent';

import { GAME_COLORS } from '../../utils/Types';

export class BurstBall extends Ball {
	private state: 'winding' | 'burst' = 'winding';
	private windupFrames = 30; // wind-up duration in frames
	private frameCounter = 0;
	private burstSpeed = 25;
	private windSpeed = 2;

	constructor(id: string, layer: string, x: number, y: number, isGoodBall: boolean) {
		super(id, layer, x, y, isGoodBall);
	}

	createBallGraphic(): Graphics {
		const ballGraphic = new Graphics();
		const tip = { x: 10, y: 20 };
		const left = { x: 0, y: 0 };
		const right = { x: 20, y: 0 };

		ballGraphic.poly([tip, right, left], true);
		ballGraphic.fill(GAME_COLORS.white);
		ballGraphic.pivot.set(10, 10);
		return ballGraphic;
	}

	initBallPhysicsData(x: number, y: number) {
		const data = {
			x,
			y,
			width: 30,
			height: 35,
			velocityX: 0,
			velocityY: 0,
			isStatic: false,
			behaviour: 'bounce' as const,
			restitution: 1.0,
			mass: 1,
			collisionShape: 'triangle' as const,
		};
		
		return data;
	}

	moveBall(physics: PhysicsComponent): void {
		const render = this.getComponent('render') as RenderComponent;

		if (this.state === 'winding') {
			this.frameCounter++;

			// Slowly move in current direction
			const dir = Math.atan2(physics.velocityY, physics.velocityX);
			physics.velocityX = Math.cos(dir) * this.windSpeed;
			physics.velocityY = Math.sin(dir) * this.windSpeed;

			if (this.frameCounter >= this.windupFrames) {
				// Switch to burst phase
				this.state = 'burst';

				// Use current direction to burst
				const burstAngle = Math.atan2(physics.velocityY, physics.velocityX);
				physics.velocityX = Math.cos(burstAngle) * this.burstSpeed;
				physics.velocityY = Math.sin(burstAngle) * this.burstSpeed;
			}
		}

		// Apply movement
		physics.x += physics.velocityX;
		physics.y += physics.velocityY;

		// Rotate to match direction
		if (render?.graphic) {
			render.graphic.rotation = Math.atan2(physics.velocityY, physics.velocityX) - Math.PI / 2;
		}
	}

	// Reset when hitting paddle
	resetWindup() {
		this.state = 'winding';
		this.frameCounter = 0;
	}
}