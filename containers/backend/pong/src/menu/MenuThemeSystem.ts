/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuThemeSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/04 20:21:44 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point, Graphics } from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { Menu } from './Menu';
import { Title } from './Title';
import { BallButton } from './BallButton';

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
import { isRenderComponent, isMenuLine, isBall } from '../utils/Guards'
import { MenuLine } from './MenuLine';

export class MenuThemeSystem implements System {
	private menu: Menu;
	private isClassicModeOn: boolean = false;

	constructor(menu: Menu) {
		this.menu = menu;
	}

	update(entities: Entity[], delta: FrameData): void {
		if (this.isClassicModeOn !== this.menu.config.classicMode) {
			this.isClassicModeOn = this.menu.config.classicMode;

			this.remakeTitle();
		}
	}

	remakeTitle() {
		const entitiesToRemove: string[] = [];
		
		for (const entity of this.menu.entities) {
			if (entity instanceof Title) {
				entitiesToRemove.push(entity.id);
			} else if (entity instanceof BallButton) {
				entitiesToRemove.push(entity.id);
			} else if (isBall(entity)) {
				entitiesToRemove.push(entity.id);
			}
		}

		for (const entityId of entitiesToRemove) {
			this.menu.removeEntity(entityId);
		}

		this.menu.renderLayers.logo.children.splice(0, 2);

		this.menu.createTitle();

		if (!this.menu.config.classicMode) {
			this.menu.createBallButton();
		}
	}
}