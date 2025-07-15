/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingLayer.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 17:47:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/28 19:20:50 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Container, Point } from 'pixi.js'
import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter, GlowFilter, MotionBlurFilter, GlitchFilter, DropShadowFilter } from 'pixi-filters'
import { PongGame } from '../engine/Game'
import { Entity } from "../engine/Entity";
import { RenderComponent } from "../components/RenderComponent";
import { PostProcessingComponent } from "../components/PostProcessingComponent";
import { GAME_COLORS } from '../utils/Types';

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
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,    // Amount of screen bend (default: 1.0). Try 2.0+ for a classic CRT curve.
            lineWidth: 0.1,         // Thickness of scanlines (default: 1.0)
            lineContrast: 0.2,      // Contrast between scanlines and base image (default: 0.25)
            verticalLine: false,    // false = horizontal lines, true = vertical scanlines
            noise: 0.1,             // Noise overlay intensity (default: 0.3)
            noiseSize: 0.5,         // Size of noise grain (default: 1.0)
            seed: Math.random(),    // Seed for the noise randomness
            vignetting: 0.45,        // Vignette size (smaller = tighter vignette, default: 0.3)
            vignettingAlpha: 0.6,   // Opacity of vignette (default: 1.0)
            vignettingBlur: 0.1,    // Blur intensity of the vignette (default: 0.3)
            time: 0                 // For animating scanlines; increase over time in your game loop
        });

        // Lens distortion
        const bulgePinch = new BulgePinchFilter({
            center: new Point(0.5, 0.5), // Normalized coordinates (0 to 1) if using relative center
            radius: Math.min(game.width, game.height) * 1.6,                      // Radius of effect in pixels
            strength: (1 / game.width / game.height) * 70000,                     // Range: -1 (pinch) to 1 (bulge)
        });

        // Chromatic aberration
        const rgbSplit = new RGBSplitFilter({
            red:   new Point(-0.5, 0),
            green: new Point(0, 0.5),
            blue:  new Point(0.5, -0.5),
        });

        const glow = new GlowFilter({
            alpha: 0.1,
            color: GAME_COLORS.white,
            distance: 10,
            innerStrength: 0,
            knockout: false,
            outerStrength: 2,
            quality: 0.1,
        });

        // DepthLine filters
        const depthLineCRTFilter = new CRTFilter({
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,    // Amount of screen bend (default: 1.0). Try 2.0+ for a classic CRT curve.
            lineWidth: 0.1,         // Thickness of scanlines (default: 1.0)
            lineContrast: 0.2,      // Contrast between scanlines and base image (default: 0.25)
            verticalLine: false,    // false = horizontal lines, true = vertical scanlines
            noise: 0,             // Noise overlay intensity (default: 0.3)
            noiseSize: 0.5,         // Size of noise grain (default: 1.0)
            seed: Math.random(),    // Seed for the noise randomness
            vignetting: 0.5,        // Vignette size (smaller = tighter vignette, default: 0.3)
            vignettingAlpha: 1,   // Opacity of vignette (default: 1.0)
            vignettingBlur: 0.2,    // Blur intensity of the vignette (default: 0.3)
            time: 0                 // For animating scanlines; increase over time in your game loop
        });

        const depthLineGlow = new GlowFilter({
            alpha: 0.1,
            color: GAME_COLORS.white,
            distance: 10,
            innerStrength: 0,
            knockout: false,
            outerStrength: 1,
            quality: 0.1,
        });

        // Powerup filters
        const powerupCRT = new CRTFilter({
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,    // Amount of screen bend (default: 1.0). Try 2.0+ for a classic CRT curve.
            lineWidth: 0.1,         // Thickness of scanlines (default: 1.0)
            lineContrast: 0.2,      // Contrast between scanlines and base image (default: 0.25)
            verticalLine: false,    // false = horizontal lines, true = vertical scanlines
            noise: 0.,             // Noise overlay intensity (default: 0.3)
            noiseSize: 0.5,         // Size of noise grain (default: 1.0)
            seed: Math.random(),    // Seed for the noise randomness
            vignetting: 0,        // Vignette size (smaller = tighter vignette, default: 0.3)
            vignettingAlpha: 0,   // Opacity of vignette (default: 1.0)
            vignettingBlur: 0,    // Blur intensity of the vignette (default: 0.3)
            time: 0                 // For animating scanlines; increase over time in your game loop
        });

        const powerupGlow = new GlowFilter({
            alpha: 0.2,
            color: GAME_COLORS.marine,
            distance: 10,
            innerStrength: 3,
            knockout: false,
            outerStrength: 2,
            quality: 0.1,
        });

        const powerdownGlow = new GlowFilter({
            alpha: 0.2,
            color: GAME_COLORS.marine,
            distance: 10,
            innerStrength: 3,
            knockout: false,
            outerStrength: 2,
            quality: 0.1,
        });

        const ballChangeGlow = new GlowFilter({
            alpha: 0.2,
            color: GAME_COLORS.marine,
            distance: 10,
            innerStrength: 3,
            knockout: false,
            outerStrength: 2,
            quality: 0.1,
        });

        const powerupDropShadow = new DropShadowFilter({
            alpha: 0.75,
            blur: 1,
            color: GAME_COLORS.green,
            offset: {x: 4,y: 4},
            pixelSize: {x:1,y:1},
            quality: 4,
            resolution: 1,
        });
        
        const powerdownDropShadow = new DropShadowFilter({
            alpha: 0.75,
            blur: 1,
            color: GAME_COLORS.red,
            offset: {x: 4,y: 4},
            pixelSize: {x:1,y:1},
            quality: 4,
            resolution: 1,
        });

        const ballChangeDropShadow = new DropShadowFilter({
            alpha: 0.75,
            blur: 1,
            color: GAME_COLORS.brown,
            offset: {x: 4,y: 4},
            pixelSize: {x:1,y:1},
            quality: 4,
            resolution: 1,
        });

        const powerdownGlitch = new GlitchFilter({
            average: false,
            blue: {x: 0.5, y: 0.5},
            green: {x: 0.5, y: 0.5},
            red: {x: 0.5, y: 0.5},
            direction: 0,
            fillMode: 1,
            offset : 2,
            sampleSize: 512,
            seed: 0,
            slices: 200,
        });

        const powerupMotionBlur = new MotionBlurFilter({
           kernelSize: 5,
           offset: 1,
           velocity: {x: 0, y:0},
        });

        // Apply filters to the visual root
        game.visualRoot.filters = [glow, advancedBloom, bulgePinch, crtFilter, rgbSplit];
        this.addComponent(new PostProcessingComponent({
            advancedBloom: advancedBloom,
			crtFilter: crtFilter,
            depthLineCRTFilter: depthLineCRTFilter,
            bulgePinch: bulgePinch,
            rgbSpilt: rgbSplit,
            powerupGlow: powerupGlow,
            powerupCRT: powerupCRT,
            powerdownGlitch: powerdownGlitch,
        }));

        //Apply filters to the powerup layer0
        game.renderLayers.background.filters = [depthLineGlow, bulgePinch, depthLineCRTFilter];
        game.renderLayers.powerup.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur];
        game.renderLayers.powerupGlitched.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur, powerdownGlitch];
        game.renderLayers.powerdown.filters = [powerdownGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerdownDropShadow, powerupMotionBlur, powerdownGlitch];
        game.renderLayers.ballChange.filters = [ballChangeGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, ballChangeDropShadow, powerupMotionBlur];
        game.renderLayers.crossCut.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur];
    }
}
