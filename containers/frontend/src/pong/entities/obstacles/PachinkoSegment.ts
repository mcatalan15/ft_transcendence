/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PachinkoSegment.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/16 11:59:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/20 17:22:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { Obstacle } from './Obstacle';

import { RenderComponent } from "../../components/RenderComponent";

import { PachinkoPatternManager } from '../../managers/PachinkoPatternManager';

import { ObstacleOptions } from '../../utils/Types';
import { drawPointPath, generateCirclePoints } from '../../utils/Utils';

export class PachinkoSegment extends Obstacle {
	points: Point[] = [];

	constructor(game: PongGame, options: ObstacleOptions, type: string, id: string, layer: string, pattern: number) {
		super(game, id, layer, options);
		
		const color = this.game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		
		if (render) {
			render.graphic = this.generatePachinkoLine(game, color, pattern);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generatePachinkoLine(game: PongGame, color: number, pattern: number): Graphics {
		const line = new Graphics();
		
		const radius = Math.min(game.width / 20, game.height / 80) * 1.5;
		
		let circlePositions;
		switch (pattern) {
			case (0):
				circlePositions = PachinkoPatternManager.createDiamondPattern(radius);
				break;
			case (1):
				circlePositions = PachinkoPatternManager.createHexGridPattern(radius);
				break;
			default:
				circlePositions = PachinkoPatternManager.createDoubleFunnelPattern(radius);
				break;
		}
		
		this.points = [];
		
		circlePositions.forEach(pos => {
			const circlePoints = generateCirclePoints(pos.x, pos.y, radius, 32);
			
			this.points.push(...circlePoints);
			
			line.beginPath();
			drawPointPath(line, circlePoints, color, false);
			line.closePath();
		});
		
		return line;
	}
}