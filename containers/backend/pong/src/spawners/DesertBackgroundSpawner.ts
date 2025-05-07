/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DesertBackgroundSpawner.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:40:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/07 19:29:46 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { DepthLine } from '../entities/background/DepthLine';
import { PyramidDepthLine } from '../entities/background/PyramidDepthLine';

import { WorldSystem } from '../systems/WorldSystem';

import { DepthLineBehavior } from '../utils/Types';

export class DesertBackgroundSpawner {
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


	static buildTopPyramid(worldSystem: WorldSystem, depth: number): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
		const maxPyramidHeight = height / 1.7 - topWallOffset - wallThickness;
		const side = Math.floor(Math.random() * 2) > 0 ? 1 : -1;
		
		// For odd depth, the middle index is at depth / 2 (integer division)
		const middleIndex = Math.floor(depth / 2);
		
		// Random Values that remain consistent throughout the pyramid
		const pyramidBaseWidthTop = this.getRandomBaseWidth(width);
		const pyramidBaseWidthBottom = this.getRandomBaseWidth(width);
		const pyramidPeakOffsetTop = this.getRandomPeakOffset(width, 1);  // Positive side
		const pyramidPeakOffsetBottom = this.getRandomPeakOffset(width, -1); // Negative side
		const heightVariationFactor = this.getRandomNumber(0.85, 1.15);
	
		for (let i = 0; i < depth; i++) {
			let heightRatio = 1 - Math.abs(i - middleIndex) / middleIndex;
	
			const pyramidHeight = heightRatio * maxPyramidHeight * heightVariationFactor;
	
			const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', 0, pyramidBaseWidthTop, pyramidHeight, pyramidPeakOffsetTop * side);
			const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', 0, pyramidBaseWidthBottom, pyramidHeight, pyramidPeakOffsetBottom);

			let uniqueId;
			if (i === 0) {
				uniqueId = `firstPyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === depth - 1) {
				uniqueId = `lastPyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middlePyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}

			const topLine = this.spawnPyramidDepthLine(
				worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
	
			const bottomLine = this.spawnDepthLine(
				worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
		}
	}

	static buildBottomPyramid(worldSystem: WorldSystem, depth: number): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
		const maxPyramidHeight = height / 1.7 - topWallOffset - wallThickness;
		const middleIndex = Math.floor(depth / 2);
		const side = Math.floor(Math.random() * 2) > 0 ? 1 : -1;
		
		// Random values that remain consistent throughout the pyramid
		const pyramidBaseWidthTop = this.getRandomBaseWidth(width);
		const pyramidBaseWidthBottom = this.getRandomBaseWidth(width);
		const pyramidPeakOffsetTop = this.getRandomPeakOffset(width, 1);
		const pyramidPeakOffsetBottom = this.getRandomPeakOffset(width, -1);
		const heightVariationFactor = this.getRandomNumber(0.85, 1.15);
	
		for (let i = 0; i < depth; i++) {
			// Calculate height ratio: 0 at edges, 1 at the middle
			let heightRatio = 1 - Math.abs(i - middleIndex) / middleIndex;
			
			// Apply consistent randomness to the pyramid parameters
			const pyramidHeight = heightRatio * maxPyramidHeight * heightVariationFactor;
	
			const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', 0, pyramidBaseWidthTop, pyramidHeight, pyramidPeakOffsetTop);
			const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', 0, pyramidBaseWidthBottom, pyramidHeight, pyramidPeakOffsetBottom * side);

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
	
			let topLine = this.spawnDepthLine(
				worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
		}
	}

	static buildTopAndBottomPyramid(worldSystem: WorldSystem, depth: number): void {
		const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
		const maxPyramidHeight = height / 1.7 - topWallOffset - wallThickness;
		const middleIndex = Math.floor(depth / 2);
		const side = Math.floor(Math.random() * 2) > 0 ? 1 : -1;
		
		// Random values that remain consistent throughout the pyramid
		const pyramidBaseWidthTop = this.getRandomBaseWidth(width);
		const pyramidBaseWidthBottom = this.getRandomBaseWidth(width);
		const pyramidPeakOffsetTop = this.getRandomPeakOffset(width, 1);
		const pyramidPeakOffsetBottom = this.getRandomPeakOffset(width, -1);
		const heightVariationFactorTop = this.getRandomNumber(0.85, 1.15);
		const heightVariationFactorBottom = this.getRandomNumber(0.85, 1.15);
	
		for (let i = 0; i < depth; i++) {
			// Calculate height ratio: 0 at edges, 1 at the middle
			let heightRatio = 1 - Math.abs(i - middleIndex) / middleIndex;
			
			// Apply consistent randomness to the pyramid parameters
			const pyramidHeightTop = heightRatio * maxPyramidHeight * heightVariationFactorTop;
			const pyramidHeightBottom = heightRatio * maxPyramidHeight * heightVariationFactorBottom;
	
			const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', 0, pyramidBaseWidthTop, pyramidHeightTop, pyramidPeakOffsetTop * side);
			const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', 0, pyramidBaseWidthBottom, pyramidHeightBottom, pyramidPeakOffsetBottom * side);
			
			let uniqueId;
			if (i === 0) {
				uniqueId = `firstPyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else if (i === depth - 1) {
				uniqueId = `lastPyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			} else {
				uniqueId = `middlePyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
			}

			let topLine = this.spawnPyramidDepthLine(
				worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
	
			let bottomLine = this.spawnPyramidDepthLine(
				worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
		}
	}

	// Utils
	private static generateDepthLineBehavior(movement: string, direction: string, fade: string, pbh: number, pbw: number, pph: number, ppo: number): DepthLineBehavior {
		return {
			movement: movement,
			direction: direction,
			fade: fade,
			pyramidBaseHeight: pbh,
			pyramidBaseWidth: pbw,
			pyramidPeakHeight: pph,
			pyramidPeakOffset: ppo,
		}
	}
	
	private static getRandomNumber(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	private static getRandomPeakOffset(width: number, side: number = 0): number {
		const safeEdgeMargin = width / 8; // Minimum distance from edges
		const maxOffset = width / 2 - safeEdgeMargin; // Adjust maximum offset to respect margins
		
		// Generate a random factor between 0.1 and 0.9
		const randomFactor = this.getRandomNumber(0.1, 0.9);
		
		// Calculate the offset respecting the safe margin
		let offset = side * randomFactor * maxOffset;
		
		// Ensure the offset is at least safeEdgeMargin from the center
		// This prevents pyramids from being too close to the center
		if (Math.abs(offset) < safeEdgeMargin / 2) {
			offset = (offset >= 0 ? 1 : -1) * safeEdgeMargin / 2;
		}
		
		return offset;
	}

	private static getRandomBaseWidth(width: number): number {
		const maxBaseWidth = width / 3;
		// Allow base width to be between 50% and 90% of the max
		const randomFactor = this.getRandomNumber(0.5, 0.9);
		return randomFactor * maxBaseWidth;
	}
}