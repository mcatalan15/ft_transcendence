/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Paddle.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 09:24:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 12:13:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity.js";
import { RenderComponent } from "../components/RenderComponent.js";
import { PhysicsComponent } from "../components/PhysicsComponent.js";
import { InputComponent } from '../components/InputComponent.js';
import { TextComponent } from '../components/TextComponent.js'

export class Paddle extends Entity {
	constructor (id, layer, game, x, y, isLeftPaddle, name) {
		super(id, layer);

		this.game = game;
		this.name = name;
		
		this.isEnlarged = false;
		this.enlargeTimer = 0;

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

	createPaddleGraphic() {
		const paddleGraphic = new PIXI.Graphics();
		paddleGraphic.rect(0, 0, 10, 80);
		paddleGraphic.fill('#FFFBEB');
		paddleGraphic.pivot.set(5, 40);
		return (paddleGraphic);
	}

	initPaddlePhysicsData(x, y) {
		const data = {
			x: x,
			y: y,
			width: 10,
			height: 80,
			velocityX: 0,
			velocityY: 0,
			isStatic: false,
			behaviour: 'block',
			restitution: 1.0,
			mass: 100,
			speed: 20,
		}

		return (data);
	}

	setUpPaddleKeys(isLeftPaddle) {
		if (isLeftPaddle == true) {
			return ({ up: ['w'], down: ['s'] }) ;
		}
		return ({ up: ['ArrowUp'], down: ['ArrowDown'] });
	}

	setPaddleName(isLeftPaddle, name) {
		return {
			text: name,
			x: 0,
			y: 0,
			style: {
				fill: 0xFFFBEB,
				fontSize: 10,
				fontWeight: 'bold',
			},
			rotation: isLeftPaddle ? -Math.PI/2 : Math.PI/2,
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	resetPaddleSize(paddle) {
		if (!paddle.isEnlarged) return;

		paddle.isEnlarged = false;
		paddle.enlargeProgress = 0;

		this.game.eventQueue.push({
			type: 'RESET_PADDLE',
			target: paddle,
		})
	}
}