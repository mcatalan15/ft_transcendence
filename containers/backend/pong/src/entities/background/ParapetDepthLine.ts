/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParapetDepthLine.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 15:23:30 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';

export class ParapetDepthLine extends DepthLine {
	peakHeight?: number;
	type?: string ;
	points: Point[] = [];

	constructor(id: string, layer: string, game: PongGame, options: PyramidDepthLineOptions = {}) {
		super(id, layer, game, options);

		this.peakHeight = options.behavior!.pyramidPeakHeight;

		this.type = options.type;

		const color = game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		if (render) {
			render.graphic = this.generateParapetLine(this.width, color);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateParapetLine(width: number, color: number): Graphics {
		const line = new Graphics();
		const halfWidth = width / 2;
		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight! : this.peakHeight!;
		const peakX = this.behavior?.direction === 'downwards' ? -100 : 100;

		if (this.behavior.direction === 'downwards') {
			this.points = [
				new Point(-halfWidth, 0),
				new Point(-halfWidth, peakY),
				new Point(peakX, peakY),
				new Point(peakX, 0),
				new Point(halfWidth, 0)
		]} else {
			this.points = [
				new Point(halfWidth, 0),
				new Point(halfWidth, peakY),
				new Point(peakX, peakY),
				new Point(peakX, 0),
				new Point(-halfWidth, 0)
		]};

		// Draw using points
		line.moveTo(this.points[0].x, this.points[0].y);
		for (let i = 1; i < this.points.length; i++) {
			line.lineTo(this.points[i].x, this.points[i].y);
		}

		// Stylize
		line.stroke({
			width: 2,
			color: color,
			alpha: 1,
			alignment: 0.5,
			cap: 'round',
			join: 'round',
			miterLimit: 10
		});

		return line;
	}
}