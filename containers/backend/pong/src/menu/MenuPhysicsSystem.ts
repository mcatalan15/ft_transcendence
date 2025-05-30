/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuPhysicsSystem.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/30 11:50:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/30 15:14:13 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";
import { System } from "../engine/System";

import { Ball } from "../entities/balls/Ball";
import { Menu } from "./Menu";

import { PhysicsComponent } from "../components/PhysicsComponent";
import { VFXComponent } from "../components/VFXComponent";

import { GAME_COLORS } from "../utils/Types";
import { isBall } from "../utils/Guards";
import { getBoundingBox } from "../utils/PhysicsUtils";
import { MenuParticleSpawner } from "./MenuParticleSpawner";

export class MenuPhysicsSystem implements System {
	menu: Menu;
	width: number;
	height: number;

	constructor(menu: Menu) {
		this.menu = menu;
		this.width = menu.width;
		this.height = menu.height;
	}

	update(entities: Entity[]): void {
		for (const entity of entities){
			if (isBall(entity)) {
				this.updateBall(entity,);
			}
		}
	}

	updateBall(ball: Ball) {
		const physics = ball.getComponent('physics') as PhysicsComponent;
		const vfx = ball.getComponent('vfx') as VFXComponent;

		if (!physics || !vfx) return;

		ball.moveBall(physics);
		this.handleBallWallCollisions(physics, ball);
	}

	handleBallWallCollisions(physics: PhysicsComponent, ball: Ball) {
		let collided = false;
		const boundingBox = getBoundingBox(physics);
		
		const leftBoundary = 0 + 45;
		const rightBoundary = 1800 - 35;
		const topBoundary = 0 + 40;
		const bottomBoundary = 800 - 90;
	
		if (boundingBox.left < leftBoundary && physics.velocityX < 0) {
			physics.velocityX *= -1;
			physics.x = leftBoundary + physics.width / 2;
			collided = true;
		} else if (boundingBox.right > rightBoundary && physics.velocityX > 0) {
			physics.velocityX *= -1;
			physics.x = rightBoundary - physics.width / 2;
			collided = true;
		}
	
		if (boundingBox.top < topBoundary && physics.velocityY < 0) {
			physics.velocityY *= -1;
			physics.y = topBoundary + physics.height / 2;
			collided = true;
		} else if (boundingBox.bottom > bottomBoundary && physics.velocityY > 0) {
			physics.velocityY *= -1;
			physics.y = bottomBoundary - physics.height / 2;
			collided = true;
		}
	
		if (collided) {
			if (ball.hasComponent('vfx')) {
				const vfx = ball.getComponent('vfx') as VFXComponent;
				vfx.startFlash(GAME_COLORS.particleGray, 5);
				MenuParticleSpawner.spawnBasicExplosion(this.menu, physics.x - physics.width / 4, physics.y, GAME_COLORS.particleGray, 0.5);
			}
		}
	}
}