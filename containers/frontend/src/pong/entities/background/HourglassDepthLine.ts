/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HourglassDepthLine.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 17:57:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';
import { drawPointOpenPath } from '../../utils/Utils';

export class HourglassDepthLine extends DepthLine {
	peakHeight?: number;
	type?: string;
	points: Point[] = [];

	constructor(id: string, layer: string, game: PongGame, options: PyramidDepthLineOptions = {}) {
		super(id, layer, game, options);

		this.peakHeight = options.behavior!.linePekHeight;
		this.type = options.type;

		const color = this.game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		if (render) {
			render.graphic = this.generateAcceleratorLine(this.width, color, options.behavior!.direction!);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateAcceleratorLine(width: number, color: number, direction: string): Graphics {
		const line = new Graphics();
		let sign = 1;
		let offset = this.game.paddleOffset + (this.game.paddleWidth / 2);

		if (direction === 'upwards') {
			sign = -1;
			offset *= -1;
		}

		const halfWidth = width / 2  * sign;
		const fourthWidth = width / 4 * sign;
		const eigthWidth = width / 16 * sign;

		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight! : this.peakHeight!;

		const halfHeight = peakY / 1.2;
		const thirdHeight = peakY / 3.5;
		const eigthHeight = peakY / 8;

		/* this.points = [
			new Point(-halfWidth, 0),
			new Point(-halfWidth + fourthWidth, 0),
			new Point(-halfWidth + (fourthWidth + eigthWidth), thirdHeight),
			new Point(-halfWidth + (3 * eigthWidth), thirdHeight),
			new Point(-halfWidth + (4 * eigthWidth), halfHeight),
			new Point(fourthWidth, halfHeight),
			new Point(fourthWidth + eigthWidth, thirdHeight),
			new Point(fourthWidth + 2 * eigthWidth, thirdHeight),
			new Point(fourthWidth + 3 * eigthWidth, 0),
			new Point(halfWidth, 0),
		]; */

		this.points = [
			new Point(-halfWidth, 0),
			new Point(-halfWidth + fourthWidth, 0),
			new Point(-halfWidth + (eigthWidth +fourthWidth), halfHeight),
			new Point(eigthWidth + (eigthWidth + (eigthWidth)), halfHeight),
			new Point(eigthHeight + fourthWidth , 0),
			new Point(halfWidth, 0),
		];

		// Use the utility function to draw the path
		drawPointOpenPath(line, this.points, color);

		return line;
	}
}