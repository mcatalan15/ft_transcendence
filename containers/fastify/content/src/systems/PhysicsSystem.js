/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsSystem.js                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 11:28:34 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/14 16:13:48 by hmunoz-g         ###   ########.fr       */
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
        
        // Check if ball is out of bounds
        this._checkBallOutOfBounds(physics);
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

    _handleBallPaddleCollisions(physics, entitiesMap) {
        const ballLeft = physics.x - (physics.width / 2);
        const ballRight = physics.x + (physics.width / 2);
		const ball = entitiesMap.ball;

        // Left Paddle collision
        if (entitiesMap.paddleL) {
            const paddlePhysics = entitiesMap.paddleL.getComponent('physics');
            const paddleRight = paddlePhysics.x + (paddlePhysics.width / 2);
            const paddleTop = paddlePhysics.y - (paddlePhysics.height / 2);
            const paddleBottom = paddlePhysics.y + (paddlePhysics.height / 2);
            
            if (physics.y >= paddleTop && physics.y <= paddleBottom && 
                ballLeft <= paddleRight && ballLeft >= paddleRight - Math.abs(physics.velocityX)) {
                physics.x = paddleRight + (physics.width / 2);
                physics.velocityX *= -1;
				
                ParticleSpawner.spawnBasicExplosion(this.game, physics.x - physics.width / 4, physics.y);

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
                physics.x = paddleLeft - (physics.width / 2);
                physics.velocityX *= -1;

                ParticleSpawner.spawnBasicExplosion(this.game, physics.x + physics.width / 4, physics.y);
				
				if (ball && ball.hasComponent('vfx')) {
					const vfx = ball.getComponent('vfx');
					vfx.startFlash(0xAC1CFF, 10); // Red flash for right paddle
				}
            }
        }
    }

    _checkBallOutOfBounds(physics) {
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
                physics.velocityY
            );
            this._resetBall(physics, 1);
        }

        // Ball exits left side
        if (ballRight < 0) {
            ParticleSpawner.spawnBurst(
                this.game,
                physics.x + physics.width / 4,
                physics.y,
                10,
                physics.velocityX,
                physics.velocityY
            );
            this._resetBall(physics, -1);
        }
    }
    
    _resetBall(physics, direction) {
        physics.x = this.width / 2;
        physics.y = this.height / 2;
    
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        const speed = 10;
        
        physics.velocityX = Math.cos(angle) * speed * direction;
        physics.velocityY = Math.sin(angle) * speed;
    }
}