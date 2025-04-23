/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 13:56:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 14:25:48 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { PongGame } from '../engine/Game'; // or wherever your Game type/class lives
import type { Entity } from '../engine/Entity';
import type { RenderComponent } from '../components/RenderComponent';
import type { PhysicsComponent } from '../components/PhysicsComponent';
import type { TextComponent } from '../components/TextComponent';
import { Application } from 'pixi.js';

export class RenderSystem {
	private game: PongGame;
	private app: Application;
	private renderedTextComponents: Set<string>; // maybe store entity IDs or component IDs

	constructor(game: PongGame, app: Application) {
		this.game = game;
		this.app = app;
		this.renderedTextComponents = new Set();
	}

	update(entities: Entity[], delta: number): void {
		entities.forEach((entity) => {
			const renderComponent = entity.getComponent('render') as RenderComponent | null;
			const physicsComponent = entity.getComponent('physics') as PhysicsComponent | null;

			if (renderComponent && physicsComponent) {
				renderComponent.graphic.x = physicsComponent.x;
				renderComponent.graphic.y = physicsComponent.y;
			}

			if (
				entity.hasComponent('text') &&
				physicsComponent &&
				(entity.id === 'paddleL' || entity.id === 'paddleR')
			) {
				const textComponent = entity.getComponent('text') as TextComponent;
				const textObject = textComponent.getRenderable(); // assumed to return PIXI.Text or similar

				if (entity.id === 'paddleL') {
					textObject.x = physicsComponent.x - 25;
					textObject.y = physicsComponent.y;
				} else {
					textObject.x = physicsComponent.x + 25;
					textObject.y = physicsComponent.y;
				}
			}
		});
	}
}
