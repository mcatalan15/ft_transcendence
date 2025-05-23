/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LedgeSegment.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/16 11:59:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/23 12:59:01 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { Obstacle } from './Obstacle';

import { RenderComponent } from "../../components/RenderComponent";

import { LedgePatternManager } from '../../managers/LedgePatternManager';

import { ObstacleOptions } from '../../utils/Types';
import { drawPointPath, generateLedgePoints } from '../../utils/Utils';

export class LedgeSegment extends Obstacle {
	points: Point[] = [];
	segmentIndices: { start: number; count: number; }[] = [];
	color: number = this.game.currentWorld.color;

	constructor(game: PongGame, options: ObstacleOptions, type: string, id: string, layer: string) {
		super(game, id, layer, options);
		
		const render = this.getComponent('render') as RenderComponent;
		if (render) {
			render.graphic = this.generateLedgeLine(game, this.color);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateLedgeLine(game: PongGame, color: number): Graphics {
		const line = new Graphics();

		let ledgePositions = LedgePatternManager.createLedgePattern(game);

		this.points = [];
		this.segmentIndices = [];
		
		const pathSegments: {x: number, y: number}[][] = [];
		let currentPath: {x: number, y: number}[] = [];
		
		for (const pos of ledgePositions) {
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
			
			const pathPoints = generateLedgePoints(pathPositions);
			this.points.push(...pathPoints);
			pointIndex += pathPoints.length;
			
			line.beginPath();
			drawPointPath(line, pathPoints, color, false);
			line.closePath();
		}

		return line;
	}
}