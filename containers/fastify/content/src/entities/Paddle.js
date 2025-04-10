/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Paddle.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 09:24:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/10 15:51:30 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity.js";
import { RenderComponent } from "../components/RenderComponent.js";
import { PhysicsComponent } from "../components/PhysicsComponent.js";
import { InputComponent } from '../components/InputComponent.js';

export class Paddle extends Entity {
	constructor (id, x, y, isLeftPaddle) {
		super(id);

		const paddleGraphic = this.createPaddleGraphic();
		const renderComponent = new RenderComponent(paddleGraphic);
		this.addComponent(renderComponent);

		const physicsData = this.initPaddlePhysicsData(x, y);
		const physicsComponent = new PhysicsComponent(physicsData);
		this.addComponent(physicsComponent);

		const keys = this.setUpPaddleKeys(isLeftPaddle);
		const inputComponent = new InputComponent(keys);
		inputComponent.side = isLeftPaddle ? 'left' : 'right';
		this.addComponent(inputComponent);
		console.log(`Paddle has component ${this.getComponent('input').type}`);
	}

	createPaddleGraphic() {
		const paddleGraphic = new PIXI.Graphics();
		paddleGraphic.rect(0, 0, 10, 80);
		paddleGraphic.fill('white');
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
}