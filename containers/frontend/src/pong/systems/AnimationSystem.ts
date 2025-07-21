/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AnimationSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:26:59 by hmunoz-g         ###   ########.fr       */
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
import { UI } from '../entities/UI';

import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { GAME_COLORS } from '../utils/Types';

import { CrossCutFactory, CrossCutPosition, CrossCutAction, CrossCutType } from '../factories/CrossCutFactory';
import { FrameData, GameEvent } from '../utils/Types';
import { lerp } from '../utils/Utils';
import { isPaddle,
		isDepthLine,
		isObstacle,
		isPowerup,
		isUI,
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
	private UI!: UI;
	private frameCounter: number = 0;
	private depthLineUpdateRate: number = 1;
	lastCutId: string | null = null;
	isDespawningCrossCut: boolean = false;

	constructor(
		game: PongGame,
	) {
		this.game = game;

		for (const entity of this.game.entities) {
			if (isUI(entity)) this.UI = entity;
		}
	}

	update(entities: Entity[], delta: FrameData): void {
		this.frameCounter = (this.frameCounter + 1) % this.depthLineUpdateRate;
		const entitiesToRemove: string[] = [];
		
		if (this.UI.leftAffectationFullTime > 0) {
			this.UI.leftAffectationTime += delta.deltaTime;
		}
		if (this.UI.rightAffectationFullTime > 0) {
			this.UI.rightAffectationTime += delta.deltaTime;
		}

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
				} else if (isUI(entity)) {
					this.animateUI(entity);
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
			paddle.overshootTarget = paddle.targetHeight * 1.2;
		} else if (event.type === 'SHRINK_PADDLE') {
			paddle.targetHeight = paddle.baseHeight * 0.5;
			paddle.overshootTarget = paddle.baseHeight * 0.4;
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
			targetHeight = lerp(entity.originalHeight, entity.overshootTarget, easeT);
			if (t >= 1) {
				entity.overshootPhase = 'settle';
				entity.enlargeProgress = 0;
				entity.originalHeight = entity.overshootTarget;
			}
		} else if (entity.overshootPhase === 'settle') {
			targetHeight = lerp(entity.originalHeight, entity.targetHeight, easeT);
			if (t >= 1) {
				entity.overshootPhase = '';
			}
		}
	
		if (targetHeight !== undefined) {
			physics.height = targetHeight;
			const graphic = render.graphic as Graphics;
			
			const currentFillColor = graphic.fillStyle?.color || GAME_COLORS.white;
			
			graphic.clear();
			graphic.rect(0, 0, physics.width, targetHeight);
			graphic.fill(currentFillColor);
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
				if (!entity.id.includes('Standard') && entity.id.includes('last')) {
					this.handlePowerupSpawnEvent('figure');
				}
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
		
		const animSpeed = 1;
		
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
			if (entity.id.includes('last')) {
				this.handlePowerupSpawnEvent('obstacle');
			}
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

	animateUI(UI: UI) {
		if (UI.leftAffectationFullTime) {
			if (UI.leftAffectationTime >= UI.leftAffectationFullTime) {
				UI.leftAffectationFullTime = 0;
				UI.leftAffectationTime = 0;
				UI.hasLeftSideActivated = false;
			} else {
				const render = UI.getComponent('render') as RenderComponent;
				const targetChild = render.graphic.children.find(child => child.label === "leftBarFill");
				if (targetChild) {
					for (let i = 0; i < render.graphic.children.length; i++) {
						if (render.graphic.children[i].label === targetChild.label) {
							let caughtGraphic = render.graphic.children[i] as Graphics;
							caughtGraphic.clear();
							const length = 80 - ((UI.leftAffectationTime / UI.leftAffectationFullTime) * 80)
							caughtGraphic.rect(0, 0, length, 7.5);
							caughtGraphic.fill(GAME_COLORS.white);
						}
					}
				}
			}
		}
		
		if (UI.rightAffectationFullTime) {
			if (UI.rightAffectationTime >= UI.rightAffectationFullTime) {
				UI.rightAffectationFullTime = 0;
				UI.rightAffectationTime = 0;
				UI.hasRightSideActivated = false;
			} else {
				const render = UI.getComponent('render') as RenderComponent;
				const targetChild = render.graphic.children.find(child => child.label === "rightBarFill");
				if (targetChild) {
					for (let i = 0; i < render.graphic.children.length; i++) {
						if (render.graphic.children[i].label === targetChild.label) {
							let caughtGraphic = render.graphic.children[i] as Graphics;
							caughtGraphic.clear();
							const length = 80 - ((UI.rightAffectationTime / UI.rightAffectationFullTime) * 80);
							const offsetX = 80 - length;
							caughtGraphic.rect(offsetX, 0, length, 7.5);
							caughtGraphic.fill(GAME_COLORS.white);
						}
					}
				}
			}
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

	private handlePowerupSpawnEvent(origin: string): void {
		if (origin === 'figure') {
			const spawnPowerupEvent: GameEvent = {
				type: "SPAWN_POWERUP_FROM_FIGURE",
				target: this.game.currentWorld,
			}

			this.game.eventQueue.push(spawnPowerupEvent);
		} else if (origin === 'obstacle') {
			const spawnPowerupEvent: GameEvent = {
				type: "SPAWN_POWERUP_FROM_OBSTACLE",
				target: this.game.currentWorld,
			}

			this.game.eventQueue.push(spawnPowerupEvent);
		}
    }

	cleanup(): void {
		this.frameCounter = 0;
		this.lastCutId = null;
		this.isDespawningCrossCut = false;
		
		for (const entity of this.game.entities) {
			if (entity.hasComponent('animation')) {
				const animation = entity.getComponent('animation') as AnimationComponent;
				if (animation) {
					animation.initialized = false;
					animation.despawnStarted = false;
					animation.options = {};
				}
			}
			
			if (isPaddle(entity)) {
				entity.targetHeight = 0;
				entity.enlargeProgress = 0;
				entity.overshootPhase = '';
				entity.originalHeight = entity.baseHeight;
				entity.overshootTarget = 0;
				entity.wasEnlarged = false;
				entity.wasShrinked = false;
			}
		}
		
		if (this.UI) {
			this.UI.leftAffectationFullTime = 0;
			this.UI.leftAffectationTime = 0;
			this.UI.rightAffectationFullTime = 0;
			this.UI.rightAffectationTime = 0;
			this.UI.hasLeftSideActivated = false;
			this.UI.hasRightSideActivated = false;
		}
	}
}