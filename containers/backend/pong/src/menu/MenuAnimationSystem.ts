/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuAnimationSystem.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/30 10:08:20 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point, Graphics } from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { Menu } from './Menu';
import { Title } from './Title';

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
import { isRenderComponent } from '../utils/Guards'

export class MenuAnimationSystem implements System {
	private menu: Menu;
	private UI!: UI;
	private frameCounter: number = 0;
	private depthLineUpdateRate: number = 1;
	lastCutId: string | null = null;
	isDespawningCrossCut: boolean = false;

	constructor(menu: Menu) {
		this.menu = menu;

	}

	update(entities: Entity[], delta: FrameData): void {
		const entitiesToRemove: string[] = [];

		// 1. Handle events
		const unhandledEvents = [];

		// 2. Update entities
		for (const entity of entities) {
			if (entity.id === 'title') {
				this.animateTitle(delta, entity as Title);
			}
		}
		// 3. Cleanup
		for (const id of entitiesToRemove) {
			this.menu.removeEntity(id);
		}
	}

	animateTitle(delta: FrameData, entity: Title) {
		let titleBackdrop;
		let titleText;
		let titleBall;
		let titleBlock;
		for (const [key, component] of entity.components) {
			if (isRenderComponent(component)) {
				if (component.instanceId === 'backDrop') titleBackdrop = component;
				else if (component.instanceId === 'textRender') titleText = component;
				else if (component.instanceId === 'ballRender') titleBall = component;
				else if (component.instanceId === 'block') titleBlock = component;
			}
		}

		const animation = entity.getComponent('animation') as AnimationComponent;

		if (!titleBackdrop || !titleText || !titleBall || !titleBlock || !animation) {
			console.log("Missing components:", { titleBackdrop: !!titleBackdrop, titleText: !!titleText, titleBlock: !!titleBlock, animation: !!animation });
			return
		};

		if (animation.options) {
			const animationOptions = animation.options;
			
			// Set initial positions if not already set
			if (!animationOptions.initialized) {
				animationOptions.backdropInitialX = titleBackdrop.graphic.x;
				animationOptions.backdropInitialY = titleBackdrop.graphic.y;
				animationOptions.textInitialX = titleText.graphic.x + 500;
				animationOptions.textInitialY = titleText.graphic.y - 40 + 160;
				animationOptions.ballInitialX = titleText.graphic.x - 65 + 500;
				animationOptions.ballInitialY = titleText.graphic.y - 30 + 160;
				animationOptions.blockInitialX = titleBlock.graphic.x + 500;
				animationOptions.blockInitialY = titleBlock.graphic.y;
				animationOptions.initialized = true;
			}
	
			const floatOffset = Math.sin((Date.now() / 800 * (animationOptions.floatSpeed as number)) + (animationOptions.floatOffset as number)) * (animationOptions.floatAmplitude as number);
	
			// Apply animation to each component using their individual initial positions
			titleBackdrop.graphic.position.set(
				animationOptions.backdropInitialX as number, 
				(animationOptions.backdropInitialY as number)
			);
	
			titleText.graphic.position.set(
				animationOptions.textInitialX as number, 
				(animationOptions.textInitialY as number)
			);

			titleBall.graphic.position.set(
				(animationOptions.ballInitialX as number),
				((animationOptions.ballInitialY as number) + floatOffset)
			);
	
			titleBlock.graphic.position.set(
				animationOptions.blockInitialX as number, 
				(animationOptions.blockInitialY as number)
			);
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

	}
}