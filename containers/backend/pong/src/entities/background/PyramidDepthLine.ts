/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PyramidDepthLine.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/05 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/05 10:50:47 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { Entity } from "../../engine/Entity";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { PyramidDepthLineOptions } from '../../utils/Types';

export class PyramidDepthLine extends DepthLine {
    baseHeight: number;
    peakHeight: number;
    peakOffset: number;
    baseWidth: number;

    constructor(id: string, layer: string, game: PongGame, options: PyramidDepthLineOptions = {}) {
        super(id, layer, game, options);

        // First try to get values from behavior object (preferred)
        if (options.behavior) {
            this.baseHeight = options.behavior.pyramidBaseHeight ?? 4;
            this.baseWidth = options.behavior.pyramidBaseWidth ?? (this.width / 12);
            this.peakHeight = options.behavior.pyramidPeakHeight ?? 10;
            this.peakOffset = options.behavior.pyramidPeakOffset ?? 0;
        } else {
            // Fallback to direct options (backward compatibility)
            this.baseHeight = options.baseHeight ?? 4;
            this.baseWidth = this.width / 12;
            this.peakHeight = options.peakHeight ?? 10;
            this.peakOffset = options.peakOffset ?? 0;
        }

        const color = game.currentWorld.color;
        const render = this.getComponent('render') as RenderComponent;
        if (render) {
            render.graphic = this.generatePyramidLine(this.width, color);
            render.graphic.position.set(this.x, this.y);
        }
    }

    private generatePyramidLine(width: number, color: number): Graphics {
		const g = new Graphics();
		const halfWidth = width / 2;
		
		const baseY = this.behavior?.direction === 'downwards' ? -this.baseHeight : this.baseHeight;
		const peakY = this.behavior?.direction === 'downwards' ? -this.peakHeight : this.peakHeight;
		const peakX = this.peakOffset;
	
		// Calculate base width - half on each side of the peak
		const baseLeftX = peakX - this.baseWidth / 2;
		const baseRightX = peakX + this.baseWidth / 2;
	
		
		// Draw the shape
		g.moveTo(-halfWidth, 0);
		g.lineTo(baseLeftX, baseY);
		g.lineTo(peakX, peakY);
		g.lineTo(baseRightX, baseY);
		g.lineTo(halfWidth, 0);

		// Use improved line style with caps and joins for smoother rendering
		g.stroke({
			width: 0.5,
			color: color,
			alpha: 1,
			alignment: 0.5,         // Center alignment
			cap: 'round',           // Round end caps
			join: 'round',          // Round corners
			miterLimit: 10          // Limit for miter joins if used
		});
	
		
		return g;
	}
}