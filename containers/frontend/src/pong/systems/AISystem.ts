/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AISystem.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/30 16:27:04 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 10:55:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle';
import { Ball } from '../entities/balls/Ball';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { InputComponent } from '../components/InputComponent';
import { FrameData } from '../utils/Types';
import type { System } from '../engine/System';

export class AISystem implements System {
    private game: PongGame;
    private aiPaddle!: Paddle;
    private targetBall: Ball | null = null;
    
    private lastUpdateTime: number = 0;
    private UPDATE_INTERVAL: number = 1000;

    private aiSpeed: number = 30;
    private accuracy: number = 0.85;
    private reactionDeadZone: number = 50;
    
    // AI decision state
    private targetPosition: number = 0;
    private currentDecision: 'up' | 'down' | 'stop' = 'stop';

    constructor(game: PongGame) {
        this.game = game;
        this.lastUpdateTime = Date.now();
        this.targetPosition = this.game.height / 2;
        
        this.findAIPaddle();
        setTimeout(() => this.findAIPaddle(), 200);
    }

    private findAIPaddle(): void {
		for (const entity of this.game.entities) {
			if (entity instanceof Paddle && entity.id === 'paddleR' && this.game.config.variant === '1vAI') {
				this.aiPaddle = entity;
				entity.isAI = true;
				
				const paddlePhysics = entity.getComponent('physics') as PhysicsComponent;
				if (paddlePhysics) {
					paddlePhysics.speed = this.aiSpeed;
				}
							
				return;
			}
		}
		
		if (!this.aiPaddle) {
			setTimeout(() => this.findAIPaddle(), 500);
		}
	}

    private findBall(): Ball | null {
        for (const entity of this.game.entities) {
            if (entity instanceof Ball && entity.isGoodBall) {
                return entity;
            }
        }
        return null;
    }

    update(entities: Entity[], frameData: FrameData): void {
        if (!this.aiPaddle || this.game.config.variant !== '1vAI') {
            return;
        }

        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
        
        if (timeSinceLastUpdate >= this.UPDATE_INTERVAL) {
            this.lastUpdateTime = currentTime;
            this.makeAIDecision();
        }

        this.executeAIDecision(frameData);
    }

    private makeAIDecision(): void {
        this.targetBall = this.findBall();
        
        if (!this.targetBall || !this.aiPaddle) {
            this.targetPosition = this.game.height / 2;
            return;
        }

        const ballPhysics = this.targetBall.getComponent('physics') as PhysicsComponent;
        const paddlePhysics = this.aiPaddle.getComponent('physics') as PhysicsComponent;

        if (!ballPhysics || !paddlePhysics) {
            this.targetPosition = this.game.height / 2;
            return;
        }

        const paddleX = paddlePhysics.x;

        this.targetPosition = this.predictBallInterception(ballPhysics, paddleX);
        
        if (this.accuracy < 1.0) {
            const maxError = (1.0 - this.accuracy) * 60;
            const error = (Math.random() - 0.5) * maxError;
            this.targetPosition += error;
        }

        const paddleHalfHeight = paddlePhysics.height / 2;
        const topWall = 80;
        const bottomWall = this.game.height - 80;
        
        this.targetPosition = Math.max(topWall + paddleHalfHeight, 
                                     Math.min(bottomWall - paddleHalfHeight, this.targetPosition));
    }

    private predictBallInterception(ballPhysics: PhysicsComponent, paddleX: number): number {
        let ballX = ballPhysics.x;
        let ballY = ballPhysics.y;
        let ballVelX = ballPhysics.velocityX;
        let ballVelY = ballPhysics.velocityY;

        if (ballVelX <= 0) {
            return ballY;
        }

        const distanceToTravel = paddleX - ballX;
        if (distanceToTravel <= 0 || ballVelX <= 0) {
            return ballY;
        }

        const timeToReach = distanceToTravel / ballVelX;

        let predictedY = ballY + (ballVelY * timeToReach);

        const topWall = 80;
        const bottomWall = this.game.height - 80;
        
        let currentVelY = ballVelY;
        let currentY = predictedY;
        
        while (currentY < topWall || currentY > bottomWall) {
            if (currentY < topWall) {
                const overshoot = topWall - currentY;
                currentY = topWall + overshoot;
                currentVelY = -currentVelY;
            } else if (currentY > bottomWall) {
                // Hit bottom wall
                const overshoot = currentY - bottomWall;
                currentY = bottomWall - overshoot;
                currentVelY = -currentVelY;
            }
        }

        return currentY;
    }

    private executeAIDecision(frameData: FrameData): void {
		if (!this.aiPaddle) return;
	
		const paddlePhysics = this.aiPaddle.getComponent('physics') as PhysicsComponent;
		if (!paddlePhysics) return;
	
		const currentY = paddlePhysics.y;
		const deltaY = this.targetPosition - currentY;
		const distance = Math.abs(deltaY);
	
		const inputComponent = this.aiPaddle.getComponent('input') as InputComponent;
		if (inputComponent) {
		
			if (distance < this.reactionDeadZone) {
				// Stop
				inputComponent.upPressed = false;
				inputComponent.downPressed = false;
				this.currentDecision = 'stop';
			} else if (deltaY > 0) {
				// Move down
				inputComponent.upPressed = false;
				inputComponent.downPressed = true;
				this.currentDecision = 'down';
			} else {
				// Move up
				inputComponent.upPressed = true;
				inputComponent.downPressed = false;
				this.currentDecision = 'up';
			}
		} else {
			console.error('AI paddle has no input component!');
		}
	}

	public setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
		switch (difficulty) {
			case 'easy':
				this.aiSpeed = 10;
				this.accuracy = 0.7;
				this.reactionDeadZone = 25;
				break;
			case 'medium':
				this.aiSpeed = 8;
				this.accuracy = 0.85;
				this.reactionDeadZone = 15;
				break;
			case 'hard':
				this.aiSpeed = 12;
				this.accuracy = 0.95;
				this.reactionDeadZone = 8;
				break;
		}
		
		if (this.aiPaddle) {
			const paddlePhysics = this.aiPaddle.getComponent('physics') as PhysicsComponent;
			if (paddlePhysics) {
				paddlePhysics.speed = this.aiSpeed;
			}
		}
	}
}