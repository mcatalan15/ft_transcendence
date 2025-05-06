/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PyramidDepthLine.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/06 16:10:19 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { Entity } from "../../engine/Entity";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';

export class PyramidDepthLine extends DepthLine {
	baseHeight: number;
	peakHeight: number;
	peakOffset: number;
	baseWidth: number;
	type?: string ;
	points: Point[] = [];
    cuttingPoints: Point[] = [];

	constructor(id: string, layer: string, game: PongGame, options: PyramidDepthLineOptions = {}) {
		super(id, layer, game, options);

		// Behavior-based parameters
		if (options.behavior) {
			this.baseHeight = options.behavior.pyramidBaseHeight ?? 4;
			this.baseWidth = options.behavior.pyramidBaseWidth ?? (this.width / 12);
			this.peakHeight = options.behavior.pyramidPeakHeight ?? 10;
			this.peakOffset = options.behavior.pyramidPeakOffset ?? 0;
		} else {
			this.baseHeight = options.baseHeight ?? 4;
			this.baseWidth = this.width / 12;
			this.peakHeight = options.peakHeight ?? 10;
			this.peakOffset = options.peakOffset ?? 0;
		}

		this.type = options.type;

		const color = game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		if (render) {
			render.graphic = this.generatePyramidLine(this.width, color);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generatePyramidLine(width: number, color: number): Graphics {
		const g = new Graphics();
		const halfWidth = width / 2;

		const baseY = this.behavior?.direction === 'downwards' ? -this.baseHeight : this.baseHeight;
		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight : this.peakHeight;
		const peakX = this.peakOffset;

		const baseLeftX = peakX - this.baseWidth / 2;
		const baseRightX = peakX + this.baseWidth / 2;

		this.points = [
			new Point(-halfWidth, 0),
			new Point(baseLeftX, baseY),
			new Point(peakX, peakY),
			new Point(baseRightX, baseY),
			new Point(halfWidth, 0)
		];

		// Draw using points
		g.moveTo(this.points[0].x, this.points[0].y);
		for (let i = 1; i < this.points.length; i++) {
			g.lineTo(this.points[i].x, this.points[i].y);
		}

		// Stylize
		g.stroke({
			width: 0.5,
			color: color,
			alpha: 1,
			alignment: 0.5,
			cap: 'round',
			join: 'round',
			miterLimit: 10
		});

		return g;
	}

    getCuttingPoints(depthLine: PyramidDepthLine) {
        this.cuttingPoints = depthLine.points;
    }
}