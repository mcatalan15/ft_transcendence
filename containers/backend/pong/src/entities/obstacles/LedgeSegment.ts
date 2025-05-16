/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LedgeSegment.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/16 11:59:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/16 16:01:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { Obstacle } from './Obstacle';

import { RenderComponent } from "../../components/RenderComponent";

import { ObstacleBehavior, ObstacleOptions } from '../../utils/Types';
import { drawPointPath } from '../../utils/Utils';

export class LedgeSegment extends Obstacle {
	points: Point[] = [];

	constructor(game: PongGame, options: ObstacleOptions, type: string, id: string, layer: string) {
		super(game, id, layer, options);

		const color = this.game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		if (render) {
			render.graphic = this.generateLedgeLine(game, color);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateLedgeLine(game: PongGame, color: number): Graphics {
		const line = new Graphics();

		const thirdWidth = game.width / 3;
		const tenthHeight = game.height / 10;
		
		this.points = [
			new Point(-thirdWidth, -tenthHeight),
			new Point( thirdWidth, -tenthHeight),
			new Point( thirdWidth, tenthHeight),
			new Point( -thirdWidth, tenthHeight),
			new Point(-thirdWidth, -tenthHeight),
		];

		drawPointPath(line, this.points, color)
		//line.pivot.set(game.width/4, game.height / 20);

		return line;
	}
}