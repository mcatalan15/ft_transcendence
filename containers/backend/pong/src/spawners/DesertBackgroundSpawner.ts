/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DesertBackgroundSpawner.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:40:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/05 18:34:23 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { DepthLine } from '../entities/background/DepthLine';
import { PyramidDepthLine } from '../entities/background/PyramidDepthLine';

import { RenderComponent } from '../components/RenderComponent';

import { MainBackgroundSpawner } from './MainBackgroundSpawner';

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
		width: number,
		height: number,
		topWallOffset: number,
		bottomWallOffset: number,
		wallThickness: number,
		type: 'top' | 'bot' | string,
		behavior: DepthLineBehavior,
		peakOffset: number = 0
	): DepthLine {
		const uniqueId = `pyramidDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		const addedOffset = 10;

		const upperLimit = topWallOffset + wallThickness - addedOffset;
		const lowerLimit = height - bottomWallOffset + addedOffset;

		const depthLine = new PyramidDepthLine(uniqueId, 'background', game, {
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
		const maxPyramidHeight = height / 3 - topWallOffset - wallThickness;
		const halfDepth = Math.floor(depth / 2.5);
		
		// Random Values
		const pyramidBaseWidthTop = this.getRandomBaseWidth(width);
		const pyramidBaseWidthBottom = this.getRandomBaseWidth(width);
		const pyramidPeakOffsetTop = this.getRandomPeakOffset(width, 1);  // Positive side
		const pyramidPeakOffsetBottom = this.getRandomPeakOffset(width, -1); // Negative side
		const heightVariationFactor = this.getRandomNumber(0.85, 1.15);
	
		for (let i = 0; i < depth; i++) {
			// Calculate pyramidHeightRatio: 0 → 1 → 0
			let heightRatio: number;
			if (i <= halfDepth) {
				heightRatio = i / halfDepth; // ascending
			} else {
				heightRatio = (depth - 1 - i) / halfDepth; // descending
			}
	
			// Apply consistent randomness to the pyramid parameters
			const basePyramidHeight = heightRatio * maxPyramidHeight;
			const pyramidHeight = basePyramidHeight * heightVariationFactor;
	
			const behaviorTop: DepthLineBehavior = {
				movement: 'vertical',
				direction: 'upwards',
				fade: 'in',
				pyramidBaseHeight: 0,
				pyramidBaseWidth: pyramidBaseWidthTop,
				pyramidPeakHeight: pyramidHeight,
				pyramidPeakOffset: pyramidPeakOffsetTop,
			};
	
			const behaviorBottom: DepthLineBehavior = {
				movement: 'vertical',
				direction: 'downwards',
				fade: 'in',
				pyramidBaseHeight: 0,
				pyramidBaseWidth: pyramidBaseWidthBottom,
				pyramidPeakHeight: pyramidHeight,
				pyramidPeakOffset: pyramidPeakOffsetBottom,
			};
	
			const topLine = this.spawnPyramidDepthLine(
				worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
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
		const maxPyramidHeight = height / 3 - topWallOffset - wallThickness;
		const halfDepth = Math.floor(depth / 2.5);
		
		// Random values
		const pyramidBaseWidthTop = this.getRandomBaseWidth(width);
		const pyramidBaseWidthBottom = this.getRandomBaseWidth(width);
		const pyramidPeakOffsetTop = this.getRandomPeakOffset(width, 1);
		const pyramidPeakOffsetBottom = this.getRandomPeakOffset(width, -1);
		const heightVariationFactor = this.getRandomNumber(0.85, 1.15);
	
		for (let i = 0; i < depth; i++) {
			let heightRatio = i <= halfDepth
				? i / halfDepth
				: (depth - 1 - i) / halfDepth;
			
			// Apply consistent randomness to the pyramid parameters
			const basePyramidHeight = heightRatio * maxPyramidHeight;
			const pyramidHeight = basePyramidHeight * heightVariationFactor;
	
			const behaviorTop: DepthLineBehavior = {
				movement: 'vertical',
				direction: 'upwards',
				fade: 'in',
				pyramidBaseHeight: 0,
				pyramidBaseWidth: pyramidBaseWidthTop,
				pyramidPeakHeight: pyramidHeight,
				pyramidPeakOffset: pyramidPeakOffsetTop,
			};
	
			const behaviorBottom: DepthLineBehavior = {
				movement: 'vertical',
				direction: 'downwards',
				fade: 'in',
				pyramidBaseHeight: 0,
				pyramidBaseWidth: pyramidBaseWidthBottom,
				pyramidPeakHeight: pyramidHeight,
				pyramidPeakOffset: pyramidPeakOffsetBottom,
			};
	
			let bottomLine = this.spawnPyramidDepthLine(
				worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
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
		const maxPyramidHeight = height / 3 - topWallOffset - wallThickness;
		const halfDepth = Math.floor(depth / 2.5);
		
		// Random values
		const pyramidBaseWidthTop = this.getRandomBaseWidth(width);
		const pyramidBaseWidthBottom = this.getRandomBaseWidth(width);
		const pyramidPeakOffsetTop = this.getRandomPeakOffset(width, 1);
		const pyramidPeakOffsetBottom = this.getRandomPeakOffset(width, -1);
		const heightVariationFactorTop = this.getRandomNumber(0.85, 1.15);
		const heightVariationFactorBottom = this.getRandomNumber(0.85, 1.15);
	
		for (let i = 0; i < depth; i++) {
			let heightRatio = i <= halfDepth
				? i / halfDepth
				: (depth - 1 - i) / halfDepth;
			
			// Apply consistent randomness to the pyramid parameters
			const basePyramidHeight = heightRatio * maxPyramidHeight;
			const pyramidHeightTop = basePyramidHeight * heightVariationFactorTop;
			const pyramidHeightBottom = basePyramidHeight * heightVariationFactorBottom;
	
			const behaviorTop: DepthLineBehavior = {
				movement: 'vertical',
				direction: 'upwards',
				fade: 'in',
				pyramidBaseHeight: 0,
				pyramidBaseWidth: pyramidBaseWidthTop,
				pyramidPeakHeight: pyramidHeightTop,
				pyramidPeakOffset: pyramidPeakOffsetTop,
			};
	
			const behaviorBottom: DepthLineBehavior = {
				movement: 'vertical',
				direction: 'downwards',
				fade: 'in',
				pyramidBaseHeight: 0,
				pyramidBaseWidth: pyramidBaseWidthBottom,
				pyramidPeakHeight: pyramidHeightBottom,
				pyramidPeakOffset: pyramidPeakOffsetBottom,
			};
	
			let topLine = this.spawnPyramidDepthLine(
				worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
			);
			worldSystem.depthLineQueue.push(topLine);
	
			let bottomLine = this.spawnPyramidDepthLine(
				worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
			);
			worldSystem.depthLineQueue.push(bottomLine);
		}
	}

	// Utils
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

	private static getRandomPyramidHeight(baseHeight: number): number {
		// Vary by ±15% from the base height
		const variationFactor = this.getRandomNumber(0.85, 1.15);
		return baseHeight * variationFactor;
	}

	private static getRandomBaseWidth(width: number): number {
		const maxBaseWidth = width / 3;
		// Allow base width to be between 20% and 90% of the max
		const randomFactor = this.getRandomNumber(0.2, 0.9);
		return randomFactor * maxBaseWidth;
	}
}