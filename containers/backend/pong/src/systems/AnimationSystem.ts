/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AnimationSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/21 11:50:41 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point, Graphics } from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { Paddle } from '../entities/Paddle'
import { Powerup } from '../entities/powerups/Powerup';
import { DepthLine } from '../entities/background/DepthLine';
import { CrossCut } from '../entities/crossCuts/CrossCut';
import { Obstacle } from '../entities/obstacles/Obstacle';

import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { CrossCutFactory, CrossCutPosition, CrossCutAction, CrossCutType } from '../factories/CrossCutFactory';
import { FrameData, GameEvent } from '../utils/Types';
import { isPaddle,
		isDepthLine,
		isObstacle,
		isPowerup,
		isPyramidDepthLine,
		isParapetDepthLine,
		isLightningDepthLine,
		isEscalatorDepthLine,
		isAcceleratorDepthLine,
		isMawDepthLine,
		isRakeDepthLine,
		isLedgeSegment,
		isPachinkoSegment,
		isWindmillSegment,
		isCrossCut,
} from '../utils/Guards'

export class AnimationSystem implements System {
	private game: PongGame;

	private frameCounter: number = 0;
	private depthLineUpdateRate: number = 1;
	lastCutId: string | null = null;
	isDespawningCrossCut: boolean = false;

	constructor(
		game: PongGame,
	) {
		this.game = game;
	}

	update(entities: Entity[], delta: FrameData): void {
		this.frameCounter = (this.frameCounter + 1) % this.depthLineUpdateRate;
		const entitiesToRemove: string[] = [];
	
		// 1. Handle paddle transformation events
		const unhandledEvents = [];
	
		while (this.game.eventQueue.length > 0) {
			const event = this.game.eventQueue.shift() as GameEvent;
	
			if (
				event.type === 'ENLARGE_PADDLE' ||
				event.type === 'SHRINK_PADDLE' ||
				event.type === 'RESET_PADDLE'
			) {
				this.transformPaddle(event);
			} else if (event.type === 'DESPAWN_CROSSCUT') {
				this.isDespawningCrossCut = true;
			} else {
				unhandledEvents.push(event);
			}
		}
		this.game.eventQueue.push(...unhandledEvents);

		if (this.isDespawningCrossCut === true) {
			this.animateDespawnCrossCut();
		}

		// 2. Update entities
		for (const entity of entities) {
			if (isPaddle(entity) && entity.targetHeight && entity.enlargeProgress < 1) {
				this.animatePaddle(delta, entity);
			} else if (this.frameCounter <= 0) {
				if (isDepthLine(entity)) {
					this.animateDepthline(delta, entitiesToRemove, entity);
				} else if (isObstacle(entity)) {
					this.animateObstacle(delta, entitiesToRemove, entity);
				} else if (isPowerup(entity)) {
					this.animatePowerup(entity);
				} else if (isCrossCut(entity) && this.isDespawningCrossCut !== true) {
					this.animateCrossCut(entity);
				}
			}
		}

		for (const id of entitiesToRemove) {
			this.game.removeEntity(id);
		}
	}

	transformPaddle(event: GameEvent) {
		const paddle = event.target as Paddle;
		const render = paddle.getComponent('render') as RenderComponent;
		const physics = paddle.getComponent('physics') as PhysicsComponent;
		if (!render || !physics) return;

		paddle.originalHeight = physics.height;

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
	}

	animatePaddle(delta: FrameData, entity: Paddle) {
		const render = entity.getComponent('render') as RenderComponent;
		const physics = entity.getComponent('physics') as PhysicsComponent;
		if (!render || !physics) return;

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
			graphic.fill('0xfff8e3');
			graphic.pivot.set(physics.width / 2, targetHeight / 2);
		}
	}

	animateDepthline(delta: FrameData, entitiesToRemove: string[], entity: DepthLine) {
		const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
		const render = entity.getComponent('render') as RenderComponent;

		if (
			!lifetime ||
			!render ||
			!entity.behavior ||
			!entity.initialized
		) {
			return ;
		};

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
				this.manageCrossCutCreation(entity, render);
				entitiesToRemove.push(entity.id);
			}
		}
	}

	animateObstacle(delta: FrameData, entitiesToRemove: string[], entity: Obstacle) {
		const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
		const render = entity.getComponent('render') as RenderComponent;
		
		if (!lifetime || !render) {
			return;
		}

		if (!lifetime.duration) {
			lifetime.duration = lifetime.remaining;
		}
		
		const animSpeed = 1
		
		const adjustedDelta = delta.deltaTime * animSpeed;
		
		const progress = Math.max(0, Math.min(1, 1 - (lifetime.remaining / lifetime.duration)));
		
		const alphaEase = 2;
		const scaleEase = 2;
		
		entity.alpha = Math.pow(progress, alphaEase) * entity.targetAlpha;
		render.graphic.alpha = entity.alpha;
		
		const currentScale = entity.initialScale + (entity.targetScale - entity.initialScale) * Math.pow(progress, scaleEase);
		render.graphic.scale.set(currentScale, currentScale);
		
		lifetime.remaining -= adjustedDelta;
		
		if (lifetime.despawn === 'time' && lifetime.remaining <= 0) {
			this.manageCrossCutCreation(entity, render);
			entitiesToRemove.push(entity.id);
		}
	}

	animatePowerup(entity: Powerup) {
		const render = entity.getComponent('render') as RenderComponent;
		const animation = entity.getComponent('animation') as AnimationComponent;
		const physics = entity.getComponent('physics') as PhysicsComponent;
		
		if (!render || !animation || !physics) return;
		
		if (animation.options) {
			const animationOptions = animation.options;
			const floatY = animationOptions.initialY as number + 
			Math.sin((Date.now() / 800 * (animationOptions.floatSpeed as number)) + (animationOptions.floatOffset as number)) * 
			(animationOptions.floatAmplitude as number);
		
			physics.y = floatY;
			render.graphic.position.set(physics.x, floatY);
		}	
	}

	animateCrossCut(entity: CrossCut) {
		const render = entity.getComponent('render') as RenderComponent;
		const animation = entity.getComponent('animation') as AnimationComponent;
		
		if (!render || !animation) return;
		
		if (!animation.initialized) {
		  animation.options = {
			...animation.options,
			startTime: Date.now(),
			duration: 100,
			initialAlpha: 0,
			targetAlpha: 1,
			targetDespawnAlpha: 0,
			easeExponent: 1,
			initialized: true
		  };
		  animation.initialized = true;
		}
		
		if (!animation.options) return;
		
		const startTime = animation.options.startTime as number;
		const duration = animation.options.duration as number;
		const initialAlpha = animation.options.initialAlpha as number;
		const targetAlpha = animation.options.targetAlpha as number;
		const easeExponent = animation.options.easeExponent as number;
		
		const elapsedTime = Date.now() - startTime;
		const progress = Math.min(1, elapsedTime / duration);
		
		const easedProgress = Math.pow(progress, easeExponent);
		
		const currentAlpha = initialAlpha + (targetAlpha - initialAlpha) * easedProgress;
		
		render.graphic.alpha = currentAlpha;
	}
	
	animateDespawnCrossCut() {
		let crossCut;
		
		for (const entity of this.game.entities) {
			if (isCrossCut(entity)) {
				crossCut = entity;
			}
		}

		if (!crossCut) return;
		
		const render = crossCut.getComponent('render') as RenderComponent;
		const animation = crossCut.getComponent('animation') as AnimationComponent;
		
		if (!render || !animation) return;
		
		if (!animation.despawnStarted) {
		  animation.options = {
			...animation.options,
			despawnStartTime: Date.now(),
			despawnDuration: 100,
			initialDespawnAlpha: render.graphic.alpha,
			targetDespawnAlpha: 0,
			easeExponent: animation.options?.easeExponent || 1
		  };
		  animation.despawnStarted = true;
		}
		
		if (!animation.options) return;
		
		const startTime = animation.options.despawnStartTime as number;
		const duration = animation.options.despawnDuration as number;
		const initialAlpha = animation.options.initialDespawnAlpha as number;
		const targetAlpha = animation.options.targetDespawnAlpha as number;
		const easeExponent = animation.options.easeExponent as number;
		
		const elapsedTime = Date.now() - startTime;
		const progress = Math.min(1, elapsedTime / duration);
		
		const easedProgress = Math.pow(progress, easeExponent);
		
		const currentAlpha = initialAlpha + (targetAlpha - initialAlpha) * easedProgress;
		
		render.graphic.alpha = currentAlpha;
		
		if (progress >= 1) {
		  CrossCutFactory.despawnAllCrossCuts(this.game);
		  this.isDespawningCrossCut = false;
		}
	}

	manageCrossCutCreation(entity: DepthLine | Obstacle, render: RenderComponent) {
		let points: Point[] = [];
		let direction;
		
		let cutType: CrossCutType;
		if (isDepthLine(entity)) {
			direction = entity.behavior?.direction;
		}
		const position: CrossCutPosition = direction === 'upwards' ? 'top' : 'bottom';

		// Extract points based on entity type
		if (isPyramidDepthLine(entity)) {
			cutType = 'Triangle';
			points = [...entity.points];
		} else if (isParapetDepthLine(entity)) {
			cutType = 'Parapet';
			points = [...entity.points];
		} else if (isLightningDepthLine(entity)) {
			cutType = 'Saw';
			points = [...entity.points];
		} else if (isEscalatorDepthLine(entity)) {
			cutType = 'Escalator';
			points = [...entity.points];
		} else if (isAcceleratorDepthLine(entity)) {
			cutType = 'Accelerator';
			points = [...entity.points];
		} else if (isMawDepthLine(entity)) {
			cutType = 'Maw';
			points = [...entity.points];
		} else if (isRakeDepthLine(entity)) {
			cutType = 'Rake';
			points = [...entity.points];
		} else if (isLedgeSegment(entity)) {
			cutType = 'Ledge';
			points = [...entity.points];
		} else if (isPachinkoSegment(entity)) {
			cutType = 'Pachinko';
			points = [...entity.points];
		} else if (isWindmillSegment(entity)) {
			cutType = 'Windmill';
			points = [...entity.points];
		} else {
			return;
		}
		
		let action: CrossCutAction;
		if (entity.id.startsWith('last')) {
			action = 'spawn';
		} else if (entity.id.startsWith('middle')) {
			action = 'transform';
		} else if (entity.id.startsWith('first')) {
			action = 'despawn';
		} else {
			return;
		}
		
		const eventName = CrossCutFactory.generateEventName(
			action, 
			action === 'despawn' ? null : position, 
			cutType
		);
		
		this.game.eventQueue.push({
			type: eventName,
			points: points,
			x: render.graphic.x,
			y: render.graphic.y,
		} as GameEvent);
	}

	private lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}
}