/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingLayer.js                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/17 11:12:49 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/17 18:25:44 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity.js";
import { RenderComponent } from "../components/RenderComponent.js";
import { PostProcessingComponent } from "../components/PostProcessingComponent.js";

export class PostProcessingLayer extends Entity {
    constructor(id, layer, game, app, renderLayers) {
        super(id, layer);

        const container = new PIXI.Container();
        this.addComponent(new RenderComponent(container));
		
		// Create a bloom effect
		const advancedBloom = new PIXI.filters.AdvancedBloomFilter({
			threshold: 0.7,       // Higher threshold means fewer colors will bloom (more subtle)
			bloomScale: 0.2,      // Lower bloomScale makes the bloom effect less intense
			brightness: 1,      // Standard brightness (1.0 for neutral)
			blur: 1,              // Medium blur strength (not too strong)
			quality: 10,           // Standard quality
			pixelSize: 0.5,         // Standard pixel size
		});
        
        const crtFilter = new PIXI.filters.CRTFilter({
            curvature: 1.5,         // Amount of screen bend (default: 1.0). Try 2.0+ for a classic CRT curve.
            lineWidth: 0.1,         // Thickness of scanlines (default: 1.0)
            lineContrast: 0.5,      // Contrast between scanlines and base image (default: 0.25)
            verticalLine: false,    // false = horizontal lines, true = vertical scanlines
            noise: 0.1,             // Noise overlay intensity (default: 0.3)
            noiseSize: 1.0,         // Size of noise grain (default: 1.0)
            seed: Math.random(),    // Seed for the noise randomness
            vignetting: 0.4,        // Vignette size (smaller = tighter vignette, default: 0.3)
            vignettingAlpha: 0.4,   // Opacity of vignette (default: 1.0)
            vignettingBlur: 0.4,    // Blur intensity of the vignette (default: 0.3)
            time: 0                 // For animating scanlines; increase over time in your game loop
        });

        const bulgePinch = new PIXI.filters.BulgePinchFilter({
            center: new PIXI.Point(0.5, 0.5), // Normalized coordinates (0 to 1) if using relative center
            radius: 800,                      // Radius of effect in pixels
            strength: 0.04                     // Range: -1 (pinch) to 1 (bulge)
        });

        const rgbSplit = new PIXI.filters.RGBSplitFilter(
            new PIXI.Point(-0.3, 0), // Red channel offset
            new PIXI.Point(0, 0.3),  // Green channel offset
            new PIXI.Point(0.3, -0.3) // Blue channel offset
        );
        
        // Apply filters to the game's visualRoot
        game.visualRoot.filters = [bulgePinch, crtFilter, rgbSplit];
        
        // Store everything we need in the component
        this.addComponent(new PostProcessingComponent(null, {
            crtFilter: crtFilter
        }));
        
        // Add a debugging toggle
        window.toggleCRT = () => {
            scanlineSprite.visible = !scanlineSprite.visible;
            game.visualRoot.filters = scanlineSprite.visible ? 
                [crtFilter] : [];
        };
    }
}