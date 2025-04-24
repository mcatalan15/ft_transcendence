/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:55:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 12:33:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import ECS engine elements
import { Entity } from '../engine/Entity';
import { System } from '../engine/System';
import { PongGame } from '../engine/Game'

// Import defined entities
// import { Wall } from '../entities/Wall';
import { Paddle } from '../entities/Paddle'
import { Ball } from '../entities/Ball'

// Import built components
import { PhysicsComponent } from '../components/PhysicsComponent';
import { VFXComponent } from '../components/VFXComponent';
import { InputComponent } from '../components/InputComponent';

// Import utils
import { createEntitiesMap } from '../utils/Utils';
import { isPaddle, isBall } from '../utils/Guards';

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
				this.updateBall(entity, entitiesMap);
			}
		}
	}

	updatePaddle(paddle: Paddle, entitiesMap: Map<string, Entity>) {
		const input = paddle.getComponent('input') as InputComponent;
        const physics = paddle.getComponent('physics') as PhysicsComponent;
        
        if (!input || !physics) return;

        this.applyInputToPaddle(input, physics);
        
        this.constrainPaddleToWalls(physics, entitiesMap);
	}

	applyInputToPaddle(input: InputComponent, physics: PhysicsComponent) {
        const speed = physics.speed || 5;

        if (input.upPressed) {
            physics.velocityY = -speed;
        } else if (input.downPressed) {
            physics.velocityY = speed;
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

	updateBall(ball: Ball, entitiesMap: Map<string, Entity>) {
		const physics = ball.getComponent('physics') as PhysicsComponent;
		const vfx = ball.getComponent('vfx') as VFXComponent;

		if (!physics || !vfx) return;

		// Move the ball
		physics.x += physics.velocityX;
        physics.y += physics.velocityY;

		 // Handle collisions
		this.handleBallWallCollisions(physics, entitiesMap);
        this.handleBallPaddleCollisions(physics, entitiesMap);
        //this.handlePowerupCollisions(physics, entitiesMap);

		// Check if ball is out of bounds
        this.checkBallOutOfBounds(ball, physics);
	}

	handleBallWallCollisions(physics: PhysicsComponent, entitiesMap: Map<string, Entity>): void {
		// Top wall collision
		const wallT = entitiesMap.get('wallT');
		if (wallT) {
			const wallPhysics = wallT.getComponent('physics') as PhysicsComponent;
			const wallBottom = wallPhysics.y + (wallPhysics.height / 2);
			const ballTop = physics.y - (physics.height / 2);
	
			if (ballTop < wallBottom) {
				physics.y = wallBottom + (physics.height / 2);
				physics.velocityY *= -1;
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
			}
		}
	}

	handleBallPaddleCollisions(
		physics: PhysicsComponent,
		entitiesMap: Map<string, Entity>
	): void {
		const ballLeft = physics.x - physics.width / 2;
		const ballRight = physics.x + physics.width / 2;
		// const ball = entitiesMap.get("ball");
	
		const MAX_BOUNCE_ANGLE = Math.PI / 4;
		const PADDLE_INFLUENCE = 0.5;
		const MIN_HORIZONTAL_COMPONENT = 0.7;
	
		// Left Paddle
		const paddleL = entitiesMap.get("paddleL");
		if (paddleL) {
			const paddlePhysics = paddleL.getComponent("physics") as PhysicsComponent;
			const paddleRight = paddlePhysics.x + paddlePhysics.width / 2;
			const paddleTop = paddlePhysics.y - paddlePhysics.height / 2;
			const paddleBottom = paddlePhysics.y + paddlePhysics.height / 2;
	
			if (
				physics.y >= paddleTop &&
				physics.y <= paddleBottom &&
				ballLeft <= paddleRight &&
				ballLeft >= paddleRight - Math.abs(physics.velocityX)
			) {
				physics.x = paddleRight + physics.width / 2;
	
				const relativeHit = (physics.y - paddlePhysics.y) / (paddlePhysics.height / 2);
				const clamped = Math.max(-0.8, Math.min(0.8, relativeHit));
				const bounceAngle = clamped * MAX_BOUNCE_ANGLE;
	
				const speed = Math.hypot(physics.velocityX, physics.velocityY);
				physics.velocityX = Math.cos(bounceAngle) * speed;
				physics.velocityY = Math.sin(bounceAngle) * speed;
	
				if (paddlePhysics.velocityY !== 0) {
					const paddleInfluence = Math.min(Math.abs(paddlePhysics.velocityY), 5) * Math.sign(paddlePhysics.velocityY);
					physics.velocityY += paddleInfluence * PADDLE_INFLUENCE;
				}
	
				const horizontalComponent = Math.abs(physics.velocityX) / speed;
				if (horizontalComponent < MIN_HORIZONTAL_COMPONENT) {
					const direction = Math.sign(physics.velocityX);
					physics.velocityX = direction * MIN_HORIZONTAL_COMPONENT * speed;
					const maxVertical = Math.sqrt(1 - MIN_HORIZONTAL_COMPONENT ** 2);
					physics.velocityY = Math.sign(physics.velocityY) * maxVertical * speed;
				}
	
				//Handle sound
			}
		}
	
		// Right Paddle
		const paddleR = entitiesMap.get("paddleR");
		if (paddleR) {
			const paddlePhysics = paddleR.getComponent("physics") as PhysicsComponent;
			const paddleLeft = paddlePhysics.x - paddlePhysics.width / 2;
			const paddleTop = paddlePhysics.y - paddlePhysics.height / 2;
			const paddleBottom = paddlePhysics.y + paddlePhysics.height / 2;
	
			if (
				physics.y >= paddleTop &&
				physics.y <= paddleBottom &&
				ballRight >= paddleLeft &&
				ballRight <= paddleLeft + Math.abs(physics.velocityX)
			) {
				physics.x = paddleLeft - physics.width / 2;
	
				const relativeHit = (physics.y - paddlePhysics.y) / (paddlePhysics.height / 2);
				const clamped = Math.max(-0.8, Math.min(0.8, relativeHit));
				const bounceAngle = clamped * MAX_BOUNCE_ANGLE;
	
				const speed = Math.hypot(physics.velocityX, physics.velocityY);
				physics.velocityX = -Math.cos(bounceAngle) * speed;
				physics.velocityY = Math.sin(bounceAngle) * speed;
	
				if (paddlePhysics.velocityY !== 0) {
					const paddleInfluence = Math.min(Math.abs(paddlePhysics.velocityY), 5) * Math.sign(paddlePhysics.velocityY);
					physics.velocityY += paddleInfluence * PADDLE_INFLUENCE;
				}
	
				const horizontalComponent = Math.abs(physics.velocityX) / speed;
				if (horizontalComponent < MIN_HORIZONTAL_COMPONENT) {
					const direction = Math.sign(physics.velocityX);
					physics.velocityX = direction * MIN_HORIZONTAL_COMPONENT * speed;
					const maxVertical = Math.sqrt(1 - MIN_HORIZONTAL_COMPONENT ** 2);
					physics.velocityY = Math.sign(physics.velocityY) * maxVertical * speed;
				}
	
				//Handle sound
			}
		}
	}

	checkBallOutOfBounds(ball: Ball, physics: PhysicsComponent) {
        const ballLeft = physics.x - (physics.width / 2);
        const ballRight = physics.x + (physics.width / 2);

        // Ball exits right side
        if (ballLeft > this.width) {
            /*ParticleSpawner.spawnBurst(
                this.game,
                physics.x - physics.width / 4,
                physics.y,
                10,
                physics.velocityX,
                physics.velocityY,
                0xFBBF24,
            );*/
            //this.game.sounds.death.play();
            //this.game.eventQueue.push({ type: 'SCORE', side: 'left' });
            this.resetBall(ball, physics, 1);
        }

        // Ball exits left side
        if (ballRight < 0) {
            /*ParticleSpawner.spawnBurst(
                this.game,
                physics.x + physics.width / 4,
                physics.y,
                10,
                physics.velocityX,
                physics.velocityY,
                0xFBBF24,
            );*/
            //this.game.sounds.death.play();
            //this.game.eventQueue.push({ type: 'SCORE', side: 'right' });
            this.resetBall(ball, physics, -1);
        }
    }
    
    resetBall(ball: Ball, physics: PhysicsComponent, direction: number) {
        physics.x = this.width / 2;
        physics.y = this.height / 2;
    
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        const speed = 10;
        
        physics.velocityX = Math.cos(angle) * speed * direction;
        physics.velocityY = Math.sin(angle) * speed;
        ball.lastHit = '';
    }
}