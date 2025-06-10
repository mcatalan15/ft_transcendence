/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Paddle.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:30:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 12:07:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';
import { PongGame } from '../engine/Game'
import { Entity } from "../engine/Entity";
import { RenderComponent } from "../components/RenderComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { InputComponent } from '../components/InputComponent';
import { TextComponent } from '../components/TextComponent';

import { GAME_COLORS } from '../utils/Types.js';

export class Paddle extends Entity {
    game: PongGame;
    name: string;
    isEnlarged: boolean = false;
    wasEnlarged: boolean = false;
    affectedTimer: number = 0;
	enlargeProgress: number = 0;
    isShrinked: boolean = false;
    wasShrinked: boolean = false;
    shrinkProgress: number = 0;
    isInverted: boolean = false;
    inversion: number = 1;
    isSlowed: boolean = false;
    slowness: number = 1;
    isFlat: boolean = false;
    isMagnetized: boolean = false;
    isStunned: boolean = false;
    baseWidth: number = 0;
    originalWidth: number = 0;
    baseHeight: number = 0;
    originalHeight: number = 0;
    overshootTarget: number = 0;
    overshootPhase: string = '';
    targetHeight: number = 0;
    currentLayer: string = 'foreground';

    constructor(id: string, layer: string, game: PongGame, x: number, y: number, isLeftPaddle: boolean, name: string) {
        super(id, layer);

        this.game = game;
        this.name = name;

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
        paddleGraphic.rect(0, 0, this.game.paddleWidth, this.game.paddleHeight);
        paddleGraphic.fill(GAME_COLORS.white);
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
            return { up: ['w', 'W'], down: ['s', 'S'] };
        }
        return { up: ['ArrowUp'], down: ['ArrowDown'] };
    }

    setPaddleName(isLeftPaddle: boolean, name: string) {
		return {
			text: name,
			x: 0,
			y: 0,
			style: {
				fill: GAME_COLORS.white,
				fontSize: 10,
				fontWeight: 'bold' as const,
			},
			rotation: isLeftPaddle ? -Math.PI/2 : Math.PI/2,
			anchor: { x: 0.5, y: 0.5 },
		};
	}

    resetPaddleSize(paddle: Paddle): void {
        if (!paddle.isEnlarged && !paddle.isShrinked) return;

        if (paddle.isEnlarged) {
            paddle.wasEnlarged = true;
        } else if (paddle.isShrinked) {
            paddle.wasShrinked = true;
        }
        
        paddle.isEnlarged = false;
        paddle.isShrinked = false;
        paddle.enlargeProgress = 0;
        paddle.shrinkProgress = 0;

        this.game.eventQueue.push({
            type: 'RESET_PADDLE',
            target: paddle,
        });
    }
}