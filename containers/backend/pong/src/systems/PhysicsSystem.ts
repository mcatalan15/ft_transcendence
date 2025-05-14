/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:55:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 15:39:22 by hmunoz-g         ###   ########.fr       */
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

import { PhysicsComponent } from '../components/PhysicsComponent';
import { VFXComponent } from '../components/VFXComponent';
import { InputComponent } from '../components/InputComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { ParticleSpawner } from '../spawners/ParticleSpawner'
import { BallSpawner } from '../spawners/BallSpawner'
import { PowerupSpawner } from '../spawners/PowerupSpawner';

import { createEntitiesMap } from '../utils/Utils';
import { isPaddle, isBall, isSpinBall, isPowerup, isBullet } from '../utils/Guards';
import { BoundingBox } from '../utils/Types';


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

		// Move the ball
		ball.applyMagneticForce(this.game, physics, entitiesMap);
		if (physics.velocityX > 0) {
			ball.magneticInfluence = 'right';
		} else {
			ball.magneticInfluence = 'left';
		}
		ball.moveBall(physics);

		 // Handle collisions
		this.handleBallWallCollisions(physics, entitiesMap, ball);
		//this.handleBallCutCollisions(physics, entitiesMap, ball);
		this.handleBallShieldCollisions(physics, entitiesMap, ball);
        this.handleBallPaddleCollisions(physics, entitiesMap, ball);
        this.handlePowerupCollisions(entities, entitiesMap, ball);

		// Check if ball is out of bounds
        this.checkBallOutOfBounds(physics, ball);
	}

	handleBallWallCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		let collided = false;
		
		// Top wall collision
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
	
		// Bottom wall collision
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
		
		// Apply spin effect if SpinBall
		if (isSpinBall(ball) && collided) {
			(ball as SpinBall).applySpinToBounce(physics);
		}
	}

	//! WIP
	/*handleBallCutCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		for (const [id, entity] of entitiesMap.entries()) {
			if (!id.startsWith('cut-')) continue;
			const cutPhysics = entity.getComponent('physics') as PhysicsComponent;
			if (!cutPhysics) continue;
	
			const ballRadius = physics.width / 2;
			const ballCenter = { x: physics.x, y: physics.y };
	
			// Define triangle points based on center + dimensions
			const baseWidth = cutPhysics.width;
			const height = cutPhysics.height;
			const centerX = cutPhysics.x;
			const centerY = cutPhysics.y;
	
			// Assuming upward-pointing isosceles triangle
			const A = { x: centerX, y: centerY - height / 2 }; // top
			const B = { x: centerX - baseWidth / 2, y: centerY + height / 2 }; // bottom-left
			const C = { x: centerX + baseWidth / 2, y: centerY + height / 2 }; // bottom-right
	
			// Check against each edge
			const edges = [
				[A, B],
				[B, C],
				[C, A],
			];
	
			for (const [p1, p2] of edges) {
				if (this.circleIntersectsSegment(ballCenter, ballRadius, p1, p2)) {
					const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
					const normal = { x: -edge.y, y: edge.x }; // perpendicular vector
					const normalLen = Math.hypot(normal.x, normal.y);
					const nx = normal.x / normalLen;
					const ny = normal.y / normalLen;
	
					// Reflect ball velocity across normal
					const dot = physics.velocityX * nx + physics.velocityY * ny;
					physics.velocityX -= 2 * dot * nx;
					physics.velocityY -= 2 * dot * ny;
	
					// Apply spin effect if SpinBall
					if (isSpinBall(ball)) {
						(ball as SpinBall).applySpinToBounce(physics);
					}
	
					// VFX
					const vfx = ball.getComponent('vfx') as VFXComponent;
					if (vfx) {
						vfx.startFlash(0xFFFF00, 5);
					}
					ParticleSpawner.spawnBasicExplosion(this.game, physics.x, physics.y, 0xFFFFAA);
					this.game.sounds.pong.play();
					break;
				}
			}
		}
	}*/
	
	handleBallShieldCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		let collided = false;
		
		const shield = entitiesMap.get('shield') as Shield;
		if (shield) {
			const shieldPhysics = shield.getComponent('physics') as PhysicsComponent;
			// Left Shield collision
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

		// Apply spin effect if SpinBall
		if (isSpinBall(ball) && collided) {
			(ball as SpinBall).applySpinToBounce(physics);
		}
	}

	handleBallPaddleCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>, ball: Ball): void {
		const MAX_BOUNCE_ANGLE = Math.PI / 4; // 45 degrees
		const PADDLE_INFLUENCE = 0.5;
		const MIN_HORIZONTAL_COMPONENT = 0.7; // At least 70% of velocity should be horizontal
		
		if (ball.isGoodBall) {
			// Ball data
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
				
				// Perform swept collision test
				const collision = this.sweptAABB(
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
						
						// Apply paddle movement influence
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
					
					this.enforceMinimumHorizontalComponent(physics, speed, MIN_HORIZONTAL_COMPONENT);
					
					// Apply spin effect for SpinBall
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
						ParticleSpawner.spawnBasicExplosion(this.game, physics.x - physics.width / 4, physics.y, 0x1CFFAC);
						
						if (ball.hasComponent('vfx')) {
							const vfx = ball.getComponent('vfx') as VFXComponent;
							vfx.startFlash(0x5EEAD4, 10); // Green flash for left paddle
						}

					} else {
						ParticleSpawner.spawnBasicExplosion(this.game, physics.x + physics.width / 4, physics.y, 0xAC1CFF);
						
						if (ball.hasComponent('vfx')) {
							const vfx = ball.getComponent('vfx') as VFXComponent;
							vfx.startFlash(0xD946EF, 10); // Purple flash for right paddle
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
	
	// Make powerups crate events, handle those events in powerup system. 
	handlePowerupCollisions(entities: Entity[], entitiesMap: Map<string, Entity>, ball: Ball) {
		const ballBox = this.getBoundingBox(ball.getComponent('physics') as PhysicsComponent);

        for (const entity of entities) {
			if (isPowerup(entity)) {
                const powerupBox = this.getBoundingBox(entity.getComponent('physics') as PhysicsComponent);
                if (ball.lastHit && this.isAABBOverlap(ballBox, powerupBox)) {
                    console.log(`Triggered powerup: ${entity.id}`);
                    const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
					entity.sendPowerupEvent(entitiesMap);
                    lifetime.remaining = 0;
                }
            }
        }
    }


	checkBallOutOfBounds(physics: PhysicsComponent, ball: Ball) {
        const ballLeft = physics.x - (physics.width / 2);
        const ballRight = physics.x + (physics.width / 2);

		// Ball exits right side
		if (ballLeft > this.width) {
			if (ball.isGoodBall) {
				this.game.sounds.death.play();
				ParticleSpawner.spawnBurst(
					this.game,
					physics.x - physics.width / 4,
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
					physics.x + physics.width / 4,
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

		// Move the bullet
		bullet.moveBullet(physics);

		 // Handle collisions
		this.handleBulletCollisions(bullet, entitiesMap);

		// Check if ball is out of bounds
        this.checkBulletOutOfBounds(bullet);
	}

	handleBulletCollisions(bullet: Bullet, entitiesMap: Map<string, Entity>) {
		const bulletPhysics = bullet.getComponent('physics') as PhysicsComponent;
		const bulletBox = this.getBoundingBox(bulletPhysics);
	
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
	
		const paddleLBox = this.getBoundingBox(paddleLPhysics);
		const paddleRBox = this.getBoundingBox(paddleRPhysics);
	
		
		if (bullet.direction === 'right') {
			if (this.isAABBOverlap(bulletBox, paddleRBox)) {
				paddleR.isStunned = true;
				paddleR.affectedTimer = 100;
				PowerupSpawner.despawnBullet(this.game, bullet.id);
				console.log('Bullet hit!');
			}
		} else if (bullet.direction === 'left') {
			if (this.isAABBOverlap(bulletBox, paddleLBox)) {
				paddleL.isStunned = true;
				paddleL.affectedTimer = 100;
				PowerupSpawner.despawnBullet(this.game, bullet.id);
				console.log('Bullet hit!');
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

	// Utils
    getCurrentBall(): Ball | undefined{
		for (const entity of this.game.entities.values()) {
			if (isBall(entity)) return entity;
		}
		return undefined;
	}
	
	getBoundingBox(physics: PhysicsComponent): BoundingBox {
        return {
            left: physics.x - physics.width / 2,
            right: physics.x + physics.width / 2,
            top: physics.y - physics.height / 2,
            bottom: physics.y + physics.height / 2
        };
    }
    
    isAABBOverlap(a: BoundingBox, b: BoundingBox) {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }

	sweptAABB(
		ballX: number, ballY: number, ballWidth: number, ballHeight: number, ballVx: number, ballVy: number,
		paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number, paddleVy: number = 0
	) {
		const ballHalfW = ballWidth / 2;
		const ballHalfH = ballHeight / 2;
		const paddleHalfW = paddleWidth / 2;
		const paddleHalfH = paddleHeight / 2;
		
		const relVx = ballVx;
		const relVy = ballVy - paddleVy;
		
		const entryDistX = (paddleX - paddleHalfW) - (ballX + ballHalfW);
		const exitDistX = (paddleX + paddleHalfW) - (ballX - ballHalfW);
		
		const entryDistY = (paddleY - paddleHalfH) - (ballY + ballHalfH);
		const exitDistY = (paddleY + paddleHalfH) - (ballY - ballHalfH);
		
		let entryTimeX = relVx !== 0 ? entryDistX / relVx : -Infinity;
		let entryTimeY = relVy !== 0 ? entryDistY / relVy : -Infinity;
		let exitTimeX = relVx !== 0 ? exitDistX / relVx : Infinity;
		let exitTimeY = relVy !== 0 ? exitDistY / relVy : Infinity;
		
		if (entryTimeX > exitTimeX) [entryTimeX, exitTimeX] = [exitTimeX, entryTimeX];
		if (entryTimeY > exitTimeY) [entryTimeY, exitTimeY] = [exitTimeY, entryTimeY];
		
		if (exitTimeX < 0 || exitTimeY < 0) {
			return { hit: false, time: 1, position: { x: ballX + ballVx, y: ballY + ballVy }, normal: { x: 0, y: 0 } };
		}
		
		if (entryTimeX > exitTimeY || entryTimeY > exitTimeX) {
			return { hit: false, time: 1, position: { x: ballX + ballVx, y: ballY + ballVy }, normal: { x: 0, y: 0 } };
		}
		
		const entryTime = Math.max(entryTimeX, entryTimeY);
		
		if (entryTime > 1 || entryTime < 0) {
			return { hit: false, time: 1, position: { x: ballX + ballVx, y: ballY + ballVy }, normal: { x: 0, y: 0 } };
		}
		
		let normalX = 0;
		let normalY = 0;
		
		if (entryTimeX > entryTimeY) {
			normalX = entryDistX < 0 ? 1 : -1;
		} else {
			normalY = entryDistY < 0 ? 1 : -1;
		}
		
		const posX = ballX + ballVx * entryTime;
		const posY = ballY + ballVy * entryTime;
		
		return {
			hit: true,
			time: entryTime,
			position: { x: posX, y: posY },
			normal: { x: normalX, y: normalY }
		};
	}

	enforceMinimumHorizontalComponent(physics: PhysicsComponent, speed: number, minHorizontalComponent: number): void {
		const horizontalComponent = Math.abs(physics.velocityX) / speed;
		
		if (horizontalComponent < minHorizontalComponent) {
			const direction = Math.sign(physics.velocityX);
			
			const horizontalDir = direction !== 0 ? direction : 
				(physics.x < this.game.width / 2 ? 1 : -1);
			
			physics.velocityX = horizontalDir * minHorizontalComponent * speed;
			
			const maxVertical = Math.sqrt(1 - minHorizontalComponent * minHorizontalComponent);
			
			physics.velocityY = Math.sign(physics.velocityY) * maxVertical * speed;
		}
	}

	circleIntersectsSegment(circle: {x: number, y: number}, radius: number, a: {x: number, y: number}, b: {x: number, y: number}): boolean {
		// Vector from A to B
		const ab = { x: b.x - a.x, y: b.y - a.y };
		const ac = { x: circle.x - a.x, y: circle.y - a.y };
	
		// Project ac onto ab to find closest point
		const abLengthSq = ab.x * ab.x + ab.y * ab.y;
		const t = Math.max(0, Math.min(1, (ac.x * ab.x + ac.y * ab.y) / abLengthSq));
		const closest = { x: a.x + ab.x * t, y: a.y + ab.y * t };
	
		// Distance from circle center to closest point
		const dx = circle.x - closest.x;
		const dy = circle.y - closest.y;
		return dx * dx + dy * dy <= radius * radius;
	}
	
}