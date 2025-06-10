/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ball.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/28 11:52:33 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/02 15:55:03 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { PongGame } from '../../engine/Game';
import { Entity } from '../../engine/Entity'
import { Paddle } from '../Paddle';

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';
import { VFXComponent } from '../../components/VFXComponent';

export abstract class Ball extends Entity {
	lastHit: string;
	isGoodBall: boolean;
	isFakeBall: boolean;
	magneticInfluence: string;

	constructor(id: string, layer: string, x: number, y: number, isGoodBall: boolean) {
		super(id, layer);

		this.lastHit = '';

		const ballGraphic = this.createBallGraphic();
		const renderComponent = new RenderComponent(ballGraphic);
		this.addComponent(renderComponent);

		const physicsData = this.initBallPhysicsData(x, y);
		const physicsComponent = new PhysicsComponent(physicsData);
		this.addComponent(physicsComponent);

		const vfxComponent = new VFXComponent();
		this.addComponent(vfxComponent);

		if (isGoodBall) {
			this.isGoodBall = true;
			this.isFakeBall = false;
		} else {
			this.isGoodBall = false;
			this.isFakeBall = true;
		}

		this.magneticInfluence = '';
	}

	// Ball types must implement their graphics
	abstract createBallGraphic(): Graphics;

	// Ball types must implement their physics setup
	abstract initBallPhysicsData(x: number, y: number): any;
	abstract moveBall(physics: PhysicsComponent): void;

	despawnBall(game: PongGame, ballId: string) {
		game.removeEntity(ballId);
	}

	applyMagneticForce(game: PongGame, physics: PhysicsComponent, entitiesMap: Map<string, Entity>): void {
		// Constants for magnetic effect
		const MAGNETIC_FORCE_MAX = 1.5;   // Maximum force strength
		const MAGNETIC_RANGE = game.width / 2;       // Distance at which magnetic effect begins
		const MAGNETIC_MIN_RANGE = 30;    // Distance at which magnetic force reaches maximum
	
		// Get both paddles
		const paddleL = entitiesMap.get("paddleL") as Paddle;
		const paddleR = entitiesMap.get("paddleR") as Paddle;
		
		if (!paddleL || !paddleR) return;
		
		// Check if either paddle is magnetized
		if (!(paddleL.isMagnetized && this.magneticInfluence === 'left') && !(paddleR.isMagnetized && this.magneticInfluence === 'right')) return;
		
		// Calculate forces for both paddles
		const leftPhysics = paddleL.getComponent('physics') as PhysicsComponent;
		const rightPhysics = paddleR.getComponent('physics') as PhysicsComponent;
		
		if (!leftPhysics || !rightPhysics) return;
		
		// Apply force from left paddle if magnetized
		if (paddleL.isMagnetized) {
			const paddleCenter = {
				x: leftPhysics.x + leftPhysics.width / 2,
				y: leftPhysics.y
			};
			
			const distance = Math.hypot(
				physics.x - paddleCenter.x, 
				physics.y - paddleCenter.y
			);
			
			// Only apply force if within range
			if (distance < MAGNETIC_RANGE) {
				// Calculate force strength (stronger as distance decreases)
				let forceStrength = MAGNETIC_FORCE_MAX * 
					(1 - Math.max(distance - MAGNETIC_MIN_RANGE, 0) / 
					(MAGNETIC_RANGE - MAGNETIC_MIN_RANGE));
					
				forceStrength = Math.min(forceStrength, MAGNETIC_FORCE_MAX);
				
				// Calculate direction vector
				const dirX = paddleCenter.x - physics.x;
				const dirY = paddleCenter.y - physics.y;
				const magnitude = Math.hypot(dirX, dirY);
				
				// Apply force to velocity
				if (magnitude > 0) {
					physics.velocityX += (dirX / magnitude) * forceStrength;
					physics.velocityY += (dirY / magnitude) * forceStrength;
				}
			}
		}
		
		// Apply force from right paddle if magnetized
		if (paddleR.isMagnetized) {
			const paddleCenter = {
				x: rightPhysics.x - rightPhysics.width / 2,
				y: rightPhysics.y
			};
			
			const distance = Math.hypot(
				physics.x - paddleCenter.x, 
				physics.y - paddleCenter.y
			);
			
			// Only apply force if within range
			if (distance < MAGNETIC_RANGE) {
				// Calculate force strength (stronger as distance decreases)
				let forceStrength = MAGNETIC_FORCE_MAX * 
					(1 - Math.max(distance - MAGNETIC_MIN_RANGE, 0) / 
					(MAGNETIC_RANGE - MAGNETIC_MIN_RANGE));
					
				forceStrength = Math.min(forceStrength, MAGNETIC_FORCE_MAX);
				
				// Calculate direction vector
				const dirX = paddleCenter.x - physics.x;
				const dirY = paddleCenter.y - physics.y;
				const magnitude = Math.hypot(dirX, dirY);
				
				// Apply force to velocity
				if (magnitude > 0) {
					physics.velocityX += (dirX / magnitude) * forceStrength;
					physics.velocityY += (dirY / magnitude) * forceStrength;
				}
			}
		}
		
		// Optional: Add a cap to the velocity to prevent balls from getting too fast
		const MAX_VELOCITY = 15;
		const currentSpeed = Math.hypot(physics.velocityX, physics.velocityY);
		
		if (currentSpeed > MAX_VELOCITY) {
			const scale = MAX_VELOCITY / currentSpeed;
			physics.velocityX *= scale;
			physics.velocityY *= scale;
		}
	}
}