/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ball.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 16:18:46 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 09:59:13 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';
import { VFXComponent } from '../components/VFXComponent.js';

export class Ball extends Entity {
	constructor(id, layer, x, y) {
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

	createBallGraphic() {
		const ballGraphic = new PIXI.Graphics();
		ballGraphic.circle(10, 10, 10);
		ballGraphic.fill(0xFFFFFF);
		ballGraphic.pivot.set(10, 10);
		return (ballGraphic);
	}

	initBallPhysicsData(x, y) {
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
			behaviour: 'bounce',
			restitution: 1.0,
			mass: 1,
		};

		return (data);
	}
}