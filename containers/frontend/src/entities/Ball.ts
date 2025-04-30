/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ball.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:40:51 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 11:46:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { VFXComponent } from '../components/VFXComponent';

export class Ball extends Entity {
	lastHit: string;
	
	constructor(id: string, layer: string, x: number, y: number) {
		super(id, layer);

		this.lastHit = '';
		
		const ballGraphic = this.createBallGraphic();

		const renderComponent = new RenderComponent(ballGraphic);
		this.addComponent(renderComponent);

		const physicsData = this.initBallPhysicsData(x, y);
		const physicsComponent = new PhysicsComponent(physicsData);
		this.addComponent(physicsComponent);

		const vfxComponent = new VFXComponent();
		this.addComponent(vfxComponent);
	}

	createBallGraphic(): Graphics {
		const ballGraphic = new Graphics();
		ballGraphic.circle(10, 10, 10);
		ballGraphic.fill(0xFFFFFF);
		ballGraphic.pivot.set(10, 10);
		return ballGraphic;
	}

	initBallPhysicsData(x: number, y: number) {
		const speed = 10;
		const angle = (Math.random() * 120 - 60) * (Math.PI / 180);
		const velocityX = Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1);
		const velocityY = Math.sin(angle) * speed;

		const data = {
			x: x,
			y: y,
			width: 20,
			height: 20,
			velocityX: velocityX,
			velocityY: velocityY,
			isStatic: false,
			behaviour: 'bounce' as const,
			restitution: 1.0,
			mass: 1,
		};

		return data;
	}
}