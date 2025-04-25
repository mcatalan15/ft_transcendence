/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AnimationSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 18:53:50 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application, Graphics } from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { Paddle } from '../entities/Paddle'

import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { MainBackgroundSpawner } from '../spawners/MainBackgroundSpawner';

import { DepthLineBehavior, FrameData, GameEvent } from '../utils/Types';
import { isPaddle, isDepthLine, isPowerup } from '../utils/Guards'

export class AnimationSystem implements System {
	private game: PongGame;
	private app: Application;
	private width: number;
	private height: number;
	private topWallOffset: number;
	private bottomWallOffset: number;
	private wallThickness: number;

	private depthLineCooldown: number = 20;
	private frameCounter: number = 0;
	private depthLineUpdateRate: number = 1;
	private lastLineSpawnTime: number = 0;

	constructor(
		game: PongGame,
		app: any,
		width: number,
		height: number,
		topWallOffset: number,
		bottomWallOffset: number,
		wallThickness: number
	) {
		this.game = game;
		this.app = app;
		this.width = width;
		this.height = height;
		this.topWallOffset = topWallOffset;
		this.bottomWallOffset = bottomWallOffset;
		this.wallThickness = wallThickness;
	}

	update(entities: Entity[], delta: FrameData): void {
		this.frameCounter = (this.frameCounter + 1) % this.depthLineUpdateRate;
		const entitiesToRemove: string[] = [];

		// 1. Handle paddle events (ENLARGE/RESET)
		const unhandledEvents = [];

		while (this.game.eventQueue.length > 0) {
			const event = this.game.eventQueue.shift() as GameEvent;

			if (event.type === 'ENLARGE_PADDLE' || event.type === 'RESET_PADDLE') {
				const paddle = event.target as Paddle;
				const render = paddle.getComponent('render') as RenderComponent;
				const physics = paddle.getComponent('physics') as PhysicsComponent;
				if (!render || !physics) continue;

				paddle.originalHeight = physics.height;
				paddle.targetHeight = event.type === 'ENLARGE_PADDLE'
					? paddle.baseHeight * 2
					: paddle.baseHeight;
				paddle.overshootTarget = event.type === 'ENLARGE_PADDLE'
					? paddle.targetHeight * 1.2
					: paddle.targetHeight * 0.9;
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

		// 3. Spawn depth lines
		this.depthLineCooldown -= delta.deltaTime;

		if (this.depthLineCooldown <= 0) {
			this.lastLineSpawnTime = Date.now();

			const behaviorTop: DepthLineBehavior = { movement: 'vertical', direction: 'upwards', fade: 'in' };
			const behaviorBottom: DepthLineBehavior = { movement: 'vertical', direction: 'downwards', fade: 'in' };

			MainBackgroundSpawner.spawnDepthLine(this.game, this.width, this.height, this.topWallOffset, this.bottomWallOffset, this.wallThickness, 'top', behaviorTop);
			MainBackgroundSpawner.spawnDepthLine(this.game, this.width, this.height, this.topWallOffset, this.bottomWallOffset, this.wallThickness, 'bottom', behaviorBottom);

			this.depthLineCooldown = 20;
		}

		// 4. Initialize and animate depth lines
		for (const entity of entities) {
			if (isDepthLine(entity) && entity.id.startsWith('depthLine')) {
				const idParts = entity.id.split('-');
				const timestamp = parseInt(idParts[1]);
				if (!entity.initialized && timestamp >= this.lastLineSpawnTime - 100) {
					const render = entity.getComponent('render') as RenderComponent;
					if (render) {
						entity.initialized = true;
						entity.initialY = entity.y;
						entity.alpha = 0;
						render.graphic.alpha = 0;
					}
				}
			}
		}

		if (this.frameCounter === 0) {
			for (const entity of entities) {
				if (!isDepthLine(entity) && !isPowerup(entity)) {
					continue;
				} else if (isDepthLine(entity)) {
					const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
					const render = entity.getComponent('render') as RenderComponent;

					if (!lifetime || !render || !entity.behavior) continue;

					if (!entity.initialY) {
						entity.initialY = entity.y;
						entity.initialized = true;
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
							entitiesToRemove.push(entity.id);
						}
					}
				} else if (isPowerup(entity)) {
					// ANIMATE POWERUP HERE
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
