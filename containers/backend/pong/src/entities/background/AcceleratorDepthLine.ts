/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AcceleratorDepthLine.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/19 15:55:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';
import { drawPointOpenPath } from '../../utils/Utils';

export class AcceleratorDepthLine extends DepthLine {
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
		const eigthWidth = width / 8 * sign;

		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight! : this.peakHeight!;

		const fourthHeight = peakY / 4;
		const eigthHeight = peakY / 8;


		this.points = [
			new Point(-halfWidth, 0),
			new Point(-halfWidth, fourthHeight * 2),
			new Point(-halfWidth + offset, fourthHeight * 2),
			new Point(-halfWidth + (fourthWidth / 2), eigthHeight),
			new Point(-halfWidth + fourthWidth + eigthWidth / 2, eigthHeight * 7),
			new Point(fourthWidth - eigthWidth / 2, eigthHeight * 7),
			new Point(fourthWidth + eigthWidth, eigthHeight),
			new Point(halfWidth - offset, fourthHeight * 2),
			new Point(halfWidth, fourthHeight * 2),
			new Point(halfWidth, 0),
		];

		// Use the utility function to draw the path
		drawPointOpenPath(line, this.points, color);

		return line;
	}
}