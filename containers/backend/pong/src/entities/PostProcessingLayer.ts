/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingLayer.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 14:50:43 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:11:01 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";
import { RenderComponent } from "../components/RenderComponent";
import { PostProcessingComponent } from "../components/PostProcessingComponent";
import { Container, Point } from "pixi.js";

// Creating interfaces for PIXI filters since they're not directly available in the TS definitions
interface AdvancedBloomFilter {
    threshold: number;
    bloomScale: number;
    brightness: number;
    blur: number;
    quality: number;
    pixelSize: number;
}

interface CRTFilter {
    curvature: number;
    lineWidth: number;
    lineContrast: number;
    verticalLine: boolean;
    noise: number;
    noiseSize: number;
    seed: number;
    vignetting: number;
    vignettingAlpha: number;
    vignettingBlur: number;
    time: number;
}

interface BulgePinchFilter {
    center: Point;
    radius: number;
    strength: number;
}

interface RGBSplitFilter {
    red: Point;
    green: Point;
    blue: Point;
}

// Interface for PIXI filters namespace
interface PIXIFilters {
    AdvancedBloomFilter: new (options: Partial<AdvancedBloomFilter>) => any;
    CRTFilter: new (options: Partial<CRTFilter>) => any;
    BulgePinchFilter: new (options: Partial<BulgePinchFilter>) => any;
    RGBSplitFilter: new (options: Partial<RGBSplitFilter>) => any;
}

// Extending PIXI namespace with filters
declare global {
    namespace PIXI {
        const filters: PIXIFilters;
    }
}

interface Game {
    visualRoot: any;
}

interface App {
    screen: { width: number; height: number };
}

export class PostProcessingLayer extends Entity {
    constructor(id: string, layer: string, game: Game, app: App, renderLayers: any) {
        super(id, layer);

        //const container = new Container();
        //this.addComponent(new RenderComponent(container));
        
        // Bloom effect
        const advancedBloom = new PIXI.filters.AdvancedBloomFilter({
            threshold: 0.7,       // Higher threshold means fewer colors will bloom (more subtle)
            bloomScale: 0.2,      // Lower bloomScale makes the bloom effect less intense
            brightness: 1,        // Standard brightness (1.0 for neutral)
            blur: 1,              // Medium blur strength (not too strong)
            quality: 10,          // Standard quality
            pixelSize: 0.5,       // Standard pixel size
        });
        
        // CRT overlay
        const crtFilter = new PIXI.filters.CRTFilter({
            curvature: 1.3,         // Amount of screen bend (default: 1.0). Try 2.0+ for a classic CRT curve.
            lineWidth: 0.1,         // Thickness of scanlines (default: 1.0)
            lineContrast: 0.2,      // Contrast between scanlines and base image (default: 0.25)
            verticalLine: false,    // false = horizontal lines, true = vertical scanlines
            noise: 0.1,             // Noise overlay intensity (default: 0.3)
            noiseSize: 0.5,         // Size of noise grain (default: 1.0)
            seed: Math.random(),    // Seed for the noise randomness
            vignetting: 0.4,        // Vignette size (smaller = tighter vignette, default: 0.3)
            vignettingAlpha: 0.4,   // Opacity of vignette (default: 1.0)
            vignettingBlur: 0.1,    // Blur intensity of the vignette (default: 0.3)
            time: 0                 // For animating scanlines; increase over time in your game loop
        });

        // Lens distortion
        const bulgePinch = new PIXI.filters.BulgePinchFilter({
            center: new Point(0.5, 0.5), // Normalized coordinates (0 to 1) if using relative center
            radius: 800,                  // Radius of effect in pixels
            strength: 0.04                // Range: -1 (pinch) to 1 (bulge)
        });

        // Chromatic aberration
        const rgbSplit = new PIXI.filters.RGBSplitFilter({
            red: new Point(-0.3, 0),
            green: new Point(0, 0.3),
            blue: new Point(0.3, -0.3),
        });
        
        game.visualRoot.filters = [advancedBloom, bulgePinch, crtFilter, rgbSplit];
        
        this.addComponent(new PostProcessingComponent(null, {
            crtFilter: crtFilter
        }));
    }
}