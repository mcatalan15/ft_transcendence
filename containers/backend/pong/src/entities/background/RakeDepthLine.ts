/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RakeDepthLine.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/19 15:56:33 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';
import { drawPointOpenPath } from '../../utils/Utils';

export class RakeDepthLine extends DepthLine {
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
		const ninthWidth = width / 9 * sign;

		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight! : this.peakHeight!;
		const peakX = 0;

		const halfHeight = peakY / 2;
		const twelfthHeight = peakY / 5;


		this.points = [
			new Point(-halfWidth, 0),
			new Point(-halfWidth + ninthWidth, 0),
			new Point(-halfWidth + ninthWidth, twelfthHeight),
			new Point(-halfWidth + (ninthWidth * 2), (twelfthHeight * 2)),
			new Point(-halfWidth + (ninthWidth * 2), twelfthHeight),
			new Point(-halfWidth + (ninthWidth * 3), twelfthHeight),
			new Point(-halfWidth + (ninthWidth * 3), (twelfthHeight * 3)),
			new Point(-halfWidth + (ninthWidth * 4), (twelfthHeight * 4)),
			new Point(-halfWidth + (ninthWidth * 4), twelfthHeight * 2),
			new Point(-halfWidth + (ninthWidth * 5), twelfthHeight * 2),
			new Point(-halfWidth + (ninthWidth * 5), (twelfthHeight * 4)),
			new Point(-halfWidth + (ninthWidth * 6), (twelfthHeight * 3)),
			new Point(-halfWidth + (ninthWidth * 6), twelfthHeight),
			new Point(-halfWidth + (ninthWidth * 7), twelfthHeight),
			new Point(-halfWidth + (ninthWidth * 7), (twelfthHeight * 2)),
			new Point(-halfWidth + (ninthWidth * 8), (twelfthHeight * 1)),
			new Point(-halfWidth + (ninthWidth * 8), 0),
			new Point(halfWidth, 0),
		];

		drawPointOpenPath(line, this.points, color);

		return line;
	}
}