/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EndingSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/27 16:28:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 16:16:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import { PongGame } from '../engine/Game';

import { System } from '../engine/System';
import { UI } from '../entities/UI';
import { Paddle } from '../entities/Paddle';

import { PhysicsComponent } from '../components/PhysicsComponent';

import { ParticleSpawner } from '../spawners/ParticleSpawner';

import { isUI } from '../utils/Guards';
import { getRandomGameColor } from '../utils/MenuUtils';
import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';
import { GAME_COLORS } from '../utils/Types';

export class EndingSystem implements System {
    private game: PongGame;
    private UI!: UI;
    private ended: boolean = false;
    private endingProcessed: boolean = false;
    private isOnlineGame: boolean = false;

    constructor(game: PongGame) {
        this.game = game;
        this.isOnlineGame = game.config.mode === 'online';
        
        for (const entity of this.game.entities) {
            if (isUI(entity)) this.UI = entity;
        }
    }

    update(entities: Entity[]) {
        if (!this.endingProcessed) {
            // For online games, don't check win conditions - backend handles this
            if (this.isOnlineGame) {
                // Only process if backend has sent game end signal
                if (this.game.hasReceivedGameEnd) {
                    this.ended = true;
                }
            } else {
                // Local game logic - use proper win conditions
                this.checkLocalGameWinConditions();
            }
        }
    
        if (this.ended && !this.endingProcessed) {
            this.processGameEnd();
        }
    }

    private checkLocalGameWinConditions() {
        const winScore = 11; // Proper pong winning score
        
        // Standard win condition: first to 11 points
        if (this.UI.leftScore >= winScore && this.UI.rightScore < winScore - 1) {
            this.game.data.leftPlayer.result = 'win';
            this.game.data.rightPlayer.result = 'lose';
            this.ended = true;
        } else if (this.UI.rightScore >= winScore && this.UI.leftScore < winScore - 1) {
            this.game.data.rightPlayer.result = 'win';
            this.game.data.leftPlayer.result = 'lose';
            this.ended = true;
        }
        
        // Deuce situation: need 2-point lead after 10-10
        else if (this.UI.leftScore >= 10 && this.UI.rightScore >= 10) {
            if (Math.abs(this.UI.leftScore - this.UI.rightScore) >= 2) {
                if (this.UI.leftScore > this.UI.rightScore) {
                    this.game.data.leftPlayer.result = 'win';
                    this.game.data.rightPlayer.result = 'lose';
                } else {
                    this.game.data.rightPlayer.result = 'win';
                    this.game.data.leftPlayer.result = 'lose';
                }
                this.ended = true;
            }
        }
        
        // Maximum score limit (prevent infinite games)
        if (this.UI.leftScore >= 25 || this.UI.rightScore >= 25) {
            if (this.UI.leftScore > this.UI.rightScore) {
                this.game.data.leftPlayer.result = 'win';
                this.game.data.rightPlayer.result = 'lose';
            } else if (this.UI.rightScore > this.UI.leftScore) {
                this.game.data.rightPlayer.result = 'win';
                this.game.data.leftPlayer.result = 'lose';
            } else {
                this.game.data.leftPlayer.result = 'draw';
                this.game.data.rightPlayer.result = 'draw';
            }
            this.ended = true;
        }
    }

    // Method called by network manager when backend sends game end
    public processOnlineGameEnd(gameEndData: any) {
        if (!this.isOnlineGame) return;
        
        // Update scores from backend
        this.UI.leftScore = gameEndData.finalScore.leftPlayer;
        this.UI.rightScore = gameEndData.finalScore.rightPlayer;
        
        // Update game results from backend
        this.game.data.leftPlayer.result = gameEndData.leftPlayer.result;
        this.game.data.rightPlayer.result = gameEndData.rightPlayer.result;
        this.game.data.winner = gameEndData.winner;
        this.game.data.generalResult = gameEndData.generalResult;
        
        // Signal that backend has determined game end
        this.game.hasReceivedGameEnd = true;
        this.ended = true;
    }

    private processGameEnd() {
        // Common game end processing for both local and online
        this.game.data.finalScore = {
            leftPlayer: this.UI.leftScore,
            rightPlayer: this.UI.rightScore
        };

        if (!this.game.data.winner) {
            this.game.data.winner = this.game.data.leftPlayer.result === 'win' 
                ? this.game.data.leftPlayer.name 
                : this.game.data.rightPlayer.name;
        }

        if (!this.game.data.generalResult) {
            if (this.game.data.leftPlayer.result === 'draw') {
                this.game.data.generalResult = 'draw';
            } else {
                this.game.data.generalResult = this.game.data.leftPlayer.result === 'win' ? 'leftWin' : 'rightWin';
            }
        }

        this.game.data.endedAt = new Date().toISOString();
        this.endingProcessed = true;
        
        this.triggerLosingPaddleExplosion();
        this.createFireworks();
        
        // Only save results for local games (online games are saved by backend)
        if (!this.isOnlineGame) {
            this.game.saveGameResults();
        }
        
        this.game.hasEnded = true;
        this.displayResults();
    }

    private createFireworks() {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const x = Math.random() * this.game.width;
                const y = Math.random() * (this.game.height * 0.6) + this.game.height * 0.2;
                const color = this.game.data.generalResult === 'draw' 
                    ? GAME_COLORS.blue 
                    : GAME_COLORS.red; // You can make this dynamic based on winner
                
                ParticleSpawner.spawnFireworksExplosion(this.game, x, y, color, 1.5);
            }, i * 300);
        }
    }

    private triggerLosingPaddleExplosion(): void {
		let losingPaddleId: string;
		let playerName: string;
		
		if (this.game.data.leftPlayer.result === 'lose') {
			losingPaddleId = 'paddleL';
			playerName = this.game.data.leftPlayer.name;
		} else if (this.game.data.rightPlayer.result === 'lose') {
			losingPaddleId = 'paddleR';
			playerName = this.game.data.rightPlayer.name;
		} else {
			return;
		}
		
		const losingPaddle = this.game.entities.find(e => e.id === losingPaddleId) as Paddle;
		if (!losingPaddle) {
			console.error(`Could not find losing paddle: ${losingPaddleId}`);
			return;
		}
	
		const paddleRenderComponent = losingPaddle.getComponent('render') as RenderComponent;
		const paddleTextComponent = losingPaddle.getComponent('text') as TextComponent;
		this.game.renderLayers.hidden.addChild(paddleRenderComponent!.graphic);
		this.game.renderLayers.hidden.addChild(paddleTextComponent.getRenderable());
		
		const paddlePhysics = losingPaddle.getComponent('physics') as PhysicsComponent;
		if (!paddlePhysics) {
			console.error(`Losing paddle has no physics component: ${losingPaddleId}`);
			return;
		}
		
		const paddleX = paddlePhysics.x;
		const paddleY = paddlePhysics.y;
		const paddleWidth = paddlePhysics.width;
		const paddleHeight = paddlePhysics.height;
		const isLeftPaddle = losingPaddleId === 'paddleL';
		
	
		// Pass the player name to the explosion
		ParticleSpawner.spawnPaddleExplosion(
			this.game,
			paddleX,
			paddleY,
			paddleWidth,
			paddleHeight,
			isLeftPaddle,
			playerName // Add player name parameter
		);
	}

    displayResults(): void {
        this.game.renderLayers.alphaFade.addChild(this.game.alphaFade);

        const endgameRenderComponent = this.game.endGameOverlay.getComponent('render') as RenderComponent;
        this.game.renderLayers.overlays.addChild(endgameRenderComponent.graphic);

        const endgameTextComponent = this.game.endGameOverlay.getComponent('text') as TextComponent;
        this.game.renderLayers.overlays.addChild(endgameTextComponent.getRenderable());
    }
}