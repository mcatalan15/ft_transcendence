/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PachinkoPatterns.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/16 16:38:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/16 21:16:30 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js'

import { generateCirclePoints, drawPointPath } from '../../utils/Utils';

export class PachinkoPatterns {
    /**
     * Creates a single circle graphic
     */
    static singleCircle(graphics: Graphics, x: number, y: number, radius: number, color: number, fill: boolean = false): Point[] {
        const points = generateCirclePoints(x, y, radius, 32);
        drawPointPath(graphics, points, color, fill);
        return points;
    }
    
    /**
     * Creates a sideways diamond pattern optimized for Pong gameplay
     * The pattern is symmetrical around the vertical center axis
     */
    static sidewaysDiamond(graphics: Graphics, centerX: number, centerY: number, radius: number, spacing: number, width: number, height: number, color: number): Point[] {
        const allPoints: Point[] = [];
        
        // Calculate half-width and half-height for easier positioning
        const halfWidth = Math.floor(width / 2);
        const halfHeight = Math.floor(height / 2);
        
        // Create the diamond shape
        for (let x = -halfWidth; x <= halfWidth; x++) {
            // Calculate how many circles in this column
            const distFromCenter = Math.abs(x);
            const circlesInColumn = height - (distFromCenter * 2);
            
            if (circlesInColumn <= 0) continue;
            
            // Calculate starting Y position for this column
            const colStartY = centerY - ((circlesInColumn - 1) * spacing) / 2;
            
            // Draw this column
            for (let y = 0; y < circlesInColumn; y++) {
                const posX = centerX + x * spacing;
                const posY = colStartY + y * spacing;
                
                const circlePoints = this.singleCircle(graphics, posX, posY, radius, color);
                allPoints.push(...circlePoints);
            }
        }
        
        return allPoints;
    }
    
    /**
     * Creates a zigzag pattern optimized for Pong gameplay
     * The pattern creates an interesting path for the ball to navigate
     */
    static zigzagPattern(graphics: Graphics, centerX: number, centerY: number, radius: number, spacing: number, width: number, amplitude: number, color: number): Point[] {
        const allPoints: Point[] = [];
        const columns = width;
        
        // Create a zigzag pattern
        for (let col = -Math.floor(columns/2); col <= Math.floor(columns/2); col++) {
            const x = centerX + col * spacing;
            
            // Calculate Y positions with zigzag effect
            // Use sawtooth wave pattern instead of sine for sharper zigzags
            const zigzagOffset = ((Math.abs(col) % 4) < 2 ? 1 : -1) * amplitude;
            
            // Create multiple circles in each column for a more substantial barrier
            for (let i = -2; i <= 2; i++) {
                const y = centerY + zigzagOffset + (i * spacing * 0.8);
                
                const circlePoints = this.singleCircle(graphics, x, y, radius, color);
                allPoints.push(...circlePoints);
            }
        }
        
        return allPoints;
    }
    
    /**
     * Creates a honeycomb pattern optimized for Pong gameplay
     * The pattern is symmetrical and creates interesting bounce angles
     */
    static honeycombPattern(graphics: Graphics, centerX: number, centerY: number, radius: number, spacing: number, width: number, rows: number, color: number): Point[] {
        const allPoints: Point[] = [];
        
        // Constants for hexagonal grid
        const dx = spacing;           // Horizontal spacing
        const dy = spacing * 0.866;   // Vertical spacing (sin(60°) ≈ 0.866)
        
        // Calculate half-width for easier positioning
        const halfWidth = Math.floor(width / 2);
        const halfRows = Math.floor(rows / 2);
        
        // Draw the honeycomb pattern
        for (let col = -halfWidth; col <= halfWidth; col++) {
            // Offset every other column for honeycomb effect
            const isOffset = col % 2 !== 0;
            const yOffset = isOffset ? dy / 2 : 0;
            
            for (let row = -halfRows; row <= halfRows; row++) {
                const x = centerX + col * dx;
                const y = centerY + (row * dy) + yOffset;
                
                const circlePoints = this.singleCircle(graphics, x, y, radius, color);
                allPoints.push(...circlePoints);
            }
        }
        
        return allPoints;
    }
    
    /**
     * Creates a funnel pattern optimized for Pong gameplay
     * The pattern narrows in the middle to create a challenging obstacle
     */
    static funnelPattern(graphics: Graphics, centerX: number, centerY: number, radius: number, spacing: number, width: number, narrowingFactor: number, color: number): Point[] {
        const allPoints: Point[] = [];
        
        // Calculate half-width for easier positioning
        const halfWidth = Math.floor(width / 2);
        
        // Create the funnel shape
        for (let x = -halfWidth; x <= halfWidth; x++) {
            // Calculate how many circles in this column
            // More circles at the edges, fewer in the middle
            const distFromCenter = Math.abs(x);
            const normalizedDist = distFromCenter / halfWidth;  // 0 to 1
            
            // Calculate the height at this position
            const height = Math.max(1, Math.floor(narrowingFactor * normalizedDist * 2));
            
            // Calculate starting Y position for this column
            const halfHeight = Math.floor(height / 2);
            
            // Draw this column
            for (let y = -halfHeight; y <= halfHeight; y++) {
                const posX = centerX + x * spacing;
                const posY = centerY + y * spacing;
                
                const circlePoints = this.singleCircle(graphics, posX, posY, radius, color);
                allPoints.push(...circlePoints);
            }
        }
        
        return allPoints;
    }
}