/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LedgeCrossCut.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/06 10:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/15 13:50:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { CrossCut } from './CrossCut';

export class LedgeCrossCut extends CrossCut {
    constructor(id: string, layer: string, shape: string, position: string, nPoints: number, points: Point[], x: number, y: number) {
        super(id, layer, shape, position, nPoints, points, x, y);
    }

    createCutGraphic(): Graphics {
        const ledgeGraphic = new Graphics();
        this.redrawGraphic(ledgeGraphic);
        return ledgeGraphic; 
    }
    
    protected redrawGraphic(graphic: Graphics): void {
        graphic.clear();
        
        if (this.points && this.points.length > 0) {
            const pointsPerLedge = 5;
            
            const ledgeCount = 3;
            
            for (let c = 0; c < ledgeCount; c++) {
                const startIdx = c * pointsPerLedge;
                const endIdx = startIdx + pointsPerLedge;
                
                graphic.beginPath();
                graphic.moveTo(this.points[startIdx].x, this.points[startIdx].y);
                
                for (let i = startIdx + 1; i < endIdx && i < this.points.length; i++) {
                    graphic.lineTo(this.points[i].x, this.points[i].y);
                }
                
                // Close the path and fill
                graphic.closePath();
                graphic.fill(0xf7eebc);
            }
        }
    }
}