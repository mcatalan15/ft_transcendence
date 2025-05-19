/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WindmillSegment.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/16 11:59:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/19 12:07:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { Obstacle } from './Obstacle';

import { RenderComponent } from "../../components/RenderComponent";

import { WindmillPatternManager} from '../../managers/WindmillPatternManager';

import { ObstacleBehavior, ObstacleOptions } from '../../utils/Types';
import { drawPointPath, generateWindmillPoints } from '../../utils/Utils';

export class WindmillSegment extends Obstacle {
	points: Point[] = [];
	segmentIndices: { start: number; count: number; }[] = [];
	color: number = 0;

	constructor(game: PongGame, options: ObstacleOptions, type: string, id: string, layer: string, pattern: number, position: number) {
		super(game, id, layer, options);
		
		const color = this.game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		
		if (render) {
			render.graphic = this.generateWindmillLine(game, color, pattern, position);
			render.graphic.position.set(this.x, this.y);
		}
	}

	
	private generateWindmillLine(game: PongGame, color: number, pattern: number, position: number): Graphics {
		const line = new Graphics();
		
		let windmillPositions;
	
		switch (pattern) {
			case (0):
				windmillPositions = WindmillPatternManager.createDoubleTopPattern(game, position);
				break;
			default:
				windmillPositions = WindmillPatternManager.createDoubleBottomPattern(game, position);
				break;
		}
	
		this.points = [];
		this.segmentIndices = [];
		
		const pathSegments: {x: number, y: number}[][] = [];
		let currentPath: {x: number, y: number}[] = [];
		
		for (const pos of windmillPositions) {
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
			
			const pathPoints = generateWindmillPoints(pathPositions);
			this.points.push(...pathPoints);
			pointIndex += pathPoints.length;
			
			line.beginPath();
			drawPointPath(line, pathPoints, color, false);
			line.closePath();
		}
		
		return line;
	}	
}