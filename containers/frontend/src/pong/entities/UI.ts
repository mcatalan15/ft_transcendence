/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UI.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 15:47:46 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 14:41:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { TextStyle } from 'pixi.js'
import { Entity } from "../engine/Entity";
import { TextComponent} from '../components/TextComponent';
import { TextData } from '../utils/Types'

export class UI extends Entity {
	width: number;
	height: number;
	topOffset: number;
	elapsedTime: number;
	leftScore: number;
	rightScore: number;

	constructor(id: string, layer: string, width: number, height: number, topWallOffset: number) {
		super(id, layer);

		this.topOffset = topWallOffset - 25;
		this.width = width;
		this.height = height;

		this.elapsedTime = 0;
		this.leftScore = 0;
		this.rightScore = 0;

		const scoreText = this.setUpScoreText(width, height);
		const scoreTextComponent = new TextComponent(scoreText);
		this.addComponent(scoreTextComponent, "scoreText");

		const timerText = this.setUpTimerText(width, height);
		const timerTextComponent = new TextComponent(timerText);
		this.addComponent(timerTextComponent, "timerText");

		const worldText = this.setUpWorldText(width, height);
		const worldTextComponent = new TextComponent(worldText);
		this.addComponent(worldTextComponent, "worldText");
	}

	private setUpScoreText(width: number, height: number): TextData {
		return {
			tag: 'score',
			text: '0 - 0',
			x: 0,
			y: 0,
			style: {
				fill: 0xFFFBEB,
				fontSize: 20,
				fontWeight: 'bold',
			} as TextStyle,
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	private setUpTimerText(width: number, height: number): TextData {
		return {
			tag: 'timer',
			text: '00:00:00',
			x: 0,
			y: 0,
			style: {
				fill: 0xFFFBEB,
				fontSize: 10,
				fontWeight: 'bold',
			} as TextStyle,
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	private setUpWorldText(widht: number, height: number): TextData {
		return {
			tag: 'world',
			text: 'NO_WORLD',
			x: 0,
			y: 0,
			style: {
				fill: 0xFFFBEB,
				fontSize: 10,
				fontWeight: 'bold',
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
			console.error("Score text component not found");
		}
	}

	setWorldText(newWorld: string): void {
		const textComponent = this.getWorldTextComponent() as TextComponent;
		if (textComponent) {
			textComponent.text = newWorld;
			textComponent.setText(newWorld);
		} else {
			console.error("Score text component not found");
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