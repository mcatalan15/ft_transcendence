/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UI.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 15:47:46 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/21 15:59:06 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, TextStyle } from 'pixi.js'

import { Entity } from "../engine/Entity";

import { RenderComponent } from '../components/RenderComponent';
import { TextComponent} from '../components/TextComponent';

import { TextData } from '../utils/Types'
import { drawPointOpenPath } from '../utils/Utils';

export class UI extends Entity {
	width: number;
	height: number;
	topOffset: number;
	elapsedTime: number;
	leftScore: number;
	rightScore: number;

	constructor(id: string, layer: string, width: number, height: number, topWallOffset: number) {
		super(id, layer);

		this.topOffset = topWallOffset - 40;
		this.width = width;
		this.height = height;

		this.elapsedTime = 0;
		this.leftScore = 0;
		this.rightScore = 0;

		/* const graphic = this.setUpWorldGraphic();
		const renderComponent = new RenderComponent(graphic);
		this.addComponent(renderComponent, 'render'); */
		
		const scoreText = this.setUpScoreText();
		const scoreTextComponent = new TextComponent(scoreText);
		this.addComponent(scoreTextComponent, "scoreText");

		const timerText = this.setUpTimerText();
		const timerTextComponent = new TextComponent(timerText);
		this.addComponent(timerTextComponent, "timerText");

		const worldText = this.setUpWorldText();
		const worldTextComponent = new TextComponent(worldText);
		this.addComponent(worldTextComponent, "worldText");
	}

	/* private setUpWorldGraphic(): Graphics {
        const graphic = new Graphics;
		
		graphic.moveTo(30, 25);
		graphic.lineTo(150, 25);

		graphic.moveTo(30, 60);
		graphic.lineTo(150, 60);
        
        graphic.stroke({color: 0xfff8e3, width: 2 });

		graphic.x = this.width / 2;
		graphic.y = this.height - 80;
        return (graphic);
    } */

	private setUpScoreText(): TextData {
		return {
			tag: 'score',
			text: '0 - 0',
			x: 0,
			y: 0,
			style: {
				fill: 0xfff8e3,
				fontSize: 20,
				fontWeight: 'bold',
			} as TextStyle,
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	private setUpTimerText(): TextData {
		return {
			tag: 'timer',
			text: '00:00:00',
			x: 0,
			y: 0,
			style: {
				fill: 0xfff8e3,
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
				fill: 0xfff8e3,
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
}