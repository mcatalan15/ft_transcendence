/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EndGameOverlay.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/01 15:09:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 22:27:59 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";

import { PongGame } from "../../engine/Game";

import { GameQuitButton } from "./GameQuitButton";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { ImageManager } from "../../managers/ImageManager";

import { Entity } from "../../engine/Entity";
import { GAME_COLORS } from "../../utils/Types";
import { isPlayerWinner } from "../../utils/Utils";

export class EndgameOverlay extends Entity {
	game: PongGame;
	overlayGraphics: Container = new Container();
	resultText: any;
	headerText: any;
	leftPlayerName: any;
	rightPlayerName: any;
	headerSprite!: Sprite;
	leftAvatarSprite!: Sprite;
	rightAvatarSprite!: Sprite;
	ornamentGraphic: Container = new Container();
	dashedLines: Text[] = [];
	upperLegend: Text[] = [];
	lowerLegend: Text[] = [];
	statsLegend: Text = new Text;
	playerStats: Text[] = [];
	gameQuitButton: GameQuitButton;
	
	originalX: number;
	originalY: number;
	originalWidth: number;
	originalHeight: number;

	isFirefox: boolean = false;
	
	constructor (game: PongGame, id: string, layer: string, x: number, y: number, width: number = 1000, height: number = 400) {
		super(id, layer);
		this.game = game;
		this.isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

		this.originalX = 400;
		this.originalY = 200;
		this.originalWidth = 1000;
		this.originalHeight = 400;

		this.createOverlayGraphics(game, this.originalX, this.originalY, this.originalWidth, this.originalHeight, 20);
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

		this.gameQuitButton = new GameQuitButton(
			this.game, 
			'gameQuitButton', 
			'overlays',
		);
		
		const quitButtonComponent = new RenderComponent(this.gameQuitButton.getContainer());
		this.addComponent(quitButtonComponent, 'gameQuitButton');
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

		this.overlayGraphics.removeChildren();
		this.createOverlayGraphics(this.game, this.originalX, this.originalY, this.originalWidth, this.originalHeight, 15);

		this.ornamentGraphic.removeChildren();
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

		this.updateQuitButton();
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
		let assetName: string;
		const language = this.game.language || 'en';
		
		if (this.game.config.classicMode) {
				assetName = `resultsHeader${language.toUpperCase()}White`;
		} else {
				assetName = `resultsHeader${language.toUpperCase()}Yellow`;
		}
		
		const headerSprite = ImageManager.createSprite(assetName);
		if (headerSprite) {
			headerSprite.anchor.set(0.5, 0.5);
			
			headerSprite.x = 900;
			headerSprite.y = 185;
			headerSprite.alpha = 0;
			
			(headerSprite as any).isFixedPosition = true;
			
			if (this.isFirefox) {
				headerSprite.scale.set(0.99999999);
				headerSprite.x -= 1;
				headerSprite.y += 1;
				
				if (headerSprite.texture && headerSprite.texture.source) {
					headerSprite.texture.source.scaleMode = 'nearest';
					
					if ('generateMipmaps' in headerSprite.texture.source) {
						(headerSprite.texture.source as any).generateMipmaps = false;
					}
				}
			} else {
				headerSprite.scale.set(1.0);
			}
			
			return headerSprite;
		}
		
		console.warn(`Failed to create header sprite for asset: ${assetName}`);
		return null;
	}
	
	private createOverlayGraphics(game: PongGame, x: number, y: number, width: number, height: number, headerHeight: number){
		this.overlayGraphics.removeChildren();

		const fixedX = 400;
		const fixedY = 175;
		const fixedWidth = 1000;
		const fixedHeight = 400;

		const background = new Graphics();
		
		const points = this.getBackgroundPoints(fixedX, fixedY, fixedWidth, fixedHeight);
		
		background.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length; i++) {
			background.lineTo(points[i].x, points[i].y);
		}
		background.closePath();
		
		background.fill({ color: GAME_COLORS.black });
		this.overlayGraphics.addChild(background);
	
		let frameColor;
		if (game.config.classicMode) {
			frameColor = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				frameColor = GAME_COLORS.orange;
			} else {
				frameColor = GAME_COLORS.orange;
			}
		}
		
		const frame = new Graphics();
		frame.moveTo(x, y);
		frame.lineTo(x, y + height - 5);
		frame.lineTo(x + width / 2 - 75, y + height - 5);
		frame.moveTo(x + width / 2 + 75, y + height - 5);
		frame.lineTo(x + width, y + height - 5);
		frame.lineTo(x + width, y);
		frame.stroke({ color: frameColor, width: 5 });
		this.overlayGraphics.addChild(frame);

		const leftAvatarFrame = new Graphics();
		leftAvatarFrame.rect(462.5, 267.5, 235, 235);
		leftAvatarFrame.rect(1102.5, 267.5, 235, 235);
		leftAvatarFrame.stroke({ color: frameColor, width: 2 });
		this.overlayGraphics.addChild(leftAvatarFrame);

		let statsColor = GAME_COLORS.orange;
		if (game.config.classicMode) {
			statsColor = GAME_COLORS.white;
		} else {
			statsColor = GAME_COLORS.orange;
		}

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
		this.overlayGraphics.addChild(statsUnderlines);
	}

	getHeaderText(): any {
		let text: string;

		switch (this.game.language) {
			case ('en'): {
				text = "GAME OVER";
				break;
			}

			case ('es'): {
				text = "FIN DEL JUEGO";
				break;
			}

			case ('fr'): {
				text = "FIN DE LA PARTIE";
				break;
			}

			default: {
				text = "FI DE LA PARTIDA";
				break;
			}
		}
	
		return {
			text: text,
			x: 405,
			y: 191,
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
		const winner = this.game.data.winner;
		const isDraw = this.game.data.generalResult === 'draw';
		
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
					text = "¡Empate!";
					color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
					break;
				}

				case ('fr'): {
					text = "Match nul !";
					color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
					break;
				}

				default: {
					text = "Empat!";
					color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
					break;
				}
			}

		} else {
			switch (this.game.language) {
				case ('en'): {
					text = `⇢ ${winner} won! ⇠`;
					color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
					break;
				}

				case ('es'): {
					text = `⇢ ${winner} ha ganado! ⇠`;
					color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
					break;
				}

				case ('fr'): {
					text = `⇢ ${winner} a gagné ! ⇠`;
					color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
					break;
				}

				default: {
					text = `⇢ ${winner} ha guanyat! ⇠`;
					color = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
					break;
				}
			}
		}
		
		return {
			text: text.toUpperCase(),
			x: 900,
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
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = GAME_COLORS.orange;
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
		const language = this.game.language || 'en';
		const lowerOffset = 20;
		
		const victoryENPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 158.3, y: y - 6 },
			{ x: x + width + 2.2 - 158.3, y: y - 15 },
			{ x: x + width + 2.2 - 170, y: y - 15 },
			{ x: x + width + 2.2 - 170, y: y - 6 }
		];

		const victoryESPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 175.5, y: y - 6 },
			{ x: x + width + 2.2 - 175.5, y: y - 15 },
			{ x: x + width + 2.2 - 187, y: y - 15 },
			{ x: x + width + 2.2 - 187, y: y - 6 }
		];

		const victoryFRPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 171.5, y: y - 6 },
			{ x: x + width + 2.2 - 171.5, y: y - 15 },
			{ x: x + width + 2.2 - 183, y: y - 15 },
			{ x: x + width + 2.2 - 183, y: y - 6 }
		];

		const victoryCATPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 175.5, y: y - 6 },
			{ x: x + width + 2.2 - 175.5, y: y - 15 },
			{ x: x + width + 2.2 - 187, y: y - 15 },
			{ x: x + width + 2.2 - 187, y: y - 6 }
		];

		const defeatENPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 63.3, y: y - 6 },
			{ x: x + width + 2.2 - 63.3, y: y - 15 },
			{ x: x + width + 2.2 - 73, y: y - 15 },
			{ x: x + width + 2.2 - 73, y: y - 6 },
			{ x: x + width + 2.2 - 211, y: y - 6 },
			{ x: x + width + 2.2 - 211, y: y - 15 },
			{ x: x + width + 2.2 - 222, y: y - 15 },
			{ x: x + width + 2.2 - 222, y: y - 6 }
		];

		const defeatESPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 100.3, y: y - 6 },
			{ x: x + width + 2.2 - 100.3, y: y - 15 },
			{ x: x + width + 2.2 - 110, y: y - 15 },
			{ x: x + width + 2.2 - 110, y: y - 6 },
			{ x: x + width + 2.2 - 236, y: y - 6 },
			{ x: x + width + 2.2 - 236, y: y - 15 },
			{ x: x + width + 2.2 - 247, y: y - 15 },
			{ x: x + width + 2.2 - 247, y: y - 6 }
		];

		const defeatFRPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 96.3, y: y - 6 },
			{ x: x + width + 2.2 - 96.3, y: y - 15 },
			{ x: x + width + 2.2 - 107, y: y - 15 },
			{ x: x + width + 2.2 - 107, y: y - 6 },
			{ x: x + width + 2.2 - 228, y: y - 6 },
			{ x: x + width + 2.2 - 228, y: y - 15 },
			{ x: x + width + 2.2 - 239, y: y - 15 },
			{ x: x + width + 2.2 - 239, y: y - 6 }
		];

		const defeatCATPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 100.3, y: y - 6 },
			{ x: x + width + 2.2 - 100.3, y: y - 15 },
			{ x: x + width + 2.2 - 110, y: y - 15 },
			{ x: x + width + 2.2 - 110, y: y - 6 },
			{ x: x + width + 2.2 - 236, y: y - 6 },
			{ x: x + width + 2.2 - 236, y: y - 15 },
			{ x: x + width + 2.2 - 247, y: y - 15 },
			{ x: x + width + 2.2 - 247, y: y - 6 }
		];

		const drawENPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 165, y: y - 6 },
			{ x: x + width + 2.2 - 165, y: y - 15 },
			{ x: x + width + 2.2 - 175, y: y - 15 },
			{ x: x + width + 2.2 - 175, y: y - 6 }
		];

		const drawESPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 97, y: y - 6 },
			{ x: x + width + 2.2 - 97, y: y - 15 },
			{ x: x + width + 2.2 - 107, y: y - 15 },
			{ x: x + width + 2.2 - 107, y: y - 6 }
		];

		const drawFRPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 55.5, y: y - 6 },
			{ x: x + width + 2.2 - 55.5, y: y - 15 },
			{ x: x + width + 2.2 - 65.5, y: y - 15 },
			{ x: x + width + 2.2 - 65.5, y: y - 6 }
		];

		const drawCATPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 63, y: y - 6 },
			{ x: x + width + 2.2 - 63, y: y - 15 },
			{ x: x + width + 2.2 - 73, y: y - 15 },
			{ x: x + width + 2.2 - 73, y: y - 6 }
		];

		const resultsENPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 78.3, y: y - 6 },
			{ x: x + width + 2.2 - 78.3, y: y - 15 },
			{ x: x + width + 2.2 - 102, y: y - 15 },
			{ x: x + width + 2.2 - 102, y: y - 6 }
		];

		const resultsESPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 101, y: y - 6 },
			{ x: x + width + 2.2 - 101, y: y - 15 },
			{ x: x + width + 2.2 - 111, y: y - 15 },
			{ x: x + width + 2.2 - 111, y: y - 6 },
			{ x: x + width + 2.2 - 167, y: y - 6 },
			{ x: x + width + 2.2 - 167, y: y - 15 },
			{ x: x + width + 2.2 - 190, y: y - 15 },
			{ x: x + width + 2.2 - 190, y: y - 6 }
		];


		const resultsFRPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 80, y: y - 6 },
			{ x: x + width + 2.2 - 80, y: y - 15 },
			{ x: x + width + 2.2 - 88, y: y - 15 },
			{ x: x + width + 2.2 - 88, y: y - 6 },
			{ x: x + width + 2.2 - 128, y: y - 6 },
			{ x: x + width + 2.2 - 128, y: y - 15 },
			{ x: x + width + 2.2 - 150, y: y - 15 },
			{ x: x + width + 2.2 - 150, y: y - 6 }
		];

		const resultsCATPoints = [
			{ x: x - 2.2, y: y - 6 },
			{ x: x - 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y + height + lowerOffset },
			{ x: x + width + 2.2, y: y - 6 },
			{ x: x + width + 2.2 - 80, y: y - 6 },
			{ x: x + width + 2.2 - 80, y: y - 15 },
			{ x: x + width + 2.2 - 88, y: y - 15 },
			{ x: x + width + 2.2 - 88, y: y - 6 },
			{ x: x + width + 2.2 - 128, y: y - 6 },
			{ x: x + width + 2.2 - 128, y: y - 15 },
			{ x: x + width + 2.2 - 150, y: y - 15 },
			{ x: x + width + 2.2 - 150, y: y - 6 }
		];
	
		switch (language) {
			case 'en':
				return resultsENPoints;
			case 'es':
				return resultsESPoints;
			case 'fr':
				return resultsFRPoints;
			default:
				return resultsCATPoints;
		}

	}

	private async createAvatarSprites(): Promise<void> {
		const { leftSprite, rightSprite } = await this.getAvatarSprites();
		
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

	private async updateAvatarSprites(): Promise<void> {
		const { leftSprite, rightSprite } = await this.getAvatarSprites();
		
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

	private async getAvatarSprites(): Promise<{ leftSprite: Sprite | null, rightSprite: Sprite | null }> {
		const assetSuffix = this.game.config.classicMode ? 'Classic' : 'Square';
		
		const leftPlayerData = this.game.playerData;
		const rightPlayerData = this.game.opponentData;
		
		const leftSprite = await this.createPlayerAvatarSprite(
			leftPlayerData?.avatar,
			`avatarUnknown${assetSuffix}`,
			580,
			385,
			0.225
		);
		
		const rightSprite = await this.createPlayerAvatarSprite(
			rightPlayerData?.avatar,
			this.game.config.variant === '1vAI' ? `avatarBot${assetSuffix}` : `avatarUnknown${assetSuffix}`,
			1220,
			385,
			0.225
		);
		
		return { leftSprite, rightSprite };
	}

	private async createPlayerAvatarSprite(
		avatarKey: string | undefined,
		fallbackAssetName: string,
		x: number,
		y: number,
		scale: number
	): Promise<Sprite | null> {
		try {
			let sprite: Sprite | null = null;

			if (avatarKey && (avatarKey.startsWith('http') || avatarKey.startsWith('/'))) {
				let finalUrl: string;
				if (avatarKey.includes('?')) {
					finalUrl = `${avatarKey}&t=${Date.now()}`;
				} else {
					finalUrl = `${avatarKey}?t=${Date.now()}`;
				}

				try {
					const texture = await Assets.load({
						src: finalUrl,
						loadParser: 'loadTextures'
					});

					if (texture) {
						sprite = new Sprite(texture);
						sprite.anchor.set(0.5);

						const targetWidth = 360;
						const targetHeight = 360;
						const scaleX = targetWidth / texture.width;
						const scaleY = targetHeight / texture.height;
						const baseScale = Math.min(scaleX, scaleY);

						sprite.scale.set(baseScale * scale * 2.75);
					} else {
						console.error('Texture is null, falling back to default avatar');
					}
				} catch (loadError) {
					console.error('Failed to load texture from URL:', loadError);
				}
			} else if (avatarKey && ImageManager.assets && ImageManager.assets.has(avatarKey)) {
				const texture = ImageManager.assets.get(avatarKey);
				sprite = new Sprite(texture);
				sprite.anchor.set(0.5);
				sprite.scale.set(scale);
			}
			if (!sprite) {
				sprite = ImageManager.createSprite(fallbackAssetName);
				if (sprite) {
					sprite.anchor.set(0.5);
					sprite.scale.set(scale);
				}
			}

			if (sprite) {
				sprite.x = x;
				sprite.y = y;
				sprite.alpha = 0;
				(sprite as any).isFixedPosition = true;
			}

			return sprite;
		} catch (error) {
			console.error('Failed to create player avatar sprite:', error);

			const fallbackSprite = ImageManager.createSprite(fallbackAssetName);
			if (fallbackSprite) {
				fallbackSprite.anchor.set(0.5);
				fallbackSprite.x = x;
				fallbackSprite.y = y;
				fallbackSprite.alpha = 0;
				fallbackSprite.scale.set(scale);
				(fallbackSprite as any).isFixedPosition = true;
			}

			return fallbackSprite;
		}
	}

	createOrnamentGraphic() {
		this.ornamentGraphic.removeChildren();
		
		const graphics = new Graphics();
		const hOffset = 30;
		const baseX = 450;
		const baseY = 245;
		const bottomY = 530;
		const groupWidth = 16;
		const groupHeight = 20;
		const numGroups = 3;
		const linesPerGroup = 20;
		const lineLength = 10;

		let color;

		if (this.game.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = GAME_COLORS.orange;
			}
		}

		for (let group = 0; group < numGroups + 1; group++) {
			const groupX = baseX + group * (linesPerGroup * groupWidth);

			graphics.moveTo(groupX - hOffset, baseY);
			graphics.lineTo(groupX - hOffset, baseY + groupHeight);
			graphics.stroke({
				color: this.game.config.classicMode ? GAME_COLORS.white : color,
				width: 2.5,
				alpha: 0.5,
			});

			if (group === numGroups) break;
			
			for (let line = 0; line < linesPerGroup; line++) {
				if (line === 0) continue;
				const lineX = groupX + line * groupWidth;
				graphics.moveTo(lineX - hOffset, baseY);
				graphics.lineTo(lineX - hOffset, baseY + lineLength);
			}

			graphics.stroke({
				color: this.game.config.classicMode ? GAME_COLORS.white : color,
				width: 1.25,
				alpha: 0.5,
			});
		}

		for (let group = 0; group < numGroups + 1; group++) {
			const groupX = baseX + group * (linesPerGroup * groupWidth);
		
			graphics.moveTo(groupX - hOffset, bottomY);
			graphics.lineTo(groupX - hOffset, bottomY + groupHeight);
			graphics.stroke({
				color: this.game.config.classicMode ? GAME_COLORS.white : color,
				width: 2.5,
				alpha: 0.5,
			});
		
			if (group === numGroups) break;
			
			for (let line = 0; line < linesPerGroup; line++) {
				if (line === 0) continue;
				const lineX = groupX + line * groupWidth;
				graphics.moveTo(lineX - hOffset, bottomY + lineLength);
				graphics.lineTo(lineX - hOffset, bottomY + (2 * lineLength));
			}
		
			graphics.stroke({
				color: this.game.config.classicMode ? GAME_COLORS.white : color,
				width: 1.25,
				alpha: 0.5,
			});
		}
		
		this.ornamentGraphic.addChild(graphics);
	}

	createDashedLines(): Text[] {
		const dashedLines: Text[] = [];

		let color;

		if (this.game.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = GAME_COLORS.orange;
			}
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
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = GAME_COLORS.orange;
			}
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
		legend[1].y = 242;

		return (legend);
	}

	createLowerLegend() {
		const legend: Text[] = [];
		
		let color;

		if (this.game.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = GAME_COLORS.orange;
			}
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
		legend[1].y = 568;
	
		return (legend);
	}

	createStatsLegend(): Text {		
		const preText = this.getStatsLegendText();
		let text;
		
		let color;

		if (this.game.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = GAME_COLORS.orange;
			}
		}

		text = {
			text: preText,
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

	getStatsLegendText(): string {
		if (this.game.language === 'en') {
			return ("Goals scored\nBalls returned\nReturn rate\nPower-ups\nPower-downs\nBall changes\n");
		} else if (this.game.language === 'es') {
			return ("Goles marcados\nPelotas devueltas\nTasa de retorno\nPower-ups\nPower-downs\nCambios de pelota\n");
		} else if (this.game.language === 'fr') {
			return ("Buts marqués\nBallons renvoyés\nTaux de retour\nPower-ups\nPower-downs\nChangements de ballon\n");
		} else {
			return ("Gols marcats\nPilotes retornades\nTaxa de retorn\nPower-ups\nPower-downs\nCanvis de pilota\n");
		}
	}

	createPlayerStats(): Text[] {
		const stats: Text[] = [];
	
		let color;

		if (this.game.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = GAME_COLORS.orange;
			}
		}
	
		const leftPlayerStats: number[] = this.getPlayerStats('left');
	
		stats.push({
			text: `${leftPlayerStats[0]}\n${leftPlayerStats[1]}\n${leftPlayerStats[2].toFixed(1)}\n${leftPlayerStats[3]}\n${leftPlayerStats[4]}\n${leftPlayerStats[5]}\n`,
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
		stats[0].x = this.game.data.leftPlayer.goalsAgainst === 0 ? 775 : 770;
		stats[0].y = 300;
	
		const rightPlayerStats: number[] = this.getPlayerStats('right');
	
		stats.push({
			text: `${rightPlayerStats[0]}\n${rightPlayerStats[1]}\n${rightPlayerStats[2].toFixed(1)}\n${rightPlayerStats[3]}\n${rightPlayerStats[4]}\n${rightPlayerStats[5]}\n`,
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
		stats[1].x = this.game.data.rightPlayer.goalsAgainst == 0 ? 1025 : 1030;
		stats[1].y = 300;
	
		return (stats);
	}

	getPlayerStats(side: string): number[] {
		const stats: number[] = [];
	
		if (side === 'left') {
			stats.push(this.game.data.leftPlayer.goalsInFavor || 0);
			stats.push(this.game.data.leftPlayer.hits || 0);
			
			const hits = this.game.data.leftPlayer.hits || 0;
			const goalsAgainst = this.game.data.leftPlayer.goalsAgainst || 0;
			const totalBalls = hits + goalsAgainst;
			const returnRate = totalBalls > 0 ? (hits / totalBalls) * 100 : 0;
			
			stats.push(parseFloat(returnRate.toFixed(1)));
			
			stats.push(this.game.data.leftPlayer.powerupsPicked || 0);
			stats.push(this.game.data.leftPlayer.powerdownsPicked || 0);
			stats.push(this.game.data.leftPlayer.ballchangesPicked || 0);
		} else if (side === 'right') {
			stats.push(this.game.data.rightPlayer.goalsInFavor || 0);
			stats.push(this.game.data.rightPlayer.hits || 0);
			
			const hits = this.game.data.rightPlayer.hits || 0;
			const goalsAgainst = this.game.data.rightPlayer.goalsAgainst || 0;
			const totalBalls = hits + goalsAgainst;
			const returnRate = totalBalls > 0 ? (hits / totalBalls) * 100 : 0;
			
			stats.push(parseFloat(returnRate.toFixed(1)));
			
			stats.push(this.game.data.rightPlayer.powerupsPicked || 0);
			stats.push(this.game.data.rightPlayer.powerdownsPicked || 0);
			stats.push(this.game.data.rightPlayer.ballchangesPicked || 0);
		} else {
			console.warn(`Invalid side: ${side}. Defaulting to left player.`);
			stats.push(0, 0, 0.0, 0, 0, 0);
		}
	
		return (stats);
	}

	private updateQuitButton(): void {
		this.gameQuitButton.cleanup();
		this.gameQuitButton = new GameQuitButton(
			this.game, 
			'gameQuitButton', 
			'overlays', 
		);
		
		const updatedQuitButtonComponent = new RenderComponent(this.gameQuitButton.getContainer());
		this.replaceComponent('render', updatedQuitButtonComponent, 'gameQuitButton');
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

		if (this.overlayGraphics) {
			if (this.overlayGraphics.parent) {
				this.overlayGraphics.parent.removeChild(this.overlayGraphics);
			}
			this.overlayGraphics.destroy({ children: true });
		}
		
		if (this.ornamentGraphic) {
			if (this.ornamentGraphic.parent) {
				this.ornamentGraphic.parent.removeChild(this.ornamentGraphic);
			}
			this.ornamentGraphic.destroy({ children: true });
		}
	}
}