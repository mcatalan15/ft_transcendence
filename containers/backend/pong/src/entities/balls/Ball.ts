/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ball.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/28 11:52:33 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/29 12:01:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { Entity } from '../../engine/Entity'

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';
import { VFXComponent } from '../../components/VFXComponent';

export abstract class Ball extends Entity {
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

	// Ball types must implement their graphics
	abstract createBallGraphic(): Graphics;

	// Ball types must implement their physics setup
	abstract initBallPhysicsData(x: number, y: number): any;
	abstract moveBall(physics: PhysicsComponent): void;
}