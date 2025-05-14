/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParapetDepthLine.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 17:55:46 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';
import { drawPointPath } from '../../utils/Utils';

export class ParapetDepthLine extends DepthLine {
	peakHeight?: number;
	type?: string;
	points: Point[] = [];

	constructor(id: string, layer: string, game: PongGame, options: PyramidDepthLineOptions = {}) {
		super(id, layer, game, options);

		this.peakHeight = options.behavior!.linePekHeight;
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
			];
		} else {
			this.points = [
				new Point(halfWidth, 0),
				new Point(halfWidth, peakY),
				new Point(peakX, peakY),
				new Point(peakX, 0),
				new Point(-halfWidth, 0)
			];
		}

		// Use the utility function to draw the path
		drawPointPath(line, this.points, color);

		return line;
	}
}