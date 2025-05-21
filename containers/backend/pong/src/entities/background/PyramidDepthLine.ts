/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PyramidDepthLine.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/21 09:49:49 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';
import { drawPointOpenPath } from '../../utils/Utils';

export class PyramidDepthLine extends DepthLine {
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
			render.graphic = this.generatePyramidLine(this.width, color);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generatePyramidLine(width: number, color: number): Graphics {
		const line = new Graphics();
		const halfWidth = width / 2;

		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight! : this.peakHeight!;
		const peakX = 0;
		const offset = this.game.paddleOffset + (this.game.paddleWidth / 2);

		this.points = [
			new Point(-halfWidth, 0),
			new Point(-halfWidth + offset, 0),
			new Point(peakX, peakY),
			new Point(halfWidth - offset, 0),
			new Point(halfWidth, 0)
		];

		// Use the utility function to draw the path
		drawPointOpenPath(line, this.points, color);

		return line;
	}
}