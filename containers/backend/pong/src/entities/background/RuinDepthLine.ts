/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RuinDepthLine.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/08 13:34:19 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';

export class RuinDepthLine extends DepthLine {
	hSegments: number;
	vSegments: number;
	tSegments: number;
	hOffset: number;
	maxHeight: number;
	maxWidth: number;
	type?: string;
	npoints: number;
	points: Point[] = [];
    cuttingPoints: Point[] = [];

	constructor(id: string, layer: string, game: PongGame, options: PyramidDepthLineOptions = {}) {
		super(id, layer, game, options);

		// Behavior-based parameters
	
		this.hSegments = options.behavior!.ruinHSegments ?? 7;
		this.vSegments = options.behavior!.ruinHSegments ?? this.hSegments + 1;
		this.tSegments = options.behavior!.ruinHSegments ?? this.vSegments + 1;
		this.hOffset = game.width / 8

		//TODO: Randomize this values!!
		this.maxHeight = game.height / 2;
		this.maxWidth = game.width - (this.hOffset * 2);
		
		this.npoints = options.behavior!.ruinHSegments ?? (this.hSegments / 2) + 4;

		this.type = options.type;

		const color = game.currentWorld.color;
		const render = this.getComponent('render') as RenderComponent;
		if (render) {
			render.graphic = this.generateRuinLine(color);
			render.graphic.position.set(this.x, this.y);
		}
	}

	private generateRuinLine(color: number): Graphics {
		const line = new Graphics();

		const segmentWidths = this.generateSegmentWidths(this.maxWidth, this.hSegments);
		const segmentHeights = this.generateSegmentHeights(this.maxHeight, this.vSegments);


		this.points.push(new Point(0, 0));
		this.points.push(new Point(this.hOffset, 0));

		for (let i = 2; i < this.npoints - 1; i++) {
			let pushingPoint = new Point;
			if (i % 2 === 0) {
				pushingPoint.x = this.points[i - 1].x;
				pushingPoint.y = segmentHeights[i - 2];
			} else {
				pushingPoint.x = segmentWidths[i - 2];
				pushingPoint.y = this.points[i - 1].y;
			}
			this.points.push(pushingPoint);
		}

		this.points.push(new Point(this.game.width, 0));

		line.moveTo(this.points[0].x, this.points[0].y);
		for (let i = 1; i < this.points.length; i++) {
			line.lineTo(this.points[i].x, this.points[i].y);
		}

		line.stroke({
			width: 0.5,
			color: color,
			alpha: 1,
			alignment: 0.5,
			cap: 'round',
			join: 'round',
			miterLimit: 10
		});

		console.log(this.points);

		return (line);
	}

	generateSegmentWidths(maxWidth: number, hSegments: number): number[] {
		if (hSegments <= 1) return [maxWidth];

		const cuts: number[] = [];
		for (let i = 0; i < hSegments - 1; i++) {
			cuts.push(Math.random() * maxWidth);
		}
	
		// Step 2: Sort them
		cuts.sort((a, b) => a - b);
	
		const segmentWidths: number[] = [];
		let prev = 0;
		for (const cut of cuts) {
			segmentWidths.push(cut - prev);
			prev = cut;
		}
		segmentWidths.push(maxWidth - prev);

		return segmentWidths;
	}

	generateSegmentHeights(maxHeight: number, vSegments: number): number[] {
		if (vSegments <= 2) return [maxHeight];

		const heights: number[] = [];
		for (let i = 0; i < vSegments - 1; i++){
			heights.push(Math.random() * maxHeight);
		}

		return(heights);
	}

    getCuttingPoints(depthLine: RuinDepthLine) {
        this.cuttingPoints = depthLine.points;
    }
}