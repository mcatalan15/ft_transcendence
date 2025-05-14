/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WallFiguresSpawner.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:40:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 19:38:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { DepthLineFactory } from '../entities/background/DepthLineFactory';

import { WorldSystem } from '../systems/WorldSystem';

import { DepthLineBehavior } from '../utils/Types';

export class WallFiguresSpawner{
	static buildPyramids(worldSystem: WorldSystem, depth: number): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
		const maxPyramidHeight = height / 2.2 - topWallOffset - wallThickness;

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
	
			const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', pyramidHeight);
			const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', pyramidHeight);

			let uniqueId;
			if (i === 0) {
				uniqueId = `firstPyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === depth - 1) {
				uniqueId = `lastPyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middlePyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}

			let bottomLine = DepthLineFactory.createDepthLine(
				'pyramid', worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
	
			let topLine = DepthLineFactory.createDepthLine(
				'pyramid', worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
		}
	}

	static buildParapets(worldSystem: WorldSystem, depth: number): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;

		const maxParapetHeight = height / 2 - topWallOffset - wallThickness;
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
			
			const parapetHeight = heightRatio * maxParapetHeight;
	
			const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', parapetHeight);
			const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', parapetHeight);

			let uniqueId;
			if (i === 0) {
				uniqueId = `firstParapetDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === depth - 1) {
				uniqueId = `lastParapetDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middleParapetDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}

			let bottomLine = DepthLineFactory.createDepthLine(
				'parapet', worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
	
			let topLine = DepthLineFactory.createDepthLine(
				'parapet', worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
		}
	}

	static buildSawEdges(worldSystem: WorldSystem, depth: number): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;

		const maxSawHeight = height / 2 - topWallOffset - wallThickness;
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
			
			const sawHeight = heightRatio * maxSawHeight;
	
			const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', sawHeight);
			const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', sawHeight);

			let uniqueId;
			if (i === 0) {
				uniqueId = `firstSawEdgeDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === depth - 1) {
				uniqueId = `lastSawEdgeLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middleSawEdgeLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}

			let bottomLine = DepthLineFactory.createDepthLine(
				'sawEdge', worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
	
			let topLine = DepthLineFactory.createDepthLine(
				'sawEdge', worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
		}
	}

	static buildEscalator(worldSystem: WorldSystem, depth: number): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;

		const maxEscalatorHeight = height / 2 - topWallOffset - wallThickness;
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
			
			const escalatorHeight = heightRatio * maxEscalatorHeight;
	
			const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', escalatorHeight);
			const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', escalatorHeight);

			let uniqueId;
			if (i === 0) {
				uniqueId = `firstEscalatorDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === depth - 1) {
				uniqueId = `lastEscalatorLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middleEscalatorLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}

			let bottomLine = DepthLineFactory.createDepthLine(
				'escalator', worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
	
			let topLine = DepthLineFactory.createDepthLine(
				'escalator', worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
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
			linePekHeight: pph,
		}
	}
}