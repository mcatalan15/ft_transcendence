/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCutSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:55:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 15:27:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { TriangleCrossCut } from '../entities/crossCuts/TriangleCrossCut';

import { CrossCutSpawner } from '../spawners/CrossCutSpawner';

import { isCrossCut } from '../utils/Guards';
import { GameEvent } from '../utils/Types';

export class CrossCutSystem implements System {
	game: PongGame;

	constructor (game: PongGame) {
		this.game = game;
	}
	
	update(): void {
		const unhandledEvents = [];

		while (this.game.eventQueue.length > 0) {
			const event = this.game.eventQueue.shift() as GameEvent;
			
			if (event.type.endsWith("CrossCut")) {
				if (event.type.startsWith('spawnTop') && event.points && event.x && event.y) {
					CrossCutSpawner.spawnCrossCut(this.game, event.points, "top", event.x, event.y);
				} else if (event.type.startsWith('spawnBottom') && event.points && event.x && event.y) {
					CrossCutSpawner.spawnCrossCut(this.game, event.points, "bottom", event.x, event.y);
				} else if (event.type.startsWith('transformTop') && event.points) {
					for (const entity of this.game.entities) {
						if (isCrossCut(entity) && entity.position === 'top') {
							entity.transformCrossCut(entity, event.points);
						}
					}
				} else if (event.type.startsWith('transformBottom') && event.points) {
					for (const entity of this.game.entities) {
						if (isCrossCut(entity) && entity.position === 'bottom') {
							entity.transformCrossCut(entity, event.points);
						}
					}
				}
				else if (event.type.startsWith('despawn')) {
					for (const entity of this.game.entities) {
						if (isCrossCut(entity)) {
							this.game.removeEntity(entity.id);
						}
					}
				}
			} else {
				unhandledEvents.push(event);
			}
		}

		this.game.eventQueue.push(...unhandledEvents);
	}
}