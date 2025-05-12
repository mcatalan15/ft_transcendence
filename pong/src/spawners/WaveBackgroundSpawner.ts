/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WaveBackgroundSpawner.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/11 13:40:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/11 16:21:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { DepthLine } from '../entities/background/DepthLine';
import { WaveDepthLine } from '../entities/background/WaveDepthLine';

import { WorldSystem } from '../systems/WorldSystem';

import { DepthLineBehavior } from '../utils/Types';

export class WaveBackgroundSpawner {
    static spawnDepthLine(
        game: PongGame,
        width: number,
        height: number,
        topWallOffset: number,
        bottomWallOffset: number,
        wallThickness: number,
        type: 'top' | 'bottom' | string,
        behavior: DepthLineBehavior
    ): DepthLine {
        const uniqueId = `depthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const addedOffset = 10;

        const upperLimit = topWallOffset + wallThickness - addedOffset;
        const lowerLimit = height - bottomWallOffset + addedOffset;

        const depthLine = new DepthLine(uniqueId, 'background', game, {
            velocityX: 10,
            velocityY: 10,
            width,
            height,
            upperLimit,
            lowerLimit,
            alpha: 0,
            behavior,
            type,
            despawn: 'position',
        });

        return (depthLine);
    }

    static spawnWaveDepthLine(
    game: PongGame,
    id: string,
    width: number,
    height: number,
    topWallOffset: number,
    bottomWallOffset: number,
    wallThickness: number,
    type: 'top' | 'bottom' | string,
    behavior: DepthLineBehavior
): WaveDepthLine {
    const addedOffset = 10;
    const upperLimit = topWallOffset + wallThickness - addedOffset;
    const lowerLimit = height - bottomWallOffset + addedOffset;
    
    // Create the wave depth line with fixed parameters for consistency
    const depthLine = new WaveDepthLine(id, 'background', game, {
        velocityX: 10,
        velocityY: 10,
        width,
        height,
        upperLimit,
        lowerLimit,
        alpha: 0,
        behavior,
        type,
        despawn: 'position',
        // Ensure resolution is high enough for square waves
        resolution: behavior.waveType === 'square' ? 200 : 100
    });
   
    return depthLine;
}

    static buildTopWaves(worldSystem: WorldSystem, depth: number): void {
        const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
        const maxAmplitude = height / 5;
        const middleIndex = Math.floor(depth / 2);
        
        // Random values that remain consistent throughout the wave set
        const waveTypeOptions: ('sine' | 'square' | 'triangle' | 'sawtooth')[] = ['sine', 'square', 'triangle', 'sawtooth'];
        const selectedWaveType = 'square'; //waveTypeOptions[Math.floor(Math.random() * waveTypeOptions.length)];
        const baseFrequency = this.getRandomNumber(2, 5);
        const phaseShift = Math.random() * Math.PI * 2;
        const waveOffset = 0;
        
        for (let i = 0; i < depth; i++) {
            let amplitudeRatio = 1 - Math.abs(i - middleIndex) / middleIndex;
            const frequencyVariation = 1 + (amplitudeRatio * 0.5);
            
            const amplitude = amplitudeRatio * maxAmplitude * 0.3; // * this.getRandomNumber(0.85, 1.15);
            const frequency = baseFrequency * frequencyVariation;
            
            const behaviorTop = this.generateWaveLineBehavior('vertical', 'upwards', 'in',
                amplitude * 0.7, frequency * 0.8, waveOffset, phaseShift + (i * Math.PI / depth) + Math.PI/2, selectedWaveType);
            
            const behaviorBottom = this.generateWaveLineBehavior('vertical', 'downwards', 'in',
                amplitude, frequency, waveOffset, phaseShift + (i * Math.PI / depth), selectedWaveType);
            
            let uniqueId = `waveDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            const topLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
            );
            worldSystem.depthLineQueue.push(topLine);
            
            const bottomLine = this.spawnDepthLine(
                worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
            );

            worldSystem.depthLineQueue.push(bottomLine);
        }
    }

    /*static buildBottomWaves(worldSystem: WorldSystem, depth: number): void {
        const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
        const maxAmplitude = height / 5;
        const middleIndex = Math.floor(depth / 2);
        
        // Random values that remain consistent throughout the wave set
        const waveTypeOptions: ('sine' | 'square' | 'triangle' | 'sawtooth')[] = ['sine', 'square', 'triangle', 'sawtooth'];
        const selectedWaveType = waveTypeOptions[Math.floor(Math.random() * waveTypeOptions.length)];
        const baseFrequency = this.getRandomNumber(2, 5);
        const phaseShift = Math.random() * Math.PI * 2;
        const waveOffset = 0;
        
        for (let i = 0; i < depth; i++) {
            let amplitudeRatio = 1 - Math.abs(i - middleIndex) / middleIndex;
            const frequencyVariation = 1 + (amplitudeRatio * 0.5);
            
            const amplitude = amplitudeRatio * maxAmplitude * 0.3; // * this.getRandomNumber(0.85, 1.15);
            const frequency = baseFrequency * frequencyVariation;
            
            const behaviorTop = this.generateWaveLineBehavior('vertical', 'upwards', 'in',
                amplitude * 0.7, frequency * 0.8, waveOffset, phaseShift + (i * Math.PI / depth) + Math.PI/2, selectedWaveType);
            
            const behaviorBottom = this.generateWaveLineBehavior('vertical', 'downwards', 'in',
                amplitude, frequency, waveOffset, phaseShift + (i * Math.PI / depth), selectedWaveType);
            
            let uniqueId = `waveDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            const topLine = this.spawnDepthLine(
                worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
            );
            worldSystem.depthLineQueue.push(topLine);
            
            const bottomLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
            );
            worldSystem.depthLineQueue.push(bottomLine);
        }
    }*/

    //! STRAIGHT PATTERN - NO HORIZONTAL SHIFT
    static buildBottomWaves(worldSystem: WorldSystem, depth: number): void {
        const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
        const maxAmplitude = 10; //height / 5;
        
        // Random values that remain consistent throughout the wave set
        const waveTypeOptions: ('sine' | 'square' | 'triangle' | 'sawtooth')[] = ['sine', 'square', 'triangle', 'sawtooth'];
        const selectedWaveType = waveTypeOptions[Math.floor(Math.random() * waveTypeOptions.length)];
        const baseFrequency = this.getRandomNumber(2, 5);
        const phaseShift = Math.random() * Math.PI * 2;
        const waveOffset = 0;
        
        // Define behaviors outside the loop - create just once for all lines
        const behaviorTop = this.generateWaveLineBehavior('vertical', 'upwards', 'in',
            maxAmplitude * 0.7, baseFrequency * 0.8, waveOffset, phaseShift + Math.PI/2, selectedWaveType);
        
        const behaviorBottom = this.generateWaveLineBehavior('vertical', 'downwards', 'in',
            maxAmplitude, baseFrequency, waveOffset, phaseShift, selectedWaveType);
        
        // Now loop and apply the same behavior to all lines
        for (let i = 0; i < depth; i++) {
            let uniqueId = `waveDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            const topLine = this.spawnDepthLine(
                worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
            );
            worldSystem.depthLineQueue.push(topLine);
            
            const bottomLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
            );
            worldSystem.depthLineQueue.push(bottomLine);
        }
    }

    /*static buildBottomWaves(worldSystem: WorldSystem, depth: number): void {
        const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
        const maxAmplitude = height / 5;
        const middleIndex = Math.floor(depth / 2);
        
        // Random values that remain consistent throughout the wave set
        const waveTypeOptions: ('sine' | 'square' | 'triangle' | 'sawtooth')[] = ['sine', 'square', 'triangle', 'sawtooth'];
        const selectedWaveType = waveTypeOptions[Math.floor(Math.random() * waveTypeOptions.length)];
        const baseFrequency = this.getRandomNumber(2, 5);
        const phaseShift = Math.random() * Math.PI * 2;
        const waveOffset = 0;
        
        for (let i = 0; i < depth; i++) {
            let amplitudeRatio = 1 - Math.abs(i - middleIndex) / middleIndex;
            const frequencyVariation = 1 + (amplitudeRatio * 0.5);
            
            const amplitude = amplitudeRatio * maxAmplitude * 0.3; // * this.getRandomNumber(0.85, 1.15);
            const frequency = baseFrequency * frequencyVariation;
            
            const behaviorTop = this.generateWaveLineBehavior('vertical', 'upwards', 'in',
                amplitude * 0.7, frequency * 0.8, waveOffset, phaseShift + (i * Math.PI / depth) + Math.PI/2, selectedWaveType);
            
            const behaviorBottom = this.generateWaveLineBehavior('vertical', 'downwards', 'in',
                amplitude, frequency, waveOffset, phaseShift + (i * Math.PI / depth), selectedWaveType);
            
            let uniqueId = `waveDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            const topLine = this.spawnDepthLine(
                worldSystem.game, width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
            );
            worldSystem.depthLineQueue.push(topLine);
            
            const bottomLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
            );
            worldSystem.depthLineQueue.push(bottomLine);
        }
    }*/

    static buildTopAndBottomWaves(worldSystem: WorldSystem, depth: number): void {
        const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
        const maxAmplitude = height / 6;  // Slightly smaller amplitude when using both top and bottom
        const middleIndex = Math.floor(depth / 2);
        
        // Random values that remain consistent throughout the wave set
        const waveTypeOptions: ('sine' | 'square' | 'triangle' | 'sawtooth')[] = ['sine', 'triangle', 'sawtooth'];
        const selectedWaveType = waveTypeOptions[Math.floor(Math.random() * waveTypeOptions.length)];
        const baseFrequency = this.getRandomNumber(2, 5);
        const phaseShift = Math.random() * Math.PI * 2;
        const waveOffset = 0;
        const amplitudeVariation = this.getRandomNumber(0.2, 0.4); // 20-40% variation
        
        // Use opposing phase shifts for top and bottom to create interesting patterns
        const bottomPhaseShift = phaseShift + Math.PI;  // 180 degree offset
        
        for (let i = 0; i < depth; i++) {
            let amplitudeRatio = 1 - Math.abs(i - middleIndex) / middleIndex;
            const frequencyVariation = 1 + (amplitudeRatio * 0.5);
            
            const amplitude = amplitudeRatio * maxAmplitude * this.getRandomNumber(0.85, 1.15);
            const frequency = baseFrequency * frequencyVariation;
            
            // Create symmetric but opposing waves for top and bottom
            // For top waves, negative y values need clamping
            const behaviorTop = this.generateWaveLineBehavior('vertical', 'upwards', 'in',
                amplitude, frequency, waveOffset, phaseShift + (i * Math.PI / depth), selectedWaveType,
                amplitudeVariation, 0); // Clamp negative peak heights to 0
            
            // For bottom waves, positive values need clamping
            const behaviorBottom = this.generateWaveLineBehavior('vertical', 'downwards', 'in',
                amplitude, frequency, waveOffset, bottomPhaseShift + (i * Math.PI / depth), selectedWaveType,
                amplitudeVariation, 0); // Clamp positive peak heights to 0
            
            let uniqueId = `waveDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            const topLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId + '-top', width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
            );
            worldSystem.depthLineQueue.push(topLine);
            
            const bottomLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId + '-bottom', width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
            );
            worldSystem.depthLineQueue.push(bottomLine);
        }
    }

    // Special pattern where top and bottom waves merge at the center
    static buildMergingWaves(worldSystem: WorldSystem, depth: number): void {
        const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
        const maxAmplitude = height / 4;
        const middleIndex = Math.floor(depth / 2);
        
        const waveTypeOptions: ('sine' | 'triangle')[] = ['sine', 'triangle'];
        const selectedWaveType = waveTypeOptions[Math.floor(Math.random() * waveTypeOptions.length)];
        const baseFrequency = this.getRandomNumber(3, 6);  // Higher frequency for dramatic effect
        const phaseShift = Math.random() * Math.PI * 2;
        const waveOffset = 0; // No offset for continuous waves
        const amplitudeVariation = this.getRandomNumber(0.3, 0.5); // More variation for dramatic effect
        
        for (let i = 0; i < depth; i++) {
            let amplitudeRatio = 1 - Math.abs(i - middleIndex) / middleIndex;
            
            // More dramatic frequency changes
            const frequencyVariation = 1 + amplitudeRatio;
            
            const amplitude = amplitudeRatio * maxAmplitude;
            const frequency = baseFrequency * frequencyVariation;
            
            // For a merging effect, the top and bottom waves need to be exactly out of phase
            // No clamping needed for this effect as we want the dramatic peaks
            const behaviorTop = this.generateWaveLineBehavior('vertical', 'upwards', 'in',
                amplitude, frequency, waveOffset, phaseShift, selectedWaveType,
                amplitudeVariation, null); // No clamping for merging effect
            
            const behaviorBottom = this.generateWaveLineBehavior('vertical', 'downwards', 'in',
                amplitude, frequency, waveOffset, phaseShift + Math.PI, selectedWaveType,
                amplitudeVariation, null); // No clamping for merging effect
            
            let uniqueId = `waveDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            const topLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId + '-top', width, height, topWallOffset, bottomWallOffset, wallThickness, 'top', behaviorTop
            );
            worldSystem.depthLineQueue.push(topLine);
            
            const bottomLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId + '-bottom', width, height, topWallOffset, bottomWallOffset, wallThickness, 'bottom', behaviorBottom
            );
            worldSystem.depthLineQueue.push(bottomLine);
        }
    }

    //! ATTEMPT TO MAKE AN ALL-CAPABLE FUNCTION
    static buildWaveBundle(
    worldSystem: WorldSystem, 
    depth: number,
    options: {
        maxAmplitude?: number,               // Maximum wave height
        useHeightRamping?: boolean,          // Whether to ramp height in middle
        useHorizontalShifting?: boolean,     // Whether to add progressive phase shift
        heightRampingFactor?: number,        // How dramatic the height ramping is (0-1)
        horizontalShiftFactor?: number,      // How much to shift each line horizontally
        waveType?: 'sine' | 'square' | 'triangle' | 'sawtooth' | 'random' | 'noise',
        baseFrequency?: number,              // Base frequency for all waves
        frequencyVariation?: boolean,        // Whether frequency varies with amplitude
        amplitudeVariation?: number,         // Variation within each individual wave
    } = {}
    ): void {
        const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
        
        // Default values
        const maxAmplitude = options.maxAmplitude ?? (height / 10);
        const useHeightRamping = options.useHeightRamping ?? false;
        const useHorizontalShifting = options.useHorizontalShifting ?? false;
        const heightRampingFactor = options.heightRampingFactor ?? 0;
        const horizontalShiftFactor = options.horizontalShiftFactor ?? 0;
        const amplitudeVariation = options.amplitudeVariation ?? 0;
        
        // Wave type selection
        const waveTypeOptions: ('sine' | 'square' | 'triangle' | 'sawtooth' | 'noise' | 'pulse' | 'bounce' | 'stepped' | 'exponential' | 'elastic' | 'heart' | 'composite')[] = 
            ['sine', 'square', 'triangle', 'sawtooth', 'noise', 'pulse', 'bounce', 'exponential', 'elastic', 'heart', 'composite'];
        let selectedWaveType = 'composite'; //options.waveType ?? 'random';
        if (selectedWaveType === 'random') {
            selectedWaveType = waveTypeOptions[Math.floor(Math.random() * waveTypeOptions.length)];
        }
        
        // Base parameters
        const baseFrequency = options.baseFrequency ?? this.getRandomNumber(2, 5);
        const basephaseShift = Math.random() * Math.PI * 2;
        const waveOffset = 0;
        const middleIndex = Math.floor(depth / 2);
        
        // Pre-calculate behaviors if not using variations
        let commonBehaviorTop, commonBehaviorBottom;
        if (!useHeightRamping && !useHorizontalShifting) {
            commonBehaviorTop = this.generateWaveLineBehavior(
                'vertical', 'upwards', 'in',
                maxAmplitude * 0.7, baseFrequency * 0.8, 
                waveOffset, basephaseShift + Math.PI/2, 
                selectedWaveType as any, amplitudeVariation
            );
            
            commonBehaviorBottom = this.generateWaveLineBehavior(
                'vertical', 'downwards', 'in',
                maxAmplitude, baseFrequency, 
                waveOffset, basephaseShift, 
                selectedWaveType as any, amplitudeVariation
            );
        }
        
        // Create each wave in the bundle
        for (let i = 0; i < depth; i++) {
            // Calculate amplitude ratio based on distance from middle
            let amplitudeRatio = useHeightRamping ? 
                (1 - Math.abs(i - middleIndex) / middleIndex) * heightRampingFactor + (1 - heightRampingFactor) : 
                1;
            
            // Calculate phase shift for this wave
            let wavePhaseShift = basephaseShift;
            if (useHorizontalShifting) {
                wavePhaseShift += (i * horizontalShiftFactor);
            }
            
            // Calculate frequency for this wave
            const frequencyVariation = options.frequencyVariation && useHeightRamping ? 
                1 + (amplitudeRatio * 0.5) : 1;
            const frequency = baseFrequency * frequencyVariation;
            
            // Calculate actual amplitude to use
            const amplitude = amplitudeRatio * maxAmplitude;
            
            // Generate behaviors or use common ones
            const behaviorTop = useHeightRamping || useHorizontalShifting ?
                this.generateWaveLineBehavior(
                    'vertical', 'upwards', 'in',
                    amplitude * 0.7, frequency * 0.8, 
                    waveOffset, wavePhaseShift + Math.PI/2, 
                    selectedWaveType as any, amplitudeVariation
                ) : commonBehaviorTop;
            
            const behaviorBottom = useHeightRamping || useHorizontalShifting ?
                this.generateWaveLineBehavior(
                    'vertical', 'downwards', 'in',
                    amplitude, frequency, 
                    waveOffset, wavePhaseShift, 
                    selectedWaveType as any, amplitudeVariation
                ) : commonBehaviorBottom;
            
            // Create unique ID
            let uniqueId = `waveDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // Spawn the lines
            const topLine = this.spawnDepthLine(
                worldSystem.game, width, height, topWallOffset, bottomWallOffset, 
                wallThickness, 'top', behaviorTop!
            );
            worldSystem.depthLineQueue.push(topLine);
            
            const bottomLine = this.spawnWaveDepthLine(
                worldSystem.game, uniqueId, width, height, topWallOffset, bottomWallOffset, 
                wallThickness, 'bottom', behaviorBottom!
            );
            worldSystem.depthLineQueue.push(bottomLine);
        }
    }

    // Utils
    private static generateWaveLineBehavior(
        movement: string, 
        direction: string, 
        fade: string, 
        amplitude: number,
        frequency: number,
        waveOffset: number,
        phaseShift: number,
        waveType: 'sine' | 'square' | 'triangle' | 'sawtooth',
        amplitudeVariation: number = 0,
        minBottomHeight: number | null = null
    ): DepthLineBehavior {
        return {
            movement: movement,
            direction: direction,
            fade: fade,
            waveAmplitude: amplitude,
            waveFrequency: frequency,
            waveOffset: waveOffset,
            phaseShift: phaseShift,
            waveType: waveType,
            amplitudeVariation: amplitudeVariation,
            minBottomHeight: minBottomHeight
        }
    }
    
    private static getRandomNumber(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}


/*
// Create wave bundle like function ONE (with height ramping and horizontal shifting)
WorldBuilder.buildWaveBundle(worldSystem, depth, {
    useHeightRamping: true,
    useHorizontalShifting: true,
    heightRampingFactor: 0.3
});

// Create wave bundle like function TWO (no variations)
WorldBuilder.buildWaveBundle(worldSystem, depth, {
    useHeightRamping: false,
    useHorizontalShifting: false,
    maxAmplitude: 10
});

// Create wave bundle with height ramping but no horizontal shifting
WorldBuilder.buildWaveBundle(worldSystem, depth, {
    useHeightRamping: true,
    useHorizontalShifting: false,
    heightRampingFactor: 0.3
});

// Create wave bundle with horizontal shifting but uniform height
WorldBuilder.buildWaveBundle(worldSystem, depth, {
    useHeightRamping: false,
    useHorizontalShifting: true,
    horizontalShiftFactor: Math.PI / (depth * 2) // More gentle shifting
});
*/