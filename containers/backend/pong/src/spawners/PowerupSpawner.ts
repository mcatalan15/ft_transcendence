/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSpawner.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:44:42 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/01 18:25:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { EnlargePowerup } from "../entities/powerups/EnlargePowerup";

import { ShrinkPowerDown } from "../entities/powerups/ShrinkPowerDown";
import { InvertPowerDown } from "../entities/powerups/InvertPowerDown";
import { SlowPowerDown } from "../entities/powerups/SlowPowerDown";
import { FlatPowerDown } from "../entities/powerups/FlatPowerDown";

import { CurveBallPowerup } from "../entities/powerups/CurveBallPowerup";
import { MultiplyBallPowerup } from "../entities/powerups/MultiplyBallPowerup";
import { BurstBallPowerup } from "../entities/powerups/BurstBallPowerup"
import { SpinBallPowerup } from "../entities/powerups/SpinBallPowerup";

import { RenderComponent } from "../components/RenderComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";

export class PowerupSpawner {
	static spawnPowerup(game: PongGame, width: number, height: number): void {
		const uniqueId = `powerup-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		
		// Boundaries for spawning
		const extraOffset = 50;
		const topBoundary = game.topWallOffset + game.wallThickness + extraOffset;
		const bottomBoundary = height - game.bottomWallOffset - extraOffset;
		const availableHeight = bottomBoundary - topBoundary;
		
		const spawnAreaWidth = width / 2;
		
		// Random position within the spawn area
		const randomX = (width - spawnAreaWidth) / 2 + Math.random() * spawnAreaWidth;
		const randomY = topBoundary + Math.random() * availableHeight;
		
		let powerup;
		let spawnIndex = Math.floor(Math.random() * 3);

		switch (spawnIndex) {
			case (0):
				powerup = new EnlargePowerup(uniqueId, 'powerup', game, randomX, randomY);
				break;
			case (1):
				powerup = this.getPowerdown(uniqueId, game, randomY, randomX);
				break;
			default:
				powerup = this.getBallChange(uniqueId, game, randomY, randomX);
				break;
		}

		//powerup = new FlatPowerDown(uniqueId, 'powerdown', game, randomX, randomY);
	
		game.addEntity(powerup);
	
		const render = powerup.getComponent('render') as RenderComponent;
		const physics = powerup.getComponent('physics') as PhysicsComponent;
		
		render.graphic.x = physics.x;
		render.graphic.y = physics.y;
	
		console.log(powerup.layer);
		if (powerup.layer === 'powerup') {
			game.renderLayers.powerup.addChild(render.graphic);
		} else if (powerup.layer === 'powerdown') {
			game.renderLayers.powerdown.addChild(render.graphic);
		} else if (powerup.layer === 'ballChange') {
			game.renderLayers.ballChange.addChild(render.graphic);
		}
	}

	static getPowerdown(uniqueId: string, game: PongGame, randomX: number, randomY: number) {
		let idx = Math.floor(Math.random() * 4);

		let powerdown;

		switch(idx) {
			case(0):
				powerdown = new ShrinkPowerDown(uniqueId, 'powerdown', game, randomY, randomX);
				break;
			case(1):
				powerdown = new SlowPowerDown(uniqueId, 'powerdown', game, randomY, randomX);
				break;
			case(2):
				powerdown = new FlatPowerDown(uniqueId, 'powerdown', game, randomY, randomX);
				break;
			default:
				powerdown = new InvertPowerDown(uniqueId, 'powerdown', game, randomY, randomX);
				break;
		}

		return (powerdown);
	}

	static getBallChange(uniqueId: string, game: PongGame, randomX: number, randomY: number) {
		let idx = Math.floor(Math.random() * 4);

		let powerup;
	
		switch(idx) {
			case(0):
				powerup = new CurveBallPowerup(uniqueId, 'ballChange', game, randomY, randomX);
				break;
			case(1):
				powerup =  new MultiplyBallPowerup(uniqueId, 'ballChange', game, randomY, randomX);
				break;
			case(2):
				powerup =  new SpinBallPowerup(uniqueId, 'ballChange', game, randomY, randomX);
				break;
			default:
				powerup = new BurstBallPowerup(uniqueId, 'ballChange', game, randomY, randomX);
				break;
		}
		
		return (powerup);
	}
}
