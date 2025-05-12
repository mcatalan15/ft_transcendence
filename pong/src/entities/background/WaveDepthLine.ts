/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WaveDepthLine.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/11 08:51:29 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/11 16:40:28 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { PongGame } from "../../engine/Game";
import { DepthLine } from "./DepthLine";

import { RenderComponent } from "../../components/RenderComponent";

import { WaveDepthLineOptions } from '../../utils/Types';

export class WaveDepthLine extends DepthLine {
    amplitude: number;       // Height of the wave peaks
    frequency: number;       // Number of complete waves
    waveOffset: number;      // Horizontal shift of the wave pattern
    phaseShift: number;      // Phase shift in radians
    type?: string;
    points: Point[] = [];
    cuttingPoints: Point[] = [];
    resolution: number;      // Number of points to use for drawing the wave
    waveType: 'sine' | 'square' | 'triangle' | 'sawtooth' | 'noise' | 'pulse' | 'bounce' | 'stepped' | 'exponential' | 'elastic' | 'heart' | 'composite';
    amplitudeVariation: number; // Variation factor for amplitude
    minBottomHeight: number | null; // Minimum allowed height for bottom peaks

    constructor(id: string, layer: string, game: PongGame, options: WaveDepthLineOptions = {}) {
        super(id, layer, game, options);

        // Wave-specific parameters
        if (options.behavior) {
            this.amplitude = options.behavior.waveAmplitude ?? 20;
            this.frequency = options.behavior.waveFrequency ?? 3;
            this.waveOffset = options.behavior.waveOffset ?? 0;
            this.phaseShift = options.behavior.phaseShift ?? 0;
            this.waveType = options.behavior.waveType ?? 'sine';
            this.amplitudeVariation = options.behavior.amplitudeVariation ?? 0.3; // 30% variation by default
            this.minBottomHeight = options.behavior.minBottomHeight ?? null; // Default to no clamping
        } else {
            this.amplitude = options.amplitude ?? 20;
            this.frequency = options.frequency ?? 3;
            this.waveOffset = options.waveOffset ?? 0;
            this.phaseShift = options.phaseShift ?? 0;
            this.waveType = options.waveType ?? 'sine';
            this.amplitudeVariation = options.amplitudeVariation ?? 0;
            this.minBottomHeight = options.minBottomHeight ?? null;
        }

        // Higher resolution for smoother curves, even higher for square waves
        this.resolution = this.waveType === 'square' ? 200 : (options.resolution ?? 100);
        this.type = options.type;

        const color = game.currentWorld.color;
        const render = this.getComponent('render') as RenderComponent;
        if (render) {
            render.graphic = this.generateWaveLine(this.width, color);
            render.graphic.position.set(this.x, this.y);
        }
    }

    private generateWaveLine(width: number, color: number): Graphics {
        const line = new Graphics();
        const halfWidth = width / 2;
        
        // Clear previous points and prepare new array
        this.points = [];
        
        // Generate seeds for amplitude variation at different x positions
        // Using fixed seeds for consistency (change to random if variation is desired)
        const variationSeed1 =  Math.random() * Math.PI * 2;
        const variationSeed2 =  Math.random() * Math.PI * 2;
        const variationSeed3 =  Math.random() * Math.PI * 2;
        
        // Use the full width for the wave pattern - no flat segments at edges
        const waveStartX = -halfWidth;
        const waveEndX = halfWidth;
        const waveWidth = waveEndX - waveStartX;
        
        if (this.waveType === 'square') {
            // Special handling for square waves to ensure vertical lines
            return this.generateSquareWave(halfWidth, waveWidth, waveStartX, color);
        }
        
        // Generate wave points for the entire width
        for (let i = 0; i <= this.resolution; i++) {
            const x = waveStartX + (i * waveWidth / this.resolution);
            
            // Normalized position for wave calculation (0 to 2π * frequency)
            const t = ((x - waveStartX) / waveWidth) * Math.PI * 2 * this.frequency + this.phaseShift;
            
            // Calculate amplitude variation factor for this position
            const normalizedPos = i / this.resolution;
            const variation = 1 + this.amplitudeVariation * (
                0.5 * Math.sin(normalizedPos * Math.PI * 2 + variationSeed1) + 
                0.3 * Math.sin(normalizedPos * Math.PI * 3.7 + variationSeed2) +
                0.2 * Math.sin(normalizedPos * Math.PI * 6.1 + variationSeed3)
            );
            
            // Apply the variation to the amplitude
            const variedAmplitude = this.amplitude * variation;
            
            // Calculate basic wave based on type
            let y = 0;
            switch (this.waveType) {
                case 'sine':
                    y = variedAmplitude * Math.sin(t) - variedAmplitude; //!ADJUSTMENT OF THE LINE HEIGHT
                    break;
                case 'triangle':
                    y = variedAmplitude * (2 * Math.asin(Math.sin(t)) / Math.PI) - variedAmplitude;
                    break;
                case 'sawtooth':
                    y = variedAmplitude * ((t % (Math.PI * 2)) / Math.PI - 1) - variedAmplitude;
                    break;
                case 'noise':
                    // Perlin-like noise with controllable smoothness
                    const noiseScale = 0.1;
                    const noiseAmount = 1.0;
                    y = variedAmplitude * ((Math.sin(t) + 
                        noiseAmount * (Math.sin(t*5.3) * 0.2 + 
                        Math.sin(t*9.7) * 0.1 + 
                        Math.sin(t*17.3) * 0.05))) - variedAmplitude;
                    break;
                case 'pulse':
                    // dutyCycle controls width of the high portion (0.1 = narrow pulses, 0.9 = wide pulses)
                    const dutyCycle = 0.3; 
                    y = variedAmplitude * ((t % (Math.PI * 2)) / (Math.PI * 2) < dutyCycle ? 1 : -1) - variedAmplitude;
                    break;
                case 'bounce':
                    // This creates a bounce effect with gravity-like easing
                    const bounce = Math.sin(t);
                    y = variedAmplitude * (bounce < 0 ? 
                        Math.pow(Math.sin(t), 2) : 
                        -Math.pow(Math.sin(t), 2)) - variedAmplitude;
                    break;
                case 'stepped':
                    // Number of steps in one cycle
                    const steps = 5;
                    y = variedAmplitude * (Math.floor((t % (Math.PI * 2)) / (Math.PI * 2) * steps) / 
                        (steps - 1) * 2 - 1) - variedAmplitude;
                    break;
                case 'exponential':
                    // Normalized position in wave cycle (0 to 1)
                    const normalizedPos = (t % (Math.PI * 2)) / (Math.PI * 2);
                    // Create exponential curve that rises and falls
                    const expFactor = 4; // Higher = steeper curve
                    if (normalizedPos < 0.5) {
                        y = variedAmplitude * (Math.pow(normalizedPos * 2, expFactor) * 2 - 1) - variedAmplitude;
                    } else {
                        y = variedAmplitude * (1 - Math.pow((normalizedPos - 0.5) * 2, expFactor) * 2) - variedAmplitude;
                    }
                    break;
                case 'elastic':
                    // Creates underdamped oscillation effect
                    const dampingFactor = 3;
                    const normalizedCycle = (t % (Math.PI * 2)) / (Math.PI * 2);
                    y = variedAmplitude * (Math.sin(normalizedCycle * Math.PI * 2 * dampingFactor) * 
                        Math.exp(-normalizedCycle * 4)) - variedAmplitude;
                    break;
                case 'heart':
                    // Create a heart-shaped pattern
                    const nx = ((t % (Math.PI * 2)) / (Math.PI * 2)) * 2 - 1;
                    // Heart formula
                    const absNx = Math.abs(nx);
                    const heartY = Math.sqrt(1 - absNx) * Math.cos(Math.PI * nx * 3) * 0.8;
                    y = variedAmplitude * heartY - variedAmplitude;
                    break;
                case 'composite':
                    // Combine sine and triangle waves
                    const sine = Math.sin(t);
                    const triangle = 2 * Math.asin(Math.sin(t * 2)) / Math.PI;
                    y = variedAmplitude * (0.7 * sine + 0.3 * triangle) - variedAmplitude;
                    break;
                                
                // Square case is handled separately
            }
            
            // Apply height clamping if specified
            if (this.minBottomHeight !== null) {
                if (this.type === 'bottom') {
                    // For bottom waves, limit how far down (positive y) the wave can go
                    if (y > this.minBottomHeight) {
                        y = this.minBottomHeight;
                    }
                } else if (this.type === 'top') {
                    // For top waves, limit how far up (negative y) the wave can go
                    if (y < -this.minBottomHeight) {
                        y = -this.minBottomHeight;
                    }
                }
            }
            
            // Add the calculated point
            this.points.push(new Point(x, y));
        }
        
        console.log(this.points);
        
        // Draw the line using the points
        this.drawLineFromPoints(line, color);
        return line;
    }

    private generateSquareWave(halfWidth: number, waveWidth: number, waveStartX: number, color: number): Graphics {
        const line = new Graphics();
        
        // Calculate the number of complete cycles that fit in the width
        const cyclePeriod = waveWidth / this.frequency;
        const halfCyclePeriod = cyclePeriod / 2;
        
        // Generate points for perfectly vertical square waves
        const baseY = this.minBottomHeight !== null ? this.minBottomHeight : 0;
        let lastX = waveStartX;
        
        // First point
        let currentY = this.getSquareWaveY(waveStartX, halfCyclePeriod, waveStartX);
        this.points.push(new Point(waveStartX, currentY));
        
        // Generate square wave with perfectly vertical lines
        for (let cycle = 0; cycle < this.frequency; cycle++) {
            const cycleStartX = waveStartX + (cycle * cyclePeriod);
            
            // High part of the wave
            const highX = cycleStartX;
            const highY = -this.amplitude * 3; //! ADJUST HEIGHT OF THE WAVE
            if (highX > lastX) {
                // Add vertical line point at current X
                this.points.push(new Point(highX, currentY));
                // Move to high Y at same X (vertical line)
                this.points.push(new Point(highX, highY));
                currentY = highY;
                lastX = highX;
            }
            
            // Low part of the wave
            const lowX = cycleStartX + halfCyclePeriod;
            // Apply clamping for bottom type
            const lowY = this.type === 'bottom' && this.minBottomHeight !== null ? 
                          Math.min(this.amplitude, this.minBottomHeight) + 500 : 
                          0; //! THIS 0 MANTAINS THE LOWER HEIGHT AT THE WALL Y VALUE.
            
            if (lowX <= halfWidth * 2) {
                // Add vertical line point at this X
                this.points.push(new Point(lowX, currentY));
                // Move to low Y at same X (vertical line)
                this.points.push(new Point(lowX, lowY));
                currentY = lowY;
                lastX = lowX;
            }
        }
        
        // Ensure the wave extends to the full width
        const endX = waveStartX + waveWidth;
        if (lastX < endX) {
            this.points.push(new Point(endX, currentY));
        }

        console.log(this.points);
        
        // Draw the line
        this.drawLineFromPoints(line, color);
        return line;
    }
    
    private getSquareWaveY(x: number, halfCyclePeriod: number, waveStartX: number): number {
        // Calculate the position within the wave cycle
        const position = x - waveStartX;
        const cyclePosition = position % (halfCyclePeriod * 2);
        
        // Determine if we're in the high or low part of the square wave
        if (cyclePosition < halfCyclePeriod) {
            return -this.amplitude;
        } else {
            if (this.type === 'bottom' && this.minBottomHeight !== null) {
                return Math.min(this.amplitude, this.minBottomHeight);
            }
            return this.amplitude;
        }
    }
    
    private drawLineFromPoints(line: Graphics, color: number): void {
        if (this.points.length > 0) {
            line.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                line.lineTo(this.points[i].x, this.points[i].y);
            }
        }
        
        // Style the line
        line.stroke({
            width: 2,
            color: color,
            alpha: 1,
            alignment: 0.5,
            cap: 'round',
            join: 'round',
            miterLimit: 10
        });
    }

    getCuttingPoints(depthLine: WaveDepthLine) {
        this.cuttingPoints = depthLine.points;
    }
}