/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EndingSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/27 16:28:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 14:56:21 by hmunoz-g         ###   ########.fr       */
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
            
            this.triggerLosingPaddleExplosion();
            
            this.game.saveGameResults();
            this.game.hasEnded = true;
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
}