/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EndingSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/27 16:28:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/02 18:48:19 by hmunoz-g         ###   ########.fr       */
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

    constructor(game: PongGame) {
        this.game = game;
        
        for (const entity of this.game.entities) {
            if (isUI(entity)) this.UI = entity;
        }
    }

    update(entities: Entity[]) {
        if (!this.endingProcessed) {
            if (this.UI.leftScore >= 2 && this.UI.rightScore < 1) {
                this.game.data.leftPlayer.result = 'win';
                this.game.data.rightPlayer.result = 'lose';
                this.ended = true;
            } else if (this.UI.rightScore >= 2 && this.UI.leftScore < 1) {
                this.game.data.rightPlayer.result = 'win';
                this.game.data.leftPlayer.result = 'lose';
                this.ended = true;
            }
        
            if (this.UI.leftScore > 5 && this.UI.rightScore < this.UI.leftScore - 2) {
                this.game.data.leftPlayer.result = 'win';
                this.game.data.rightPlayer.result = 'lose';
                this.ended = true;
            } else if (this.UI.rightScore > 5 && this.UI.leftScore < this.UI.rightScore - 2) {
                this.game.data.rightPlayer.result = 'win';
                this.game.data.leftPlayer.result = 'lose';
                this.ended = true;
            }
        
            if (this.UI.leftScore >= 20 && this.UI.rightScore >= 20) {
                this.game.data.rightPlayer.result = 'draw';
                this.game.data.leftPlayer.result = 'draw';
                this.ended = true;
            }
        }
    
        if (this.ended && !this.endingProcessed) {
            this.game.data.winner = this.game.data.leftPlayer.result === 'win' ? this.game.data.leftPlayer.name : this.game.data.rightPlayer.name;
            
            this.game.data.finalScore = {
                leftPlayer: this.UI.leftScore,
                rightPlayer: this.UI.rightScore
            };
    
            if (this.game.data.winner === null) {
                this.game.data.generalResult = 'draw';
            } else {
                this.game.data.generalResult = this.game.data.leftPlayer.result === 'win' ? 'leftWin' : 'rightWin';
            }
    
            this.game.data.endedAt = new Date().toISOString();
            this.endingProcessed = true;
            
            if (!this.game.config.classicMode) {
                this.triggerLosingPaddleExplosion();

                if (this.game.endGameOverlay.isPlayerWinner()) {
                    for (let i = 0; i < 75; i++) {
                        setTimeout(() => {
                            const x = Math.random() * this.game.width;
                            const y = Math.random() * (this.game.height * 0.6) + this.game.height * 0.2;
                            const color = GAME_COLORS.orange;
                            
                            ParticleSpawner.spawnFireworksExplosion(this.game, x, y, color, 1.5);
                        }, i * 300);
                    }
                }
            }
            
            this.game.saveGameResults();
            this.game.hasEnded = true;

            this.displayResults();
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
		
	
		ParticleSpawner.spawnPaddleExplosion(
			this.game,
			paddleX,
			paddleY,
			paddleWidth,
			paddleHeight,
			isLeftPaddle,
			playerName
		);
	}

    displayResults(): void {
        this.game.endGameOverlay.redraw();
        
        this.game.renderLayers.alphaFade.addChild(this.game.alphaFade);
    
        // Get the main overlay graphics
        const endgameRenderComponent = this.game.endGameOverlay.getComponent('render', 'headerGraphic') as RenderComponent;
        this.game.renderLayers.overlays.addChild(endgameRenderComponent.graphic);
    
        // Get the text component
        const endgameTextComponent = this.game.endGameOverlay.getComponent('text', 'resultText') as TextComponent;
        if (endgameTextComponent) {
            this.game.renderLayers.overlays.addChild(endgameTextComponent.getRenderable());
        }
    
        // Get the header sprite component - add debugging
        const headerRenderComponent = this.game.endGameOverlay.getComponent('render', 'headerSprite') as RenderComponent;
        console.log('In displayResults - headerRenderComponent:', headerRenderComponent);
        
        if (headerRenderComponent?.graphic) {
            console.log('Adding header sprite to overlays');
            this.game.renderLayers.overlays.addChild(headerRenderComponent.graphic);
            
            headerRenderComponent.graphic.alpha = 0;
            this.animateHeaderFadeIn(headerRenderComponent.graphic);
        } else {
            console.warn('Header sprite component not found or has no graphic');
            // List all components for debugging
            console.log('Available components:', this.game.endGameOverlay.components);
        }
    }

    private animateHeaderFadeIn(headerSprite: any): void {
        const fadeSpeed = 0.02;
        const animate = () => {
            headerSprite.alpha += fadeSpeed;
            if (headerSprite.alpha < 1) {
                requestAnimationFrame(animate);
            } else {
                headerSprite.alpha = 1;
            }
        };
        animate();
    }
}