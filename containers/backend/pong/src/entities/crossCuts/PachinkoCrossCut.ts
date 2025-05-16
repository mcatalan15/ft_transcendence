/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PachinkoCrossCut.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/06 10:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/16 21:09:49 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { CrossCut } from './CrossCut';

export class PachinkoCrossCut extends CrossCut {
    constructor(id: string, layer: string, shape: string, position: string, nPoints: number, points: Point[], x: number, y: number) {
        super(id, layer, shape, position, nPoints, points, x, y);
    }

    createCutGraphic(): Graphics {
        const pachinkoGraphic = new Graphics();
        this.redrawGraphic(pachinkoGraphic);
        return pachinkoGraphic; 
    }
    
    protected redrawGraphic(graphic: Graphics): void {
        // Clear the existing graphic
        graphic.clear();
        
        // If we're using the circlePointSets approach
        // If we're still using the flat this.points array with all points concatenated
        if (this.points && this.points.length > 0) {
            // We need to know how many points are in each circle
            const pointsPerCircle = 33; // 32 segments + 1 closing point
            
            // Calculate how many complete circles we have
            const circleCount = Math.floor(this.points.length / pointsPerCircle);
            
            // Draw each circle separately
            for (let c = 0; c < circleCount; c++) {
                const startIdx = c * pointsPerCircle;
                const endIdx = startIdx + pointsPerCircle;
                
                graphic.beginPath();
                graphic.moveTo(this.points[startIdx].x, this.points[startIdx].y);
                
                for (let i = startIdx + 1; i < endIdx && i < this.points.length; i++) {
                    graphic.lineTo(this.points[i].x, this.points[i].y);
                }
                
                // Close the path and fill
                graphic.closePath();
                graphic.fill(0xFFFBEB);
            }
        }
    }
}