/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RuinDepthLine.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/08 17:48:50 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { RuinDepthLineOptions } from '../../utils/Types';

export class RuinDepthLine extends DepthLine {
	hSegments: number;
	vSegments: number;
	hOffset: number;
	maxHeight: number;
	maxWidth: number;
	segmentWidths: number[] = [];
	segmentHeights: number[] = [];
	type?: string;
	points: Point[] = [];
    cuttingPoints: Point[] = [];

	constructor(id: string, layer: string, game: PongGame, options: RuinDepthLineOptions = {}) {
		super(id, layer, game, options);

		// Behavior-based parameters
		this.hSegments = options.behavior?.ruinHSegments ?? 4;
		this.vSegments = this.hSegments - 1;
		this.hOffset = game.width / 8;

		this.segmentWidths = options.segmentWidths!;
		this.segmentHeights = options.segmentHeights!;

		// Set maximum height and width for the ruin line
		this.maxHeight = options.maxHeight!;
		this.maxWidth = options.maxWidth!;
		
		this.type = options.type;

		const color = game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		if (render) {
			render.graphic = this.generateRuinLine(color);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateRuinLine(color: number): Graphics {
		const line = new Graphics();
		const halfWidth = this.game.width / 2;
	
		// Calculate the total width available for zigzag pattern
		const totalWidth = this.maxWidth;
		
		// Determine the boundary points
		const leftEdge = -halfWidth;
		const leftOffset = -halfWidth + this.hOffset;
		const rightOffset = halfWidth - this.hOffset;
		const rightEdge = halfWidth;
		
		// Reserve space for the final segments - make zigzag pattern slightly smaller
		// This ensures we don't overshoot the right boundary
		const zigzagWidth = rightOffset - leftOffset;
		const adjustedSegmentWidths = this.segmentWidths.map(w => w * 0.9); // Scale down slightly
		
		// Start at the left edge of the screen
		this.points = [];
		this.points.push(new Point(leftEdge, 0));
		this.points.push(new Point(leftOffset, 0));
		
		// Current position for building the zigzag
		let currentX = leftOffset;
		let currentY = 0;
		
		// Create the main zigzag pattern
		// But stop before the last vertical segment to ensure controlled ending
		for (let i = 0; i < this.vSegments - 1; i++) {
			// Add vertical segment
			currentY -= this.segmentHeights[i];
			this.points.push(new Point(currentX, currentY));
			
			// Add horizontal segment if not at the end
			if (i < this.hSegments - 2) { // Use -2 instead of -1 to leave room for controlled ending
				currentX += adjustedSegmentWidths[i];
				// Make sure we don't exceed our right boundary
				currentX = Math.min(currentX, rightOffset - this.hOffset/2);
				this.points.push(new Point(currentX, currentY));
			}
		}
		
		// Now add the final segments with careful control
		
		// If we're not close enough to the right edge, add a horizontal segment to get closer
		if (currentX < rightOffset - this.hOffset) {
			const remainingDistance = rightOffset - this.hOffset - currentX;
			currentX += remainingDistance;
			this.points.push(new Point(currentX, currentY));
		}
		
		// Add the last vertical segment to go back to baseline
		this.points.push(new Point(currentX, 0));
		
		// Add the offset point and the right edge
		this.points.push(new Point(rightOffset, 0));
		this.points.push(new Point(rightEdge, 0));
		
		// Draw the line
		line.moveTo(this.points[0].x, this.points[0].y);
		for (let i = 1; i < this.points.length; i++) {
			line.lineTo(this.points[i].x, this.points[i].y);
		}
	
		// Style the line
		line.stroke({
			width: 0.5,
			color: color,
			alpha: 1,
			alignment: 0.5,
			cap: 'round',
			join: 'round',
			miterLimit: 10
		});
	
		return line;
	}

    getCuttingPoints(depthLine: RuinDepthLine) {
        this.cuttingPoints = depthLine.points;
    }
}