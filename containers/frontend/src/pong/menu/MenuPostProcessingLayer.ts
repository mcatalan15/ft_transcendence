/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuPostProcessingLayer.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 17:47:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/13 15:38:17 by hmunoz-g         ###   ########.fr       */
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
            threshold: 0.7,
            bloomScale: 0.2,
            brightness: 1,
            blur: 1,
            quality: 10,
            pixelSize: 0.5,
        });

        // CRT base
        const crtFilter = new CRTFilter({
            curvature: (menu.width * 0.0005 + menu.height * 0.0005) / 2,
            lineWidth: 0.05,
            lineContrast: 0.15,
            verticalLine: false,
            noise: 0.05,
            noiseSize: 0.2,
            seed: Math.random(),
            vignetting: 0.45,
            vignettingAlpha: 0.6,
            vignettingBlur: 0.1,
            time: 0
        });

         // Overlay CRT
         const crtOverlay = new CRTFilter({
            curvature: (menu.width * 0.0005 + menu.height * 0.0005) / 2,
            lineWidth: 0.05,
            lineContrast: 0.15,
            verticalLine: false,
            noise: 0.05,
            noiseSize: 0.2,
            seed: Math.random(),
            vignetting: 0.45,
            vignettingAlpha: 0.6,
            vignettingBlur: 0.1,
            time: 0
        });

        // Lens distortion
        const bulgePinch = new BulgePinchFilter({
            center: new Point(0.5, 0.5),
            radius: Math.min(menu.width, menu.height) * 1.6,
            strength: (1 / menu.width / menu.height) * 70000,
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

        // Power-up effects
        const powerupCRT = new CRTFilter({
            curvature: (menu.width * 0.0005 + menu.height * 0.0005) / 2,
            lineWidth: 0.1,
            lineContrast: 0.2,
            verticalLine: false,
            noise: 0.,
            noiseSize: 0.5,
            seed: Math.random(),
            vignetting: 0,
            vignettingAlpha: 0,
            vignettingBlur: 0,
            time: 0
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

        this.addComponent(new PostProcessingComponent({
            advancedBloom: advancedBloom,
			crtFilter: crtFilter,
            crtOverlay: crtOverlay,
            powerupCRT: powerupCRT,
            bulgePinch: bulgePinch,
            rgbSpilt: rgbSplit,
            powerdownGlitch: powerdownGlitch,
        }));
        menu.baseFilters = [glow, advancedBloom, bulgePinch, crtFilter, rgbSplit];
        menu.powerupFilters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow];
        menu.powerdownFilters = [powerdownGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerdownDropShadow, powerdownGlitch];
        menu.ballchangeFilters = [ballChangeGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, ballChangeDropShadow];
        menu.powerupClassicFilters = [advancedBloom, bulgePinch, powerupCRT, rgbSplit];

        menu.visualRoot.filters = menu.baseFilters;
        menu.menuContainer.filters = menu.baseFilters;
        menu.renderLayers.overlays.filters = menu.baseFilters;
        menu.renderLayers.powerups.filters = menu.powerupFilters;
        menu.renderLayers.powerdowns.filters = menu.powerdownFilters;
        menu.renderLayers.ballchanges.filters = menu.ballchangeFilters;
        menu.renderLayers.overlayQuits.filters = menu.baseFilters;
    }
}
