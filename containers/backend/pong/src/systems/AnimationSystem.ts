/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AnimationSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/06 16:11:53 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application, Graphics } from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { Paddle } from '../entities/Paddle'
import { cutTriangle } from '../entities/background/cutTriangle';

import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { FrameData, GameEvent } from '../utils/Types';
import { isPaddle, isDepthLine, isPowerup, isPyramidDepthLine, isRenderSystem } from '../utils/Guards'
import { PyramidDepthLine } from '../entities/background/PyramidDepthLine';

export class AnimationSystem implements System {
	private game: PongGame;
	private width: number;
	private height: number;
	private topWallOffset: number;
	private bottomWallOffset: number;
	private wallThickness: number;

	private frameCounter: number = 0;
	private depthLineUpdateRate: number = 1;
	lastCutId: string | null = null;

	constructor(
		game: PongGame,
		width: number,
		height: number,
		topWallOffset: number,
		bottomWallOffset: number,
		wallThickness: number
	) {
		this.game = game;
		this.width = width;
		this.height = height;
		this.topWallOffset = topWallOffset;
		this.bottomWallOffset = bottomWallOffset;
		this.wallThickness = wallThickness;
	}

	update(entities: Entity[], delta: FrameData): void {
		this.frameCounter = (this.frameCounter + 1) % this.depthLineUpdateRate;
		const entitiesToRemove: string[] = [];
	
		// 1. Handle paddle events (ENLARGE/SHRINK/RESET)
		const unhandledEvents = [];
	
		while (this.game.eventQueue.length > 0) {
			const event = this.game.eventQueue.shift() as GameEvent;
	
			if (
				event.type === 'ENLARGE_PADDLE' ||
				event.type === 'SHRINK_PADDLE' ||
				event.type === 'RESET_PADDLE'
			) {
				const paddle = event.target as Paddle;
				const render = paddle.getComponent('render') as RenderComponent;
				const physics = paddle.getComponent('physics') as PhysicsComponent;
				if (!render || !physics) continue;
	
				paddle.originalHeight = physics.height;
	
				// Set target height
				if (event.type === 'ENLARGE_PADDLE') {
					paddle.targetHeight = paddle.baseHeight * 2;
					paddle.overshootTarget = paddle.targetHeight * 1.2; // Overshoot by growing 20% larger
				} else if (event.type === 'SHRINK_PADDLE') {
					paddle.targetHeight = paddle.baseHeight * 0.5; // Final target is 50% of original
					paddle.overshootTarget = paddle.baseHeight * 0.4; // Overshoot by shrinking to 40% first
				} else {
					paddle.targetHeight = paddle.baseHeight;
					if (paddle.wasEnlarged) {
						paddle.overshootTarget = paddle.targetHeight * 0.9;
						paddle.wasEnlarged = false;
					} else if (paddle.wasShrinked) {
						paddle.overshootTarget = paddle.targetHeight * 1.1;
						paddle.wasShrinked = false;
					}
				}
				
				paddle.overshootPhase = 'expand';
				paddle.enlargeProgress = 0;
			} else {
				unhandledEvents.push(event);
			}
		}
		this.game.eventQueue.push(...unhandledEvents);
	
		// 2. Update paddle animations
		for (const entity of entities) {
			const render = entity.getComponent('render') as RenderComponent;
			const physics = entity.getComponent('physics') as PhysicsComponent;
			if (!render || !physics) continue;
	
			if (isPaddle(entity) && entity.targetHeight && entity.enlargeProgress < 1) {
				entity.enlargeProgress += delta.deltaTime * 0.1;
				const t = Math.min(entity.enlargeProgress, 1);
				let easeT = 1 - Math.pow(2, -10 * t);
				let targetHeight;
	
				if (entity.overshootPhase === 'expand') {
					targetHeight = this.lerp(entity.originalHeight, entity.overshootTarget, easeT);
					if (t >= 1) {
						entity.overshootPhase = 'settle';
						entity.enlargeProgress = 0;
						entity.originalHeight = entity.overshootTarget;
					}
				} else if (entity.overshootPhase === 'settle') {
					targetHeight = this.lerp(entity.originalHeight, entity.targetHeight, easeT);
					if (t >= 1) {
						entity.overshootPhase = '';
					}
				}
	
				if (targetHeight !== undefined) {
					physics.height = targetHeight;
					const graphic = render.graphic as Graphics;
					graphic.clear();
					graphic.rect(0, 0, physics.width, targetHeight);
					graphic.fill('#FFFBEB');
					graphic.pivot.set(physics.width / 2, targetHeight / 2);
				}
			}
		}

		// 3. Animate entities
		if (this.frameCounter === 0) {
			for (const entity of entities) {
				if (!isDepthLine(entity) && !isPowerup(entity)) {
					continue;
				} else if (isDepthLine(entity)) {
					const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
					const render = entity.getComponent('render') as RenderComponent;

					if (!lifetime || !render || !entity.behavior) continue;

					if (!entity.initialized) {	
						continue; // Skip if not initialized by WorldSystem
					}
					
					let progress = 0;
					if (entity.behavior.direction === 'upwards') {
						progress = 1 - ((entity.y - entity.upperLimit) / (entity.initialY - entity.upperLimit));
					} else {
						progress = (entity.y - entity.initialY) / (entity.lowerLimit - entity.initialY);
					}
					progress = Math.max(0, Math.min(1, progress));

					const speedMultiplier = Math.pow(progress + 0.5, 2);

					if (entity.behavior.direction === 'upwards') {
						entity.y -= entity.velocityY * delta.deltaTime * 0.1 * speedMultiplier * this.depthLineUpdateRate;
					} else {
						entity.y += entity.velocityY * delta.deltaTime * 0.1 * speedMultiplier * this.depthLineUpdateRate;
					}

					render.graphic.position.set(entity.x, entity.y);
					entity.alpha = progress * entity.targetAlpha;
					render.graphic.alpha = entity.alpha;

					if (lifetime.despawn === 'position') {
						if (
							(entity.behavior.direction === 'upwards' && entity.y <= entity.upperLimit) ||
							(entity.behavior.direction === 'downwards' && entity.y >= entity.lowerLimit)
						) {
							if (isPyramidDepthLine(entity)) {
								if (entity.points && entity.points.length >= 4) {
									for (const system of this.game.systems) {
										if (isRenderSystem(system)) {
											system.generatePyramidCut(entity);
										}
									}
								} else {
									console.warn("PyramidDepthLine missing required points:", entity);
								}
							}
							entitiesToRemove.push(entity.id);
						}
					}
				} else if (isPowerup(entity)) {
					const render = entity.getComponent('render') as RenderComponent;
					const animation = entity.getComponent('animation') as AnimationComponent;
					const physics = entity.getComponent('physics') as PhysicsComponent;
					
					if (!render || !animation || !physics) continue;
					
					// Calculate the new Y position using a sine wave
					if (animation.options) {
						const animationOptions = animation.options;
						const floatY = animationOptions.initialY as number + 
						Math.sin((Date.now() / 800 * (animationOptions.floatSpeed as number)) + (animationOptions.floatOffset as number)) * 
						(animationOptions.floatAmplitude as number);
					
						// Update the position of the powerup
						physics.y = floatY;
						render.graphic.position.set(physics.x, floatY);
					}
				}
			}
		}

		for (const id of entitiesToRemove) {
			this.game.removeEntity(id);
		}
	}

	private lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}
}