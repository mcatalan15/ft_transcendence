/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsSystem.js                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 11:28:34 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 08:12:36 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ParticleSpawner } from '../spawners/ParticleSpawner.js'

export class PhysicsSystem {
    constructor(game, width, height) {
        this.width = width;
        this.height = height;
        this.game = game;
    }

    update(entities) {
        const entitiesMap = this._createEntitiesMap(entities);
        
        for (const entity of entities) {
            if (entity.id === 'paddleL' || entity.id === 'paddleR') {
                this._updatePaddle(entity, entitiesMap);
            } else if (entity.id === 'ball') {
                this._updateBall(entity, entitiesMap);
            }
        }
    }

    _createEntitiesMap(entities) {
        const map = {};
        for (const entity of entities) {
            map[entity.id] = entity;
        }
        return map;
    }

    _updatePaddle(paddle, entitiesMap) {
        const input = paddle.getComponent('input');
        const physics = paddle.getComponent('physics');
        
        if (!input || !physics) return;

        // Update paddle position based on input
        this._applyInputToPaddle(input, physics);
        
        // Handle wall collisions
        this._constrainPaddleToWalls(physics, entitiesMap);
    }

    _applyInputToPaddle(input, physics) {
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

    _constrainPaddleToWalls(physics, entitiesMap) {
        // Top wall collision
        if (entitiesMap.wallT) {
            const wallPhysics = entitiesMap.wallT.getComponent('physics');
            const wallBottom = wallPhysics.y + wallPhysics.height;
            const paddleTop = physics.y - (physics.height / 2);

            if (paddleTop < wallBottom) {
                physics.y = wallBottom + (physics.height / 2);
                physics.velocityY = 0;
            }
        }

        // Bottom wall collision
        if (entitiesMap.wallB) {
            const wallPhysics = entitiesMap.wallB.getComponent('physics');
            const wallTop = wallPhysics.y;
            const paddleBottom = physics.y + (physics.height / 2);

            if (paddleBottom > wallTop) {
                physics.y = wallTop - (physics.height / 2);
                physics.velocityY = 0;
            }
        }
    }

    _updateBall(ball, entitiesMap) {
        const physics = ball.getComponent('physics');
		const vfx = ball.getComponent('vfx');
        if (!physics || ! vfx) return;

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

    _handleBallWallCollisions(physics, entitiesMap) {
        // Top wall collision
        if (entitiesMap.wallT) {
            const wallPhysics = entitiesMap.wallT.getComponent('physics');
            const wallBottom = wallPhysics.y + wallPhysics.height;
            const ballTop = physics.y - (physics.height / 2);

            if (ballTop < wallBottom) {
                physics.y = wallBottom + (physics.height / 2);
                physics.velocityY *= -1;
            }
        }

        // Bottom wall collision
        if (entitiesMap.wallB) {
            const wallPhysics = entitiesMap.wallB.getComponent('physics');
            const wallTop = wallPhysics.y;
            const ballBottom = physics.y + (physics.height / 2);

            if (ballBottom > wallTop) {
                physics.y = wallTop - (physics.height / 2);
                physics.velocityY *= -1;
            }
        }
    }

// Enhanced collision system that considers both paddle speed and hit position
// Enhanced collision system with clamped angles to prevent overly vertical trajectories
_handleBallPaddleCollisions(physics, entitiesMap) {
    const ballLeft = physics.x - (physics.width / 2);
    const ballRight = physics.x + (physics.width / 2);
    const ball = entitiesMap.ball;
    
    // Configuration for bounce mechanics - reduced maximum angle
    const MAX_BOUNCE_ANGLE = Math.PI / 4; // 45 degrees maximum bounce angle (reduced from 60)
    const PADDLE_INFLUENCE = 0.5; // Reduced paddle influence (from 0.75)
    const MIN_HORIZONTAL_COMPONENT = 0.7; // Ensures ball always has significant horizontal movement
    
    // Left Paddle collision
    if (entitiesMap.paddleL) {
        const paddlePhysics = entitiesMap.paddleL.getComponent('physics');
        const paddleRight = paddlePhysics.x + (paddlePhysics.width / 2);
        const paddleTop = paddlePhysics.y - (paddlePhysics.height / 2);
        const paddleBottom = paddlePhysics.y + (paddlePhysics.height / 2);
        
        if (physics.y >= paddleTop && physics.y <= paddleBottom &&
            ballLeft <= paddleRight && ballLeft >= paddleRight - Math.abs(physics.velocityX)) {
            // Position the ball properly after collision
            physics.x = paddleRight + (physics.width / 2);
            
            // Calculate relative position of hit on paddle (0 = center, -1 = top edge, 1 = bottom edge)
            const relativeHitPosition = ((physics.y - paddlePhysics.y) / (paddlePhysics.height / 2));
            
            // Calculate bounce angle based on hit position, but limit the range
            const clampedHitPosition = Math.max(-0.8, Math.min(0.8, relativeHitPosition)); // clamp to 80% of edge
            const bounceAngle = clampedHitPosition * MAX_BOUNCE_ANGLE;
            
            // Calculate new velocity components based on the bounce angle
            const speed = Math.sqrt(physics.velocityX * physics.velocityX + physics.velocityY * physics.velocityY);
            physics.velocityX = Math.cos(bounceAngle) * speed;
            physics.velocityY = Math.sin(bounceAngle) * speed;
            
            // Add influence from paddle's motion (if paddle is moving), but limit the effect
            if (paddlePhysics.velocityY !== 0) {
                // Clamp paddle velocity influence
                const paddleInfluence = Math.min(Math.abs(paddlePhysics.velocityY), 5) * Math.sign(paddlePhysics.velocityY);
                physics.velocityY += paddleInfluence * PADDLE_INFLUENCE;
            }
            
            // Ensure the ball maintains significant horizontal velocity by adjusting components
            const horizontalComponent = Math.abs(physics.velocityX) / speed;
            if (horizontalComponent < MIN_HORIZONTAL_COMPONENT) {
                // Recalculate velocities to ensure minimum horizontal component
                const currentDirection = Math.sign(physics.velocityX);
                physics.velocityX = currentDirection * MIN_HORIZONTAL_COMPONENT * speed;
                
                // Adjust Y to maintain the same overall speed
                const maxVerticalComponent = Math.sqrt(1 - (MIN_HORIZONTAL_COMPONENT * MIN_HORIZONTAL_COMPONENT));
                physics.velocityY = Math.sign(physics.velocityY) * maxVerticalComponent * speed;
            }
            
            this.game.sounds.pong.play();
            ball.lastHit = 'left';
            ParticleSpawner.spawnBasicExplosion(this.game, physics.x - physics.width / 4, physics.y, 0x1CFFAC);
            if (ball && ball.hasComponent('vfx')) {
                const vfx = ball.getComponent('vfx');
                vfx.startFlash(0x1CFFAC, 10); // Blue flash for left paddle
            }
        }
    }
    
    // Right Paddle collision
    if (entitiesMap.paddleR) {
        const paddlePhysics = entitiesMap.paddleR.getComponent('physics');
        const paddleLeft = paddlePhysics.x - (paddlePhysics.width / 2);
        const paddleTop = paddlePhysics.y - (paddlePhysics.height / 2);
        const paddleBottom = paddlePhysics.y + (paddlePhysics.height / 2);
        
        if (physics.y >= paddleTop && physics.y <= paddleBottom &&
            ballRight >= paddleLeft && ballRight <= paddleLeft + Math.abs(physics.velocityX)) {
            // Position the ball properly after collision
            physics.x = paddleLeft - (physics.width / 2);
            
            // Calculate relative position of hit on paddle (0 = center, -1 = top edge, 1 = bottom edge)
            const relativeHitPosition = ((physics.y - paddlePhysics.y) / (paddlePhysics.height / 2));
            
            // Calculate bounce angle based on hit position, but limit the range
            const clampedHitPosition = Math.max(-0.8, Math.min(0.8, relativeHitPosition)); // clamp to 80% of edge
            const bounceAngle = clampedHitPosition * MAX_BOUNCE_ANGLE;
            
            // Calculate new velocity components based on the bounce angle
            const speed = Math.sqrt(physics.velocityX * physics.velocityX + physics.velocityY * physics.velocityY);
            physics.velocityX = -Math.cos(bounceAngle) * speed; // Negative for right paddle
            physics.velocityY = Math.sin(bounceAngle) * speed;
            
            // Add influence from paddle's motion (if paddle is moving), but limit the effect
            if (paddlePhysics.velocityY !== 0) {
                // Clamp paddle velocity influence
                const paddleInfluence = Math.min(Math.abs(paddlePhysics.velocityY), 5) * Math.sign(paddlePhysics.velocityY);
                physics.velocityY += paddleInfluence * PADDLE_INFLUENCE;
            }
            
            // Ensure the ball maintains significant horizontal velocity
            const horizontalComponent = Math.abs(physics.velocityX) / speed;
            if (horizontalComponent < MIN_HORIZONTAL_COMPONENT) {
                // Recalculate velocities to ensure minimum horizontal component
                const currentDirection = Math.sign(physics.velocityX);
                physics.velocityX = currentDirection * MIN_HORIZONTAL_COMPONENT * speed;
                
                // Adjust Y to maintain the same overall speed
                const maxVerticalComponent = Math.sqrt(1 - (MIN_HORIZONTAL_COMPONENT * MIN_HORIZONTAL_COMPONENT));
                physics.velocityY = Math.sign(physics.velocityY) * maxVerticalComponent * speed;
            }
            
            this.game.sounds.pong.play();
            ball.lastHit = 'right';
            ParticleSpawner.spawnBasicExplosion(this.game, physics.x + physics.width / 4, physics.y, 0xAC1CFF);
            
            if (ball && ball.hasComponent('vfx')) {
                const vfx = ball.getComponent('vfx');
                vfx.startFlash(0xAC1CFF, 10); // Red flash for right paddle
            }
        }
    }
}

    _handlePowerupCollisions(physics, entitiesMap) {
		const ball = entitiesMap.ball;
        const ballBox = this.getBoundingBox(ball.getComponent('physics'));

        for (const entity of Object.values(entitiesMap)) {
            if (entity.id.startsWith('powerup')) {
                const powerupBox = this.getBoundingBox(entity.getComponent('physics'));
                if (ball.lastHit && this.isAABBOverlap(ballBox, powerupBox)) {
                    console.log(`Triggered powerup: ${entity.id}`);
                    this.game.sounds.powerup.play();
                    const lifetime = entity.getComponent('lifetime');
                    const powerupComp = entity.getComponent('powerup');
                    if (ball.lastHit === 'left')
                    {  
                        powerupComp.enlargePaddle(entitiesMap.paddleL);
                    } else if (ball.lastHit === 'right')
                        powerupComp.enlargePaddle(entitiesMap.paddleR);
                    lifetime.remaining = 0;
                }
            }
        }
    }

    _checkBallOutOfBounds(ball, physics) {
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
                0xFFAC1C,
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
                0xFFAC1C,
            );
            this.game.sounds.death.play();
            this.game.eventQueue.push({ type: 'SCORE', side: 'right' });
            this._resetBall(ball, physics, -1);
        }
    }
    
    _resetBall(ball, physics, direction) {
        physics.x = this.width / 2;
        physics.y = this.height / 2;
    
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        const speed = 10;
        
        physics.velocityX = Math.cos(angle) * speed * direction;
        physics.velocityY = Math.sin(angle) * speed;
        ball.lastHit = '';
    }

    // Utils
    getBoundingBox(physics) {
        return {
            left: physics.x - physics.width / 2,
            right: physics.x + physics.width / 2,
            top: physics.y - physics.height / 2,
            bottom: physics.y + physics.height / 2
        };
    }
    
    isAABBOverlap(a, b) {
        return (
            a.left < b.right &&
            a.right > b.left &&
            a.top < b.bottom &&
            a.bottom > b.top
        );
    }
}