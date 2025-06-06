/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SpinBall.ts                                        :+:      :+:    :+:   */
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

export class SpinBall extends Ball {
	private rotation: number = 0;
	private angularVelocity: number = 0.05;
	private angularAcceleration: number = 0.0005;
	private maxAngularVelocity: number = 0.5;
	spinFactor: number = 0.3; // Controls how much the spin affects bounces
	rotationDir: number = 1;

	
	constructor(id: string, layer: string, x: number, y: number, isGoodBall: boolean) {
		super(id, layer, x, y, isGoodBall);
	}

	createBallGraphic(): Graphics {
		const ballGraphic = new Graphics();
		ballGraphic.rect(-10, -10, 20, 20);
		ballGraphic.fill(GAME_COLORS.white);
		//ballGraphic.pivot.set(0, 0);
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
		if (physics.velocityX > 0) {
			this.rotationDir = 	1;
		} else {
			this.rotationDir = -1;
		}
		
		const render = this.getComponent('render') as RenderComponent;
	
		// Update rotation
		this.rotation += this.angularVelocity * this.rotationDir;
		this.angularVelocity = Math.min(this.angularVelocity + this.angularAcceleration, this.maxAngularVelocity);
	
		if (render?.graphic) {
		  render.graphic.rotation = this.rotation;
		}
	
		// Apply regular movement
		physics.x += physics.velocityX;
		physics.y += physics.velocityY;
	  }
	
	  applySpinToBounce(physics: PhysicsComponent) {
		// Calculate how much influence the spin should have (0 to 1 range)
		// This creates a more controlled scaling based on current angular velocity
		const spinInfluencePercent = this.angularVelocity / this.maxAngularVelocity;
		
		// Scale the influence with our spin factor to keep it manageable
		// Use a non-linear scaling to make it more controlled
		const spinInfluence = Math.sin(this.rotation) * this.spinFactor * spinInfluencePercent;
		
		// Get current velocity angle
		const currentAngle = Math.atan2(physics.velocityY, physics.velocityX);
		
		// Apply a limited spin effect to the angle
		// The clamp ensures we don't add more than ±25 degrees of deviation
		const maxDeviationRadians = Math.PI / 7; // About 25 degrees maximum deviation
		const angleAdjustment = Math.max(-maxDeviationRadians, Math.min(maxDeviationRadians, spinInfluence));
		const newAngle = currentAngle + angleAdjustment;
		
		// Maintain the same speed but change direction
		const speed = Math.sqrt(physics.velocityX ** 2 + physics.velocityY ** 2);
		
		// Apply the new trajectory
		physics.velocityX = Math.cos(newAngle) * speed;
		physics.velocityY = Math.sin(newAngle) * speed;
		
		// More gradual increase in angular properties per bounce
		this.angularAcceleration *= 1.02; // Reduced from 1.05
		this.maxAngularVelocity = Math.min(this.maxAngularVelocity * 1.01, 0.3); // Reduced cap
		
		// Optional: add a small boost to speed after each bounce to make game gradually faster
		const speedBoost = 1.01; // 1% speed increase per bounce
		physics.velocityX *= speedBoost;
		physics.velocityY *= speedBoost;
		
		// Log debug info to monitor behavior
		console.log(`SpinBall bounce: angle=${(newAngle * 180 / Math.PI).toFixed(2)}°, speed=${speed.toFixed(2)}, angVel=${this.angularVelocity.toFixed(3)}, spinInfluence=${spinInfluence.toFixed(3)}`);
	  }
}