/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingLayer.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 17:47:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 18:13:33 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application, Container, Point } from 'pixi.js'
import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter } from 'pixi-filters'
import { PongGame } from '../engine/Game'
import { Entity } from "../engine/Entity";
import { RenderComponent } from "../components/RenderComponent";
import { PostProcessingComponent } from "../components/PostProcessingComponent";
import { PostProcessingOptions } from '../utils/Types';


interface PostProcessingLayerOptions {
    game: any;  // Replace with your actual game type
    app: Application;
    renderLayers: any;  // Adjust this type if you have a specific type for renderLayers
}

export class PostProcessingLayer extends Entity {
    constructor(id: string, layer: string, game: PongGame) {
        super(id, layer);

        const container = new Container();
        this.addComponent(new RenderComponent(container));

        // Bloom effect
        const advancedBloom = new AdvancedBloomFilter({
            threshold: 0.7,       // Higher threshold means fewer colors will bloom (more subtle)
            bloomScale: 0.2,      // Lower bloomScale makes the bloom effect less intense
            brightness: 1,      // Standard brightness (1.0 for neutral)
            blur: 1,              // Medium blur strength (not too strong)
            quality: 10,           // Standard quality
            pixelSize: 0.5,         // Standard pixel size
        });

        // CRT overlay
        const crtFilter = new CRTFilter({
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
        const bulgePinch = new BulgePinchFilter({
            center: new Point(0.5, 0.5), // Normalized coordinates (0 to 1) if using relative center
            radius: 800,                      // Radius of effect in pixels
            strength: 0.04                     // Range: -1 (pinch) to 1 (bulge)
        });

        // Chromatic aberration
        const rgbSplit = new RGBSplitFilter({
            red:   new Point(-0.3, 0),
            green: new Point(0, 0.3),
            blue:  new Point(0.3, -0.3),
        });

        // Apply filters to the visual root
        game.visualRoot.filters = [advancedBloom, bulgePinch, crtFilter, rgbSplit];
        this.addComponent(new PostProcessingComponent({
            advancedBloom: advancedBloom,
			crtFilter: crtFilter,
            bulgePinch: bulgePinch,
            rgbSpilt: rgbSplit,
        }));
    }
}
