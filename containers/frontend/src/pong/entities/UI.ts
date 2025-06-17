/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UI.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 15:47:46 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/17 13:52:08 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, TextStyle } from 'pixi.js'

import { PongGame } from '../engine/Game';

import { Entity } from "../engine/Entity";

import { TextComponent} from '../components/TextComponent';
import { RenderComponent } from '../components/RenderComponent';

import { TextData, GAME_COLORS } from '../utils/Types'

export class UI extends Entity {
	game: PongGame;
	width: number;
	height: number;
	topOffset: number;
	elapsedTime: number;
	leftScore: number;
	rightScore: number;
	hasLeftSideActivated: boolean = false;
	hasRightSideActivated: boolean = false;
	leftAffectationTime: number = 0;
	leftAffectationFullTime: number = 0;
	rightAffectationTime: number = 0;
	rightAffectationFullTime: number = 0;

	constructor(game: PongGame, id: string, layer: string, width: number, height: number, topWallOffset: number) {
		super(id, layer);

		this.game = game;

		this.topOffset = topWallOffset - 40;
		this.width = width;
		this.height = height;

		this.elapsedTime = 0;
		this.leftScore = 0;
		this.rightScore = 0;

		const bars = this.setUpBars();
		const renderComponent = new RenderComponent(bars);
		this.addComponent(renderComponent, 'render');
		
		const scoreText = this.setUpScoreText();
		const scoreTextComponent = new TextComponent(scoreText);
		this.addComponent(scoreTextComponent, "scoreText");

		if (!this.game.config.classicMode) {
			const timerText = this.setUpTimerText();
			const timerTextComponent = new TextComponent(timerText);
			this.addComponent(timerTextComponent, "timerText");
		}

		if (!this.game.config.classicMode) {
			const worldText = this.setUpWorldText();
			const worldTextComponent = new TextComponent(worldText);
			this.addComponent(worldTextComponent, "worldText");
		}
	}

	private setUpBars(): Container {
        const graphics = new Container();
		
		const leftBarContainer = new Graphics;
		leftBarContainer.rect(0, 0, 80, 7.5);
		leftBarContainer.stroke({color: GAME_COLORS.white, width: 1.5 });
		leftBarContainer.x = 20;
		leftBarContainer.y = this.game.height - 40;
		leftBarContainer.label = 'leftBarContainer';
		graphics.addChild(leftBarContainer);

		const rightBarContainer = new Graphics;
		rightBarContainer.rect(0, 0, 80, 7.5);
		rightBarContainer.stroke({color: GAME_COLORS.white, width: 1.5 });
		rightBarContainer.x = this.game.width - 100;
		rightBarContainer.y = this.game.height - 40;
		rightBarContainer.label = 'rightBarContainer';
        graphics.addChild(rightBarContainer);

		const leftBarFill = new Graphics;
		leftBarFill.rect(0, 0, 0, 7.5);
		leftBarFill.fill(GAME_COLORS.white);
		leftBarFill.x = 20;
		leftBarFill.y = this.game.height - 40;
		leftBarFill.label = 'leftBarFill';
		graphics.addChild(leftBarFill);

		const rightBarFill = new Graphics;
		rightBarFill.rect(0, 0, 0, 7.5);
		rightBarFill.fill(GAME_COLORS.white);
		rightBarFill.x = this.game.width - 100;
		rightBarFill.y = this.game.height - 40;
		rightBarFill.label = 'rightBarFill';
        graphics.addChild(rightBarFill);

		return (graphics);
    }

	private setUpScoreText(): TextData {
		if (this.game.config.classicMode) {
			return {
				tag: 'score',
				text: '0          0',
				x: 0,
				y: 0,
				style: {
					fill: { color: GAME_COLORS.white, alpha: 1 },
					fontSize: 200,
					fontFamily: 'anatol-mn',
				} as TextStyle,
				anchor: { x: 0.5, y: 0.5 },
			};
		} else {
			return {
				tag: 'score',
				text: '0 - 0',
				x: 0,
				y: 0,
				style: {
					fill: GAME_COLORS.white,
					fontSize: 20,
					fontWeight: 'bold',
				} as TextStyle,
				anchor: { x: 0.5, y: 0.5 },
			};
		}
	}

	private setUpTimerText(): TextData {
		return {
			tag: 'timer',
			text: '00:00:00',
			x: 0,
			y: 0,
			style: {
				fill: GAME_COLORS.white,
				fontSize: 10,
				fontWeight: 'bold',
			} as TextStyle,
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	private setUpWorldText(): TextData {
		return {
			tag: 'world',
			text: 'NO_WORLD',
			x: 0,
			y: 0,
			style: {
				fill: GAME_COLORS.white,
				fontSize: 10,
				fontWeight: 'bold',
				align: 'left',
				leading: 2,
				lineHeight: 12,
			} as TextStyle,
			anchor: { x: 0, y: 0.5 },
		};
	}

	getScoreTextComponent(): TextComponent | null {
		return this.getComponent("text", "scoreText") as TextComponent | null;
	}

	getTimerTextComponent(): TextComponent | null {
		return this.getComponent("text", "timerText") as TextComponent | null;
	}

	getWorldTextComponent(): TextComponent | null {
		return this.getComponent("text", "worldText") as TextComponent | null;
	}

	getScore(side: 'left' | 'right'): number {
		return side === 'left' ? this.leftScore : this.rightScore;
	}

	incrementScore(side: 'left' | 'right'): void {
		if (side === 'left') {
			this.leftScore++;
		} else {
			this.rightScore++;
		}
	}

	setScoreText(newScore: string): void {
		const textComponent = this.getScoreTextComponent() as TextComponent;
		if (textComponent) {
			textComponent.text = newScore;
			textComponent.setText(newScore);
		} else {
			console.error("Score text component not found");
		}
	}

	setTimerText(newTime: string): void {
		const textComponent = this.getTimerTextComponent() as TextComponent;
		if (textComponent) {
			textComponent.text = newTime;
			textComponent.setText(newTime);
		} else {
			console.error("Timer text component not found");
		}
	}

	setWorldText(newWorld: string): void {
		const textComponent = this.getWorldTextComponent() as TextComponent;
		if (textComponent) {
			textComponent.text = newWorld;
			textComponent.setText(newWorld);
		} else {
			console.error("World text component not found");
		}
	}

	updateTimer(deltaTime: number): void {
		this.elapsedTime += deltaTime;

		const minutes = Math.floor(this.elapsedTime / 60000).toString().padStart(2, '0');
		const seconds = Math.floor((this.elapsedTime % 60000) / 1000).toString().padStart(2, '0');
		const milliseconds = Math.floor((this.elapsedTime % 1000) / 10).toString().padStart(2, '0');

		const formattedTime = `${minutes}:${seconds}:${milliseconds}`;

		const timerComponent = this.getTimerTextComponent();
		if (timerComponent) {
			timerComponent.setText(formattedTime);
		}
	}

	setBarTimer(side: string, time: number) {
		if (side === 'left') {
			this.leftAffectationFullTime = time;
			this.leftAffectationTime = 0;
		} else if (side === 'right') {
			this.rightAffectationFullTime = time;
			this.rightAffectationTime = 0;
		}
	}

	resetBars(side: string){
		if (side === 'left') {
			this.leftAffectationFullTime = 0;
			this.leftAffectationTime = 0;
			const render = this.getComponent('render') as RenderComponent;
			const targetChild = render.graphic.children.find(child => child.label === "leftBarFill");
			if (targetChild) {
				for (let i = 0; i < render.graphic.children.length; i++) {
					if (render.graphic.children[i].label === targetChild.label) {						
						let caughtGraphic = render.graphic.children[i] as Graphics;
						console.log(caughtGraphic);
						caughtGraphic.clear();
						caughtGraphic.rect(0, 0, 0, 7.5);
						//caughtGraphic.fill(GAME_COLORS.white);
					}
				}
			}
		} else if (side === 'right') {
			this.rightAffectationFullTime = 0;
			this.rightAffectationTime = 0;
			const render = this.getComponent('render') as RenderComponent;
			const targetChild = render.graphic.children.find(child => child.label === "rightBarFill");
			if (targetChild) {
				for (let i = 0; i < render.graphic.children.length; i++) {
					if (render.graphic.children[i].label === targetChild.label) {
						let caughtGraphic = render.graphic.children[i] as Graphics;
						console.log(caughtGraphic);
						caughtGraphic.clear();
						caughtGraphic.rect(0, 0, 0, 7.5);
						//caughtGraphic.fill(GAME_COLORS.white);
					}
				}
			}
		}
	}
}