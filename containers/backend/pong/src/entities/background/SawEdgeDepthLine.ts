/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SawEdgeDepthLine.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/19 15:56:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';
import { drawPointOpenPath } from '../../utils/Utils';

export class SawEdgeDepthLine extends DepthLine {
	peakHeight?: number;
	type?: string;
	points: Point[] = [];

	constructor(id: string, layer: string, game: PongGame, options: PyramidDepthLineOptions = {}, flip: number) {
		super(id, layer, game, options);

		this.peakHeight = options.behavior!.linePekHeight;
		this.type = options.type;

		const color = game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		if (render) {
			render.graphic = this.generateSawEdgeLine(this.width, color, options.behavior!.direction!, flip);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateSawEdgeLine(width: number, color: number, direction: string, flip: number): Graphics {
		const line = new Graphics();
		let sign = 1;
		let offset = this.game.paddleOffset + (this.game.paddleWidth / 2);

		if (direction === 'upwards') {
			sign = -1;
			offset *= -1;
		}

		let halfWidth = width / 2  * sign;
		let fourthWidth = width / 4 * sign;
		let sixthWidth = width / 6 * sign;

		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight! : this.peakHeight!;
		const peakX = 0;

		const thirdHeight = peakY / 2.5;


		this.points = [
			new Point(-halfWidth, 0),
			new Point(-halfWidth, thirdHeight * 1.25),
			new Point(-halfWidth + offset, thirdHeight * 1.25),
			new Point(-halfWidth + (sixthWidth / 2), thirdHeight * 1.25),
			new Point(-halfWidth + (sixthWidth), thirdHeight / 6),
			new Point(-halfWidth + (sixthWidth * 2), thirdHeight * 2),
			new Point(peakX, thirdHeight / 6),
			new Point(fourthWidth, thirdHeight * 3),
			new Point(halfWidth - offset, 0),
			new Point(halfWidth, 0)
		];

		if (flip) {
			for (const point of this.points) {
				point.x *= -1;
			}
		}

		// Use the utility function to draw the path
		drawPointOpenPath(line, this.points, color);

		return line;
	}
}