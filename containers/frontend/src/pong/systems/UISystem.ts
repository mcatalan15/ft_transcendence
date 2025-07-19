/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UISystem.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:03:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/11 10:31:29 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Container, Text } from 'pixi.js';

import type { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import type { UI } from '../entities/UI'

import type { TextComponent } from '../components/TextComponent';

import { isUI } from '../utils/Guards';
import { GameEvent } from '../utils/Types'


export class UISystem implements System {
	private game: PongGame;
	private renderedTextComponents: Set<TextComponent>;
	private uiLayer: Container;

	constructor(game: PongGame) {
		this.game = game;
		this.renderedTextComponents = new Set();
		this.uiLayer = game.renderLayers.ui;
	}

	update(entities: Entity[], delta: { deltaTime: number }): void {
		if (this.game.hasEnded) {
			return;
		}
		
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
						if (this.game.config.classicMode) {
							textObject.x = this.game.width / 2;
							textObject.y = 200;
						} else {
							textObject.x = this.game.width / 2;
							textObject.y = entity.topOffset + 12;
						}
					} else if (tag === 'classicScoreLeft') {
						textObject.x = entity.width / 2 - 250;
						textObject.y = 225;
					} else if (tag === 'classicScoreRight') {
						textObject.x = entity.width / 2 + 250;
						textObject.y = 225;
					} else if (tag === 'timer' || textComponent.instanceId === 'timer') {
						textObject.x = entity.width - 50;
						textObject.y = entity.topOffset + 20;
					} else if (tag == 'world' || textComponent.instanceId === 'world') {
						textObject.x = 20;
						textObject.y = entity.topOffset + 20;
					}

					this.ensureTextIsRendered(textComponent, textObject);
				});
			}
		});
	}

	private updateScore(entities: Entity[], event: GameEvent): void {
		if (this.game.isOnline && this.game.config.classicMode || this.game.hasEnded) {
			console.log('🎮 UI: Skipping local score event in online mode, server manages scoring');
			return;
		}

		const uiEntity = entities.find(e => e.id === 'UI') as UI;
		if (!uiEntity) {
			return;
		}

		if (event.side === 'left') uiEntity.incrementScore('left');
		else if (event.side === 'right') uiEntity.incrementScore('right');

		let newScore;
		if (this.game.config.classicMode) {
			if (event.side === 'left') {
				newScore = `${uiEntity.getScore('left')}`;
				uiEntity.setClassicScoreText(newScore, 'left');
			} else if (event.side === 'right') {
				newScore = `${uiEntity.getScore('right')}`;
				uiEntity.setClassicScoreText(newScore, 'right');
			}
		} else {
			newScore = `${uiEntity.getScore('left')} - ${uiEntity.getScore('right')}`;
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

	cleanup(): void {
		this.renderedTextComponents.clear();
		
		for (const entity of this.game.entities) {
			if (isUI(entity)) {
				entity.leftScore = 0;
				entity.rightScore = 0;
				entity.elapsedTime = 0;
				
				// Reset all text components
				const textComponents = entity.getComponentsByType('text') as TextComponent[];
				textComponents.forEach(textComponent => {
					const textObject = textComponent.getRenderable();
					textObject.visible = false;
					
					// Remove from UI layer
					if (textObject.parent === this.uiLayer) {
						this.uiLayer.removeChild(textObject);
					}
				});
			}
		}
		
		console.log('UISystem cleanup completed');
	}
}
