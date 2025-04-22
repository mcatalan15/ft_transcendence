/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Wall.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 09:58:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 12:12:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity.js";
import { RenderComponent } from '../components/RenderComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';

export class Wall extends Entity {
	constructor (id, layer, width, height, thickness, offset) {
		super(id, layer);

		const wallGraphic = this.createWallGraphic(width, thickness);
		
		const renderComponent = new RenderComponent(wallGraphic);
		this.addComponent(renderComponent);

		const physicsData = this.initWallPhysicsData(width, thickness, height, offset);
		const physicsComponent = new PhysicsComponent(physicsData);
		this.addComponent(physicsComponent);
	}

	createWallGraphic(width, thickness) {
		const wallGraphic = new PIXI.Graphics();
		wallGraphic.rect(0, 0, width, thickness);
		wallGraphic.fill('#FFFBEB');
		wallGraphic.pivot.set(0, 0, width / 2, thickness / 2);
		return (wallGraphic);
	}

	initWallPhysicsData(width, thickness, height, offset) {
		const data = {
			x: 0,
			y: offset,
			width: width,
			height: thickness,
			velocityX: 0,
			velocityY: 0,
			isStatic: true,
			behaviour: 'block',
			restitution: 1.0,
			mass: 100,
		}
		
		return (data);
	}
}