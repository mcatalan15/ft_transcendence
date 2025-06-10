/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MawDepthLine.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/22 16:33:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';
import { drawPointOpenPath } from '../../utils/Utils';

export class MawDepthLine extends DepthLine {
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
			render.graphic = this.generateMawLine(this.width, color, options.behavior!.direction!);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateMawLine(width: number, color: number, direction: string): Graphics {
		const line = new Graphics();
		let sign = 1;
		let offset = this.game.paddleOffset + (this.game.paddleWidth / 2);
		
		if (direction === 'upwards') {
			sign = -1;
			offset *= -1;
		}

		const halfWidth = width / 2  * sign;
		const thirdWidth = width / 3 * sign;
		const sixthWidth = width / 6 * sign;

		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight! : this.peakHeight!;
		const peakX = 0;

		const halfHeight = peakY / 2;
		const fourthHeight = peakY / 4;


		this.points = [
			new Point(-halfWidth, 0),
			new Point(-halfWidth + offset, 0),
			new Point(-halfWidth + sixthWidth, halfHeight - (fourthHeight / 2)),
			new Point(-halfWidth + sixthWidth, (fourthHeight * 2)),
			new Point(-halfWidth + thirdWidth, fourthHeight),
			new Point(-halfWidth + thirdWidth, (fourthHeight * 2)),
			new Point(-halfWidth + thirdWidth + (sixthWidth / 2), fourthHeight),
			new Point(sixthWidth / 2, fourthHeight),
			new Point(sixthWidth, (fourthHeight * 2)),
			new Point(sixthWidth, fourthHeight),
			new Point(thirdWidth, (fourthHeight * 2)),
			new Point(thirdWidth, halfHeight - (fourthHeight / 2)),
			new Point(halfWidth - offset, 0),
			new Point(halfWidth, 0),
		];

		// Use the utility function to draw the path
		drawPointOpenPath(line, this.points, color);

		return line;
	}
}