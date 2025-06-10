/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 15:57:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 12:25:53 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle';
import type { System } from '../engine/System'

import { UI } from '../entities/UI';

import { PhysicsComponent } from '../components/PhysicsComponent';
import { PowerupComponent } from '../components/PowerupComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { PowerupSpawner } from '../spawners/PowerupSpawner';
import { BallSpawner } from '../spawners/BallSpawner';

import { FrameData, GameEvent  } from '../utils/Types'
import { removePaddleFromLayer } from '../utils/Utils';
import { isPaddle, isBall, isPowerup, isShield, isUI } from '../utils/Guards'

export class PowerupSystem implements System {
	game: PongGame;
	width: number;
	height: number;
	UI!: UI;
	powerupTimer: number = 0;
	isSpawningPowerups: boolean = false;
	isSpawningBullets: boolean = false;
	bulletSpawnInterval: number = 10;
	bulletQuantity: number = 3;
	bulletEvent?: GameEvent;

	constructor(game: PongGame, width: number, height: number) {
		this.game = game;
		this.width = width;
		this.height = height;

		for (const entity of this.game.entities) {
			if (isUI(entity)) this.UI = entity;
		}
	}

	update(entities: Entity[], delta: FrameData): void {
		const powerupsToRemove: string[] = [];
		const unhandledEvents: GameEvent[] = [];

		if (this.isSpawningPowerups) {
			this.powerupTimer -= delta.deltaTime;

			if (this.powerupTimer <= 0) {
				PowerupSpawner.spawnPowerup(this.game, this. width, this.height, this.game.currentWorld.tag)
				this.powerupTimer = 999999;
			}
		}

		//handle powerup events
		while (this.game.eventQueue.length > 0) {
			const event = this.game.eventQueue.shift();
			if (!event)
				break;
			
			if (event.type.endsWith("Ball")) {
				this.game.sounds.ballchange.play();
				this.changeBall(event);
			} else if (event.type.endsWith("Powerup")) {
				this.game.sounds.powerup.play();
				this.setBarTimers(event.side!, event.type);
				this.triggerPowerup(event);
			} else if (event.type.endsWith("Powerdown")) {
				this.setBarTimers(event.side!, event.type);
				this.game.sounds.powerdown.play();
				this.triggerPowerdown(event);
			} else if (event.type === 'SPAWN_POWERUP_FROM_FIGURE') {
				this.isSpawningPowerups = true;
				this.powerupTimer = 420;
			} else if (event.type === 'SPAWN_POWERUP_FROM_OBSTACLE') {
				this.isSpawningPowerups = true;
				this.powerupTimer = 20;
			} else {
				unhandledEvents.push(event);
			}
		}


		this.game.eventQueue.push(...unhandledEvents);

		for (const entity of entities) {
			// Manage powerup lifetime
			if (entity.id.includes('power') || entity.id.includes('ballChange')) {
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

			//Manage shield lifetime
			if (isShield(entity)) {
				const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
				if (!lifetime) continue;

				if (lifetime.despawn === 'time') {
					lifetime.remaining -= delta.deltaTime;

					if (lifetime.remaining <= 0) {
						PowerupSpawner.despawnShield(this.game, entity.id);
					}
				}
			}

			// Restore powerup effects
			if (isPaddle(entity)) {
				if (entity.isEnlarged || entity.isShrinked || entity.isInverted || entity.isSlowed || entity.isFlat || entity.isMagnetized || entity.isStunned ) {
					entity.affectedTimer -= delta.deltaTime;
				}

				if ((entity.isEnlarged || entity.isShrinked) && entity.affectedTimer <= 0) {
					console.log('Resetting paddle height');
					if (entity.isEnlarged) {
						this.game.sounds.paddleResetDown.play()
					} else {
						if (entity.isEnlarged) this.game.sounds.paddleResetUp.play();
					};
					removePaddleFromLayer(this, entity);
					entity.resetPaddleSize(entity);
				} else if (entity.isInverted && entity.affectedTimer <= 0) {
					removePaddleFromLayer(this, entity);
					entity.inversion = 1;
					entity.isInverted = false;
				} else if (entity.isSlowed && entity.affectedTimer <= 0) {
					removePaddleFromLayer(this, entity);
					entity.slowness = 1;
					entity.isSlowed = false;
				} else if (entity.isFlat && entity.affectedTimer <= 0) {
					removePaddleFromLayer(this, entity);
					entity.isFlat = false;
				} else if (entity.isMagnetized && entity.affectedTimer <= 0) {
					removePaddleFromLayer(this, entity);
					entity.isMagnetized = false;
				} else if (entity.isStunned && entity.affectedTimer <= 0) {
					removePaddleFromLayer(this, entity);
					entity.isStunned = false;
				}
			}
		}

		// Remove powerups that have expired
		for (const entityId of powerupsToRemove) {
			this.game.removeEntity(entityId);
		}

		// Handle bullet spawning
		if (this.isSpawningBullets) {
			this.bulletSpawnInterval -= delta.deltaTime;

			if (this.bulletSpawnInterval <= 0 && this.bulletQuantity) {
				this.triggerShootPaddle(this.bulletEvent);
				this.bulletSpawnInterval = 15;
				this.bulletQuantity--;
			}

			if (this.bulletQuantity <= 0) {
				this.isSpawningBullets = false;
			}
		}
	}

	

	setBarTimers(side: string, id: string) {
		console.log(id);
		if (id.includes('enlarge') || id.includes('magnetize') || id.includes('shrink') || id.includes('flat') || id.includes('slow') || id.includes('invert')) {
			this.UI.setBarTimer(side, 500);
		} else if (id.includes ('shield')) {
			this.UI.setBarTimer(side, 1000);
		}
	}

	changeBall(event: GameEvent) {
		switch (event.type) {
			case ('spawnCurveBall'):
				this.changeToCurveBall(event);
				break;
			case ('spawnMultiplyBall'):
				this.changeToMultiplyBall(event);
				break;
			case ('spawnBurstBall'):
				this.changeToBurstBall(event);
				break;
			case ('spawnSpinBall'):
				this.changeToSpinBall(event);
				break;
		}
	}

	triggerPowerup(event: GameEvent) {
		switch (event.type) {
			case ('enlargePowerup'):
				this.triggerEnlargePaddle(event);
				break;
			case ('shieldPowerup'):
				this.triggerShieldSpawn(event);
				break;
			case ('magnetizePowerup'):
					this.triggerMagnetizePaddle(event);
					break;
			case ('ShootPowerup'):
					this.bulletEvent = event;
					this.isSpawningBullets = true;
					this.bulletQuantity = 3;
					break;
		}
	}

	triggerPowerdown(event: GameEvent) {
		switch (event.type) {
			case ('shrinkPowerdown'):
				this.triggerShrinkPaddle(event);
				break;
			case ('invertPowerdown'):
				this.triggerInvertPaddle(event);
				break;
			case ('slowPowerdown'):
				this.triggerSlowPaddle(event);
				break;
			case ('flatPowerdown'):
				this.triggerFlatPaddle(event);
				break;
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

	triggerShieldSpawn(event: GameEvent) {
		if (event.entitiesMap) {
			let ball;

			for (const entity of event.entitiesMap.values()) {
				if (isBall(entity)) {
					ball = entity;
				}

				if (ball) {
					if (ball.lastHit === 'left') {
						PowerupSpawner.spawnShield(this.game, ball.lastHit)
						break ;
					} else if (ball.lastHit === 'right') {
						PowerupSpawner.spawnShield(this.game, ball.lastHit)
						break ;
					}
				}
			}
		}
	}

	triggerMagnetizePaddle(event: GameEvent) {
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
						powerupComp.magnetizePaddle(paddleL);
					} else if (ball.lastHit === 'right') {
						const paddleR = event.entitiesMap.get('paddleR') as Paddle;
						powerupComp.magnetizePaddle(paddleR);
					}
				}
			}
		}
	}

	triggerShootPaddle(event?: GameEvent) {
		if (!event) return;
		
		this.game.sounds.shoot.play();
		
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
						PowerupSpawner.spawnBullet(this.game, ball.lastHit, paddleL);
						break;
					} else if (ball.lastHit === 'right') {
						const paddleR = event.entitiesMap.get('paddleR') as Paddle;
						PowerupSpawner.spawnBullet(this.game, ball.lastHit, paddleR);
						break;
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

	triggerInvertPaddle(event: GameEvent) {
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
						powerupComp.invertPaddle(paddleL);
					} else if (ball.lastHit === 'right') {
						const paddleR = event.entitiesMap.get('paddleR') as Paddle;
						powerupComp.invertPaddle(paddleR);
					}
				}
			}
		}
	}

	triggerSlowPaddle(event: GameEvent) {
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
						powerupComp.slowPaddle(paddleL);
					} else if (ball.lastHit === 'right') {
						const paddleR = event.entitiesMap.get('paddleR') as Paddle;
						powerupComp.slowPaddle(paddleR);
					}
				}
			}
		}
	}

	triggerFlatPaddle(event: GameEvent) {
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
						powerupComp.flatPaddle(paddleL);
					} else if (ball.lastHit === 'right') {
						const paddleR = event.entitiesMap.get('paddleR') as Paddle;
						powerupComp.flatPaddle(paddleR);
					}
				}
			}
		}
	}

	changeToCurveBall(event: GameEvent) {
		if (event.entitiesMap) {
			for (const entity of event.entitiesMap.values()) {
				if (isBall(entity)) {
					const lastHit = entity.lastHit;
					const physics = entity.getComponent('physics') as PhysicsComponent;
	
					this.game.removeEntity(entity.id);
	
					BallSpawner.spawnCurveBallAt(this.game, physics, lastHit);
					break;
				}
			}
		}
	}

	changeToMultiplyBall(event: GameEvent) {
		if (event.entitiesMap) {
			for (const entity of event.entitiesMap.values()) {
				if (isBall(entity)) {
					const lastHit = entity.lastHit;
					const physics = entity.getComponent('physics') as PhysicsComponent;
	
					this.game.removeEntity(entity.id);
	
					BallSpawner.spawnMultiplyBallsAt(this.game, physics, lastHit);
					break;
				}
			}
		}
	}

	changeToBurstBall(event: GameEvent) {
		if (event.entitiesMap) {
			for (const entity of event.entitiesMap.values()) {
				if (isBall(entity)) {
					const lastHit = entity.lastHit;
					const physics = entity.getComponent('physics') as PhysicsComponent;
	
					this.game.removeEntity(entity.id);
	
					BallSpawner.spawnBurstBallAt(this.game, physics, lastHit);
					break;
				}
			}
		}
	}

	changeToSpinBall(event: GameEvent) {
		if (event.entitiesMap) {
			for (const entity of event.entitiesMap.values()) {
				if (isBall(entity)) {
					const lastHit = entity.lastHit;
					const physics = entity.getComponent('physics') as PhysicsComponent;
	
					this.game.removeEntity(entity.id);
	
					BallSpawner.spawnSpinBallAt(this.game, physics, lastHit);
					break;
				}
			}
		}
	}
}
