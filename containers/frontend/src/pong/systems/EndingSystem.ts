/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EndingSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/27 16:28:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/19 20:03:49 by hmunoz-g         ###   ########.fr       */
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
import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';
import { GAME_COLORS } from '../utils/Types';
import { isPlayerWinner } from '../utils/Utils';

export class EndingSystem implements System {
	private game: PongGame;
	private UI!: UI;
	private ended: boolean = false;
	private endingProcessed: boolean = false;
	private isOnlineGame: boolean = false;

	constructor(game: PongGame) {
		this.game = game;
		this.isOnlineGame = game.isOnline;
		
		for (const entity of this.game.entities) {
			if (isUI(entity)) this.UI = entity;
		}
	}

	update(entities: Entity[]) {
		if (!this.endingProcessed) {
			if (this.isOnlineGame && this.game.config.classicMode) {
				// For online games, check if server has declared the game ended OR if forced
				if ((this as any).ended || this.game.hasEnded) {
					console.log('Online game ended by server or forced trigger');
					console.log('Current UI scores:', this.UI.leftScore, 'vs', this.UI.rightScore);
					this.setGameResults();
					this.ended = true;
				} else {
					this.checkOnlineGameEnd();
				}
			} else {
				this.checkLocalGameEnd();
			}
		}
	
		if (this.ended && !this.endingProcessed) {
			this.processGameEnd();
		}
	}

	//! SET CORRECT ENDING CONDITIONS BEFORE TURNING IN

	private checkOnlineGameEnd(): void {
		if (this.UI.leftScore >= 3 || this.UI.rightScore >= 3) {
			const scoreDiff = Math.abs(this.UI.leftScore - this.UI.rightScore);
			if (scoreDiff >= 2) {
				this.setGameResults();
				this.ended = true;
			}
		}

		if (this.UI.leftScore === 2 && this.UI.rightScore === 2) {
			this.setGameResults();
				this.ended = true;
		}
		
		if (this.UI.leftScore >= 21 || this.UI.rightScore >= 21) {
			this.setGameResults();
			this.ended = true;
		}
	}

	private checkLocalGameEnd(): void {
		if (this.UI.leftScore >= 1 && this.UI.rightScore < 2) {
			this.game.data.leftPlayer.result = 'win';
			this.game.data.rightPlayer.result = 'lose';
			this.ended = true;
		} else if (this.UI.rightScore >= 1 && this.UI.leftScore < 2) {
			this.game.data.rightPlayer.result = 'win';
			this.game.data.leftPlayer.result = 'lose';
			this.ended = true;
		} else if (this.UI.leftScore === 1 && this.UI.rightScore === 1) {
			this.game.data.leftPlayer.result = 'draw';
			this.game.data.rightPlayer.result = 'draw';
			this.ended = true;
		}
	
		if (this.game.config.variant === 'tournament' && this.game.tournamentManager.getHasActiveTournament() && 
			(this.game.data.leftPlayer.result === 'win' || this.game.data.rightPlayer.result === 'win')) {
			
			const winnerName = this.game.data.leftPlayer.result === 'win' ? 
				this.game.data.leftPlayer.name : 
				this.game.data.rightPlayer.name;
			
			// Get the current match from the tournament config, not the manager
			const config = this.game.tournamentManager.getTournamentConfig()!;
			const currentMatch = config.nextMatch.matchOrder;
			
			console.log(`Completing match ${currentMatch} with winner: ${winnerName}`);
			
			// Update match winners
			config.matchWinners[`match${currentMatch}Winner` as keyof typeof config.matchWinners] = winnerName;
			
			// Update tournament structure based on current match
			if (currentMatch <= 4) {
				const secondRoundKey = `player${currentMatch}` as keyof typeof config.secondRoundPlayers;
				config.secondRoundPlayers[secondRoundKey] = winnerName;
			}
			else if (currentMatch <= 6) {
				const roundPosition = currentMatch - 4;
				const finalRoundKey = `player${roundPosition}` as keyof typeof config.thirdRoundPlayers;
				config.thirdRoundPlayers[finalRoundKey] = winnerName;
				console.log(`Updated third round ${finalRoundKey}: ${winnerName}`);
			}
			else if (currentMatch === 7) {
				config.tournamentWinner = winnerName;
				config.isFinished = true;
				console.log(`Tournament finished! Winner: ${winnerName}`);
			}
			
			// Update the tournament manager's state
			this.game.tournamentManager.updateTournament(config);
			
			// Advance to next match if not finished
			if (!config.isFinished) {
				const hasNextMatch = this.game.tournamentManager.advanceMatch();
				if (hasNextMatch) {
					config.nextMatch.matchOrder = currentMatch + 1;
					console.log(`Advanced to match ${config.nextMatch.matchOrder}`);
				}
			}
		}
	}

	private setGameResults(): void {
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
	}

	private processGameEnd(): void {
		if (this.endingProcessed) {
			console.log('Game end already processed, skipping duplicate processing');
			return;
		}

		this.endingProcessed = true;
		
		if (this.game.leftPlayer.isDisconnected === true || this.game.rightPlayer.isDisconnected === true) {
			if (this.game.leftPlayer.isDisconnected === true) {
				this.game.data.winner = this.game.data.rightPlayer.name;
			} else {
				this.game.data.winner = this.game.data.leftPlayer.name;
			}
		} else {
			this.game.data.winner = this.game.data.leftPlayer.result === 'win' ? this.game.data.leftPlayer.name : (this.game.data.rightPlayer.result === 'win' ? this.game.data.rightPlayer.name : null);
		}
		
		this.game.data.finalScore = {
			leftPlayer: this.UI.leftScore,
			rightPlayer: this.UI.rightScore
		};

		this.game.data.leftPlayer.score = this.UI.leftScore;
		this.game.data.rightPlayer.score = this.UI.rightScore;

		if (this.game.data.winner === null) {
			this.game.data.generalResult = 'draw';
		} else {
			this.game.data.generalResult = this.game.data.leftPlayer.result === 'win' ? 'leftWin' : 'rightWin';
		}

		this.game.data.endedAt = new Date().toISOString();
		this.endingProcessed = true;

		if (!this.game.config.classicMode) {
			this.triggerLosingPaddleExplosion();

			if (isPlayerWinner(this.game)) {
				this.triggerFireworks();
			}
		}
		
		if (this.isOnlineGame) {
			this.handleOnlineGameResultSaving();
		} else {
			console.log('Local game ended, no backend save needed');
		}
		
		this.game.hasEnded = true;
		this.displayResults();
	}

	private handleOnlineGameResultSaving(): void {
		/* console.log('Online game ended, checking if should save results...');
		console.log(this.game.config);
		console.log(this.game.data);
		console.log('Current player:', sessionStorage.getItem('username'));
		
		if (sessionStorage.getItem('username') === this.game.config.hostName) {
			console.log('This player is host, saving game results...');
			this.game.saveGameResults();
		} else {
			console.log('This player is guest, host will save results');
		} */
	}

	private triggerFireworks(): void {
		for (let i = 0; i < 75; i++) {
			setTimeout(() => {
				const x = Math.random() * this.game.width;
				const y = Math.random() * (this.game.height * 0.6) + this.game.height * 0.2;
				const color = GAME_COLORS.orange;
				
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
		
		if (!this.game.config.classicMode) {
			this.game.sounds.endGame.play();
		}
		
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

		const headerComponent = this.game.endGameOverlay.getComponent('render', 'headerSprite') as RenderComponent;
			
		if (headerComponent?.graphic) {
			console.log(`Header sprite actual position after creation: (${headerComponent.graphic.x}, ${headerComponent.graphic.y})`);
		}
	
		const endgameRenderComponent = this.game.endGameOverlay.getComponent('render', 'headerGraphic') as RenderComponent;
		this.game.renderLayers.overlays.addChild(endgameRenderComponent.graphic);
		endgameRenderComponent.graphic.alpha = 0;

		const endgameOrnamentRenderComponent = this.game.endGameOverlay.getComponent('render', 'ornamentGraphic') as RenderComponent;
		if (endgameOrnamentRenderComponent?.graphic) {
			this.game.renderLayers.overlays.addChild(endgameOrnamentRenderComponent.graphic);
			endgameOrnamentRenderComponent.graphic.alpha = 0;
		}

		const dashedLineComponents: TextComponent[] = [];
		for (let i = 0; i < 5; i++) {
			const dashedLineComponent = this.game.endGameOverlay.getComponent('text', `dashedLines${i}`) as TextComponent;
			if (dashedLineComponent) {
				this.game.renderLayers.overlays.addChild(dashedLineComponent.getRenderable());
				dashedLineComponent.getRenderable().alpha = 0;
				dashedLineComponents.push(dashedLineComponent);
			}
		}

		const endgameTextComponent = this.game.endGameOverlay.getComponent('text', 'resultText') as TextComponent;
		if (endgameTextComponent) {
			this.game.renderLayers.overlays.addChild(endgameTextComponent.getRenderable());
			endgameTextComponent.getRenderable().alpha = 0;
		}
	
		const headerRenderComponent = this.game.endGameOverlay.getComponent('render', 'headerSprite') as RenderComponent;
		if (headerRenderComponent?.graphic) {
			this.game.renderLayers.overlays.addChild(headerRenderComponent.graphic);
			headerRenderComponent.graphic.alpha = 0;
		}
	
		const headerTextComponent = this.game.endGameOverlay.getComponent('text', 'headerText') as TextComponent;
		if (headerTextComponent) {
			this.game.renderLayers.overlays.addChild(headerTextComponent.getRenderable());
			headerTextComponent.getRenderable().alpha = 0;
		}
	
		const leftAvatarComponent = this.game.endGameOverlay.getComponent('render', 'leftAvatar') as RenderComponent;
		if (leftAvatarComponent?.graphic) {
			this.game.renderLayers.overlays.addChild(leftAvatarComponent.graphic);
			leftAvatarComponent.graphic.alpha = 0;
		}
	
		const rightAvatarComponent = this.game.endGameOverlay.getComponent('render', 'rightAvatar') as RenderComponent;
		if (rightAvatarComponent?.graphic) {
			this.game.renderLayers.overlays.addChild(rightAvatarComponent.graphic);
			rightAvatarComponent.graphic.alpha = 0;
		}

		const leftPlayerTextComponent = this.game.endGameOverlay.getComponent('text', 'leftPlayerName') as TextComponent;
		if (leftPlayerTextComponent) {
			this.game.renderLayers.overlays.addChild(leftPlayerTextComponent.getRenderable());
			leftPlayerTextComponent.getRenderable().alpha = 0;
		}

		const rightPlayerTextComponent = this.game.endGameOverlay.getComponent('text', 'rightPlayerName') as TextComponent;
		if (rightPlayerTextComponent) {
			this.game.renderLayers.overlays.addChild(rightPlayerTextComponent.getRenderable());
			rightPlayerTextComponent.getRenderable().alpha = 0;
		}

		const upperLegendComponent = this.game.endGameOverlay.getComponent('text', 'upperLegend') as TextComponent;
		if (upperLegendComponent) {
			this.game.renderLayers.overlays.addChild(upperLegendComponent.getRenderable());
			upperLegendComponent.getRenderable().alpha = 0;
		}

		const upperLegendTextComponent = this.game.endGameOverlay.getComponent('text', 'upperLegendText') as TextComponent;
		if (upperLegendTextComponent) {
			this.game.renderLayers.overlays.addChild(upperLegendTextComponent.getRenderable());
			upperLegendTextComponent.getRenderable().alpha = 0;
		}

		const lowerLegendComponent = this.game.endGameOverlay.getComponent('text', 'lowerLegend') as TextComponent;
		if (lowerLegendComponent) {
			this.game.renderLayers.overlays.addChild(lowerLegendComponent.getRenderable());
			lowerLegendComponent.getRenderable().alpha = 0;
		}

		const lowerLegendTextComponent = this.game.endGameOverlay.getComponent('text', 'lowerLegendText') as TextComponent;
		if (lowerLegendTextComponent) {
			this.game.renderLayers.overlays.addChild(lowerLegendTextComponent.getRenderable());
			lowerLegendTextComponent.getRenderable().alpha = 0;
		}

		const statsLegendComponent = this.game.endGameOverlay.getComponent('text', 'statsLegend') as TextComponent;
		if (statsLegendComponent) {
			this.game.renderLayers.overlays.addChild(statsLegendComponent.getRenderable());
			statsLegendComponent.getRenderable().alpha = 0;
		}

		const playerStatComponents: TextComponent[] = [];
		for (let i = 0; i < this.game.endGameOverlay.playerStats.length; i++) {
			const playerStatComponent = this.game.endGameOverlay.getComponent('text', `playerStat${i}`) as TextComponent;
			if (playerStatComponent) {
				this.game.renderLayers.overlays.addChild(playerStatComponent.getRenderable());
				playerStatComponent.getRenderable().alpha = 0;
				playerStatComponents.push(playerStatComponent);
			}
		}

		const gameQuitButtonComponent = this.game.endGameOverlay.getComponent('render', 'gameQuitButton') as RenderComponent;
		if (gameQuitButtonComponent?.graphic) {
			this.game.renderLayers.overlays.addChild(gameQuitButtonComponent.graphic);
			gameQuitButtonComponent.graphic.alpha = 0;
		}

		this.animateAllElementsFadeIn(
			endgameRenderComponent,
			endgameOrnamentRenderComponent,
			endgameTextComponent, 
			headerRenderComponent, 
			headerTextComponent,
			leftAvatarComponent,
			rightAvatarComponent,
			leftPlayerTextComponent,
			rightPlayerTextComponent,
			dashedLineComponents,
			upperLegendComponent,
			upperLegendTextComponent,
			lowerLegendComponent,
			lowerLegendTextComponent,
			statsLegendComponent,
			playerStatComponents,
			gameQuitButtonComponent
		);
	}

	private animateAllElementsFadeIn(
		overlayGraphicsComponent: RenderComponent,
		overlayOrnamentComponent: RenderComponent | null,
		resultTextComponent: TextComponent | null, 
		headerSpriteComponent: RenderComponent | null, 
		headerTextComponent: TextComponent | null,
		leftAvatarComponent: RenderComponent | null,
		rightAvatarComponent: RenderComponent | null,
		leftPlayerTextComponent: TextComponent | null,
		rightPlayerTextComponent: TextComponent | null,
		dashedLineComponents: TextComponent[],
		upperLegendComponent: TextComponent | null,
		upperLegendTextComponent: TextComponent | null,
		lowerLegendComponent: TextComponent | null,
		lowerLegendTextComponent: TextComponent | null,
		statsLegendComponent: TextComponent | null,
		playerStatComponents: TextComponent[],
		gameQuitButtonComponent: RenderComponent | null
	): void {
		const fadeSpeed = 0.02;
		
		const animate = () => {
			let allComplete = true;
	
			if (overlayGraphicsComponent.graphic.alpha < 1) {
				overlayGraphicsComponent.graphic.alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (overlayOrnamentComponent?.graphic && overlayOrnamentComponent.graphic.alpha < 1) {
				overlayOrnamentComponent.graphic.alpha += fadeSpeed;
				allComplete = false;
			}
	
			dashedLineComponents.forEach(dashedLineComponent => {
				if (dashedLineComponent && dashedLineComponent.getRenderable().alpha < 1) {
					dashedLineComponent.getRenderable().alpha += fadeSpeed;
					allComplete = false;
				}
			});
	
			if (resultTextComponent && resultTextComponent.getRenderable().alpha < 1) {
				resultTextComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (headerSpriteComponent?.graphic && headerSpriteComponent.graphic.alpha < 1) {
				headerSpriteComponent.graphic.alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (headerTextComponent && headerTextComponent.getRenderable().alpha < 1) {
				headerTextComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (leftPlayerTextComponent && leftPlayerTextComponent.getRenderable().alpha < 1) {
				leftPlayerTextComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (rightPlayerTextComponent && rightPlayerTextComponent.getRenderable().alpha < 1) {
				rightPlayerTextComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (leftAvatarComponent?.graphic && leftAvatarComponent.graphic.alpha < 1) {
				leftAvatarComponent.graphic.alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (rightAvatarComponent?.graphic && rightAvatarComponent.graphic.alpha < 1) {
				rightAvatarComponent.graphic.alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (upperLegendComponent && upperLegendComponent.getRenderable().alpha < 1) {
				upperLegendComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (upperLegendTextComponent && upperLegendTextComponent.getRenderable().alpha < 1) {
				upperLegendTextComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (lowerLegendComponent && lowerLegendComponent.getRenderable().alpha < 1) {
				lowerLegendComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (lowerLegendTextComponent && lowerLegendTextComponent.getRenderable().alpha < 1) {
				lowerLegendTextComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (statsLegendComponent && statsLegendComponent.getRenderable().alpha < 1) {
				statsLegendComponent.getRenderable().alpha += fadeSpeed;
				allComplete = false;
			}
	
			playerStatComponents.forEach(playerStatComponent => {
				if (playerStatComponent && playerStatComponent.getRenderable().alpha < 1) {
					playerStatComponent.getRenderable().alpha += fadeSpeed;
					allComplete = false;
				}
			});
	
			if (gameQuitButtonComponent?.graphic && gameQuitButtonComponent.graphic.alpha < 1) {
				gameQuitButtonComponent.graphic.alpha += fadeSpeed;
				allComplete = false;
			}
	
			if (!allComplete) {
				requestAnimationFrame(animate);
			} else {
				overlayGraphicsComponent.graphic.alpha = 1;
				if (overlayOrnamentComponent?.graphic) overlayOrnamentComponent.graphic.alpha = 1;
				if (resultTextComponent) resultTextComponent.getRenderable().alpha = 1;
				if (headerSpriteComponent?.graphic) headerSpriteComponent.graphic.alpha = 1;
				if (headerTextComponent) headerTextComponent.getRenderable().alpha = 1;
				if (leftAvatarComponent?.graphic) leftAvatarComponent.graphic.alpha = 1;
				if (rightAvatarComponent?.graphic) rightAvatarComponent.graphic.alpha = 1;
				if (leftPlayerTextComponent) leftPlayerTextComponent.getRenderable().alpha = 1;
				if (rightPlayerTextComponent) rightPlayerTextComponent.getRenderable().alpha = 1;
				
				dashedLineComponents.forEach(dashedLineComponent => {
					if (dashedLineComponent) dashedLineComponent.getRenderable().alpha = 1;
				});
	
				if (upperLegendComponent) upperLegendComponent.getRenderable().alpha = 1;
				if (upperLegendTextComponent) upperLegendTextComponent.getRenderable().alpha = 1;
				if (lowerLegendComponent) lowerLegendComponent.getRenderable().alpha = 1;
				if (lowerLegendTextComponent) lowerLegendTextComponent.getRenderable().alpha = 1;
				if (statsLegendComponent) statsLegendComponent.getRenderable().alpha = 1;
				
				playerStatComponents.forEach(playerStatComponent => {
					if (playerStatComponent) playerStatComponent.getRenderable().alpha = 1;
				});
	
				if (gameQuitButtonComponent?.graphic) gameQuitButtonComponent.graphic.alpha = 1;
			}
		};
		
		animate();
	}

	cleanup(): void {
		this.ended = false;
		this.endingProcessed = false;
		
		if (this.UI) {
			this.UI.leftScore = 0;
			this.UI.rightScore = 0;
		}
		
		console.log('EndingSystem cleanup completed');
	}
}