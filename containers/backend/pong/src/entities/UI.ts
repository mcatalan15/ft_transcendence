/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UI.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 14:51:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:11:08 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";
import { TextComponent } from '../components/TextComponent';

export class UI extends Entity {
    topOffset: number;
    width: number;
    height: number;
    elapsedTime: number;
    leftScore: number;
    rightScore: number;

    constructor(id: string, layer: string, width: number, height: number, topWallOffset: number) {
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

    setUpScore(width: number, height: number) {
        return {
            tag: 'score',
            text: '0 - 0',
            x: 0,
            y: 0,
            style: {
                fill: 0xFFFBEB,
                fontSize: 20,
                fontWeight: 'bold' as const,
            },
            anchor: { x: 0.5, y: 0.5 },
        };
    }

    setUpTimer(width: number, height: number) {
        return {
            tag: 'timer',
            text: '00:00:00',
            x: 0,
            y: 0,
            style: {
                fill: 0xFFFBEB,
                fontSize: 10,
                fontWeight: 'bold' as const,
            },
            anchor: { x: 0.5, y: 0.5 },
        };
    }
    
    getScoreTextComponent(): TextComponent | null {
        return this.getComponent("text", "scoreText") as TextComponent || null;
    }
    
    getTimerTextComponent(): TextComponent | null {
        return this.getComponent("text", "timerText") as TextComponent || null;
    }

    getScore(side: 'left' | 'right'): number {
        if (side === 'left')
            return this.leftScore;
        else if (side === 'right')
            return this.rightScore;
        
        return 0;
    }

    incrementScore(side: 'left' | 'right'): void {
        if (side === 'left')
            this.leftScore += 1;
        else if (side === 'right')
            this.rightScore += 1;
    }

    setScoreText(newScore: string): void {
        const textComponent = this.getScoreTextComponent();
        if (textComponent) {
            textComponent.setText(newScore);
            console.log("Score updated to:", newScore);
        } else {
            console.error("Score text component not found");
        }
    }

    setTimerText(newTime: string): void {
        const textComponent = this.getTimerTextComponent();
        if (textComponent) {
            textComponent.setText(newTime);
        }
    }

    updateTimer(deltaTime: number): void {
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