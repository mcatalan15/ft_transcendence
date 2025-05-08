/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RuinBackgroundSpawner.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/08 12:26:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/08 12:46:08 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { DepthLine } from '../entities/background/DepthLine';
import { RuinDepthLine } from '../entities/background/RuinDepthLine';

import { RenderComponent } from '../components/RenderComponent';

import { WorldSystem } from '../systems/WorldSystem';

import { DepthLineBehavior } from '../utils/Types';

export class RuinBackgroundSpawner {
	static spawnDepthLine(
		game: PongGame,
		width: number,
		height: number,
		topWallOffset: number,
		bottomWallOffset: number,
		wallThickness: number,
		type: 'top' | 'bottom' | string,
		behavior: DepthLineBehavior
	): DepthLine {
		const uniqueId = `depthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		const addedOffset = 10;

		const upperLimit = topWallOffset + wallThickness - addedOffset;
		const lowerLimit = height - bottomWallOffset + addedOffset;

		const depthLine = new DepthLine(uniqueId, 'background', game, {
			velocityX: 10,
			velocityY: 10,
			width,
			height,
			upperLimit,
			lowerLimit,
			alpha: 0,
			behavior,
			type,
			despawn: 'position',
		});

		return (depthLine);
	}

	static spawnRuinDepthLine(
		game: PongGame,
		id: string,
		width: number,
		height: number,
		topWallOffset: number,
		bottomWallOffset: number,
		wallThickness: number,
		type: 'top' | 'bot' | string,
		behavior: DepthLineBehavior,
	): DepthLine {
		const addedOffset = 10;

		const upperLimit = topWallOffset + wallThickness - addedOffset;
		const lowerLimit = height - bottomWallOffset + addedOffset;

		const depthLine = new RuinDepthLine(id, 'background', game, {
			velocityX: 10,
			velocityY: 10,
			width,
			height,
			upperLimit,
			lowerLimit,
			alpha: 0,
			behavior,
			type,
			despawn: 'position',
		});
		game.entities.push(depthLine);
		const render = depthLine.getComponent('render') as RenderComponent;
		game.app.stage.addChild(render.graphic);
		return depthLine;
	}

	// static buildBottomRuin(worldSystem: WorldSystem, depth: number): void {
	// 	const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
	// }
}