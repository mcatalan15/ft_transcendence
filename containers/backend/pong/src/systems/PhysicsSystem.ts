/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:55:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/23 18:55:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import { System } from '../engine/System';
import { PongGame } from '../engine/Game'

import { Paddle } from '../entities/Paddle'
import { Ball } from '../entities/balls/Ball'
import { BurstBall } from '../entities/balls/BurstBall';
import { SpinBall } from '../entities/balls/SpinBall';
import { Shield } from '../entities/background/Shield';
import { Bullet } from '../entities/Bullet';
import { CrossCut } from '../entities/crossCuts/CrossCut';

import { PhysicsComponent } from '../components/PhysicsComponent';
import { VFXComponent } from '../components/VFXComponent';
import { InputComponent } from '../components/InputComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { ParticleSpawner } from '../spawners/ParticleSpawner'
import { BallSpawner } from '../spawners/BallSpawner'
import { PowerupSpawner } from '../spawners/PowerupSpawner';

import { createEntitiesMap, changePaddleLayer } from '../utils/Utils';
import * as physicsUtils from '../utils/PhysicsUtils'
import { isPaddle, isBall, isSpinBall, isPowerup, isBullet } from '../utils/Guards';
import { GAME_COLORS } from '../utils/Types';


export class PhysicsSystem implements System {
	game: PongGame;
	width: number;
	height: number;

	constructor(game: PongGame, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.game = game;
    }

	update(entities: Entity[]): void {
		const entitiesMap = createEntitiesMap(entities);

		for (const entity of entities){
			if (isPaddle(entity)) {
				this.updatePaddle(entity, entitiesMap);
			} else if (isBall(entity)) {
				this.updateBall(entity, entities, entitiesMap);
			} else if (isBullet(entity)) {
				this.updateBullet(entity, entitiesMap);
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
        const speed = paddle.isStunned? 0 : physics.speed || 5;

        if (input.upPressed) {
            physics.velocityY = -speed * paddle.inversion * paddle.slowness;
        } else if (input.downPressed) {
            physics.velocityY = speed * paddle.inversion * paddle.slowness;
        } else {
            physics.velocityY = 0;
        }

        physics.y += physics.velocityY;
    }

    constrainPaddleToWalls(physics: PhysicsComponent, entitiesMap: Map<string, Entity>) {
        // Top wall collision
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

        // Bottom wall collision
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

	updateBall(ball: Ball, entities: Entity[], entitiesMap: Map<string, Entity>) {
		const physics = ball.getComponent('physics') as PhysicsComponent;
		const vfx = ball.getComponent('vfx') as VFXComponent;

		if (!physics || !vfx) return;

		ball.applyMagneticForce(this.game, physics, entitiesMap);
		if (physics.velocityX > 0) {
			ball.magneticInfluence = 'right';
		} else {
			ball.magneticInfluence = 'left';
		}
		ball.moveBall(physics);

		this.handleBallWallCollisions(physics, entitiesMap, ball);
		this.handleBallCutCollisions(physics, entitiesMap, ball);
		this.handleBallShieldCollisions(physics, entitiesMap, ball);
        this.handleBallPaddleCollisions(physics, entitiesMap, ball);
        this.handlePowerupCollisions(entities, entitiesMap, ball);

        this.checkBallOutOfBounds(physics, ball);
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
		
		if (isSpinBall(ball) && collided) {
			(ball as SpinBall).applySpinToBounce(physics);
		}
	}

	handleBallCutCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		const ballRadius = physics.width / 2;
		const ballCenter = { x: physics.x, y: physics.y };
		let collided = false;
		let collisionNormal = { x: 0, y: 0 };
		
		// Store previous position for stuck detection
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
					
					// Check if ball is inside polygon first
					const isInside = physicsUtils.pointInPolygon(ballCenter.x, ballCenter.y, polygon, cutOffsetX, cutOffsetY);
					
					if (isInside) {
						// Ball is inside - find closest edge to push out
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
								
								// Calculate normal pointing outward from polygon
								const nx = -edgeVector.y / edgeLength;
								const ny = edgeVector.x / edgeLength;
								
								// Make sure normal points away from polygon center
								const centerToEdge = { x: closest.x - ballCenter.x, y: closest.y - ballCenter.y };
								const dot = nx * centerToEdge.x + ny * centerToEdge.y;
								closestEdgeNormal = dot > 0 ? { x: nx, y: ny } : { x: -nx, y: -ny };
							}
						}
						
						// Push ball out with extra margin
						const pushOutDistance = ballRadius + 2.0; // Increased margin
						physics.x = closestPoint.x + closestEdgeNormal.x * pushOutDistance;
						physics.y = closestPoint.y + closestEdgeNormal.y * pushOutDistance;
						
						// Reflect velocity
						const dotVelocity = physics.velocityX * closestEdgeNormal.x + physics.velocityY * closestEdgeNormal.y;
						physics.velocityX -= 2 * dotVelocity * closestEdgeNormal.x;
						physics.velocityY -= 2 * dotVelocity * closestEdgeNormal.y;
						
						collided = true;
						collisionNormal = closestEdgeNormal;
						break;
					}
					
					// Check edge collisions only if not inside
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
							// Extra safety margin
							const pushOutDistance = ballRadius + 1.5;
							physics.x = collision.point!.x + collision.normal.x * pushOutDistance;
							physics.y = collision.point!.y + collision.normal.y * pushOutDistance;
							
							// Reflect velocity
							const dotVelocity = physics.velocityX * collision.normal.x + physics.velocityY * collision.normal.y;
							physics.velocityX -= 2 * dotVelocity * collision.normal.x;
							physics.velocityY -= 2 * dotVelocity * collision.normal.y;
							
							collided = true;
							collisionNormal = collision.normal;
							break;
						}
					}
					
					// Check vertex collisions
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
								
								// Push out with margin
								const pushOutDistance = ballRadius + 1.5;
								physics.x = vertex.x + nx * pushOutDistance;
								physics.y = vertex.y + ny * pushOutDistance;
								
								// Reflect velocity
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
			// Anti-stuck mechanism: if ball is moving very slowly or oscillating
			const speed = Math.hypot(physics.velocityX, physics.velocityY);
			const distanceFromPrev = Math.hypot(physics.x - prevPos.x, physics.y - prevPos.y);
			
			// If ball barely moved or is moving very slowly, give it a boost
			if (speed < 3 || distanceFromPrev < 1) {
				const boostMagnitude = Math.max(5, speed * 1.5);
				const normalizedVelX = physics.velocityX / speed || collisionNormal.x;
				const normalizedVelY = physics.velocityY / speed || collisionNormal.y;
				
				physics.velocityX = normalizedVelX * boostMagnitude;
				physics.velocityY = normalizedVelY * boostMagnitude;
			}
			
			// Enforce speed limits
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

					PowerupSpawner.despawnShield(this.game, shield.id);
				}
			} else if (shield.side === 'right') {
				const ballRight = physics.x + (physics.width / 2);
				const shieldLeft = shieldPhysics.x - shieldPhysics.width / 2;
				if (ballRight > shieldLeft) {
					physics.velocityX *= -1;
					PowerupSpawner.despawnShield(this.game, shield.id);
				}
			}
		}

		if (isSpinBall(ball) && collided) {
			(ball as SpinBall).applySpinToBounce(physics);
		}
	}

	handleBallPaddleCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		const MAX_BOUNCE_ANGLE = Math.PI / 4; // 45 degrees
		const PADDLE_INFLUENCE = 0.5;
		const MIN_HORIZONTAL_COMPONENT = 0.7; // At least 70% of velocity should be horizontal
		
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
					this.game.sounds.pong.play();
					
					physics.x = collision.position.x;
					physics.y = collision.position.y;
					
					const speed = Math.hypot(physics.velocityX, physics.velocityY);
					
					if (collision.normal.x !== 0) {
						physics.velocityX = -physics.velocityX;
						
						const relativeHit = (physics.y - paddlePhysics.y) / (paddlePhysics.height / 2);
						const clamped = Math.max(-0.8, Math.min(0.8, relativeHit));
						const bounceAngle = clamped * MAX_BOUNCE_ANGLE;
						
						if (paddleSide === "left") {
							physics.velocityX = Math.abs(physics.velocityX); // Force right direction
							physics.velocityX = Math.cos(bounceAngle) * speed;
						} else {
							physics.velocityX = -Math.abs(physics.velocityX); // Force left direction
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
					if (ball instanceof BurstBall) {
						ball.resetWindup();
					}
					
					if (paddleSide === "left") {
						ParticleSpawner.spawnBasicExplosion(this.game, physics.x - physics.width / 4, physics.y, GAME_COLORS.greenParticle, 1);
						
						if (ball.hasComponent('vfx')) {
							const vfx = ball.getComponent('vfx') as VFXComponent;
							vfx.startFlash(GAME_COLORS.greenParticle, 10); // Green flash for left paddle
						}

					} else {
						ParticleSpawner.spawnBasicExplosion(this.game, physics.x + physics.width / 4, physics.y, GAME_COLORS.violetParticle, 1);
						
						if (ball.hasComponent('vfx')) {
							const vfx = ball.getComponent('vfx') as VFXComponent;
							vfx.startFlash(GAME_COLORS.violetParticle, 10); // Purple flash for right paddle
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

        for (const entity of entities) {
			if (isPowerup(entity)) {
                const powerupBox = physicsUtils.getBoundingBox(entity.getComponent('physics') as PhysicsComponent);
                if (ball.lastHit && physicsUtils.isAABBOverlap(ballBox, powerupBox)) {
                    console.log(`Triggered powerup: ${entity.id}`);
                    const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
					entity.sendPowerupEvent(entitiesMap);
                    lifetime.remaining = 0;
					if (!entity.id.includes('shield') && !entity.id.includes('shoot')) {
						changePaddleLayer(this.game, ball.lastHit, entity.id);
					}
                }
            }
        }
    }


	checkBallOutOfBounds(physics: PhysicsComponent, ball: Ball) {
        const ballLeft = physics.x - (physics.width / 2);
        const ballRight = physics.x + (physics.width / 2);

		if (ballLeft > this.width) {
			if (ball.isGoodBall) {
				this.game.sounds.death.play();
				ParticleSpawner.spawnBurst(
					this.game,
					physics.x - physics.width,
					physics.y,
					10,
					physics.velocityX,
					physics.velocityY,
					0xFBBF24,
				);
				this.game.eventQueue.push({ type: 'SCORE', side: 'left' });
				this.resetBall(ball, physics, 1);
			} else if (ball.isFakeBall) {
				ball.despawnBall(this.game, ball.id);
			}
		}

		// Ball exits left side
		if (ballRight < 0) {
			if 	(ball.isGoodBall) {
				this.game.sounds.death.play();
				ParticleSpawner.spawnBurst(
					this.game,
					physics.x + physics.width,
					physics.y,
					10,
					physics.velocityX,
					physics.velocityY,
					0xFBBF24,
				);
				this.game.sounds.death.play();
				this.game.eventQueue.push({ type: 'SCORE', side: 'right' });
				this.resetBall(ball, physics, -1);
			} else if (ball.isFakeBall) {
				ball.despawnBall(this.game, ball.id);
			}
		}
    }
    
    resetBall(ball: Ball, physics: PhysicsComponent, direction: number) {
        this.game.removeEntity(ball.id);
		
		physics.x = this.width / 2;
        physics.y = this.height / 2;
		
		BallSpawner.spawnDefaultBall(this.game);
    
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        const speed = 10;
        
        physics.velocityX = Math.cos(angle) * speed * direction;
        physics.velocityY = Math.sin(angle) * speed;
        ball.lastHit = '';
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
				PowerupSpawner.despawnBullet(this.game, bullet.id);
				ParticleSpawner.spawnBurst(
					this.game,
					bulletPhysics.x - bulletPhysics.width,
					bulletPhysics.y,
					10,
					bulletPhysics.velocityX,
					bulletPhysics.velocityY,
					GAME_COLORS.rose,
				);
				changePaddleLayer(this.game, 'right', 'powerDown');
				console.log('Bullet hit!');
			}
		} else if (bullet.direction === 'left') {
			if (physicsUtils.isAABBOverlap(bulletBox, paddleLBox)) {
				paddleL.isStunned = true;
				paddleL.affectedTimer = 100;
				PowerupSpawner.despawnBullet(this.game, bullet.id);
				ParticleSpawner.spawnBurst(
					this.game,
					bulletPhysics.x + bulletPhysics.width,
					bulletPhysics.y,
					10,
					-bulletPhysics.velocityX,
					bulletPhysics.velocityY,
					GAME_COLORS.rose,
				);
				changePaddleLayer(this.game, 'left', 'powerDown');
				console.log('Bullet hit!');
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
						ParticleSpawner.spawnBasicExplosion(this.game, bulletPhysics.x + bulletPhysics.width / 4, bulletPhysics.y, GAME_COLORS.rose, 1);
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
}