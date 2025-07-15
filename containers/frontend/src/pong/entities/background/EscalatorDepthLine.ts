/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   EscalatorDepthLine.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/21 12:08:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';
import { drawPointOpenPath } from '../../utils/Utils';

export class EscalatorDepthLine extends DepthLine {
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
			render.graphic = this.generateEscalatorLine(this.width, color, options.behavior!.direction!);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateEscalatorLine(width: number, color: number, direction: string): Graphics {
		const line = new Graphics();
		let sign = 1;
		if (direction === 'upwards') {
			sign = -1;
		}

		let halfWidth = width / 2  * sign;
		let seventhWidth = width / 7 * sign;
		let fourteenthWidth = width / 14 * sign;

		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight! : this.peakHeight!;
		const peakX = 0;

		const fifthHeight = peakY / 5;

		this.points = [
			new Point(-halfWidth, 0),
			new Point(-halfWidth + seventhWidth, 0),
			new Point(-halfWidth + seventhWidth, fifthHeight),
			new Point(-halfWidth + (2 * seventhWidth), fifthHeight),
			new Point(-halfWidth + (2 * seventhWidth), 2 * fifthHeight),
			new Point(-halfWidth + (3 * seventhWidth), 2 * fifthHeight),
			new Point(-halfWidth + (3 * seventhWidth), 3 * fifthHeight),
			new Point(-halfWidth + (4 * seventhWidth), 3 * fifthHeight),
			new Point(-halfWidth + (4 * seventhWidth), 2 * fifthHeight),
			new Point(-halfWidth + (5 * seventhWidth), 2 * fifthHeight),
			new Point(-halfWidth + (5 * seventhWidth), fifthHeight),
			new Point(-halfWidth + (6 * seventhWidth), fifthHeight),
			new Point(-halfWidth + (6 * seventhWidth), 0),
			new Point(halfWidth, 0),
		];

		// Use the utility function to draw the path
		drawPointOpenPath(line, this.points, color);

		return line;
	}
}