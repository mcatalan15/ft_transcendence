/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PachinkoSegment.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/16 11:59:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/16 21:31:03 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { Obstacle } from './Obstacle';

import { RenderComponent } from "../../components/RenderComponent";

import { PachinkoPatterns } from './PachinkoPatterns';

import { ObstacleBehavior, ObstacleOptions } from '../../utils/Types';
import { drawPointPath, generateCirclePoints } from '../../utils/Utils';

export class PachinkoSegment extends Obstacle {
	points: Point[] = [];

	constructor(game: PongGame, options: ObstacleOptions, type: string, id: string, layer: string) {
		super(game, id, layer, options);
		
		const color = this.game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;

		if (render) {
			render.graphic = this.generatePachinkoLine(game, color);
			render.graphic.position.set(this.x, this.y);
		}
	}

	
	private generatePachinkoLine(game: PongGame, color: number): Graphics {
		const line = new Graphics();
		
		const radius = Math.min(game.width / 20, game.height / 80); // Size of each circle
		
		// Define positions for multiple circles
		const circlePositions = [
			{ x: 0, y: 0 },
			{ x: 0, y: radius * 10 },
			{ x: 0, y: -radius * 10 },
			{ x: 0, y: radius * 20 },
			{ x: 0, y: -radius * 20 },
			{ x: 0, y: radius * 30 },
			{ x: 0, y: -radius * 30 },

			{ x: radius * 5, y: radius * 5 },
			{ x: radius * 5, y: -radius * 5 },
			{ x: radius * 5, y: radius * 15 },
			{ x: radius * 5, y: -radius * 15 },
			{ x: radius * 5, y: radius * 25 },
			{ x: radius * 5, y: -radius * 25 },

			{ x: radius * 10, y: 0 },
			{ x: radius * 10, y: radius * 10 },
			{ x: radius * 10, y: -radius * 10 },
			{ x: radius * 10, y: radius * 20 },
			{ x: radius * 10, y: -radius * 20 },

			{ x: radius * 15, y: radius * 5 },
			{ x: radius * 15, y: -radius * 5 },
			{ x: radius * 15, y: radius * 15 },
			{ x: radius * 15, y: -radius * 15 },

			{ x: radius * 20, y: 0 },
			{ x: radius * 20, y: radius * 10 },
			{ x: radius * 20, y: -radius * 10 },
			
			{ x: radius * 25, y: radius * 5 },
			{ x: radius * 25, y: -radius * 5 },

			{ x: radius * 30, y: 0 },

			{ x: -radius * 5, y: -radius * 5 },
			{ x: -radius * 5, y: radius * 5 },
			{ x: -radius * 5, y: -radius * 15 },
			{ x: -radius * 5, y: radius * 15 },
			{ x: -radius * 5, y: -radius * 25 },
			{ x: -radius * 5, y: radius * 25 },

			{ x: -radius * 10, y: 0 },
			{ x: -radius * 10, y: -radius * 10 },
			{ x: -radius * 10, y: radius * 10 },
			{ x: -radius * 10, y: -radius * 20 },
			{ x: -radius * 10, y: radius * 20 },

			{ x: -radius * 15, y: -radius * 5 },
			{ x: -radius * 15, y: radius * 5 },
			{ x: -radius * 15, y: -radius * 15 },
			{ x: -radius * 15, y: radius * 15 },

			{ x: -radius * 20, y: 0 },
			{ x: -radius * 20, y: -radius * 10 },
			{ x: -radius * 20, y: radius * 10 },
			
			{ x: -radius * 25, y: -radius * 5 },
			{ x: -radius * 25, y: radius * 5 },

			{ x: -radius * 30, y: 0 },
		];
		
		// Store all points for all circles
		this.points = [];
		
		// Generate and draw each circle
		circlePositions.forEach(pos => {
			// Generate points for this circle
			const circlePoints = generateCirclePoints(pos.x, pos.y, radius, 32);
			
			// Add these points to our collection
			this.points.push(...circlePoints);
			
			// Begin a new path for each circle
			line.beginPath();
			drawPointPath(line, circlePoints, color, false);
			line.closePath();
		});
		
		return line;
	}
}