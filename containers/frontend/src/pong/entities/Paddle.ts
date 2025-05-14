/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Paddle.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:30:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 16:05:20 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';
import { PongGame } from '../engine/Game'
import { Entity } from "../engine/Entity";
import { RenderComponent } from "../components/RenderComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { InputComponent } from '../components/InputComponent';
import { TextComponent } from '../components/TextComponent';

export class Paddle extends Entity {
    game: PongGame;
    name: string;
    isEnlarged: boolean;
    enlargeTimer: number;
	enlargeProgress: number;
    baseWidth: number;
    originalWidth: number;
    baseHeight: number;
    originalHeight: number;
    overshootTarget: number;
    overshootPhase: string;
    targetHeight: number;

    constructor(id: string, layer: string, game: PongGame, x: number, y: number, isLeftPaddle: boolean, name: string) {
        super(id, layer);

        this.game = game;
        this.name = name;
        
        this.isEnlarged = false;
        this.enlargeTimer = 0;
		this.enlargeProgress = 0;

        this.overshootTarget = 0;
        this.overshootPhase = '';
        this.targetHeight = 0;
        
        // These will be initialized in the code below
        this.baseWidth = 0;
        this.originalWidth = 0;
        this.baseHeight = 0;
        this.originalHeight = 0;

        const paddleGraphic = this.createPaddleGraphic();
        const renderComponent = new RenderComponent(paddleGraphic);
        this.addComponent(renderComponent);

        const physicsData = this.initPaddlePhysicsData(x, y);
        const physicsComponent = new PhysicsComponent(physicsData);
        this.baseWidth = physicsComponent.width;
        this.originalWidth = this.baseWidth;
        this.baseHeight = physicsComponent.height;
        this.originalHeight = this.baseHeight;
        this.addComponent(physicsComponent);

		// to be modified to use websockets instead of local keyboard directly
        const keys = this.setUpPaddleKeys(isLeftPaddle);
        const inputComponent = new InputComponent(keys);
        inputComponent.side = isLeftPaddle ? 'left' : 'right';
        this.addComponent(inputComponent);
        
        const paddleName = this.setPaddleName(isLeftPaddle, name);
        const textComponent = new TextComponent(paddleName);
        this.addComponent(textComponent);
    }

    createPaddleGraphic(): Graphics {
        const paddleGraphic = new Graphics();
        paddleGraphic.rect(0, 0, 10, 80);
        paddleGraphic.fill('#FFFBEB');
        paddleGraphic.pivot.set(5, 40);
        return paddleGraphic;
    }

    initPaddlePhysicsData(x: number, y: number){
        const data = {
            x: x,
            y: y,
            width: 10,
            height: 80,
            velocityX: 0,
            velocityY: 0,
            isStatic: false,
            behaviour: 'block' as const,
            restitution: 1.0,
            mass: 100,
            speed: 20,
        };

        return data;
    }

    setUpPaddleKeys(isLeftPaddle: boolean): { up: string[], down: string[] } {
        if (isLeftPaddle) {
            return { up: ['w'], down: ['s'] };
        }
        return { up: ['ArrowUp'], down: ['ArrowDown'] };
    }

    setPaddleName(isLeftPaddle: boolean, name: string) {
		return {
			text: name,
			x: 0,
			y: 0,
			style: {
				fill: 0xFFFBEB,
				fontSize: 10,
				fontWeight: 'bold' as const,
			},
			rotation: isLeftPaddle ? -Math.PI/2 : Math.PI/2,
			anchor: { x: 0.5, y: 0.5 },
		};
	}

    resetPaddleSize(paddle: Paddle): void {
        if (!paddle.isEnlarged) return;

        paddle.isEnlarged = false;
        paddle.enlargeProgress = 0;

        this.game.eventQueue.push({
            type: 'RESET_PADDLE',
            target: paddle,
        });
    }
}