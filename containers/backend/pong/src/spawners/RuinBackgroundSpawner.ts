/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RuinBackgroundSpawner.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/08 12:26:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/09 17:33:47 by hmunoz-g         ###   ########.fr       */
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
			ruinHSegments: behavior.ruinHSegments,
			ruinTSegments: behavior.ruinHSegments! + 2,
			maxHeight: behavior.maxHeight,
			maxWidth: behavior.maxWidth,
			segmentWidths: behavior.segmentWidths,
			segmentHeights: behavior.segmentHeights,
			hOffset: behavior.hOffset,
		});

		console.log(depthLine.id);

		return depthLine;
	}

	static buildBottomRuin(worldSystem: WorldSystem, depth: number, innerPosition: string): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
		
		const behaviorTop = this.generateDepthLineBehavior(worldSystem.game, 'vertical', 'upwards', 'in', 2);
		const behaviorBottom = this.generateDepthLineBehavior(worldSystem.game, 'vertical', 'downwards', 'in', depth);
	
		for (let i = 0; i < depth - 1; i++) {
			console.log(`i:${i} - ${Math.floor(depth) - 1}`)
			
			let uniqueId;
			if (i === 0 && innerPosition == 'first') {
				uniqueId = `firstRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === Math.floor(depth) - 1 && innerPosition == 'last') {
				uniqueId = `lastRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middleRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}
	
			// Create the ruin depth line at the bottom with the SAME behavior for all lines
			let bottomLine = this.spawnRuinDepthLine(
				worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
	
			// Create a regular depth line at the top with the SAME behavior for all lines
			let topLine = this.spawnDepthLine(
				worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
		}
	}
	
	static buildTopRuin(worldSystem: WorldSystem, depth: number, innerPosition: string): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
		
		const behaviorTop = this.generateDepthLineBehavior(worldSystem.game, 'vertical', 'upwards', 'in', depth);
		const behaviorBottom = this.generateDepthLineBehavior(worldSystem.game, 'vertical', 'downwards', 'in', 2);
	
		for (let i = 0; i < depth - 1; i++) {
			let uniqueId;
			
			if (i === 0 && innerPosition == 'first' ) {
				uniqueId = `firstRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === Math.floor(depth) - 1 && innerPosition == 'last') {
				uniqueId = `lastRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middleRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}
	
			// Create the ruin depth line at the bottom with the SAME behavior for all lines
			let topLine = this.spawnRuinDepthLine(
				worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
	
			// Create a regular depth line at the top with the SAME behavior for all lines
			let bottomLine = this.spawnDepthLine(
				worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
		}
	}
	
	static buildTopAndBottomRuin(worldSystem: WorldSystem, depth: number, innerPosition: string): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;

		// Generate behaviors for the top ruin
		const topRuinBehavior = this.generateDepthLineBehavior(worldSystem.game, 'vertical', 'upwards', 'in', depth);
		
		// Generate behaviors for the bottom ruin
		const bottomRuinBehavior = this.generateDepthLineBehavior(worldSystem.game, 'vertical', 'downwards', 'in', depth);
	
		for (let i = 0; i < depth - 1; i++) {
			let uniqueId;

			if (i === 0 && innerPosition == 'first') {
				uniqueId = `firstRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === Math.floor(depth) - 1 && innerPosition == 'last') {
				uniqueId = `lastRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middleRuinDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}
	
			// Create the top ruin depth line
			let topRuinLine = this.spawnRuinDepthLine(
				worldSystem.game, 
				uniqueId,
				width, 
				height, 
				topWallOffset, 
				bottomWallOffset, 
				wallThickness, 
				'top', 
				topRuinBehavior
			);
			worldSystem.depthLineQueue.push(topRuinLine);
	
			// Create the bottom ruin depth line
			let bottomRuinLine = this.spawnRuinDepthLine(
				worldSystem.game, 
				uniqueId,
				width, 
				height, 
				topWallOffset, 
				bottomWallOffset, 
				wallThickness, 
				'bottom', 
				bottomRuinBehavior
			);
			worldSystem.depthLineQueue.push(bottomRuinLine);
		}
	}

	// Utils
	private static generateDepthLineBehavior(game: PongGame, movement: string, direction: string, fade: string, rhs: number): DepthLineBehavior {
		let hOffset = game.width / 16;
		const maxHeight = direction === 'downwards' ? game.height / 7 : -game.height / 7;
		const maxWidth = game.width - (hOffset * 2);
		const hOffsetVariation = Math.random() * (game.width / 8);
		hOffset = hOffsetVariation >= (game.width / 16) ? hOffset + hOffsetVariation : hOffset + (game.width / 16);

		return {
			movement: movement,
			direction: direction,
			fade: fade,
			ruinHSegments: rhs,
			maxHeight: maxHeight,
			maxWidth: maxWidth,
			segmentWidths: this.generateSegmentWidths(maxWidth, rhs),
			segmentHeights: this.generateSegmentHeights(direction, maxHeight, rhs - 1),
			hOffset: hOffset,
		}
	}

	private static generateSegmentWidths(maxWidth: number, hSegments: number): number[] {
		if (hSegments <= 1) return [maxWidth];

		let lastWidth = 0;

		// Calculate the segment width
		const baseSegmentWidth = maxWidth / (hSegments - 1);
		
		// Add some random variation to each segment width
		const segmentWidths: number[] = [];
		for (let i = 0; i < hSegments - 1; i++) {
			// Random variation between 80% and 120% of base segment width
			const variation = 0.8 + Math.random() * 0.4;
			let newWidth = baseSegmentWidth * variation;

			if (newWidth - lastWidth < (maxWidth / 8)) {
				newWidth = lastWidth;
			}

			segmentWidths.push(newWidth);
			lastWidth = newWidth
		}

		return segmentWidths;
	}

	private static generateSegmentHeights(direction: string, maxHeight: number, vSegments: number): number[] {
		if (vSegments <= 0) return [];
	
		const heights: number[] = [];
		
		// Create heights with some random variation
		for (let i = 0; i < vSegments; i++) {

			let height;
			
			if (direction === "downwards") {
				height = Math.random() * -maxHeight;
			} else {
				height = Math.random() * -maxHeight;
			}
			
			heights.push(height);
		}
		
		return heights;
	}
}