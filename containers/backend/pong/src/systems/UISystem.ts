/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UISystem.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:03:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:32 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Application, Container, Text } from 'pixi.js';

import type { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import type { UI } from '../entities/UI'

import type { TextComponent } from '../components/TextComponent';

import { isUI } from '../utils/Guards';
import { GameEvent } from '../utils/Types'

export class UISystem implements System {
	private game: PongGame;
	private app: Application;
	private renderedTextComponents: Set<TextComponent>;
	private uiLayer: Container;

	constructor(game: PongGame, app: Application) {
		this.game = game;
		this.app = app;
		this.renderedTextComponents = new Set();
		this.uiLayer = game.renderLayers.ui;
	}

	update(entities: Entity[], delta: { deltaTime: number }): void {
		entities.forEach(entity => {
			if (!isUI(entity)) {
				return;
			} else {
				entity.updateTimer(delta.deltaTime * 15);

				const textComponents = entity.getComponentsByType('text') as TextComponent[];

				textComponents.forEach(textComponent => {
					const textObject = textComponent.getRenderable();
					const tag = textComponent.getTag();

					const unhandledEvents: GameEvent[] = [];

					while (this.game.eventQueue.length > 0) {
						const event = this.game.eventQueue.shift();
						if (!event) continue;

						if (event.type === 'SCORE') {
							this.updateScore(entities, event);
						} else {
							unhandledEvents.push(event);
						}
					}

					this.game.eventQueue.push(...unhandledEvents);

					if (tag === 'score' || textComponent.instanceId === 'score') {
						textObject.x = this.game.width / 2;
						textObject.y = entity.topOffset - 5;
					} else if (tag === 'timer' || textComponent.instanceId === 'timer') {
						textObject.x = entity.width - 40;
						textObject.y = entity.topOffset + 5;
					} else if (tag == 'world' || textComponent.instanceId === 'world') {
						textObject.x = 20;
						textObject.y = entity.topOffset + 5;
					}

					this.ensureTextIsRendered(textComponent, textObject);
				});
			}
		});
	}

	private updateScore(entities: Entity[], event: GameEvent): void {
		const uiEntity = entities.find(e => e.id === 'UI') as UI;
		if (!uiEntity) {
			return;
		} else {
		if (event.side === 'left') uiEntity.incrementScore('left');
		else if (event.side === 'right') uiEntity.incrementScore('right');

		const newScore = `${uiEntity.getScore('left')} - ${uiEntity.getScore('right')}`;
		uiEntity.setScoreText(newScore);
		}
	}

	private ensureTextIsRendered(textComponent: TextComponent, textObject: Text): void {
		if (!this.renderedTextComponents.has(textComponent)) {
			this.uiLayer.addChild(textObject);
			this.renderedTextComponents.add(textComponent);
		}
		textObject.visible = true;
	}
}
