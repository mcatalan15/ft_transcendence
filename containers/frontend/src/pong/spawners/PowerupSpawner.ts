/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSpawner.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:44:42 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 15:02:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from "pixi.js";

import { PongGame } from "../engine/Game";

import { Paddle } from "../entities/Paddle";

import { EnlargePowerup } from "../entities/powerups/EnlargePowerup";
import { ShieldPowerup } from "../entities/powerups/ShieldPowerUp";
import { MagnetizePowerup } from "../entities/powerups/MagnetizePowerup";
import { ShootPowerup } from "../entities/powerups/ShootPowerup";

import { ShrinkPowerDown } from "../entities/powerups/ShrinkPowerDown";
import { InvertPowerDown } from "../entities/powerups/InvertPowerDown";
import { SlowPowerDown } from "../entities/powerups/SlowPowerDown";
import { FlatPowerDown } from "../entities/powerups/FlatPowerDown";

import { CurveBallPowerup } from "../entities/powerups/CurveBallPowerup";
import { MultiplyBallPowerup } from "../entities/powerups/MultiplyBallPowerup";
import { BurstBallPowerup } from "../entities/powerups/BurstBallPowerup"
import { SpinBallPowerup } from "../entities/powerups/SpinBallPowerup";

import { Shield } from "../entities/background/Shield";
import { Bullet } from "../entities/Bullet";

import { RenderComponent } from "../components/RenderComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";

export class PowerupSpawner {
	static spawnPowerup(game: PongGame, width: number, height: number, world: string): void {
		if (game.hasEnded) return;
		
		const spawningPoints: Point[] = this.getSpawningPointsInWorld(world, width, height);

		this.redirectSpawn(game, spawningPoints);
	}

	static getSpawningPointsInWorld(world: string, width: number, height: number): Point[] {
		let points: Point [] = [];
		console.log(world);
		if (world.includes('pyramid')) {
			points.push(new Point(width / 2, height / 2 + 50));
			points.push(new Point(width / 2, height / 2 - 50));
		} else if (world.includes('cairns')) {
			points.push(new Point(width / 2 - 310, height / 2));
			points.push(new Point(width / 2, height / 2));
			points.push(new Point(width / 2 + 310, height / 2));
		} else if (world.includes('trenches')) {
			if (world.includes('Flipped')) {
				points.push(new Point(width / 2 + 150, height / 2 - 150));
				points.push(new Point(width / 2, height / 2));
				points.push(new Point(width / 2 - 150, height / 2 + 150));
			} else {
				points.push(new Point(width / 2 - 150, height / 2 - 150));
				points.push(new Point(width / 2, height / 2));
				points.push(new Point(width / 2 + 150, height / 2 + 150));
			}
		} else if (world.includes('lightning')) {
			if (world.includes('Flipped')) {
				points.push(new Point(width / 2 + 300, height / 2 - 60));
				points.push(new Point(width / 2, height / 2));
				points.push(new Point(width / 2 - 300, height / 2 + 60));
			} else {
				points.push(new Point(width / 2 - 300, height / 2 - 60));
				points.push(new Point(width / 2, height / 2));
				points.push(new Point(width / 2 + 300, height / 2 + 60));
			}
		} else if (world.includes('steps')) {
			points.push(new Point(width / 2, height / 2 + 100));
			points.push(new Point(width / 2, height / 2));
			points.push(new Point(width / 2, height / 2 - 100));
		} else if (world.includes('hourglass')) {
			points.push(new Point((width / 2 - 175), height / 2));
			points.push(new Point(width / 2, height / 2));
			points.push(new Point((width / 2 + 175), height / 2));
		} else if (world.includes('maw')) {
			points.push(new Point(width / 2, height / 2 + 150));
			points.push(new Point(width / 2 - 460, height / 2));
			points.push(new Point(width / 2, height / 2));
			points.push(new Point(width / 2 + 460, height / 2));
			points.push(new Point(width / 2, height / 2 - 150));
		} else if (world.includes('rakes')) {
			points.push(new Point(width / 2 - 400, height / 2 + 200));
			points.push(new Point(width / 2 - 400, height / 2 - 200));
			points.push(new Point(width / 2, height / 2));
			points.push(new Point(width / 2 + 400, height / 2 + 200));
			points.push(new Point(width / 2 + 400, height / 2 - 200));
		} else if (world.includes('kite') || world.includes('honeycomb') || world.includes('bowtie')) {
			points.push(new Point(width / 2, height / 2));
		} else if (world.includes('snakes')) {
			points.push(new Point(width / 2, height / 2 + 250));
			points.push(new Point(width / 2, height / 2))
			points.push(new Point(width / 2, height / 2 - 250));
		} else if (world.includes('vipers')) {
			points.push(new Point(width / 2, height / 2 + 250));
			points.push(new Point(width / 2, height / 2))
			points.push(new Point(width / 2, height / 2 - 250));
		} else {
			points.push(new Point(100, 100));
		}

		return (points);
	}

	static redirectSpawn(game: PongGame, points: Point[]) {
		switch (game.currentWorld.tag) {
			case ('pyramidWorld'):
				this.manageTwoPointSpawn(game, points);
				break;
			case ('cairnsWorld'):
				this.manageThreePointSpawn(game, points);
				break;
			case ('trenchesWorld'):
				this.manageThreePointSpawn(game, points);
				break;
			case ('trenchesFlippedWorld'):
					this.manageThreePointSpawn(game, points);
					break;
			case ('lightningWorld'):
				this.manageThreePointSpawn(game, points);
				break;
			case ('lightningFlippedWorld'):
					this.manageThreePointSpawn(game, points);
					break;
			case ('stepsWorld'):
				this.manageThreePointSpawn(game, points);
				break;
			case ('hourglassWorld'):
				this.manageThreePointSpawn(game, points);
				break;
			case ('mawWorld'):
				this.manageFivePointSpawn(game, points);
				break;
			case ('rakesWorld'):
				this.manageFivePointSpawn(game, points);
				break;
			case ('kiteWorld'):
				this.manageOnePointSpawn(game, points);
				break;
			case ('honeycombWorld'):
				this.manageOnePointSpawn(game, points);
				break;
			case ('bowtieWorld'):
				this.manageOnePointSpawn(game, points);
				break;
			case ('snakesWorld'):
				this.manageThreePointSpawn(game, points);
				break;
			case ('vipersWorld'):
				this.manageThreePointSpawn(game, points, true);
				break;
		}
	}

	static getPowerup(uniqueId: string, game: PongGame, randomX: number, randomY: number) {
		let idx = Math.floor(Math.random() * 4);

		let powerup;

		switch(idx) {
			case(0):
				powerup = new EnlargePowerup(uniqueId, 'powerup', game, randomY, randomX);
				break;
			case(1):
				uniqueId = `${uniqueId}shootPowerup`;
				powerup = new ShootPowerup(uniqueId, 'powerup', game, randomY, randomX);	
				break;
			case(2):
				uniqueId = `${uniqueId}shieldPowerup`;
				powerup = new ShieldPowerup(uniqueId, 'powerup', game, randomY, randomX);
				break;
			default:
				powerup = new MagnetizePowerup(uniqueId, 'powerup', game, randomY, randomX);
				break;
		}

		return (powerup);
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

	static spawnShield(game: PongGame, side: string){
		let shield = new Shield("shield", "powerup", game, side);
		
		game.addEntity(shield);

		const render = shield.getComponent('render') as RenderComponent;
		
		game.renderLayers.powerup.addChild(render.graphic);
		
		game.data.specialItmes.shields++;
		console.log(`spawned shield:${shield.x}`);
	}

	static despawnShield(game: PongGame, shieldId: string) {
		game.removeEntity(shieldId);
		console.log(`Shield ${shieldId} despawned`)
	}

	static spawnBullet(game: PongGame, side: string, paddle: Paddle) {
		const paddlePhysics = paddle.getComponent('physics') as PhysicsComponent;
		const direction = side === 'right' ? 'left' : 'right';

		let bullet = new Bullet("bullet", "foreground", paddlePhysics.x, paddlePhysics.y, direction);
		game.addEntity(bullet);

		const bulletRender = bullet.getComponent('render') as RenderComponent;
		const bulletPhysics = bullet.getComponent('physics') as PhysicsComponent;

		if (side === 'left') {
			bulletRender.graphic.angle = -90;
			bulletPhysics.x += paddle.baseWidth + 10;
		} else if (side === 'right') {
			bulletRender.graphic.angle = 90;
			bulletPhysics.x -= paddle.baseWidth + 10;
		}

		game.renderLayers.powerup.addChild(bulletRender.graphic);

		game.data.specialItmes.bullets++;
		console.log(`spawned bullet going:${bullet.direction}`);
	}

	static despawnBullet(game: PongGame, bulletId: string) {
		game.removeEntity(bulletId);
		console.log(`Bullet ${bulletId} despawned`)
	}

	static manageOnePointSpawn(game: PongGame, points: Point[]) {
		let uniqueId = `powerup-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		let powerup = this.getPowerup(uniqueId, game, points[0].y, points[0].x);
		
		game.addEntity(powerup);
		
			const render = powerup.getComponent('render') as RenderComponent;
			const physics = powerup.getComponent('physics') as PhysicsComponent;
			
			render.graphic.x = physics.x;
			render.graphic.y = physics.y;
		
			if (powerup.layer === 'powerup') {
				game.renderLayers.powerup.addChild(render.graphic);
			} else if (powerup.layer === 'powerdown') {
				game.renderLayers.powerdown.addChild(render.graphic);
			} else if (powerup.layer === 'ballChange') {
				game.renderLayers.ballChange.addChild(render.graphic);
			}
	}

	static manageTwoPointSpawn(game: PongGame, points: Point[]) {
		for (let i = 0; i < points.length; i++) {
			let uniqueId;

			let powerup;

			switch (i) {
				case (0):
					uniqueId = `powerUp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
					powerup = this.getPowerup(uniqueId, game, points[i].y, points[i].x);
					break;
				default:
					uniqueId = `powerDown-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
					powerup = this.getPowerdown(uniqueId, game, points[i].y, points[i].x);
					break;
			}

			game.addEntity(powerup);
		
			const render = powerup.getComponent('render') as RenderComponent;
			const physics = powerup.getComponent('physics') as PhysicsComponent;
			
			render.graphic.x = physics.x;
			render.graphic.y = physics.y;
		
			if (powerup.layer === 'powerup') {
				game.renderLayers.powerup.addChild(render.graphic);
			} else if (powerup.layer === 'powerdown') {
				game.renderLayers.powerdown.addChild(render.graphic);
			} else if (powerup.layer === 'ballChange') {
				game.renderLayers.ballChange.addChild(render.graphic);
			}
		}
	}

	static manageThreePointSpawn(game: PongGame, points: Point[], invert?: boolean) {
		for (let i = 0; i < points.length; i++) {
			let uniqueId;

			let powerup;
			
			switch (i) {
				case (0):
					if (invert) {
						uniqueId = `powerDown-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
						powerup = this.getPowerdown(uniqueId, game, points[i].y, points[i].x);
					} else {
						uniqueId = `powerUp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;	
						powerup = this.getPowerup(uniqueId, game, points[i].y, points[i].x);
					}
					break;
				case (1):
					uniqueId = `ballChange-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
					powerup = this.getBallChange(uniqueId, game, points[i].y, points[i].x);
					break;
				default:
					if (invert) {
						uniqueId = `powerUp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;	
						powerup = this.getPowerup(uniqueId, game, points[i].y, points[i].x);
					} else {
						uniqueId = `powerDown-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
						powerup = this.getPowerdown(uniqueId, game, points[i].y, points[i].x);
					}
			}

			game.addEntity(powerup);
		
			const render = powerup.getComponent('render') as RenderComponent;
			const physics = powerup.getComponent('physics') as PhysicsComponent;
			
			render.graphic.x = physics.x;
			render.graphic.y = physics.y;
		
			if (powerup.layer === 'powerup') {
				game.renderLayers.powerup.addChild(render.graphic);
			} else if (powerup.layer === 'powerdown') {
				game.renderLayers.powerdown.addChild(render.graphic);
			} else if (powerup.layer === 'ballChange') {
				game.renderLayers.ballChange.addChild(render.graphic);
			}
		}
	}

	static manageFivePointSpawn(game: PongGame, points: Point[]) {
		for (let i = 0; i < points.length; i++) {
			let uniqueId;

			let powerup;
			
			switch (i) {
				case (0):
					uniqueId = `powerUp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
					powerup = this.getPowerup(uniqueId, game, points[i].y, points[i].x);
					break;
				case (1):
					uniqueId = `powerDown-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
					powerup = this.getPowerdown(uniqueId, game, points[i].y, points[i].x);
					break;
				case(2):
				uniqueId = `ballChange-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
					powerup = this.getBallChange(uniqueId, game, points[i].y, points[i].x);
					break;
				case(3):
				uniqueId = `powerDown-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
					powerup = this.getPowerdown(uniqueId, game, points[i].y, points[i].x);
					break;
				default:
					uniqueId = `powerUp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
					powerup = this.getPowerup(uniqueId, game, points[i].y, points[i].x);	
			}

			game.addEntity(powerup);
		
			const render = powerup.getComponent('render') as RenderComponent;
			const physics = powerup.getComponent('physics') as PhysicsComponent;
			
			render.graphic.x = physics.x;
			render.graphic.y = physics.y;
		
			//console.log(powerup.layer);
			if (powerup.layer === 'powerup') {
				game.renderLayers.powerup.addChild(render.graphic);
			} else if (powerup.layer === 'powerdown') {
				game.renderLayers.powerdown.addChild(render.graphic);
			} else if (powerup.layer === 'ballChange') {
				game.renderLayers.ballChange.addChild(render.graphic);
			}
		}
	}
}