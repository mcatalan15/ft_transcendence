/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WorldSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 14:17:16 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:32 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Application } from 'pixi.js';

import type { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { FrameData, GameEvent, World } from '../utils/Types';
import { isUI } from '../utils/Guards';

export class WorldSystem implements System {
	game: PongGame;
	app: Application;
	timer: number;
	
	constructor(game: PongGame, app: Application) {
		this.game = game;
		this.app = app;
		this.timer = 200;
		
		this.game.entities.forEach(entity => {
			if (isUI(entity)) {
				entity.setWorldText(game.currentWorld.name);
			}
		});
	}

	update(entities: Entity[], delta: FrameData){
		this.timer -= delta.deltaTime;

		if (this.timer <= 0){
			this.changeWorld();
			this.timer = 200;
		}

		// Catch and handle world change events
		const unhandledEvents = [];

		while (this.game.eventQueue.length > 0) {
			const event = this.game.eventQueue.shift() as GameEvent;

			if (event.type === 'CHANGE_WORLD') {
				const targetWorld = event.target;

				this.game.currentWorld = targetWorld as World;

				for (const entity of entities) {
					if (!isUI(entity)) {
						continue ;
					} else {
						entity.setWorldText((targetWorld as World).name);
					}
				}
			} else {
				unhandledEvents.push(event);
			}
		}
		this.game.eventQueue.push(...unhandledEvents);
	}

	changeWorld() {
		const worldKeys = Object.keys(this.game.worldPool) as Array<keyof typeof this.game.worldPool>;
		
		const randomWorldKey = worldKeys[Math.floor(Math.random() * worldKeys.length)];
		
		const randomWorld = this.game.worldPool[randomWorldKey];
		
		const changeWorldEvent: GameEvent = {
		  type: "CHANGE_WORLD",
		  target: randomWorld
		};
		
		this.game.eventQueue.push(changeWorldEvent);
	  }
	
}