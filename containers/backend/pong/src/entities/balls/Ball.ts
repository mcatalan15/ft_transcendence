/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ball.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/28 11:52:33 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/30 11:42:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { PongGame } from '../../engine/Game';
import { Entity } from '../../engine/Entity'

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';
import { VFXComponent } from '../../components/VFXComponent';

export abstract class Ball extends Entity {
	lastHit: string;
	isGoodBall: boolean;
	isFakeBall: boolean;

	constructor(id: string, layer: string, x: number, y: number, isGoodBall: boolean) {
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

		if (isGoodBall) {
			this.isGoodBall = true;
			this.isFakeBall = false;
		} else {
			this.isGoodBall = false;
			this.isFakeBall = true;
		}
	}

	// Ball types must implement their graphics
	abstract createBallGraphic(): Graphics;

	// Ball types must implement their physics setup
	abstract initBallPhysicsData(x: number, y: number): any;
	abstract moveBall(physics: PhysicsComponent): void;

	despawnBall(game: PongGame, ballId: string) {
		game.removeEntity(ballId);
	}
}