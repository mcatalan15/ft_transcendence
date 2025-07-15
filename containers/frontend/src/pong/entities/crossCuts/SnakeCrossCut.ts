/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SnakeCrossCut.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/06 10:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 17:34:49 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { CrossCut } from './CrossCut';

import { PhysicsData, GAME_COLORS } from '../../utils/Types';

export class SnakeCrossCut extends CrossCut {
    constructor(id: string, layer: string, shape: string, position: string, nPoints: number, points: Point[], x: number, y: number) {
        super(id, layer, shape, position, nPoints, points, x, y);
    }

    createCutGraphic(): Graphics {
        const windmillGraphic = new Graphics();
        this.redrawGraphic(windmillGraphic);
        this.buildPolygonalPhysics();
        return windmillGraphic; 
    }

    buildPolygonalPhysics(): void {
        const pointsPerPolygon = 5;
        const nPolygons = 2;

        const polygons: Point[][] = [];

        for (let i = 0; i < nPolygons; i++) {
            const startIdx = i * pointsPerPolygon;
            const endIdx = startIdx + pointsPerPolygon;
            const polygonPoints = this.points.slice(startIdx, endIdx);

            polygons.push(polygonPoints);
        }

        const physics: PhysicsData = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'bounce',
            restitution: 1.0,
            mass: 1,
            speed: 10,

            isPolygonal: true,
            nPolygons: nPolygons,
            physicsPoints: polygons,
        };

	    this.addPolygonalPhysics(physics);
    }
    
    protected redrawGraphic(graphic: Graphics): void {
        graphic.clear();
        
        if (this.points && this.points.length > 0) {
            const pointsPerWindmill = 5;
            
            const windmillCount = 2;
            
            for (let c = 0; c < windmillCount; c++) {
                const startIdx = c * pointsPerWindmill;
                const endIdx = startIdx + pointsPerWindmill;
                
                graphic.beginPath();
                graphic.moveTo(this.points[startIdx].x, this.points[startIdx].y);
                
                for (let i = startIdx + 1; i < endIdx && i < this.points.length; i++) {
                    graphic.lineTo(this.points[i].x, this.points[i].y);
                }
                
                // Close the path and fill
                graphic.closePath();
                graphic.fill(GAME_COLORS.white);
            }
        }
    }
}