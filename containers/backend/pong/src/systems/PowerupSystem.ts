/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 15:57:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/24 17:13:28 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle';
import type { System } from '../engine/System'

import { PhysicsComponent } from '../components/PhysicsComponent';
import { PowerupComponent } from '../components/PowerupComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';
import { TextComponent } from '../components/TextComponent';

import { PowerupSpawner } from '../spawners/PowerupSpawner';
import { BallSpawner } from '../spawners/BallSpawner';

import { FrameData, GameEvent  } from '../utils/Types'
import { isPaddle, isBall, isPowerup, isShield } from '../utils/Guards'

export class PowerupSystem implements System {
	game: PongGame;
	width: number;
	height: number;
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
				this.triggerPowerup(event);
			} else if (event.type.endsWith("Powerdown")) {
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
					this.removePaddleFromLayer(entity)
					entity.resetPaddleSize(entity);
				} else if (entity.isInverted && entity.affectedTimer <= 0) {
					this.removePaddleFromLayer(entity)
					entity.inversion = 1;
					entity.isInverted = false;
				} else if (entity.isSlowed && entity.affectedTimer <= 0) {
					this.removePaddleFromLayer(entity)
					entity.slowness = 1;
					entity.isSlowed = false;
				} else if (entity.isFlat && entity.affectedTimer <= 0) {
					this.removePaddleFromLayer(entity)
					entity.isFlat = false;
				} else if (entity.isMagnetized && entity.affectedTimer <= 0) {
					this.removePaddleFromLayer(entity)
					entity.isMagnetized = false;
				} else if (entity.isStunned && entity.affectedTimer <= 0) {
					this.removePaddleFromLayer(entity)
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

	removePaddleFromLayer(paddle: Paddle) {
		const text = paddle.getComponent('text') as TextComponent;
		
		if (paddle.isFlat || paddle.isInverted || paddle.isShrinked || paddle.isSlowed || paddle.isStunned) {
			const powerdownLayer = this.game.renderLayers.powerdown;
			const targetChild = powerdownLayer.children.find(child => child.label === "paddle");

			if (targetChild) {
				this.game.renderLayers.foreground.addChild(targetChild);
			}

			const targetLeftName = powerdownLayer.children.find(child => child.label === ("playerName" + this.game.leftPlayer.name));
			const targetRightName = powerdownLayer.children.find(child => child.label === ("playerName" + this.game.rightPlayer.name));
			if (targetLeftName) {
				this.game.renderLayers.foreground.addChild(targetLeftName);
				const prefix = "playerName";
				const result = targetLeftName.label.slice(prefix.length);
				
				text.setText(result);
			} else if (targetRightName) {
				this.game.renderLayers.foreground.addChild(targetRightName);
				const prefix = "playerName";
				const result = targetRightName.label.slice(prefix.length);
				
				text.setText(result);
			}
		} else {
			const powerupLayer = this.game.renderLayers.powerup;
			const targetChild = powerupLayer.children.find(child => child.label === "paddle");

			if (targetChild) {
				this.game.renderLayers.foreground.addChild(targetChild);
			}

			const targetLeftName = powerupLayer.children.find(child => child.label === ("playerName" + this.game.leftPlayer.name));
			const targetRightName = powerupLayer.children.find(child => child.label === ("playerName" + this.game.rightPlayer.name));
			if (targetLeftName) {
				this.game.renderLayers.foreground.addChild(targetLeftName);
				const prefix = "playerName";
				const result = targetLeftName.label.slice(prefix.length);
				
				text.setText(result);
			} else if (targetRightName) {
				this.game.renderLayers.foreground.addChild(targetRightName);
				const prefix = "playerName";
				const result = targetRightName.label.slice(prefix.length);
				
				text.setText(result);
			}
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
			case ('MagnetizePowerup'):
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
