/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   endGameOverlay.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/01 15:09:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/03 15:34:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Sprite, Text } from "pixi.js";

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
    headerText: any;
    leftPlayerName: any;
    rightPlayerName: any;
    headerSprite!: Sprite;
    leftAvatarSprite!: Sprite;
    rightAvatarSprite!: Sprite;
    ornamentGraphic: Graphics = new Graphics();
    dashedLines: Text[] = [];
    upperLegend: Text[] = [];
    lowerLegend: Text[] = [];
    statsLegend: Text = new Text;
    playerStats: Text[] = [];
    
    private originalX: number;
    private originalY: number;
    private originalWidth: number;
    private originalHeight: number;
    
    constructor (game: PongGame, id: string, layer: string, x: number, y: number, width: number = 1000, height: number = 400) {
        super(id, layer);
        this.game = game;

        this.originalX = x;
        this.originalY = y;
        this.originalWidth = width;
        this.originalHeight = height;

        this.createOverlayGraphics(game, x, y, width, height, 20);
        const headerRenderComponent = new RenderComponent(this.overlayGraphics);
        this.addComponent(headerRenderComponent, 'headerGraphic');

        this.createOrnamentGraphic();
        const ornamentRenderComponent = new RenderComponent(this.ornamentGraphic);
        this.addComponent(ornamentRenderComponent, 'ornamentGraphic');

        this.dashedLines = this.createDashedLines();
		this.dashedLines.forEach(element => {
			const dashedLinesComponent = new TextComponent(element);
			this.addComponent(dashedLinesComponent, `dashedLines${this.dashedLines.indexOf(element)}`);
		});

        this.upperLegend = this.createUpperLegend();
        const upperLegendComponent = new TextComponent(this.upperLegend[0]);
        this.addComponent(upperLegendComponent, 'upperLegend');
        const upperLegendTextComponent = new TextComponent(this.upperLegend[1]);
        this.addComponent(upperLegendTextComponent, 'upperLegendText');
        
        this.lowerLegend = this.createLowerLegend();
        const lowerLegendComponent = new TextComponent(this.lowerLegend[0]);
        this.addComponent(lowerLegendComponent, 'lowerLegend');
        const lowerLegendTextComponent = new TextComponent(this.lowerLegend[1]);
        this.addComponent(lowerLegendTextComponent, 'lowerLegendText');

        this.statsLegend = this.createStatsLegend();
        const statsLegendComponent = new TextComponent(this.statsLegend);
        this.addComponent(statsLegendComponent, 'statsLegend');

        this.playerStats = this.createPlayerStats();
        this.playerStats.forEach((stat, index) => {
            const playerStatComponent = new TextComponent(stat);
            this.addComponent(playerStatComponent, `playerStat${index}`);
        });

        this.createHeaderSprite();
        this.createAvatarSprites();

        this.resultText = this.getResultText();
        const textComponent = new TextComponent(this.resultText);
        this.addComponent(textComponent, 'resultText');

        this.headerText = this.getHeaderText();
        const headerTextComponent = new TextComponent(this.headerText);
        this.addComponent(headerTextComponent, 'headerText');

        this.leftPlayerName = this.getPlayerName('left');
        const leftPlayerTextComponent = new TextComponent(this.leftPlayerName);
        this.addComponent(leftPlayerTextComponent, 'leftPlayerName');

        this.rightPlayerName = this.getPlayerName('right');
        const rightPlayerTextComponent = new TextComponent(this.rightPlayerName);
        this.addComponent(rightPlayerTextComponent, 'rightPlayerName');
    }

    redraw(): void {
        const updatedHeaderSprite = this.getHeaderSprite();
        if (updatedHeaderSprite) {
            const updatedHeaderComponent = new RenderComponent(updatedHeaderSprite);
            this.replaceComponent('render', updatedHeaderComponent, 'headerSprite');
            this.headerSprite = updatedHeaderSprite;
        }

        this.updateAvatarSprites();

        const updatedResultText = this.getResultText();
        const updatedTextComponent = new TextComponent(updatedResultText);
        this.replaceComponent('text', updatedTextComponent, 'resultText');
        this.resultText = updatedResultText;

        const updatedHeaderText = this.getHeaderText();
        const updatedHeaderTextComponent = new TextComponent(updatedHeaderText);
        this.replaceComponent('text', updatedHeaderTextComponent, 'headerText');
        this.headerText = updatedHeaderText;

        const updatedLeftPlayerName = this.getPlayerName('left');
        const updatedLeftPlayerTextComponent = new TextComponent(updatedLeftPlayerName);
        this.replaceComponent('text', updatedLeftPlayerTextComponent, 'leftPlayerName');
        this.leftPlayerName = updatedLeftPlayerName;

        const updatedRightPlayerName = this.getPlayerName('right');
        const updatedRightPlayerTextComponent = new TextComponent(updatedRightPlayerName);
        this.replaceComponent('text', updatedRightPlayerTextComponent, 'rightPlayerName');
        this.rightPlayerName = updatedRightPlayerName;

        this.overlayGraphics.clear();
        this.createOverlayGraphics(this.game, this.originalX, this.originalY, this.originalWidth, this.originalHeight, 20);

        this.ornamentGraphic.clear();
        this.createOrnamentGraphic();

        const updatedDashedLines = this.createDashedLines();
        updatedDashedLines.forEach((line, index) => {
            const dashedLineComponent = new TextComponent(line);
            this.replaceComponent('text', dashedLineComponent, `dashedLines${index}`);
        });
        this.dashedLines = updatedDashedLines;

        const updatedUpperLegend = this.createUpperLegend();
        const updatedUpperLegendComponent = new TextComponent(updatedUpperLegend[0]);
        this.replaceComponent('text', updatedUpperLegendComponent, 'upperLegend');
        const updatedUpperLegendTextComponent = new TextComponent(updatedUpperLegend[1]);
        this.replaceComponent('text', updatedUpperLegendTextComponent, 'upperLegendText');
        this.upperLegend = updatedUpperLegend;

        const updatedLowerLegend = this.createLowerLegend();
        const updatedLowerLegendComponent = new TextComponent(updatedLowerLegend[0]);
        this.replaceComponent('text', updatedLowerLegendComponent, 'lowerLegend');
        const updatedLowerLegendTextComponent = new TextComponent(updatedLowerLegend[1]);
        this.replaceComponent('text', updatedLowerLegendTextComponent, 'lowerLegendText');
        this.lowerLegend = updatedLowerLegend;

        const updatedStatsLegend = this.createStatsLegend();
        const updatedStatsLegendComponent = new TextComponent(updatedStatsLegend);
        this.replaceComponent('text', updatedStatsLegendComponent, 'statsLegend');
        this.statsLegend = updatedStatsLegend;

        const updatedPlayerStats = this.createPlayerStats();
        updatedPlayerStats.forEach((stat, index) => {
        const playerStatComponent = new TextComponent(stat);
        this.replaceComponent('text', playerStatComponent, `playerStat${index}`);
        });
        this.playerStats = updatedPlayerStats;
        
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
        
        const points = this.getBackgroundPoints(x, y, width, height);
        
        background.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            background.lineTo(points[i].x, points[i].y);
        }
        background.closePath();
        
        background.fill({ color: GAME_COLORS.black });
        container.addChild(background);
    
        let frameColor;
        if (game.config.classicMode) {
            frameColor = GAME_COLORS.white;
        } else {
            frameColor = this.isPlayerWinner() ? GAME_COLORS.green : GAME_COLORS.red;
        }
        
        const frame = new Graphics();
        frame.moveTo(x, y + 40);
        frame.lineTo(x, y + height);
        frame.lineTo(x + width, y + height);
        frame.lineTo(x + width, y + 40);
        frame.stroke({ color: frameColor, width: 5 });
        container.addChild(frame);

        const leftAvatarFrame = new Graphics();
        leftAvatarFrame.rect(462.5, 267.5, 235, 235);
        leftAvatarFrame.rect(1102.5, 267.5, 235, 235);
        leftAvatarFrame.stroke({ color: frameColor, width: 2 });
        container.addChild(leftAvatarFrame);

        const statsUnderlines = new Graphics();
        statsUnderlines.moveTo(750, 330);
        statsUnderlines.lineTo(1050, 330);
        statsUnderlines.moveTo(750, 365);
        statsUnderlines.lineTo(1050, 365);
        statsUnderlines.moveTo(750, 400);
        statsUnderlines.lineTo(1050, 400);
        statsUnderlines.moveTo(750, 435);
        statsUnderlines.lineTo(1050, 435);
        statsUnderlines.moveTo(750, 470);
        statsUnderlines.lineTo(1050, 470);
        statsUnderlines.moveTo(750, 505);
        statsUnderlines.lineTo(1050, 505);
        statsUnderlines.stroke({ color: frameColor, width: 1 });
        container.addChild(statsUnderlines);
    
        this.overlayGraphics = container;
    }

    getHeaderText(): any {
        let text: string;

        switch (this.game.language) {
            case ('en'): {
                text = "MATCH RESULTS";
                break;
            }

            case ('es'): {
                text = "RESULTADOS DE LA PARTIDA";
                break;
            }

            case ('fr'): {
                text = "RÉSULTATS DU MATCH";
                break;
            }

            default: {
                text = "RESULTATS DE LA PARTIDA";
                break;
            }
        }
    
        return {
            text: text,
            x: 405,
            y: 205,
            style: {
                fill: { color: GAME_COLORS.black },
                fontSize: 12,
                fontWeight: 'bolder' as const,
                align: 'left' as const,
                fontFamily: '"Roboto Mono", monospace',
            },
            anchor: { x: 0, y: 0.5 },
        };
    }

	getResultText(): any {
		const isWinner = this.isPlayerWinner();
		const isDraw = this.game.data.generalResult === 'draw';
		console.log(`isWinner: ${isWinner}, isDraw: ${isDraw}`);
		
		let text: string;
		let color: number;
		
		if (isDraw) {
			switch (this.game.language) {
                case ('en'): {
                    text = "You Tied!";
			        color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
                    break;
                }

                case ('es'): {
                    text = "¡Has empatado!";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
                    break;
                }

                case ('fr'): {
                    text = "Match nul !";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
                    break;
                }

                default: {
                    text = "Has empatat!";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
                    break;
                }
            }
 
		} else if (isWinner) {
			switch (this.game.language) {
                case ('en'): {
                    text = "⇢ You won! ⇠";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.green;
                    break;
                }

                case ('es'): {
                    text = "⇢ ¡Has ganado! ⇠";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.green;
                    break;
                }

                case ('fr'): {
                    text = "⇢ Vous avez gagné! ⇠";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.green;
                    break;
                }

                default: {
                    text = "⇢ Has guanyat! ⇠";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.green;
                    break;
                }
            }
		} else {
			switch (this.game.language) {
                case ('en'): {
                    text = "⇢ You lost! ⇠";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.red;
                    break;
                }

                case ('es'): {
                    text = "⇢ ¡Has perdido! ⇠";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.red;
                    break;
                }

                case ('fr'): {
                    text = "⇢ Vous avez perdu! ⇠";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.red;
                    break;
                }

                default: {
                    text = "⇢ Has perdut! ⇠";
                    color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.red;
                    break;
                }
            }
		}
		
		return {
			text: text.toUpperCase(),
			x: this.game.width / 2,
			y: 280,
			style: {
				fill: { color: color },
				fontSize: 22,
				fontWeight: 'lighter' as const,
				fontFamily: 'anatol-mn',
                align: 'center' as const,
			},
			anchor: { x: 0.5, y: 0.5 },
		};
	}

    getPlayerName(side: string): any {
        let text: string;
		let color: number;

        if (this.game.config.classicMode) {
            color = GAME_COLORS.white;
        } else {
            if (this.isPlayerWinner()) {
                color = GAME_COLORS.green;
            } else {
                color = GAME_COLORS.red;
            }
        }

        if (side === 'left') {
            text = this.game.data.leftPlayer.name || "Player 1";
        } else if (side === 'right') {
            text = this.game.data.rightPlayer.name || "Player 2";
        } else {
            console.warn(`Invalid side: ${side}. Defaulting to "Player 1".`);
            text = "Player 1";
        }
        
        return {
			text: text.toUpperCase(),
			x: side === 'left' ? 580 : 1220,
			y: 520,
			style: {
				fill: { color: color },
				fontSize: 20,
				fontWeight: 'lighter' as const,
				fontFamily: 'anatol-mn',
                align: 'center' as const,
			},
			anchor: { x: 0.5, y: 0.5 },
		};
    }

    private getBackgroundPoints(x: number, y: number, width: number, height: number): { x: number, y: number }[] {
        const isWinner = this.isPlayerWinner();
        const language = this.game.language || 'en';
        
        const victoryENPoints = [
            { x: x - 2.2, y: y + 7.45 },
            { x: x - 2.2, y: y + height },
            { x: x + width + 2.2, y: y + height },
            { x: x + width + 2.2, y: y + 7.45 },
            { x: x + width + 2.2 - 158.3, y: y + 7.45 },
            { x: x + width + 2.2 - 158.3, y: y },
            { x: x + width + 2.2 - 170, y: y },
            { x: x + width + 2.2 - 170, y: y + 7.45 }
        ];

        const victoryESPoints = [
            { x: x - 2.2, y: y + 7.45 },
            { x: x - 2.2, y: y + height },
            { x: x + width + 2.2, y: y + height },
            { x: x + width + 2.2, y: y + 7.45 },
            { x: x + width + 2.2 - 175.5, y: y + 7.45 },
            { x: x + width + 2.2 - 175.5, y: y },
            { x: x + width + 2.2 - 187, y: y },
            { x: x + width + 2.2 - 187, y: y + 7.45 }
        ];

        const victoryFRPoints = [
            { x: x - 2.2, y: y + 7.45 },
            { x: x - 2.2, y: y + height },
            { x: x + width + 2.2, y: y + height },
            { x: x + width + 2.2, y: y + 7.45 },
            { x: x + width + 2.2 - 171.5, y: y + 7.45 },
            { x: x + width + 2.2 - 171.5, y: y },
            { x: x + width + 2.2 - 183, y: y },
            { x: x + width + 2.2 - 183, y: y + 7.45 }
        ];

        const victoryCATPoints = [
            { x: x - 2.2, y: y + 7.45 },
            { x: x - 2.2, y: y + height },
            { x: x + width + 2.2, y: y + height },
            { x: x + width + 2.2, y: y + 7.45 },
            { x: x + width + 2.2 - 175.5, y: y + 7.45 },
            { x: x + width + 2.2 - 175.5, y: y },
            { x: x + width + 2.2 - 187, y: y },
            { x: x + width + 2.2 - 187, y: y + 7.45 }
        ];

        const defeatENPoints = [
            { x: x - 2.2, y: y + 7.45 },
            { x: x - 2.2, y: y + height },
            { x: x + width + 2.2, y: y + height },
            { x: x + width + 2.2, y: y + 7.45 },
            { x: x + width + 2.2 - 63.3, y: y + 7.45 },
            { x: x + width + 2.2 - 63.3, y: y },
            { x: x + width + 2.2 - 73, y: y },
            { x: x + width + 2.2 - 73, y: y + 7.45 },
            { x: x + width + 2.2 - 211, y: y + 7.45 },
            { x: x + width + 2.2 - 211, y: y },
            { x: x + width + 2.2 - 222, y: y },
            { x: x + width + 2.2 - 222, y: y + 7.45 }
        ];

        const defeatESPoints = [
            { x: x - 2.2, y: y + 7.45 },
            { x: x - 2.2, y: y + height },
            { x: x + width + 2.2, y: y + height },
            { x: x + width + 2.2, y: y + 7.45 },
            { x: x + width + 2.2 - 100.3, y: y + 7.45 },
            { x: x + width + 2.2 - 100.3, y: y },
            { x: x + width + 2.2 - 110, y: y },
            { x: x + width + 2.2 - 110, y: y + 7.45 },
            { x: x + width + 2.2 - 236, y: y + 7.45 },
            { x: x + width + 2.2 - 236, y: y },
            { x: x + width + 2.2 - 247, y: y },
            { x: x + width + 2.2 - 247, y: y + 7.45 }
        ];

        const defeatFRPoints = [
            { x: x - 2.2, y: y + 7.45 },
            { x: x - 2.2, y: y + height },
            { x: x + width + 2.2, y: y + height },
            { x: x + width + 2.2, y: y + 7.45 },
            { x: x + width + 2.2 - 96.3, y: y + 7.45 },
            { x: x + width + 2.2 - 96.3, y: y },
            { x: x + width + 2.2 - 107, y: y },
            { x: x + width + 2.2 - 107, y: y + 7.45 },
            { x: x + width + 2.2 - 228, y: y + 7.45 },
            { x: x + width + 2.2 - 228, y: y },
            { x: x + width + 2.2 - 239, y: y },
            { x: x + width + 2.2 - 239, y: y + 7.45 }
        ];

        const defeatCATPoints = [
            { x: x - 2.2, y: y + 7.45 },
            { x: x - 2.2, y: y + height },
            { x: x + width + 2.2, y: y + height },
            { x: x + width + 2.2, y: y + 7.45 },
            { x: x + width + 2.2 - 100.3, y: y + 7.45 },
            { x: x + width + 2.2 - 100.3, y: y },
            { x: x + width + 2.2 - 110, y: y },
            { x: x + width + 2.2 - 110, y: y + 7.45 },
            { x: x + width + 2.2 - 236, y: y + 7.45 },
            { x: x + width + 2.2 - 236, y: y },
            { x: x + width + 2.2 - 247, y: y },
            { x: x + width + 2.2 - 247, y: y + 7.45 }
        ];
    
        if (isWinner) {
            switch (language) {
                case 'en':
                    return victoryENPoints;
                case 'es':
                    return victoryESPoints;
                case 'fr':
                    return victoryFRPoints;
                default:
                    return victoryCATPoints;
            }
        } else {
            switch (language) {
                case 'en':
                    return defeatENPoints;
                case 'es':
                    return defeatESPoints;
                case 'fr':
                    return defeatFRPoints;
                default:
                    return defeatCATPoints;
            }
        }
    }

    private createAvatarSprites(): void {
        const { leftSprite, rightSprite } = this.getAvatarSprites();
        
        if (leftSprite) {
            this.leftAvatarSprite = leftSprite;
            const leftAvatarComponent = new RenderComponent(this.leftAvatarSprite);
            this.addComponent(leftAvatarComponent, 'leftAvatar');
        }
        
        if (rightSprite) {
            this.rightAvatarSprite = rightSprite;
            const rightAvatarComponent = new RenderComponent(this.rightAvatarSprite);
            this.addComponent(rightAvatarComponent, 'rightAvatar');
        }
    }

    private updateAvatarSprites(): void {
        const { leftSprite, rightSprite } = this.getAvatarSprites();
        
        if (leftSprite) {
            const updatedLeftComponent = new RenderComponent(leftSprite);
            this.replaceComponent('render', updatedLeftComponent, 'leftAvatar');
            this.leftAvatarSprite = leftSprite;
        }
        
        if (rightSprite) {
            const updatedRightComponent = new RenderComponent(rightSprite);
            this.replaceComponent('render', updatedRightComponent, 'rightAvatar');
            this.rightAvatarSprite = rightSprite;
        }
    }

    private getAvatarSprites(): { leftSprite: Sprite | null, rightSprite: Sprite | null } {
        const assetSuffix = this.game.config.classicMode ? 'Classic' : 'Square';
        
        const leftAvatarName = `avatarUnknown${assetSuffix}`;
        const rightAvatarName = `avatarUnknown${assetSuffix}`;
        
        const leftSprite = ImageManager.createSprite(leftAvatarName);
        const rightSprite = ImageManager.createSprite(rightAvatarName);
        
        if (leftSprite) {
            leftSprite.anchor.set(0.5, 0.5);
            leftSprite.x = this.game.width / 2 - 320;
            leftSprite.y = this.game.height / 2 + 10;
            leftSprite.alpha = 0;
            leftSprite.scale.set(0.225);
        }
        
        if (rightSprite) {
            rightSprite.anchor.set(0.5, 0.5);
            rightSprite.x = this.game.width / 2 + 320;
            rightSprite.y = this.game.height / 2 + 10;
            rightSprite.alpha = 0;
            rightSprite.scale.set(0.225);
        }
        
        return { leftSprite, rightSprite };
    }

    createOrnamentGraphic() {
		const hOffset = 30;
		const baseX = 450;
		const baseY = 245;
		const bottomY = 530;
		const groupWidth = 16;
		const groupHeight = 20;
		const numGroups = 3;
		const linesPerGroup = 20;
		const lineLength = 10;

        const color = this.isPlayerWinner() ? GAME_COLORS.green : GAME_COLORS.red ;

		// Top section
		for (let group = 0; group < numGroups + 1; group++) {
			const groupX = baseX + group * (linesPerGroup * groupWidth);

			this.ornamentGraphic.moveTo(groupX - hOffset, baseY);
			this.ornamentGraphic.lineTo(groupX - hOffset, baseY + groupHeight);
			this.ornamentGraphic.stroke({
				color: this.game.config.classicMode ? GAME_COLORS.white : color,
				width: 2.5,
				alpha: 0.5,
			});

			if (group === numGroups) break;
			
			for (let line = 0; line < linesPerGroup; line++) {
				if (line === 0) continue;
				const lineX = groupX + line * groupWidth;
				this.ornamentGraphic.moveTo(lineX - hOffset, baseY);
				this.ornamentGraphic.lineTo(lineX - hOffset, baseY + lineLength);
			}

			this.ornamentGraphic.stroke({
				color: this.game.config.classicMode ? GAME_COLORS.white : color,
				width: 1.25,
				alpha: 0.5,
			});
		}

		// Bottom section
		for (let group = 0; group < numGroups + 1; group++) {
			const groupX = baseX + group * (linesPerGroup * groupWidth);
		
			this.ornamentGraphic.moveTo(groupX - hOffset, bottomY);
			this.ornamentGraphic.lineTo(groupX - hOffset, bottomY + groupHeight);
			this.ornamentGraphic.stroke({
				color: this.game.config.classicMode ? GAME_COLORS.white : color,
				width: 2.5,
				alpha: 0.5,
			});
		
			if (group === numGroups) break;
			
			for (let line = 0; line < linesPerGroup; line++) {
				if (line === 0) continue;
				const lineX = groupX + line * groupWidth;
				this.ornamentGraphic.moveTo(lineX - hOffset, bottomY + lineLength);
				this.ornamentGraphic.lineTo(lineX - hOffset, bottomY + (2 * lineLength));
			}
		
			this.ornamentGraphic.stroke({
				color: this.game.config.classicMode ? GAME_COLORS.white : color,
				width: 1.25,
				alpha: 0.5,
			});
		}
	}

    createDashedLines(): Text[] {
		const dashedLines: Text[] = [];

        let color;

        if (this.game.config.classicMode) {
            color = GAME_COLORS.white;
        } else {
            color = this.isPlayerWinner() ? GAME_COLORS.green : GAME_COLORS.red;
        }
		
		for (let i = 0; i < 4; i++) {
			dashedLines.push({
				text: "----------------------------", 
				x: 421 + (i * 320),
				y: 397,
				style: {
					fill: { color: color, alpha: 0.3},
					fontSize: 14,
					fontWeight: 'bold' as const,
					align: 'left' as const,
					fontFamily: 'monospace',
					lineHeight: 252,
				},
			} as Text);
			dashedLines[i].rotation = 1.5708;
		}

		return (dashedLines);
	}

    createUpperLegend() {
        const legend: Text[] = [];

        let color;

        if (this.game.config.classicMode) {
            color = GAME_COLORS.white;
        } else {
            color = this.isPlayerWinner() ? GAME_COLORS.green : GAME_COLORS.red;
        }

		legend.push({
			text: "⩔⩔⩔⩔\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: color, alpha: 0.3},
				fontSize: 18,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
				letterSpacing: 307,
			},
		} as Text);

		legend[0].anchor = { x: 0, y: 0.5 };
		legend[0].x = 413;
		legend[0].y = 245;

		legend.push({
			text: "プレイヤー情報                             ゲーム統計                              プレイヤー情報\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: color, alpha: 0.3},
				fontSize: 12,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
			},
		} as Text);

		legend[1].anchor = { x: 0, y: 0.5 };
        legend[1].x = 535;
		legend[1].y = 245;

		return (legend);
    }

    createLowerLegend() {
        const legend: Text[] = [];
		
        let color;

        if (this.game.config.classicMode) {
            color = GAME_COLORS.white;
        } else {
            color = this.isPlayerWinner() ? GAME_COLORS.green : GAME_COLORS.red;
        }

		legend.push({
			text: "⩔⩔⩔⩔\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: color, alpha: 0.3},
				fontSize: 18,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
				letterSpacing: 307,
			},
		} as Text);
	
		legend[0].anchor = { x: 0, y: 0.5 };
		legend[0].x = 1386;
		legend[0].y = 550;
		legend[0].rotation = Math.PI;
	
		legend.push({
			text: "プレイヤー情報                             ゲーム統計                              プレイヤー情報\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: color, alpha: 0.3},
				fontSize: 12,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
			},
		} as Text);

		legend[1].anchor = { x: 0, y: 0.5 };
        legend[1].x = 535;
		legend[1].y = 565;
	
		return (legend);
    }

    createStatsLegend(): Text {		
        let text;
        let color;

        if (this.game.config.classicMode) {
            color = GAME_COLORS.white;
        } else {
            color = this.isPlayerWinner() ? GAME_COLORS.green : GAME_COLORS.red;
        }

        text = {
            text: "Goals in favor\nGoals against\nHits\nPower-ups picked\nPower-downs picked\nBall changes picked\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: color, alpha: 1},
				fontSize: 12,
				fontWeight: 'bolder' as const,
				align: 'center' as const,
				fontFamily: 'monospace',
                lineHeight: 35,
			},
        } as Text;

        text.anchor = { x: 0.5, y: 0 };
        text.x = this.game.width / 2;
        text.y = 300;

        return (text);
    }

    createPlayerStats(): Text[] {
        const stats: Text[] = [];

        let color;

        if (this.game.config.classicMode) {
            color = GAME_COLORS.white;
        } else {
            color = this.isPlayerWinner() ? GAME_COLORS.green : GAME_COLORS.red;
        }

        stats.push({
            text: "00\n00\n00\n00\n00\n00\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: color, alpha: 1},
				fontSize: 12,
				fontWeight: 'bolder' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
                lineHeight: 35,
			},
        } as Text);

        stats[0].anchor = { x: 0.5, y: 0 };
        stats[0].x = 760;
        stats[0].y = 300;

        stats.push({
            text: "00\n00\n00\n00\n00\n00\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: color, alpha: 1},
				fontSize: 12,
				fontWeight: 'bolder' as const,
				align: 'right' as const,
				fontFamily: 'monospace',
                lineHeight: 35,
			},
        } as Text);

        stats[1].anchor = { x: 0.5, y: 0 };
        stats[1].x = 1040;
        stats[1].y = 300;

        return (stats);
    }

	cleanup(): void {
        if (this.headerSprite) {
            if (this.headerSprite.parent) {
                this.headerSprite.parent.removeChild(this.headerSprite);
            }
            this.headerSprite.destroy();
        }
        
        if (this.leftAvatarSprite) {
            if (this.leftAvatarSprite.parent) {
                this.leftAvatarSprite.parent.removeChild(this.leftAvatarSprite);
            }
            this.leftAvatarSprite.destroy();
        }
        
        if (this.rightAvatarSprite) {
            if (this.rightAvatarSprite.parent) {
                this.rightAvatarSprite.parent.removeChild(this.rightAvatarSprite);
            }
            this.rightAvatarSprite.destroy();
        }
        
        if (this.overlayGraphics) {
            if (this.overlayGraphics.parent) {
                this.overlayGraphics.parent.removeChild(this.overlayGraphics);
            }
            this.overlayGraphics.destroy();
        }
    }
}