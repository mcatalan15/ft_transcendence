/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PachinkoCrossCut.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/06 10:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 12:23:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { CrossCut } from './CrossCut';

import { PhysicsData, GAME_COLORS } from '../../utils/Types';

export class PachinkoCrossCut extends CrossCut {
    constructor(id: string, layer: string, shape: string, position: string, nPoints: number, points: Point[], x: number, y: number) {
        super(id, layer, shape, position, nPoints, points, x, y);
    }

    createCutGraphic(): Graphics {
        const pachinkoGraphic = new Graphics();
        this.redrawGraphic(pachinkoGraphic);
        this.buildPolygonalPhysics(this.points.length);
        return pachinkoGraphic; 
    }

    buildPolygonalPhysics(npoints: number): void {
        const pointsPerOriginalPolygon = 33;
        const nPolygons = npoints / pointsPerOriginalPolygon;
        const targetPointsPerPolygon = 8; // Reduced from 33 to 8 points
        
        const polygons: Point[][] = [];
    
        for (let i = 0; i < nPolygons; i++) {
            const startIdx = i * pointsPerOriginalPolygon;
            const endIdx = startIdx + pointsPerOriginalPolygon;
            const originalPoints = this.points.slice(startIdx, endIdx);
            
            // Simplify the polygon
            const simplifiedPoints = this.simplifyPolygon(originalPoints, targetPointsPerPolygon);
            
            polygons.push(simplifiedPoints);
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
            const pointsPerCircle = 33;
            
            const circleCount = Math.floor(this.points.length / pointsPerCircle);
            
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
                graphic.fill(GAME_COLORS.white);
            }
        }
    }

    private simplifyPolygon(points: Point[], targetPointCount: number): Point[] {
        // If we already have few enough points, return the original
        if (points.length <= targetPointCount) {
            return points;
        }
        
        // For a circular shape, evenly distribute the points
        const step = Math.floor(points.length / targetPointCount);
        const simplifiedPoints: Point[] = [];
        
        // Always include the first point
        simplifiedPoints.push(points[0]);
        
        // Add evenly spaced points
        for (let i = 1; i < targetPointCount - 1; i++) {
            const idx = (i * step) % points.length;
            simplifiedPoints.push(points[idx]);
        }
        
        // Always include the last point to close the shape properly
        simplifiedPoints.push(points[points.length - 1]);
        
        return simplifiedPoints;
    }
}