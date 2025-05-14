/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WallFiguresSpawner.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:40:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 14:31:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { DepthLine } from '../entities/background/DepthLine';
import { PyramidDepthLine } from '../entities/background/PyramidDepthLine';

import { WorldSystem } from '../systems/WorldSystem';

import { DepthLineBehavior } from '../utils/Types';

export class WallFiguresSpawner {
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

	static spawnPyramidDepthLine(
		game: PongGame,
		id: string,
		width: number,
		height: number,
		topWallOffset: number,
		bottomWallOffset: number,
		wallThickness: number,
		type: 'top' | 'bot' | string,
		behavior: DepthLineBehavior,
		peakOffset: number = 0
	): DepthLine {
		const addedOffset = 10;

		const upperLimit = topWallOffset + wallThickness - addedOffset;
		const lowerLimit = height - bottomWallOffset + addedOffset;

		const depthLine = new PyramidDepthLine(id, 'background', game, {
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
			peakOffset,
		});
		
		return depthLine;
	}

	static buildPyramids(worldSystem: WorldSystem, depth: number): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
		const maxPyramidHeight = height / 2.7 - topWallOffset - wallThickness;

		const rampUpEnd = Math.floor(depth / 5);
        const rampDownStart = Math.floor(depth * 4 / 5);

		for (let i = 0; i < depth; i++) {
			let heightRatio;
            
            if (i < rampUpEnd) {
                heightRatio = i / rampUpEnd;
            } else if (i >= rampDownStart) {
                heightRatio = (depth - i - 1) / (depth - rampDownStart);
            } else {
                heightRatio = 1.0;
            }
			
			const pyramidHeight = heightRatio * maxPyramidHeight;
	
			const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', pyramidHeight,);
			const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', pyramidHeight);

			let uniqueId;
			if (i === 0) {
				uniqueId = `firstPyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === depth - 1) {
				uniqueId = `lastPyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middlePyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}

			let bottomLine = this.spawnPyramidDepthLine(
				worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
	
			let topLine = this.spawnPyramidDepthLine(
				worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
		}
	}

	// Utils
	private static generateDepthLineBehavior(movement: string, direction: string, fade: string, pph: number): DepthLineBehavior {
		return {
			movement: movement,
			direction: direction,
			fade: fade,
			pyramidPeakHeight: pph,

		}
	}
}