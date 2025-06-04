/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuPostProcessingLayer.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 17:47:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/04 09:33:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Container, Point } from 'pixi.js'
import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter, GlowFilter, MotionBlurFilter, GlitchFilter, DropShadowFilter } from 'pixi-filters'
import { Menu } from './Menu';
import { Entity } from "../engine/Entity";
import { RenderComponent } from "../components/RenderComponent";
import { PostProcessingComponent } from "../components/PostProcessingComponent";
import { GAME_COLORS } from '../utils/Types';

export class MenuPostProcessingLayer extends Entity {
    constructor(id: string, layer: string, menu: Menu) {
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
            curvature: (menu.width * 0.0005 + menu.height * 0.0005) / 2,    // Amount of screen bend (default: 1.0). Try 2.0+ for a classic CRT curve.
            lineWidth: 0.05,         // Thickness of scanlines (default: 1.0)
            lineContrast: 0.15,      // Contrast between scanlines and base image (default: 0.25)
            verticalLine: false,    // false = horizontal lines, true = vertical scanlines
            noise: 0.1,             // Noise overlay intensity (default: 0.3)
            noiseSize: 0.2,         // Size of noise grain (default: 1.0)
            seed: Math.random(),    // Seed for the noise randomness
            vignetting: 0.45,        // Vignette size (smaller = tighter vignette, default: 0.3)
            vignettingAlpha: 0.6,   // Opacity of vignette (default: 1.0)
            vignettingBlur: 0.1,    // Blur intensity of the vignette (default: 0.3)
            time: 0                 // For animating scanlines; increase over time in your game loop
        });

        // Lens distortion
        const bulgePinch = new BulgePinchFilter({
            center: new Point(0.5, 0.5), // Normalized coordinates (0 to 1) if using relative center
            radius: Math.min(menu.width, menu.height) * 1.6,                      // Radius of effect in pixels
            strength: (1 / menu.width / menu.height) * 70000,                     // Range: -1 (pinch) to 1 (bulge)
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

        this.addComponent(new PostProcessingComponent({
            advancedBloom: advancedBloom,
			crtFilter: crtFilter,
            bulgePinch: bulgePinch,
            rgbSpilt: rgbSplit,
        }));
        menu.visualRootFilters = [glow, advancedBloom, bulgePinch, crtFilter, rgbSplit];
        menu.menuContainerFilters = [glow, advancedBloom, bulgePinch, crtFilter, rgbSplit];

        menu.visualRoot.filters = menu.visualRootFilters;
        menu.menuContainer.filters = menu.menuContainerFilters;
    }
}
