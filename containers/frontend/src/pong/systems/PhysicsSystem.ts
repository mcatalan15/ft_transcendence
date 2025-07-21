/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:55:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:29:32 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import { System } from '../engine/System';
import { PongGame } from '../engine/Game'

import { Paddle } from '../entities/Paddle'
import { Ball } from '../entities/balls/Ball'
import { UI } from '../entities/UI';
import { BurstBall } from '../entities/balls/BurstBall';
import { SpinBall } from '../entities/balls/SpinBall';
import { Shield } from '../entities/background/Shield';
import { Bullet } from '../entities/Bullet';
import { CrossCut } from '../entities/crossCuts/CrossCut';

import { PhysicsComponent } from '../components/PhysicsComponent';
import { RenderComponent } from '../components/RenderComponent';
import { VFXComponent } from '../components/VFXComponent';
import { InputComponent } from '../components/InputComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { ParticleSpawner } from '../spawners/ParticleSpawner'
import { BallSpawner } from '../spawners/BallSpawner'
import { PowerupSpawner } from '../spawners/PowerupSpawner';

import { createEntitiesMap, changePaddleLayer } from '../utils/Utils';
import * as physicsUtils from '../utils/PhysicsUtils'
import { isPaddle, isBall, isSpinBall, isBurstBall, isPowerup, isBullet, isUI } from '../utils/Guards';
import { FrameData, GAME_COLORS } from '../utils/Types';
import { TextComponent } from '../components/TextComponent';

export class PhysicsSystem implements System {
	game: PongGame;
	UI!: UI;
	width: number;
	height: number;
	maxBallXVelocity: number = 100;
	mustResetBall: boolean = false;
	ballResetTime: number = 0;
	private ballCollisionHistory: Map<string, Array<{ time: number, normal: { x: number, y: number } }>> = new Map();

	private serverState: any = null;
	lastServerUpdate: number = 0;

	constructor(game: PongGame, width: number, height: number) {
		this.game = game;
		this.width = width;
		this.height = height;
		for (const entity of game.entities) {
			if (isUI(entity)) {
				this.UI = entity;
			}
		}
	}

	update(entities: Entity[], delta: FrameData): void {
		if (this.game.isOnline && this.game.config.classicMode && this.game.config.variant !== 'tournament') {
			this.handlePureServerPhysics(entities, delta);
		} else {
			this.handlePureClientPhysics(entities, delta);
		}
	}

	private handlePureServerPhysics(entities: Entity[], delta: FrameData): void {
		if (this.game.hasEnded) {
			return;
		}
		
		if (this.serverState) {
			this.applyServerStateDirectly(entities, this.serverState);
		}
		
		this.handleLocalInputPrediction(entities);
	}

	private applyServerStateDirectly(entities: Entity[], serverState: any): void {
		const ballEntity = entities.find(e => e.id === 'defaultBall');
		if (ballEntity && serverState.ball) {
			this.updateBallFromServer(ballEntity, serverState.ball);
		}
		
		this.updatePaddlesFromServer(entities, serverState);
	}

	private updateBallFromServer(ballEntity: Entity, serverBall: any): void {
		const ballPhysics = ballEntity.getComponent('physics') as PhysicsComponent;
		const ballRender = ballEntity.getComponent('render') as RenderComponent;
		
		if (!ballPhysics || !ballRender) return;
		
		(ballPhysics as any).isServerControlled = true;

		const wasHidden = ballPhysics.x < 0 || ballPhysics.y < 0;
		const isNowVisible = serverBall.x > 0 && serverBall.y > 0;
		const isSpawning = wasHidden && isNowVisible;
		
		const distance = Math.sqrt(
			Math.pow(serverBall.x - ballPhysics.x, 2) + 
			Math.pow(serverBall.y - ballPhysics.y, 2)
		);
		const isTeleport = distance > 300;
		
		if (isSpawning || isTeleport || !(ballPhysics as any).hasServerTarget) {
			ballPhysics.x = serverBall.x;
			ballPhysics.y = serverBall.y;
			(ballPhysics as any).hasServerTarget = true;
		} else {
			const lerpFactor = 0.75;
			ballPhysics.x += (serverBall.x - ballPhysics.x) * lerpFactor;
			ballPhysics.y += (serverBall.y - ballPhysics.y) * lerpFactor;
		}
		
		ballRender.graphic.x = ballPhysics.x;
		ballRender.graphic.y = ballPhysics.y;
		
		const isOffScreen = serverBall.x < 0 || serverBall.y < 0;
		ballRender.graphic.alpha = isOffScreen ? 0 : 1;
		ballRender.graphic.visible = !isOffScreen;
		
		if (serverBall.ballVelocity || serverBall.velocityX !== undefined) {
			ballPhysics.velocityX = serverBall.ballVelocity?.x || serverBall.velocityX || 0;
			ballPhysics.velocityY = serverBall.ballVelocity?.y || serverBall.velocityY || 0;
		}
	}

	private updatePaddlesFromServer(entities: Entity[], serverState: any): void {
		const leftPaddle = entities.find(e => e.id === 'paddleL');
		const rightPaddle = entities.find(e => e.id === 'paddleR');
		
		const isHost = this.game.networkManager?.isHost;
		const localPaddleId = isHost ? 'paddleL' : 'paddleR';
		
		if (leftPaddle && serverState.paddle1) {
			this.updatePaddleFromServer(leftPaddle, serverState.paddle1, localPaddleId === 'paddleL');
		}
		
		if (rightPaddle && serverState.paddle2) {
			this.updatePaddleFromServer(rightPaddle, serverState.paddle2, localPaddleId === 'paddleR');
		}
	}

	private updatePaddleFromServer(paddle: Entity, serverPaddle: any, isLocalPaddle: boolean): void {
		const physics = paddle.getComponent('physics') as PhysicsComponent;
		const render = paddle.getComponent('render') as RenderComponent;
		
		if (!physics || !render) return;
		
		(physics as any).isServerControlled = true;
		
		if (isLocalPaddle) {
			const tolerance = 15;
			if (Math.abs(physics.y - serverPaddle.y) > tolerance) {
				physics.y = serverPaddle.y;
			}
		} else {
			const lerpFactor = 0.6;
			physics.y += (serverPaddle.y - physics.y) * lerpFactor;
		}
		
		render.graphic.y = physics.y;

		if ((paddle.id === 'paddleL' || paddle.id === 'paddleR') && paddle.hasComponent('text')) {
			const textComponent = paddle.getComponent('text') as TextComponent;
			const textObject = textComponent.getRenderable();
			
			if (paddle.id === 'paddleL') {
				textObject.x = physics.x - 25;
				textObject.y = physics.y;
			} else {
				textObject.x = physics.x + 25;
				textObject.y = physics.y;
			}
		}
		
		(physics as any).lastServerUpdate = Date.now();
	}

	public updateFromServer(serverState: any): void {
		if (this.game.hasEnded) {
			return;
		}
		
		this.serverState = serverState;
		this.lastServerUpdate = Date.now();
	}

	private handleLocalInputPrediction(entities: Entity[]): void {
		const isHost = this.game.networkManager?.isHost;
		const localPaddleId = isHost ? 'paddleL' : 'paddleR';
		const localPaddle = entities.find(e => e.id === localPaddleId);
		
		if (localPaddle && localPaddle instanceof Paddle) {
			const input = localPaddle.getComponent('input') as InputComponent;
			const physics = localPaddle.getComponent('physics') as PhysicsComponent;
			
			if (input && physics) {
				const timeSinceServerUpdate = Date.now() - ((physics as any).lastServerUpdate || 0);
				const shouldPredict = timeSinceServerUpdate > 50;
				
				if (shouldPredict) {
					this.applyInputToPaddle(input, physics, localPaddle);
					
					const entitiesMap = createEntitiesMap(entities);
					this.constrainPaddleToWalls(physics, entitiesMap);
					
					(physics as any).isPredicted = true;
				}
			}
		}
	}

	private handlePureClientPhysics(entities: Entity[], delta: FrameData): void {
		const entitiesMap = createEntitiesMap(entities);
		
		if ((!this.game.isOnline || !this.game.config.classicMode)) {
			for (const entity of entities) {
				if (entity.hasComponent('physics')) {
					if (entity instanceof Paddle) {
						this.updatePaddle(entity as Paddle, entitiesMap);
					} else if (entity instanceof Ball) {
						this.updateBall(entity as Ball, entities, entitiesMap, delta);
					} else if (entity instanceof Bullet) {
						this.updateBullet(entity as Bullet, entitiesMap);
					}
				}
			}
		}
	}

	updatePaddle(paddle: Paddle, entitiesMap: Map<string, Entity>) {
		const input = paddle.getComponent('input') as InputComponent;
		const physics = paddle.getComponent('physics') as PhysicsComponent;
	
		if (!input || !physics) return;
	
		this.applyInputToPaddle(input, physics, paddle);
		this.constrainPaddleToWalls(physics, entitiesMap);
	}

	applyInputToPaddle(input: InputComponent, physics: PhysicsComponent, paddle: Paddle) {
		const speed = paddle.isStunned ? 0 : physics.speed || 5;
	
	
		if (input.upPressed) {
			physics.velocityY = -speed * paddle.inversion * paddle.slowness;
		} else if (input.downPressed) {
			physics.velocityY = speed * paddle.inversion * paddle.slowness;
		} else {
			physics.velocityY = 0;
		}
	
		const oldY = physics.y;
		physics.y += physics.velocityY;
	}

	constrainPaddleToWalls(physics: PhysicsComponent, entitiesMap: Map<string, Entity>) {
		const wallT = entitiesMap.get('wallT');
		if (wallT) {
			const wallPhysics = wallT.getComponent('physics') as PhysicsComponent;
			const wallBottom = wallPhysics.y + (wallPhysics.height / 2)
			const paddleTop = physics.y - (physics.height / 2);

			if (paddleTop < wallBottom) {
				physics.y = wallBottom + (physics.height / 2);
				physics.velocityY = 0;
			}
		}

		const wallB = entitiesMap.get('wallB')
		if (wallB) {
			const wallPhysics = wallB.getComponent('physics') as PhysicsComponent;
			const wallTop = wallPhysics.y - (wallPhysics.height / 2);
			const paddleBottom = physics.y + (physics.height / 2);

			if (paddleBottom > wallTop) {
				physics.y = wallTop - (physics.height / 2);
				physics.velocityY = 0;
			}
		}
	}

	updateBall(ball: Ball, entities: Entity[], entitiesMap: Map<string, Entity>, delta: FrameData) {
		const physics = ball.getComponent('physics') as PhysicsComponent;
		const vfx = ball.getComponent('vfx') as VFXComponent;
	
		if (!physics || !vfx) return;
	
		ball.applyMagneticForce(this.game, physics, entitiesMap);
		if (physics.velocityX > 0) {
			ball.magneticInfluence = 'right';
		} else {
			ball.magneticInfluence = 'left';
		}
	
		if (!isBurstBall(ball) && !this.game.config.classicMode) {
			if (Math.abs(physics.velocityX) > 10) {
				physics.velocityX = physics.velocityX > 0 ? 10 : -10;
			}
			if (Math.abs(physics.velocityY) > 10) {
				physics.velocityY = physics.velocityY > 0 ? 10 : -10;
			}
		} else if (this.game.config.classicMode) {
			if (Math.abs(physics.velocityX) > 20) {
				physics.velocityX = physics.velocityX > 0 ? 20 : -20;
			}
		} else if (isBurstBall(ball)) {
			if (Math.abs(physics.velocityX) > 17) {
				physics.velocityX = physics.velocityX > 0 ? 17 : -17;
			}
			if (Math.abs(physics.velocityY) > 17) {
				physics.velocityY = physics.velocityY > 0 ? 17 : -17;
			}
		}
	
		if (this.game.config.classicMode && Math.abs(physics.velocityX) < this.maxBallXVelocity) {
			this.rampBallSpeed(physics, delta);
		}
	
		ball.moveBall(physics);
	
		this.handleBallWallCollisions(physics, entitiesMap, ball);
		this.handleBallCutCollisions(physics, entitiesMap, ball);
		this.handleBallShieldCollisions(physics, entitiesMap, ball);
		this.handleBallPaddleCollisions(physics, entitiesMap, ball);
		this.handlePowerupCollisions(entities, entitiesMap, ball);
	
		this.checkBallOutOfBounds(physics, ball);
	}

	rampBallSpeed(physics: PhysicsComponent, delta: FrameData) {
		if (physics.velocityX > 0) {
			physics.velocityX += 0.005 * delta.deltaTime;
		} else if (physics.velocityX < 0) {
			physics.velocityX -= 0.005 * delta.deltaTime;
		}
	}

	handleBallWallCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		let collided = false;

		const wallT = entitiesMap.get('wallT');
		if (wallT) {
			const wallPhysics = wallT.getComponent('physics') as PhysicsComponent;
			const wallBottom = wallPhysics.y + (wallPhysics.height / 2);
			const ballTop = physics.y - (physics.height / 2);

			if (ballTop < wallBottom) {
				physics.y = wallBottom + (physics.height / 2);
				physics.velocityY *= -1;
				collided = true;
			}
		}

		const wallB = entitiesMap.get('wallB');
		if (wallB) {
			const wallPhysics = wallB.getComponent('physics') as PhysicsComponent;
			const wallTop = wallPhysics.y - (wallPhysics.height / 2);
			const ballBottom = physics.y + (physics.height / 2);

			if (ballBottom > wallTop) {
				physics.y = wallTop - (physics.height / 2);
				physics.velocityY *= -1;
				collided = true;
			}
		}

		if (collided) {
			if (!this.game.config.classicMode) {
				ParticleSpawner.spawnBasicExplosion(this.game, physics.x - physics.width / 4, physics.y, GAME_COLORS.particleGray, 0.5);
			}

			if (!this.game.config.classicMode) {
				this.game.sounds.thud.rate(Math.random() * 0.2 + 1.1);
				this.game.sounds.thud.play();
			}
		}

		if (isSpinBall(ball) && collided) {
			(ball as SpinBall).applySpinToBounce(physics);
		}
	}

	handleBallCutCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		const ballRadius = physics.width / 2;
		const ballCenter = { x: physics.x, y: physics.y };
		let collided = false;
		let collisionNormal = { x: 0, y: 0 };

		const prevPos = { x: physics.x - physics.velocityX, y: physics.y - physics.velocityY };

		for (const entity of entitiesMap.values()) {
			if (entity instanceof CrossCut) {
				const cutPhysics = entity.getComponent('physics') as PhysicsComponent;

				if (!cutPhysics || !cutPhysics.isPolygonal || !cutPhysics.physicsPoints) {
					continue;
				}

				const cutOffsetX = cutPhysics.x;
				const cutOffsetY = cutPhysics.y;

				for (let i = 0; i < cutPhysics.nPolygons!; i++) {
					const polygon = cutPhysics.physicsPoints[i];

					if (!polygon || polygon.length < 3) {
						continue;
					}

					const isInside = physicsUtils.pointInPolygon(ballCenter.x, ballCenter.y, polygon, cutOffsetX, cutOffsetY);

					if (isInside) {
						let minDist = Infinity;
						let closestEdgeNormal = { x: 0, y: 0 };
						let closestPoint = { x: 0, y: 0 };

						for (let j = 0; j < polygon.length; j++) {
							const pointA = {
								x: polygon[j].x + cutOffsetX,
								y: polygon[j].y + cutOffsetY
							};
							const pointB = {
								x: polygon[(j + 1) % polygon.length].x + cutOffsetX,
								y: polygon[(j + 1) % polygon.length].y + cutOffsetY
							};

							const edgeVector = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
							const edgeLength = Math.sqrt(edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y);

							if (edgeLength === 0) continue;

							const edgeDir = { x: edgeVector.x / edgeLength, y: edgeVector.y / edgeLength };
							const ballToA = { x: ballCenter.x - pointA.x, y: ballCenter.y - pointA.y };
							const projectionLength = ballToA.x * edgeDir.x + ballToA.y * edgeDir.y;
							const closest = {
								x: pointA.x + edgeDir.x * Math.max(0, Math.min(edgeLength, projectionLength)),
								y: pointA.y + edgeDir.y * Math.max(0, Math.min(edgeLength, projectionLength))
							};

							const dx = ballCenter.x - closest.x;
							const dy = ballCenter.y - closest.y;
							const distance = Math.sqrt(dx * dx + dy * dy);

							if (distance < minDist) {
								minDist = distance;
								closestPoint = closest;

								const nx = -edgeVector.y / edgeLength;
								const ny = edgeVector.x / edgeLength;

								const centerToEdge = { x: closest.x - ballCenter.x, y: closest.y - ballCenter.y };
								const dot = nx * centerToEdge.x + ny * centerToEdge.y;
								closestEdgeNormal = dot > 0 ? { x: nx, y: ny } : { x: -nx, y: -ny };
							}
						}

						const pushOutDistance = ballRadius + 2.0;
						physics.x = closestPoint.x + closestEdgeNormal.x * pushOutDistance;
						physics.y = closestPoint.y + closestEdgeNormal.y * pushOutDistance;

						const dotVelocity = physics.velocityX * closestEdgeNormal.x + physics.velocityY * closestEdgeNormal.y;
						physics.velocityX -= 2 * dotVelocity * closestEdgeNormal.x;
						physics.velocityY -= 2 * dotVelocity * closestEdgeNormal.y;

						collided = true;
						collisionNormal = closestEdgeNormal;
						break;
					}

					for (let j = 0; j < polygon.length; j++) {
						const pointA = {
							x: polygon[j].x + cutOffsetX,
							y: polygon[j].y + cutOffsetY
						};
						const pointB = {
							x: polygon[(j + 1) % polygon.length].x + cutOffsetX,
							y: polygon[(j + 1) % polygon.length].y + cutOffsetY
						};

						const collision = physicsUtils.circleIntersectsSegment(ballCenter, ballRadius, pointA, pointB);
						if (collision.intersects && collision.normal) {
							const pushOutDistance = ballRadius + 1.5;
							physics.x = collision.point!.x + collision.normal.x * pushOutDistance;
							physics.y = collision.point!.y + collision.normal.y * pushOutDistance;

							const dotVelocity = physics.velocityX * collision.normal.x + physics.velocityY * collision.normal.y;
							physics.velocityX -= 2 * dotVelocity * collision.normal.x;
							physics.velocityY -= 2 * dotVelocity * collision.normal.y;

							collided = true;
							collisionNormal = collision.normal;
							break;
						}
					}

					if (!collided) {
						for (let j = 0; j < polygon.length; j++) {
							const vertex = {
								x: polygon[j].x + cutOffsetX,
								y: polygon[j].y + cutOffsetY
							};

							const dx = ballCenter.x - vertex.x;
							const dy = ballCenter.y - vertex.y;
							const distanceSq = dx * dx + dy * dy;

							if (distanceSq <= ballRadius * ballRadius) {
								const distance = Math.sqrt(distanceSq);
								const nx = distance > 0 ? dx / distance : 0;
								const ny = distance > 0 ? dy / distance : 0;

								const pushOutDistance = ballRadius + 1.5;
								physics.x = vertex.x + nx * pushOutDistance;
								physics.y = vertex.y + ny * pushOutDistance;

								const dotVelocity = physics.velocityX * nx + physics.velocityY * ny;
								physics.velocityX -= 2 * dotVelocity * nx;
								physics.velocityY -= 2 * dotVelocity * ny;

								collided = true;
								collisionNormal = { x: nx, y: ny };
								break;
							}
						}
					}

					if (collided) break;
				}

				if (collided) break;
			}
		}

		if (collided) {
			const prevVelocity = { x: physics.velocityX, y: physics.velocityY };

			this.game.sounds.thud.rate(Math.random() * 0.2 + 1.1);
			if (!this.game.config.classicMode) {
				this.game.sounds.thud.play();
			}

			if (!this.game.config.classicMode) {
				ParticleSpawner.spawnBasicExplosion(this.game, physics.x - physics.width / 4, physics.y, GAME_COLORS.particleGray, 0.5);
			}

			const speed = Math.hypot(physics.velocityX, physics.velocityY);
			const distanceFromPrev = Math.hypot(physics.x - prevPos.x, physics.y - prevPos.y);

			const oscillationCheck = physicsUtils.detectOscillation(prevVelocity, { x: physics.velocityX, y: physics.velocityY });
			const historyOscillation = this.trackCollision(ball.id, collisionNormal);

			if (oscillationCheck.isOscillating || historyOscillation) {
				physicsUtils.breakOscillation(physics, collisionNormal, ball);
			}

			if (speed < 3 || distanceFromPrev < 1) {
				const boostMagnitude = Math.max(5, speed * 1.5);
				const normalizedVelX = physics.velocityX / speed || collisionNormal.x;
				const normalizedVelY = physics.velocityY / speed || collisionNormal.y;

				physics.velocityX = normalizedVelX * boostMagnitude;
				physics.velocityY = normalizedVelY * boostMagnitude;
			}

			const maxSpeed = 15;
			const currentSpeed = Math.hypot(physics.velocityX, physics.velocityY);
			if (currentSpeed > maxSpeed) {
				const scale = maxSpeed / currentSpeed;
				physics.velocityX *= scale;
				physics.velocityY *= scale;
			}

			physicsUtils.enforceMinimumHorizontalComponent(this, physics, currentSpeed, 0.5);

			if (isSpinBall(ball)) {
				(ball as SpinBall).applySpinToBounce(physics);
			}
		}
	}

	handleBallShieldCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		let collided = false;

		const shield = entitiesMap.get('shield') as Shield;
		if (shield) {
			const shieldPhysics = shield.getComponent('physics') as PhysicsComponent;
			if (shield.side === 'left') {
				const ballLeft = physics.x - (physics.width / 2);
				const shieldRight = shieldPhysics.x + shieldPhysics.width / 2;
				if (ballLeft < shieldRight) {
					physics.velocityX *= -1;

					if (!this.game.config.classicMode) {
						this.game.sounds.shieldBreak.rate(Math.random() * 0.2 + 1.1);
						this.game.sounds.shieldBreak.play();
					}

					if (!this.game.config.classicMode) {
						ParticleSpawner.spawnBurst(
							this.game,
							shieldPhysics.x,
							physics.y,
							10,
							-physics.velocityX,
							physics.velocityY,
							GAME_COLORS.green,
						)
					}

					this.UI.resetBars('left');

					PowerupSpawner.despawnShield(this.game, shield.id);
				}
			} else if (shield.side === 'right') {
				const ballRight = physics.x + (physics.width / 2);
				const shieldLeft = shieldPhysics.x - shieldPhysics.width / 2;
				if (ballRight > shieldLeft) {
					physics.velocityX *= -1;

					if (!this.game.config.classicMode) {
						this.game.sounds.shieldBreak.rate(Math.random() * 0.2 + 1.1);
						this.game.sounds.shieldBreak.play();
					}

					if (!this.game.config.classicMode) {
						ParticleSpawner.spawnBurst(
							this.game,
							shieldPhysics.x,
							physics.y,
							10,
							-physics.velocityX,
							physics.velocityY,
							GAME_COLORS.green,
						);
					}

					this.UI.resetBars('right');

					PowerupSpawner.despawnShield(this.game, shield.id);
				}
			}
		}

		if (isSpinBall(ball) && collided) {
			(ball as SpinBall).applySpinToBounce(physics);
		}
	}

	handleBallPaddleCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		const MAX_BOUNCE_ANGLE = Math.PI / 4;
		const PADDLE_INFLUENCE = 0.5;
		const MIN_HORIZONTAL_COMPONENT = 0.7;

		if (ball.isGoodBall) {
			const ballBox = {
				x: physics.x,
				y: physics.y,
				width: physics.width,
				height: physics.height,
				vx: physics.velocityX,
				vy: physics.velocityY
			};

			const paddles = [entitiesMap.get("paddleL"), entitiesMap.get("paddleR")];

			for (const paddle of paddles) {
				if (!paddle) continue;

				const paddlePhysics = paddle.getComponent("physics") as PhysicsComponent;
				const paddleSide = paddle.id === "paddleL" ? "left" : "right";

				const paddleBox = {
					x: paddlePhysics.x,
					y: paddlePhysics.y,
					width: paddlePhysics.width,
					height: paddlePhysics.height,
					vy: paddlePhysics.velocityY
				};

				const collision = physicsUtils.sweptAABB(
					ballBox.x, ballBox.y, ballBox.width, ballBox.height, ballBox.vx, ballBox.vy,
					paddleBox.x, paddleBox.y, paddleBox.width, paddleBox.height, paddleBox.vy
				);

				if (collision.hit && collision.time >= 0 && collision.time <= 1) {
					if (!this.game.config.classicMode) {
						this.game.sounds.pong.rate(Math.random() * 0.2 + 1.1);
						this.game.sounds.pong.play();
					}

					physics.x = collision.position.x;
					physics.y = collision.position.y;

					const speed = Math.hypot(physics.velocityX, physics.velocityY);

					if (collision.normal.x !== 0) {
						physics.velocityX = -physics.velocityX;

						const relativeHit = (physics.y - paddlePhysics.y) / (paddlePhysics.height / 2);
						const clamped = Math.max(-0.8, Math.min(0.8, relativeHit));
						const bounceAngle = clamped * MAX_BOUNCE_ANGLE;

						if (paddleSide === "left") {
							physics.velocityX = Math.abs(physics.velocityX);
							physics.velocityX = Math.cos(bounceAngle) * speed;
						} else {
							physics.velocityX = -Math.abs(physics.velocityX);
							physics.velocityX = -Math.cos(bounceAngle) * speed;
						}

						physics.velocityY = Math.sin(bounceAngle) * speed;

						if (paddleBox.vy !== 0) {
							const paddleInfluence = Math.min(Math.abs(paddleBox.vy), 5) * Math.sign(paddleBox.vy);
							physics.velocityY += paddleInfluence * PADDLE_INFLUENCE;
						}

					} else if (collision.normal.y !== 0) {
						physics.velocityY = -physics.velocityY;

						if (paddleSide === "left") {
							physics.velocityX = Math.max(physics.velocityX, MIN_HORIZONTAL_COMPONENT * speed);
						} else {
							physics.velocityX = Math.min(physics.velocityX, -MIN_HORIZONTAL_COMPONENT * speed);
						}

						const newSpeed = Math.hypot(physics.velocityX, physics.velocityY);
						physics.velocityX = (physics.velocityX / newSpeed) * speed;
						physics.velocityY = (physics.velocityY / newSpeed) * speed;
					}

					physicsUtils.enforceMinimumHorizontalComponent(this, physics, speed, MIN_HORIZONTAL_COMPONENT);

					if (isSpinBall(ball)) {
						(ball as SpinBall).applySpinToBounce(physics);
						if (paddleSide === 'left') {
							ball.rotationDir = 1;
						} else if (paddleSide === 'right') {
							ball.rotationDir = -1;
						}
					}

					ball.lastHit = paddleSide;

					if (paddleSide === 'left') {
						this.game.data.leftPlayer.hits++;
					} else if (paddleSide === 'right') {
						this.game.data.rightPlayer.hits++;
					}

					if (ball instanceof BurstBall) {
						ball.resetWindup();
					}

					if (paddleSide === "left") {
						if (!this.game.config.classicMode) {
							ParticleSpawner.spawnBasicExplosion(this.game, physics.x - physics.width / 4, physics.y, GAME_COLORS.greenParticle, 1);
						}

						if (ball.hasComponent('vfx')) {
							const vfx = ball.getComponent('vfx') as VFXComponent;
							vfx.startFlash(GAME_COLORS.greenParticle, 10);
						}

					} else {
						if (!this.game.config.classicMode) {
							ParticleSpawner.spawnBasicExplosion(this.game, physics.x + physics.width / 4, physics.y, GAME_COLORS.violetParticle, 1);
						}

						if (ball.hasComponent('vfx')) {
							const vfx = ball.getComponent('vfx') as VFXComponent;
							vfx.startFlash(GAME_COLORS.violetParticle, 10);
						}
					}

					if ((paddle as Paddle).isFlat) {
						physics.velocityY = 0;
						physics.velocityX *= 1.2;
					}
				}
			}
		}
	}

	handlePowerupCollisions(entities: Entity[], entitiesMap: Map<string, Entity>, ball: Ball) {
		const ballBox = physicsUtils.getBoundingBox(ball.getComponent('physics') as PhysicsComponent);
		const ballPhysics = ball.getComponent('physics') as PhysicsComponent;

		for (const entity of entities) {
			if (isPowerup(entity)) {
				const powerupBox = physicsUtils.getBoundingBox(entity.getComponent('physics') as PhysicsComponent);
				if (ball.lastHit && physicsUtils.isAABBOverlap(ballBox, powerupBox)) {
					if (entity.id.includes('Down')) {
						if (!this.game.config.classicMode) {
							ParticleSpawner.spawnBasicExplosion(this.game, ballPhysics.x + ballPhysics.width / 4, ballPhysics.y, GAME_COLORS.red, 1);
						}
					} else if (entity.id.includes('Up')) {
						if (!this.game.config.classicMode) {
							ParticleSpawner.spawnBasicExplosion(this.game, ballPhysics.x + ballPhysics.width / 4, ballPhysics.y, GAME_COLORS.green, 1);
						}
					}

					const lifetime = entity.getComponent('lifetime') as LifetimeComponent;

					if (ball.lastHit === 'left') {
						if (entity.id.includes('Up')) {
							this.game.data.leftPlayer.powerupsPicked++;
						} else if (entity.id.includes('Down')) {
							this.game.data.leftPlayer.powerdownsPicked++;
						} else if (entity.id.includes('ballChange')) {
							this.game.data.leftPlayer.ballchangesPicked++;
						}
					} else if (ball.lastHit === 'right') {
						if (entity.id.includes('Up')) {
							this.game.data.rightPlayer.powerupsPicked++;
						} else if (entity.id.includes('Down')) {
							this.game.data.rightPlayer.powerdownsPicked++;
						} else if (entity.id.includes('ballChange')) {
							this.game.data.rightPlayer.ballchangesPicked++;
						}
					}

					entity.sendPowerupEvent(entitiesMap, ball.lastHit);
					lifetime.remaining = 0;
					if (!entity.id.includes('shield') && !entity.id.includes('shoot')) {
						changePaddleLayer(this.game, ball.lastHit, entity.id);
					}
				}
			}
		}
	}


	checkBallOutOfBounds(physics: PhysicsComponent, ball: Ball) {
		if (this.game.isOnline && this.game.config.classicMode) {
			return;
		}

		const ballLeft = physics.x - (physics.width / 2) + 10;
		const ballRight = physics.x + (physics.width / 2) - 10;

		if (ballLeft > this.width) {
			if (ball.isGoodBall) {
				if (!this.game.config.classicMode) {
					this.game.sounds.death.play();
				}

				if (!this.game.config.classicMode) {
					ParticleSpawner.spawnBurst(
						this.game,
						this.game.config.filters ? physics.x - physics.width : physics.x,
						physics.y,
						10,
						physics.velocityX,
						physics.velocityY,
						GAME_COLORS.orange,
					);
				}

				this.game.eventQueue.push({ type: 'SCORE', side: 'left' });
				this.game.removeEntity(ball.id);

				this.mustResetBall = true;
				this.ballResetTime = 200;

				this.game.data.leftPlayer.score++;
				this.game.data.leftPlayer.goalsInFavor++;
				this.game.data.rightPlayer.goalsAgainst++;

				setTimeout(() => {
					BallSpawner.spawnDefaultBall(this.game);
				}, 2000);
			} else if (ball.isFakeBall) {
				ball.despawnBall(this.game, ball.id);
			}
		}

		if (ballRight < 0) {
			if (ball.isGoodBall) {
				if (!this.game.config.classicMode) {
					this.game.sounds.death.play();
				}

				if (!this.game.config.classicMode) {
					ParticleSpawner.spawnBurst(
						this.game,
						this.game.config.filters ? physics.x + physics.width : physics.x,
						physics.y,
						10,
						physics.velocityX,
						physics.velocityY,
						GAME_COLORS.orange,
					);
				}

				this.game.eventQueue.push({ type: 'SCORE', side: 'right' });
				this.game.removeEntity(ball.id);
				this.mustResetBall = true;
				this.ballResetTime = 200;

				this.game.data.rightPlayer.score++;
				this.game.data.rightPlayer.goalsInFavor++;
				this.game.data.leftPlayer.goalsAgainst++;

				setTimeout(() => {
					BallSpawner.spawnDefaultBall(this.game);
				}, 2000);
			} else if (ball.isFakeBall) {
				ball.despawnBall(this.game, ball.id);
			}
		}
	}

	updateBullet(bullet: Bullet, entitiesMap: Map<string, Entity>) {
		const physics = bullet.getComponent('physics') as PhysicsComponent;

		if (!physics) return;

		bullet.moveBullet(physics);

		this.handleBulletCollisions(bullet, entitiesMap);

		this.handleBulletCutCollisions(bullet, entitiesMap);

		this.checkBulletOutOfBounds(bullet);
	}

	handleBulletCollisions(bullet: Bullet, entitiesMap: Map<string, Entity>) {
		const bulletPhysics = bullet.getComponent('physics') as PhysicsComponent;
		const bulletBox = physicsUtils.getBoundingBox(bulletPhysics);

		let paddleL;
		let paddleR;

		for (const entity of entitiesMap.values()) {
			if (entity.id === 'paddleL') {
				paddleL = entity as Paddle;
			} else if (entity.id === 'paddleR') {
				paddleR = entity as Paddle;
			}
		}

		if (!paddleL || !paddleR) return;

		const paddleLPhysics = paddleL.getComponent('physics') as PhysicsComponent;
		const paddleRPhysics = paddleR.getComponent('physics') as PhysicsComponent;

		const paddleLBox = physicsUtils.getBoundingBox(paddleLPhysics);
		const paddleRBox = physicsUtils.getBoundingBox(paddleRPhysics);


		if (bullet.direction === 'right') {
			if (physicsUtils.isAABBOverlap(bulletBox, paddleRBox)) {
				paddleR.isStunned = true;
				paddleR.affectedTimer = 100;
				this.UI.setBarTimer('right', 100);
				PowerupSpawner.despawnBullet(this.game, bullet.id);

				if (!this.game.config.classicMode) {
					ParticleSpawner.spawnBurst(
						this.game,
						bulletPhysics.x - bulletPhysics.width,
						bulletPhysics.y,
						10,
						bulletPhysics.velocityX,
						bulletPhysics.velocityY,
						GAME_COLORS.rose,
					);
				}

				changePaddleLayer(this.game, 'right', 'powerDown');

				if (!this.game.config.classicMode) {
					this.game.sounds.hit.rate(Math.random() * 0.2 + 1.1);
					this.game.sounds.hit.play();
				}
			}
		} else if (bullet.direction === 'left') {
			if (physicsUtils.isAABBOverlap(bulletBox, paddleLBox)) {
				paddleL.isStunned = true;
				paddleL.affectedTimer = 100;
				this.UI.setBarTimer('left', 100);
				PowerupSpawner.despawnBullet(this.game, bullet.id);

				if (!this.game.config.classicMode) {
					ParticleSpawner.spawnBurst(
						this.game,
						bulletPhysics.x + bulletPhysics.width,
						bulletPhysics.y,
						10,
						-bulletPhysics.velocityX,
						bulletPhysics.velocityY,
						GAME_COLORS.rose,
					);
				}
				changePaddleLayer(this.game, 'left', 'powerDown');

				if (!this.game.config.classicMode) {
					this.game.sounds.hit.rate(Math.random() * 0.2 + 1.1);
					this.game.sounds.hit.play();
				}
			}
		}
	}

	handleBulletCutCollisions(bullet: Bullet, entitiesMap: Map<string, Entity>): void {
		const bulletPhysics = bullet.getComponent('physics') as PhysicsComponent;
		const bulletWidth = bulletPhysics.width / 2;
		const bulletHeight = bulletPhysics.height / 2;

		const bulletBox = {
			left: bulletPhysics.x - bulletWidth,
			right: bulletPhysics.x + bulletWidth,
			top: bulletPhysics.y - bulletHeight,
			bottom: bulletPhysics.y + bulletHeight
		};

		for (const entity of entitiesMap.values()) {
			if (entity instanceof CrossCut) {
				const cutPhysics = entity.getComponent('physics') as PhysicsComponent;

				if (!cutPhysics || !cutPhysics.isPolygonal || !cutPhysics.physicsPoints) {
					continue;
				}

				const cutOffsetX = cutPhysics.x;
				const cutOffsetY = cutPhysics.y;

				for (let i = 0; i < cutPhysics.nPolygons!; i++) {
					const polygon = cutPhysics.physicsPoints[i];

					if (!polygon || polygon.length < 3) {
						continue;
					}

					let collided = false;

					for (let j = 0; j < polygon.length; j++) {
						const pointA = {
							x: polygon[j].x + cutOffsetX,
							y: polygon[j].y + cutOffsetY
						};
						const pointB = {
							x: polygon[(j + 1) % polygon.length].x + cutOffsetX,
							y: polygon[(j + 1) % polygon.length].y + cutOffsetY
						};

						const bulletEdges = [
							{ x1: bulletBox.left, y1: bulletBox.top, x2: bulletBox.right, y2: bulletBox.top },
							{ x1: bulletBox.right, y1: bulletBox.top, x2: bulletBox.right, y2: bulletBox.bottom },
							{ x1: bulletBox.right, y1: bulletBox.bottom, x2: bulletBox.left, y2: bulletBox.bottom },
							{ x1: bulletBox.left, y1: bulletBox.bottom, x2: bulletBox.left, y2: bulletBox.top }
						];

						for (const edge of bulletEdges) {
							if (physicsUtils.lineSegmentsIntersect(
								edge.x1, edge.y1, edge.x2, edge.y2,
								pointA.x, pointA.y, pointB.x, pointB.y
							)) {
								collided = true;
								break;
							}
						}

						if (collided) break;
					}

					if (collided) {
						if (!this.game.config.classicMode) {
							ParticleSpawner.spawnBasicExplosion(this.game, bulletPhysics.x + bulletPhysics.width / 4, bulletPhysics.y, GAME_COLORS.rose, 1);
						}

						if (!this.game.config.classicMode) {
							this.game.sounds.hit.rate(Math.random() * 0.2 + 1.1);
							this.game.sounds.hit.play();
						}

						PowerupSpawner.despawnBullet(this.game, bullet.id);
						return;
					}
				}
			}
		}
	}

	checkBulletOutOfBounds(bullet: Bullet) {
		const bulletPhysics = bullet.getComponent('physics') as PhysicsComponent;

		const bulletLeft = bulletPhysics.x + bulletPhysics.width / 2;
		const bulletRight = bulletPhysics.x - bulletPhysics.width / 2;

		if (bulletLeft < 0 || bulletRight > this.game.width) {
			PowerupSpawner.despawnBullet(this.game, bullet.id);
		}
	}

	private trackCollision(ballId: string, normal: { x: number, y: number }) {
		if (!this.ballCollisionHistory.has(ballId)) {
			this.ballCollisionHistory.set(ballId, []);
		}

		const history = this.ballCollisionHistory.get(ballId)!;
		const now = Date.now();

		while (history.length > 0 && now - history[0].time > 2000) {
			history.shift();
		}

		history.push({ time: now, normal });

		if (history.length >= 4) {
			const recent = history.slice(-4);
			const isOscillating = this.isRapidOscillation(recent);

			if (isOscillating) {
				return true;
			}
		}

		return false;
	}

	private isRapidOscillation(collisions: Array<{ time: number, normal: { x: number, y: number } }>): boolean {
		const timeSpan = collisions[collisions.length - 1].time - collisions[0].time;
		const isRapid = timeSpan < 1000;

		let oppositeCount = 0;
		for (let i = 1; i < collisions.length; i++) {
			const prev = collisions[i - 1].normal;
			const curr = collisions[i].normal;
			const dot = prev.x * curr.x + prev.y * curr.y;

			if (dot < -0.5) {
				oppositeCount++;
			}
		}

		return isRapid && oppositeCount >= 2;
	}

	cleanup(): void {
		this.ballCollisionHistory.clear();
		
		this.mustResetBall = false;
		this.ballResetTime = 0;
		
		for (const entity of this.game.entities) {
			if (entity.hasComponent('physics')) {
				const physics = entity.getComponent('physics') as PhysicsComponent;
				if (physics) {
					physics.velocityX = 0;
					physics.velocityY = 0;
					
					(physics as any).isServerControlled = false;
				}
			}
		}
	}
}