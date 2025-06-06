/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   snakeSegment.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/16 11:59:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 16:47:09 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { Obstacle } from './Obstacle';

import { RenderComponent } from "../../components/RenderComponent";

import { SnakePatternManager} from '../../managers/SnakePatternManager';

import { ObstacleBehavior, ObstacleOptions } from '../../utils/Types';
import { drawPointPath, generateSnakePoints } from '../../utils/Utils';

export class SnakeSegment extends Obstacle {
	points: Point[] = [];
	segmentIndices: { start: number; count: number; }[] = [];
	color: number = this.game.currentWorld.color;

	constructor(game: PongGame, options: ObstacleOptions, type: string, id: string, layer: string, pattern: number, position: number) {
		super(game, id, layer, options);
		
		const render = this.getComponent('render') as RenderComponent;
		
		if (render) {
			render.graphic = this.generateSnakeLine(game, this.color, pattern, position);
			render.graphic.position.set(this.x, this.y);
		}
	}

	
	private generateSnakeLine(game: PongGame, color: number, pattern: number, position: number): Graphics {
		const line = new Graphics();
		
		let snakePositions;
	
		switch (pattern) {
			case (0):
				snakePositions = SnakePatternManager.createViperPattern(game, position);
				break;
			default:
				snakePositions = SnakePatternManager.createSnakePattern(game, position);
				break;
		}
	
		this.points = [];
		this.segmentIndices = [];
		
		const pathSegments: {x: number, y: number}[][] = [];
		let currentPath: {x: number, y: number}[] = [];
		
		for (const pos of snakePositions) {
			if (isNaN(pos.x) && isNaN(pos.y)) {
				if (currentPath.length > 0) {
					pathSegments.push([...currentPath]);
					currentPath = [];
				}
			} else {
				currentPath.push(pos);
			}
		}
		
		if (currentPath.length > 0) {
			pathSegments.push(currentPath);
		}
		
		let pointIndex = 0;
		
		for (const pathPositions of pathSegments) {
			this.segmentIndices.push({
				start: pointIndex,
				count: pathPositions.length
			});
			
			const pathPoints = generateSnakePoints(pathPositions);
			this.points.push(...pathPoints);
			pointIndex += pathPoints.length;
			
			line.beginPath();
			drawPointPath(line, pathPoints, color, false);
			line.closePath();
		}
		
		return line;
	}	
}