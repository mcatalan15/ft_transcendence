/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SnakePatternManager.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/19 09:08:04 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 20:37:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

export class SnakePatternManager {
	static createSnakePattern(game: PongGame, position: number) {
		const longSide = 300;
		const shortSide = 50;
		const heightOffset = game.height / 6.5;
		const maxHorizontalDistance = game.width / 4;
		const PATH_BREAK = { x: NaN, y: NaN }; 

		const topMovementPhase = position * Math.PI / 25 - Math.PI / 2;
		const topHorizontalOffset = Math.sin(topMovementPhase) * maxHorizontalDistance;

		const bottomMovementPhase = position * Math.PI / 25 + Math.PI / 2;
		const bottomHorizontalOffset = Math.sin(bottomMovementPhase) * maxHorizontalDistance;
		
		const lanePositions = [
			{ x: -longSide + topHorizontalOffset, y: -shortSide / 2 - heightOffset},
			{ x: -longSide + topHorizontalOffset, y: shortSide / 2 - heightOffset},
			{ x: longSide + topHorizontalOffset, y: shortSide / 2  - heightOffset},
			{ x: longSide + topHorizontalOffset, y: -shortSide / 2 - heightOffset},
			{ x: topHorizontalOffset, y: -(2 * shortSide) - heightOffset},
	
			PATH_BREAK,
	
			{ x: -longSide + bottomHorizontalOffset, y: -shortSide / 2 + heightOffset},
			{ x: -longSide + bottomHorizontalOffset, y: shortSide / 2 + heightOffset},
			{ x: bottomHorizontalOffset, y: (2 * shortSide) + heightOffset},
			{ x: longSide + bottomHorizontalOffset, y: shortSide / 2  + heightOffset},
			{ x: longSide + bottomHorizontalOffset, y: -shortSide / 2 + heightOffset},
		];
		
		return lanePositions;
	}

	static createViperPattern(game: PongGame, position: number) {
		const longSide = 300;
		const shortSide = 50;
		const heightOffset = game.height / 5;
		const maxHorizontalDistance = game.width / 4;
		const PATH_BREAK = { x: NaN, y: NaN }; 
	
		const topMovementPhase = position * Math.PI / 25 + Math.PI / 2;
		const topHorizontalOffset = Math.sin(topMovementPhase) * maxHorizontalDistance;
		
		const bottomMovementPhase = position * Math.PI / 25 - Math.PI / 2;
		const bottomHorizontalOffset = Math.sin(bottomMovementPhase) * maxHorizontalDistance;
		
		const lanePositions = [
			{ x: -longSide + topHorizontalOffset, y: -shortSide / 2 - heightOffset},
			{ x: -longSide + topHorizontalOffset, y: shortSide / 2 - heightOffset},
			{ x: topHorizontalOffset, y: (2 * shortSide) - heightOffset},
			{ x: longSide + topHorizontalOffset, y: shortSide / 2  - heightOffset},
			{ x: longSide + topHorizontalOffset, y: -shortSide / 2 - heightOffset},
	
			PATH_BREAK,
	
			{ x: -longSide + bottomHorizontalOffset, y: -shortSide / 2 + heightOffset},
			{ x: -longSide + bottomHorizontalOffset, y: shortSide / 2 + heightOffset},
			{ x: longSide + bottomHorizontalOffset, y: shortSide / 2  + heightOffset},
			{ x: longSide + bottomHorizontalOffset, y: -shortSide / 2 + heightOffset},
			{ x: bottomHorizontalOffset, y: -(2 * shortSide) + heightOffset},
		];
		
		return lanePositions;
	}
}