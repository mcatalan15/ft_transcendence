/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WindmillPatternManager.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/19 09:08:04 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/19 12:06:44 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from "pixi.js";

import { PongGame } from "../engine/Game";

const PATH_BREAK = { x: Number.NaN, y: Number.NaN };

export class WindmillPatternManager {
	static createDoubleTopPattern(game: PongGame, position: number) {
		const longSide = 100;
		const shortSide = 20;
		const heightOffset = game.height / 5;
		const widthOffset = game.width / 4;
		const rotationAngle = Math.PI / 20; // 15 degrees rotation per position unit
		const PATH_BREAK = { x: NaN, y: NaN }; 
	
		const halfShortSide = shortSide / 2;
		const combined = longSide + shortSide;
		
		const windmillPositions = [
			// Center Windmill
			{ x: -halfShortSide, y: -combined + heightOffset },
			{ x: -halfShortSide, y: - halfShortSide + heightOffset},
			{ x: - combined, y: -halfShortSide + heightOffset},
			{ x: - combined, y: halfShortSide + heightOffset},
			{ x: -halfShortSide, y: halfShortSide + heightOffset},
			{ x: -halfShortSide, y: combined + heightOffset},
			{ x: halfShortSide, y: combined + heightOffset},
			{ x: halfShortSide, y: halfShortSide + heightOffset},
			{ x: combined, y: halfShortSide + heightOffset},
			{ x: combined, y: -halfShortSide + heightOffset},
			{ x: halfShortSide, y: -halfShortSide + heightOffset},
			{ x: halfShortSide, y: -combined + heightOffset},
			{ x: -halfShortSide, y: -combined + heightOffset },
			
			PATH_BREAK,
			
			// Left Windmill
			{ x: -halfShortSide - widthOffset, y: -combined - heightOffset },
			{ x: -halfShortSide - widthOffset, y: - halfShortSide - heightOffset},
			{ x: - combined - widthOffset, y: -halfShortSide - heightOffset},
			{ x: - combined - widthOffset, y: halfShortSide - heightOffset},
			{ x: -halfShortSide - widthOffset, y: halfShortSide - heightOffset},
			{ x: -halfShortSide - widthOffset, y: combined - heightOffset},
			{ x: halfShortSide - widthOffset, y: combined - heightOffset},
			{ x: halfShortSide - widthOffset, y: halfShortSide - heightOffset},
			{ x: combined - widthOffset, y: halfShortSide - heightOffset},
			{ x: combined - widthOffset, y: -halfShortSide - heightOffset},
			{ x: halfShortSide - widthOffset, y: -halfShortSide - heightOffset},
			{ x: halfShortSide - widthOffset, y: -combined - heightOffset},
			{ x: -halfShortSide - widthOffset, y: -combined - heightOffset },

			PATH_BREAK,

			// Right Windmill
			{ x: -halfShortSide + widthOffset, y: -combined - heightOffset },
			{ x: -halfShortSide + widthOffset, y: - halfShortSide - heightOffset},
			{ x: - combined + widthOffset, y: -halfShortSide - heightOffset},
			{ x: - combined + widthOffset, y: halfShortSide - heightOffset},
			{ x: -halfShortSide + widthOffset, y: halfShortSide - heightOffset},
			{ x: -halfShortSide + widthOffset, y: combined - heightOffset},
			{ x: halfShortSide + widthOffset, y: combined - heightOffset},
			{ x: halfShortSide + widthOffset, y: halfShortSide - heightOffset},
			{ x: combined + widthOffset, y: halfShortSide - heightOffset},
			{ x: combined + widthOffset, y: -halfShortSide - heightOffset},
			{ x: halfShortSide + widthOffset, y: -halfShortSide - heightOffset},
			{ x: halfShortSide + widthOffset, y: -combined - heightOffset},
			{ x: -halfShortSide + widthOffset, y: -combined - heightOffset },
		];
		
		const centers = [
			{ x: 0, y: heightOffset },
			{ x: -widthOffset, y: -heightOffset },
			{ x: widthOffset, y: -heightOffset }
		];
		
		const baseRotation = rotationAngle * position;
		
		const rotationDirections = [1, -1, -1];
		
		const rotatedPositions = [];
		let currentPath = [];
		let centerIndex = 0;
		
		for (const point of windmillPositions) {
			if (isNaN(point.x) && isNaN(point.y)) {
				if (currentPath.length > 0) {
					const center = centers[centerIndex];
					const rotation = baseRotation * rotationDirections[centerIndex];
					const rotatedPath = this.rotatePathAroundCenter(currentPath, center, rotation);
					rotatedPositions.push(...rotatedPath);
					centerIndex++;
				}
				
				rotatedPositions.push(PATH_BREAK);
				
				currentPath = [];
			} else {
				currentPath.push(point);
			}
		}
		
		if (currentPath.length > 0) {
			const center = centers[centerIndex];
			const rotation = baseRotation * rotationDirections[centerIndex];
			const rotatedPath = this.rotatePathAroundCenter(currentPath, center, rotation);
			rotatedPositions.push(...rotatedPath);
		}
		
		return rotatedPositions;
	}

	static createDoubleBottomPattern(game: PongGame, position: number) {
		const longSide = 100;
		const shortSide = 20;
		const heightOffset = game.height / 5;
		const widthOffset = game.width / 4;
		const rotationAngle = Math.PI / 20;
		const PATH_BREAK = { x: NaN, y: NaN };
	
		const halfShortSide = shortSide / 2;
		const combined = longSide + shortSide;
		
		const windmillPositions = [
			// Center Windmill
			{ x: -halfShortSide, y: -combined - heightOffset },
			{ x: -halfShortSide, y: - halfShortSide - heightOffset},
			{ x: - combined, y: -halfShortSide - heightOffset},
			{ x: - combined, y: halfShortSide - heightOffset},
			{ x: -halfShortSide, y: halfShortSide - heightOffset},
			{ x: -halfShortSide, y: combined - heightOffset},
			{ x: halfShortSide, y: combined - heightOffset},
			{ x: halfShortSide, y: halfShortSide - heightOffset},
			{ x: combined, y: halfShortSide - heightOffset},
			{ x: combined, y: -halfShortSide - heightOffset},
			{ x: halfShortSide, y: -halfShortSide - heightOffset},
			{ x: halfShortSide, y: -combined - heightOffset},
			{ x: -halfShortSide, y: -combined - heightOffset },
			
			PATH_BREAK,
			
			// Left Windmill
			{ x: -halfShortSide - widthOffset, y: -combined + heightOffset },
			{ x: -halfShortSide - widthOffset, y: - halfShortSide + heightOffset},
			{ x: - combined - widthOffset, y: -halfShortSide + heightOffset},
			{ x: - combined - widthOffset, y: halfShortSide + heightOffset},
			{ x: -halfShortSide - widthOffset, y: halfShortSide + heightOffset},
			{ x: -halfShortSide - widthOffset, y: combined + heightOffset},
			{ x: halfShortSide - widthOffset, y: combined + heightOffset},
			{ x: halfShortSide - widthOffset, y: halfShortSide + heightOffset},
			{ x: combined - widthOffset, y: halfShortSide + heightOffset},
			{ x: combined - widthOffset, y: -halfShortSide + heightOffset},
			{ x: halfShortSide - widthOffset, y: -halfShortSide + heightOffset},
			{ x: halfShortSide - widthOffset, y: -combined + heightOffset},
			{ x: -halfShortSide - widthOffset, y: -combined + heightOffset },
	
			PATH_BREAK,
	
			// Right Windmill
			{ x: -halfShortSide + widthOffset, y: -combined + heightOffset },
			{ x: -halfShortSide + widthOffset, y: - halfShortSide + heightOffset},
			{ x: - combined + widthOffset, y: -halfShortSide + heightOffset},
			{ x: - combined + widthOffset, y: halfShortSide + heightOffset},
			{ x: -halfShortSide + widthOffset, y: halfShortSide + heightOffset},
			{ x: -halfShortSide + widthOffset, y: combined + heightOffset},
			{ x: halfShortSide + widthOffset, y: combined + heightOffset},
			{ x: halfShortSide + widthOffset, y: halfShortSide + heightOffset},
			{ x: combined + widthOffset, y: halfShortSide + heightOffset},
			{ x: combined + widthOffset, y: -halfShortSide + heightOffset},
			{ x: halfShortSide + widthOffset, y: -halfShortSide + heightOffset},
			{ x: halfShortSide + widthOffset, y: -combined + heightOffset},
			{ x: -halfShortSide + widthOffset, y: -combined + heightOffset },
		];
		
		const centers = [
			{ x: 0, y: -heightOffset },
			{ x: -widthOffset, y: heightOffset },
			{ x: widthOffset, y: heightOffset }
		];
		
		const baseRotation = rotationAngle * position;

		const rotationDirections = [1, -1, -1]; 
		
		const rotatedPositions = [];
		let currentPath = [];
		let centerIndex = 0;
		
		for (const point of windmillPositions) {
			if (isNaN(point.x) && isNaN(point.y)) {
				if (currentPath.length > 0) {
					const center = centers[centerIndex];
					const rotation = baseRotation * rotationDirections[centerIndex];
					const rotatedPath = this.rotatePathAroundCenter(currentPath, center, rotation);
					rotatedPositions.push(...rotatedPath);
					centerIndex++;
				}
				
				rotatedPositions.push(PATH_BREAK);
				
				currentPath = [];
			} else {
				currentPath.push(point);
			}
		}

		if (currentPath.length > 0) {
			const center = centers[centerIndex];
			const rotation = baseRotation * rotationDirections[centerIndex];
			const rotatedPath = this.rotatePathAroundCenter(currentPath, center, rotation);
			rotatedPositions.push(...rotatedPath);
		}
		
		return rotatedPositions;
	}
	
	static rotatePathAroundCenter(path: Array<{x: number, y: number}>, center: {x: number, y: number}, rotation: number) {
		return path.map(point => {
			const x = point.x - center.x;
			const y = point.y - center.y;
			
			const rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation);
			const rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation);
			
			return {
				x: rotatedX + center.x,
				y: rotatedY + center.y
			};
		});
	}
}
  