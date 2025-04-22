/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UI.js                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/15 09:50:04 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 12:12:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity.js";
import { TextComponent } from '../components/TextComponent.js'

export class UI extends Entity {
    constructor(id, layer, width, height,topWallOffset) {
        super(id, layer);

		this.topOffset = topWallOffset + 5;
		this.width = width;
		this.height = height;

        this.elapsedTime = 0;

		this.leftScore = 0;
		this.rightScore = 0;

        const scoreText = this.setUpScore(width, height);
        const scoreTextComponent = new TextComponent(scoreText);
        this.addComponent(scoreTextComponent, "scoreText");
        
        const timerText = this.setUpTimer(width, height);
        const timerTextComponent = new TextComponent(timerText);
        this.addComponent(timerTextComponent, "timerText");
    }

    setUpScore(width, height) {
        return {
            tag: 'score',
            text: '0 - 0',
            x: 0,
            y: 0,
            style: {
                fill: 0xFFFBEB,
                fontSize: 20,
                fontWeight: 'bold',
            },
            anchor: { x: 0.5, y: 0.5 },
        };
    }

    setUpTimer(width, height) {
        return {
            tag: 'timer',
            text: '00:00:00',
            x: 0,
            y: 0,
            style: {
                fill: 0xFFFBEB,
                fontSize: 10,
                fontWeight: 'bold',
            },
            anchor: { x: 0.5, y: 0.5 },
        };
    }
    
    getScoreTextComponent() {
        return this.getComponent("text", "scoreText");
    }
    
    getTimerTextComponent() {
        return this.getComponent("text", "timerText");
    }

	getScore(side) {
		if (side === 'left')
			return (this.leftScore);
		else if (side === 'right')
			return (this.rightScore);
	}

	incrementScore(side) {
		if (side === 'left')
			this.leftScore += 1;
		else if (side === 'right')
			this.rightScore += 1;
	}

	setScoreText(newScore) {
		const textComponent = this.getScoreTextComponent();
		if (textComponent) {
			textComponent.text = newScore;

			textComponent.setText(newScore);
			
			console.log("Score updated to:", newScore);
		} else {
			console.error("Score text component not found");
		}
	}

    setTimerText(newTime) {
        const textComponent = this.getTimerTextComponent();
        if (textComponent) {
            textComponent.text = newTime;
            textComponent.setText(newTime);
        }
    }

    updateTimer(deltaTime) {
        this.elapsedTime += deltaTime;
        
        // Format time as MM:SS:mm
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