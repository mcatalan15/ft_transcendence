/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 14:28:24 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:05:41 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ParticleSpawner } from '../spawners/ParticleSpawner';
import type { Entity } from '../engine/Entity'
import type { Paddle } from '../entities/Paddle'
import type { PongGame } from '../engine/Game'
import type { InputComponent } from '../components/InputComponent'
import type { PhysicsComponent } from '../components/PhysicsComponent'
import type { VFXComponent } from '../components/VFXComponent'
import type { LifetimeComponent } from '../components/LifetimeComponent'
import type { PowerupComponent } from '../components/PowerupComponent'

interface BoundingBox {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

// Define EntityMap interface
interface EntityMap {
    [key: string]: Entity;
}

export class PhysicsSystem {
    width: number;
    height: number;
    game: PongGame;

    constructor(game: PongGame, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.game = game;
    }

    update(entities: Entity[]): void {
        const entitiesMap = this._createEntitiesMap(entities);
        
        for (const entity of entities) {
            if (entity.id === 'paddleL' || entity.id === 'paddleR') {
                this._updatePaddle(entity, entitiesMap);
            } else if (entity.id === 'ball') {
                this._updateBall(entity, entitiesMap);
            }
        }
    }

    _createEntitiesMap(entities: Entity[]): EntityMap {
        const map: EntityMap = {};
        for (const entity of entities) {
            map[entity.id] = entity;
        }
        return map;
    }

    _updatePaddle(paddle: Entity, entitiesMap: EntityMap): void {
        const input = paddle.getComponent('input') as InputComponent | undefined;
        const physics = paddle.getComponent('physics') as PhysicsComponent | undefined;
        
        if (!input || !physics) return;

        this._applyInputToPaddle(input, physics);
        
        this._constrainPaddleToWalls(physics, entitiesMap);
    }

    _applyInputToPaddle(input: InputComponent, physics: PhysicsComponent): void {
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

    _constrainPaddleToWalls(physics: PhysicsComponent, entitiesMap: EntityMap): void {
        // Top wall collision
        if (entitiesMap.wallT) {
            const wallPhysics = entitiesMap.wallT.getComponent('physics') as PhysicsComponent;
            const wallBottom = wallPhysics.y + wallPhysics.height;
            const paddleTop = physics.y - (physics.height / 2);

            if (paddleTop < wallBottom) {
                physics.y = wallBottom + (physics.height / 2);
                physics.velocityY = 0;
            }
        }

        // Bottom wall collision
        if (entitiesMap.wallB) {
            const wallPhysics = entitiesMap.wallB.getComponent('physics') as PhysicsComponent;
            const wallTop = wallPhysics.y;
            const paddleBottom = physics.y + (physics.height / 2);

            if (paddleBottom > wallTop) {
                physics.y = wallTop - (physics.height / 2);
                physics.velocityY = 0;
            }
        }
    }

    _updateBall(ball: Entity, entitiesMap: EntityMap): void {
        const physics = ball.getComponent('physics') as PhysicsComponent | undefined;
        const vfx = ball.getComponent('vfx') as VFXComponent | undefined;
        if (!physics || !vfx) return;

        // Move the ball
        physics.x += physics.velocityX;
        physics.y += physics.velocityY;

        // Handle collisions
        this._handleBallWallCollisions(physics, entitiesMap);
        this._handleBallPaddleCollisions(physics, entitiesMap);
        this._handlePowerupCollisions(physics, entitiesMap);
        
        // Check if ball is out of bounds
        this._checkBallOutOfBounds(ball, physics);
    }

    _handleBallWallCollisions(physics: PhysicsComponent, entitiesMap: EntityMap): void {
        // Top wall collision
        if (entitiesMap.wallT) {
            const wallPhysics = entitiesMap.wallT.getComponent('physics') as PhysicsComponent;
            const wallBottom = wallPhysics.y + wallPhysics.height;
            const ballTop = physics.y - (physics.height / 2);

            if (ballTop < wallBottom) {
                physics.y = wallBottom + (physics.height / 2);
                physics.velocityY *= -1;
            }
        }

        // Bottom wall collision
        if (entitiesMap.wallB) {
            const wallPhysics = entitiesMap.wallB.getComponent('physics') as PhysicsComponent;
            const wallTop = wallPhysics.y;
            const ballBottom = physics.y + (physics.height / 2);

            if (ballBottom > wallTop) {
                physics.y = wallTop - (physics.height / 2);
                physics.velocityY *= -1;
            }
        }
    }

    _handleBallPaddleCollisions(physics: PhysicsComponent, entitiesMap: EntityMap): void {
        const ballLeft = physics.x - (physics.width / 2);
        const ballRight = physics.x + (physics.width / 2);
        const ball = entitiesMap.ball;
        
        // Configuration for bounce mechanics - reduced maximum angle
        const MAX_BOUNCE_ANGLE = Math.PI / 4; // 45 degrees maximum bounce angle (reduced from 60)
        const PADDLE_INFLUENCE = 0.5; // Reduced paddle influence (from 0.75)
        const MIN_HORIZONTAL_COMPONENT = 0.7; // Ensures ball always has significant horizontal movement
        
        // Left Paddle collision
        if (entitiesMap.paddleL) {
            const paddlePhysics = entitiesMap.paddleL.getComponent('physics') as PhysicsComponent;
            const paddleRight = paddlePhysics.x + (paddlePhysics.width / 2);
            const paddleTop = paddlePhysics.y - (paddlePhysics.height / 2);
            const paddleBottom = paddlePhysics.y + (paddlePhysics.height / 2);
            
            if (physics.y >= paddleTop && physics.y <= paddleBottom &&
                ballLeft <= paddleRight && ballLeft >= paddleRight - Math.abs(physics.velocityX)) {

                physics.x = paddleRight + (physics.width / 2);
                
                const relativeHitPosition = ((physics.y - paddlePhysics.y) / (paddlePhysics.height / 2));

                const clampedHitPosition = Math.max(-0.8, Math.min(0.8, relativeHitPosition)); // clamp to 80% of edge
                const bounceAngle = clampedHitPosition * MAX_BOUNCE_ANGLE;

                const speed = Math.sqrt(physics.velocityX * physics.velocityX + physics.velocityY * physics.velocityY);
                physics.velocityX = Math.cos(bounceAngle) * speed;
                physics.velocityY = Math.sin(bounceAngle) * speed;

                if (paddlePhysics.velocityY !== 0) {
                    const paddleInfluence = Math.min(Math.abs(paddlePhysics.velocityY), 5) * Math.sign(paddlePhysics.velocityY);
                    physics.velocityY += paddleInfluence * PADDLE_INFLUENCE;
                }
                
                const horizontalComponent = Math.abs(physics.velocityX) / speed;
                if (horizontalComponent < MIN_HORIZONTAL_COMPONENT) {
                    const currentDirection = Math.sign(physics.velocityX);
                    physics.velocityX = currentDirection * MIN_HORIZONTAL_COMPONENT * speed;
                    
                    const maxVerticalComponent = Math.sqrt(1 - (MIN_HORIZONTAL_COMPONENT * MIN_HORIZONTAL_COMPONENT));
                    physics.velocityY = Math.sign(physics.velocityY) * maxVerticalComponent * speed;
                }
                
                this.game.sounds.pong.play();
                (ball as any).lastHit = 'left';
                ParticleSpawner.spawnBasicExplosion(this.game, physics.x - physics.width / 4, physics.y, 0x1CFFAC);
                if (ball && ball.hasComponent('vfx')) {
                    const vfx = ball.getComponent('vfx') as VFXComponent;
                    vfx.startFlash(0x5EEAD4, 10); // Green flash for left paddle
                }
            }
        }
        
        // Right Paddle collision
        if (entitiesMap.paddleR) {
            const paddlePhysics = entitiesMap.paddleR.getComponent('physics') as PhysicsComponent;
            const paddleLeft = paddlePhysics.x - (paddlePhysics.width / 2);
            const paddleTop = paddlePhysics.y - (paddlePhysics.height / 2);
            const paddleBottom = paddlePhysics.y + (paddlePhysics.height / 2);
            
            if (physics.y >= paddleTop && physics.y <= paddleBottom &&
                ballRight >= paddleLeft && ballRight <= paddleLeft + Math.abs(physics.velocityX)) {

                physics.x = paddleLeft - (physics.width / 2);

                const relativeHitPosition = ((physics.y - paddlePhysics.y) / (paddlePhysics.height / 2));
                
                const clampedHitPosition = Math.max(-0.8, Math.min(0.8, relativeHitPosition)); // clamp to 80% of edge
                const bounceAngle = clampedHitPosition * MAX_BOUNCE_ANGLE;
                
                const speed = Math.sqrt(physics.velocityX * physics.velocityX + physics.velocityY * physics.velocityY);
                physics.velocityX = -Math.cos(bounceAngle) * speed;
                physics.velocityY = Math.sin(bounceAngle) * speed;

                if (paddlePhysics.velocityY !== 0) {
                    const paddleInfluence = Math.min(Math.abs(paddlePhysics.velocityY), 5) * Math.sign(paddlePhysics.velocityY);
                    physics.velocityY += paddleInfluence * PADDLE_INFLUENCE;
                }
                
                const horizontalComponent = Math.abs(physics.velocityX) / speed;
                if (horizontalComponent < MIN_HORIZONTAL_COMPONENT) {
                    const currentDirection = Math.sign(physics.velocityX);
                    physics.velocityX = currentDirection * MIN_HORIZONTAL_COMPONENT * speed;

                    const maxVerticalComponent = Math.sqrt(1 - (MIN_HORIZONTAL_COMPONENT * MIN_HORIZONTAL_COMPONENT));
                    physics.velocityY = Math.sign(physics.velocityY) * maxVerticalComponent * speed;
                }
                
                this.game.sounds.pong.play();
                (ball as any).lastHit = 'right';
                ParticleSpawner.spawnBasicExplosion(this.game, physics.x + physics.width / 4, physics.y, 0xAC1CFF);
                
                if (ball && ball.hasComponent('vfx')) {
                    const vfx = ball.getComponent('vfx') as VFXComponent;
                    vfx.startFlash(0xD946EF, 10); // Purple flash for right paddle
                }
            }
        }
    }

    _handlePowerupCollisions(physics: PhysicsComponent, entitiesMap: EntityMap): void {
        const ball = entitiesMap.ball;
        const ballBox = this.getBoundingBox(ball.getComponent('physics') as PhysicsComponent);

        for (const entity of Object.values(entitiesMap)) {
            if (entity.id.startsWith('powerup')) {
                const powerupBox = this.getBoundingBox(entity.getComponent('physics') as PhysicsComponent);
                if ((ball as any).lastHit && this.isAABBOverlap(ballBox, powerupBox)) {
                    console.log(`Triggered powerup: ${entity.id}`);
                    this.game.sounds.powerup.play();
                    const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
                    const powerupComp = entity.getComponent('powerup') as PowerupComponent;
                    if ((ball as any).lastHit === 'left') {  
                        powerupComp.enlargePaddle(entitiesMap.paddleL as Paddle);
                    } else if ((ball as any).lastHit === 'right') {
                        powerupComp.enlargePaddle(entitiesMap.paddleL as Paddle);
                    }
                    lifetime.remaining = 0;
                }
            }
        }
    }

    _checkBallOutOfBounds(ball: Entity, physics: PhysicsComponent): void {
        const ballLeft = physics.x - (physics.width / 2);
        const ballRight = physics.x + (physics.width / 2);

        // Ball exits right side
        if (ballLeft > this.width) {
            ParticleSpawner.spawnBurst(
                this.game,
                physics.x - physics.width / 4,
                physics.y,
                10,
                physics.velocityX,
                physics.velocityY,
                0xFBBF24,
            );
            this.game.sounds.death.play();
            this.game.eventQueue.push({ type: 'SCORE', side: 'left' });
            this._resetBall(ball, physics, 1);
        }

        // Ball exits left side
        if (ballRight < 0) {
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
            this._resetBall(ball, physics, -1);
        }
    }
    
    _resetBall(ball: Entity, physics: PhysicsComponent, direction: number): void {
        physics.x = this.width / 2;
        physics.y = this.height / 2;
    
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        const speed = 10;
        
        physics.velocityX = Math.cos(angle) * speed * direction;
        physics.velocityY = Math.sin(angle) * speed;
        (ball as any).lastHit = '';
    }

    // Utils
    getBoundingBox(physics: PhysicsComponent): BoundingBox {
        return {
            left: physics.x - physics.width / 2,
            right: physics.x + physics.width / 2,
            top: physics.y - physics.height / 2,
            bottom: physics.y + physics.height / 2
        };
    }
    
    isAABBOverlap(a: BoundingBox, b: BoundingBox): boolean {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }
}