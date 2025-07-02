/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   endGameOverlay.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/01 15:09:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/02 18:48:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Sprite } from "pixi.js";

import { PongGame } from "../../engine/Game";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { ImageManager } from "../../managers/ImageManager";

import { Entity } from "../../engine/Entity";
import { GAME_COLORS } from "../../utils/Types";

export class EndgameOverlay extends Entity {
    game: PongGame;
    overlayGraphics: Graphics = new Graphics();
    resultText: any;
    headerSprite!: Sprite;
    
    // Store original parameters
    private originalX: number;
    private originalY: number;
    private originalWidth: number;
    private originalHeight: number;
    
    constructor (game: PongGame, id: string, layer: string, x: number, y: number, width: number = 1000, height: number = 400) {
        super(id, layer);
        this.game = game;

        // Store the parameters
        this.originalX = x;
        this.originalY = y;
        this.originalWidth = width;
        this.originalHeight = height;

        this.createOverlayGraphics(game, x, y, width, height, 20);
        const headerRenderComponent = new RenderComponent(this.overlayGraphics);
        this.addComponent(headerRenderComponent, 'headerGraphic');

        this.createHeaderSprite();
        this.resultText = this.getResultText();
        const textComponent = new TextComponent(this.resultText);
        this.addComponent(textComponent, 'resultText');
    }

    redraw(): void {
        const updatedHeaderSprite = this.getHeaderSprite();
        if (updatedHeaderSprite) {
            const updatedHeaderComponent = new RenderComponent(updatedHeaderSprite);
            this.replaceComponent('render', updatedHeaderComponent, 'headerSprite');
            this.headerSprite = updatedHeaderSprite;
        }

        const updatedResultText = this.getResultText();
        const updatedTextComponent = new TextComponent(updatedResultText);
        this.replaceComponent('text', updatedTextComponent, 'resultText');
        this.resultText = updatedResultText;

        // Use stored parameters instead of cleared graphics properties
        this.overlayGraphics.clear();
        this.createOverlayGraphics(this.game, this.originalX, this.originalY, this.originalWidth, this.originalHeight, 20);
        
        // Update the render component
        const updatedGraphicsComponent = new RenderComponent(this.overlayGraphics);
        this.replaceComponent('render', updatedGraphicsComponent, 'headerGraphic');
    }

    private createHeaderSprite(): void {
        const headerSprite = this.getHeaderSprite();
        if (headerSprite) {
            this.headerSprite = headerSprite;
            const headerRenderComponent = new RenderComponent(this.headerSprite);
            this.addComponent(headerRenderComponent, 'headerSprite');
        }
    }

    private getHeaderSprite(): Sprite | null {
        const isWinner = this.isPlayerWinner();
        const language = this.game.language || 'en';
        
        let assetName: string;
        
        if (this.game.config.classicMode) {
            assetName = isWinner ? `victoryHeader${language.toUpperCase()}White` : `defeatHeader${language.toUpperCase()}White`;
        } else {
            if (isWinner) {
                assetName = `victoryHeader${language.toUpperCase()}Green`;
            } else {
                assetName = `defeatHeader${language.toUpperCase()}Red`;
            }
        }
        
        const headerSprite = ImageManager.createSprite(assetName);
        if (headerSprite) {
            headerSprite.anchor.set(0.5, 0.5);
            headerSprite.x = this.game.width / 2;
            headerSprite.y = this.game.height / 2 - 175;
            headerSprite.alpha = 0;
            
            return headerSprite;
        }
        
        console.warn(`Failed to create header sprite for asset: ${assetName}`);
        return null;
    }
	
	isPlayerWinner(): boolean {
		const username = sessionStorage.getItem('username') || "Player 1";
		
		if (this.game.data.winner === username) {
			return true;
		}
		
		const trimmedUsername = username.trim();
		
		if (this.game.data.leftPlayer.name.trim() === trimmedUsername) {
			return this.game.data.leftPlayer.result === 'win';
		} else if (this.game.data.rightPlayer.name.trim() === trimmedUsername) {
			return this.game.data.rightPlayer.result === 'win';
		}
		
		console.warn(`Player ${username} not found in game data.`);
		return false;
	}
	private createOverlayGraphics(game: PongGame, x: number, y: number, width: number, height: number, headerHeight: number){
		const container = new Graphics();

		const background = new Graphics();
		background.rect(x - 2, y + 20.8, width + 2, height - 20.8 );
		background.fill ( { color: GAME_COLORS.black } );
		container.addChild(background);

		const frame = new Graphics();
		frame.moveTo(x, y + 40);
		frame.lineTo(x, y + height);
		frame.lineTo(x + width, y + height);
		frame.lineTo(x + width, y + 40);
		frame.stroke ( { color: this.isPlayerWinner() ? GAME_COLORS.green : GAME_COLORS.red, width: 5 } )
		container.addChild(frame);

		this.overlayGraphics = container;
	}

	getResultText(): any {
		const isWinner = this.isPlayerWinner();
		const isDraw = this.game.data.generalResult === 'draw';
		console.log(`isWinner: ${isWinner}, isDraw: ${isDraw}`);
		
		let text: string;
		let color: number;
		
		if (isDraw) {
			text = "You Tied!";
			color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
		} else if (isWinner) {
			text = "You won!";
			color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.green;
		} else {
			text = "You lost!";
			color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.red;
		}
		
		return {
			text: text,
			x: this.game.width / 2,
			y: this.game.height / 2 - 100,
			style: {
				fill: { color: color },
				fontSize: 75,
				fontWeight: 'lighter' as const,
				fontFamily: 'anatol-mn',
			},
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	cleanup(): void {
		if (this.headerSprite) {
			if (this.headerSprite.parent) {
				this.headerSprite.parent.removeChild(this.headerSprite);
			}
			this.headerSprite.destroy();
		}
		
		if (this.overlayGraphics) {
			if (this.overlayGraphics.parent) {
				this.overlayGraphics.parent.removeChild(this.overlayGraphics);
			}
			this.overlayGraphics.destroy();
		}
	}
}