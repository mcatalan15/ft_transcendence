/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuAnimationSystem.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/28 15:42:45 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point, Graphics } from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { Menu } from './Menu';

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
import { isPaddle } from '../utils/Guards'

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

		// 1. Handle paddle transformation events
		const unhandledEvents = [];

		// 2. Update entities

		// 3. Cleanup
		for (const id of entitiesToRemove) {
			this.menu.removeEntity(id);
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