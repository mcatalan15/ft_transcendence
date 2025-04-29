/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 15:57:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/29 18:46:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle';
import type { System } from '../engine/System'

import { CurveBall } from '../entities/balls/CurveBall';

import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { PowerupComponent } from '../components/PowerupComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { PowerupSpawner } from '../spawners/PowerupSpawner';
import { BallSpawner } from '../spawners/BallSpawner';

import { FrameData, GameEvent  } from '../utils/Types'
import { isPaddle, isBall, isPowerup } from '../utils/Guards'

export class PowerupSystem implements System {
	game: PongGame;
	app: any;
	width: number;
	height: number;
	cooldown: number;
	lastPowerupSpawn: number;

	constructor(game: PongGame, app: any, width: number, height: number) {
		this.game = game;
		this.app = app;
		this.width = width;
		this.height = height;

		this.cooldown = 100;
		this.lastPowerupSpawn = 0;
	}

	update(entities: Entity[], delta: FrameData): void {
		const powerupsToRemove: string[] = [];

		this.cooldown -= delta.deltaTime;

		// Spawn powerups
		if (this.cooldown <= 0) {
			this.lastPowerupSpawn = Date.now();

			PowerupSpawner.spawnPowerup(this.game, this.width, this.height);
			console.log('Powerup Spawned');
			this.cooldown = 1000;   
		}

		for (const entity of entities) {
			// Manage powerup lifetime
			if (entity.id.startsWith('powerup')) {
				const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
				if (!lifetime) continue;

				if (lifetime.despawn === 'time') {
					lifetime.remaining -= delta.deltaTime;

					if (lifetime.remaining <= 0) {
						powerupsToRemove.push(entity.id);
						continue;
					}
				}
			}

			// Restore powerup effects
			if (isPaddle(entity)) {
				if (entity.isEnlarged) {
					entity.enlargeTimer -= delta.deltaTime;
				}

				if (entity.isShrinked) {
					console.log(entity.shrinkTimer);
					entity.shrinkTimer -= delta.deltaTime;
				}

				if ((entity.isEnlarged && entity.enlargeTimer <= 0) || (entity.isShrinked && entity.shrinkTimer <= 0)) {
					console.log('Resetting paddle height');
					this.game.sounds.paddleReset.play();
					entity.resetPaddleSize(entity);
				}
			}
		}

		//handle powerupEvents
		const unhandledEvents: GameEvent[] = [];

		while (this.game.eventQueue.length > 0) {
			const event = this.game.eventQueue.shift();
			if (!event)
				break;
			switch (event.type) {
				case ('enlargePaddle'):
					this.triggerEnlargePaddle(event);
					break;
				case ('shrinkPaddle'):
					this.triggerShrinkPaddle(event);
					break;
				case ('spawnCurveBall'):
					this.changeToCurveBall(event);
					break;
				default:
					unhandledEvents.push(event);
					break;
			}
		}

		this.game.eventQueue.push(...unhandledEvents);

		// Remove powerups that have expired
		for (const entityId of powerupsToRemove) {
			this.game.removeEntity(entityId);
		}
	}

	triggerEnlargePaddle(event: GameEvent) {
		if (event.entitiesMap) {
			let ball, powerupComp;

			for (const entity of event.entitiesMap.values()) {
				if (isBall(entity)) {
					ball = entity;
				}
				if (isPowerup(entity)) {
					powerupComp = entity.getComponent('powerup') as PowerupComponent;
				}

				if (ball && powerupComp) {
					if (ball.lastHit === 'left'){  
						const paddleL = event.entitiesMap.get('paddleL') as Paddle;
						powerupComp.enlargePaddle(paddleL);
					} else if (ball.lastHit === 'right') {
						const paddleR = event.entitiesMap.get('paddleR') as Paddle;
						powerupComp.enlargePaddle(paddleR);
					}
				}
			}
		}
	}

	triggerShrinkPaddle(event: GameEvent) {
		if (event.entitiesMap) {
			let ball, powerupComp;

			for (const entity of event.entitiesMap.values()) {
				if (isBall(entity)) {
					ball = entity;
				}
				if (isPowerup(entity)) {
					powerupComp = entity.getComponent('powerup') as PowerupComponent;
				}

				if (ball && powerupComp) {
					if (ball.lastHit === 'left'){  
						const paddleL = event.entitiesMap.get('paddleL') as Paddle;
						powerupComp.shrinkPaddle(paddleL);
					} else if (ball.lastHit === 'right') {
						const paddleR = event.entitiesMap.get('paddleR') as Paddle;
						powerupComp.shrinkPaddle(paddleR);
					}
				}
			}
		}
	}

	changeToCurveBall(event: GameEvent) {
		if (event.entitiesMap) {
			for (const entity of event.entitiesMap.values()) {
				if (isBall(entity)) {
					const physics = entity.getComponent('physics') as PhysicsComponent;
	
					this.game.removeEntity(entity.id);
	
					BallSpawner.spawnCurveBallAt(this.game, physics);
					break; // Only replace one ball
				}
			}
		}
	}
}
