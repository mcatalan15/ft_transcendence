/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuPostProcessingLayer.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 17:47:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/22 10:15:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Container, Point } from 'pixi.js'
import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter, GlowFilter, GlitchFilter, DropShadowFilter } from 'pixi-filters'
import { Menu } from '../Menu';
import { Entity } from "../../engine/Entity";
import { RenderComponent } from "../../components/RenderComponent";
import { PostProcessingComponent } from "../../components/PostProcessingComponent";
import { GAME_COLORS } from '../../utils/Types';

export class MenuPostProcessingLayer extends Entity {
    menu: Menu;
    
    constructor(id: string, layer: string, menu: Menu) {
        super(id, layer);
        this.menu = menu;

        const container = new Container();
        this.addComponent(new RenderComponent(container));

        const isFirefox = this.menu.isFirefox;

        const advancedBloom = new AdvancedBloomFilter({
            threshold: isFirefox ? 0.8 : 0.7,
            bloomScale: isFirefox ? 0.15 : 0.2,
            brightness: 1,
            blur: isFirefox ? 0.8 : 1,
            quality: isFirefox ? 6 : 10,
            pixelSize: isFirefox ? 0.8 : 0.5,
        });

        const crtFilter = new CRTFilter({
            curvature: (menu.width * 0.0005 + menu.height * 0.0005) / 2,
            lineWidth: isFirefox ? 0.03 : 0.05,
            lineContrast: isFirefox ? 0.1 : 0.15,
            verticalLine: false,
            noise: isFirefox ? 0.03 : 0.05,
            noiseSize: isFirefox ? 0.3 : 0.2,
            seed: Math.random(),
            vignetting: isFirefox ? 0.35 : 0.45,
            vignettingAlpha: isFirefox ? 0.4 : 0.6,
            vignettingBlur: isFirefox ? 0.05 : 0.1,
            time: 0
        });

         const crtOverlay = new CRTFilter({
            curvature: (menu.width * 0.0005 + menu.height * 0.0005) / 2,
            lineWidth: isFirefox ? 0.03 : 0.05,
            lineContrast: isFirefox ? 0.1 : 0.15,
            verticalLine: false,
            noise: isFirefox ? 0.03 : 0.05,
            noiseSize: isFirefox ? 0.3 : 0.2,
            seed: Math.random(),
            vignetting: isFirefox ? 0.35 : 0.45,
            vignettingAlpha: isFirefox ? 0.4 : 0.6,
            vignettingBlur: isFirefox ? 0.05 : 0.1,
            time: 0
        });

        const bulgePinch = new BulgePinchFilter({
            center: new Point(0.5, 0.5),
            radius: Math.min(menu.width, menu.height) * (isFirefox ? 1.4 : 1.6),
            strength: (1 / menu.width / menu.height) * (isFirefox ? 50000 : 70000),
        });

        const rgbSplit = new RGBSplitFilter({
            red:   new Point(isFirefox ? -0.3 : -0.5, 0),
            green: new Point(0, isFirefox ? 0.3 : 0.5),
            blue:  new Point(isFirefox ? 0.3 : 0.5, isFirefox ? -0.3 : -0.5),
        });

        const glow = new GlowFilter({
            alpha: isFirefox ? 0.08 : 0.1,
            color: GAME_COLORS.white,
            distance: isFirefox ? 3 : 5,
            innerStrength: 0,
            knockout: false,
            outerStrength: isFirefox ? 0.3 : 0.5,
            quality: isFirefox ? 0.05 : 0.1,
        });

        const powerupCRT = new CRTFilter({
            curvature: (menu.width * 0.0005 + menu.height * 0.0005) / 2,
            lineWidth: isFirefox ? 0.08 : 0.1,
            lineContrast: isFirefox ? 0.15 : 0.2,
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
            alpha: isFirefox ? 0.15 : 0.2,
            color: GAME_COLORS.marine,
            distance: isFirefox ? 7 : 10,
            innerStrength: isFirefox ? 2 : 3,
            knockout: false,
            outerStrength: isFirefox ? 1.5 : 2,
            quality: isFirefox ? 0.05 : 0.1,
        });

        const powerdownGlow = new GlowFilter({
            alpha: isFirefox ? 0.15 : 0.2,
            color: GAME_COLORS.marine,
            distance: isFirefox ? 7 : 10,
            innerStrength: isFirefox ? 2 : 3,
            knockout: false,
            outerStrength: isFirefox ? 1.5 : 2,
            quality: isFirefox ? 0.05 : 0.1,
        });

        const ballChangeGlow = new GlowFilter({
            alpha: isFirefox ? 0.15 : 0.2,
            color: GAME_COLORS.marine,
            distance: isFirefox ? 7 : 10,
            innerStrength: isFirefox ? 2 : 3,
            knockout: false,
            outerStrength: isFirefox ? 1.5 : 2,
            quality: isFirefox ? 0.05 : 0.1,
        });

        const powerupDropShadow = new DropShadowFilter({
            alpha: isFirefox ? 0.6 : 0.75,
            blur: isFirefox ? 0.8 : 1,
            color: GAME_COLORS.green,
            offset: {x: isFirefox ? 3 : 4, y: isFirefox ? 3 : 4},
            pixelSize: {x: 1, y: 1},
            quality: isFirefox ? 2 : 4,
            resolution: 1,
        });
        
        const powerdownDropShadow = new DropShadowFilter({
            alpha: isFirefox ? 0.6 : 0.75,
            blur: isFirefox ? 0.8 : 1,
            color: GAME_COLORS.red,
            offset: {x: isFirefox ? 3 : 4, y: isFirefox ? 3 : 4},
            pixelSize: {x: 1, y: 1},
            quality: isFirefox ? 2 : 4,
            resolution: 1,
        });

        const ballChangeDropShadow = new DropShadowFilter({
            alpha: isFirefox ? 0.6 : 0.75,
            blur: isFirefox ? 0.8 : 1,
            color: GAME_COLORS.brown,
            offset: {x: isFirefox ? 3 : 4, y: isFirefox ? 3 : 4},
            pixelSize: {x: 1, y: 1},
            quality: isFirefox ? 2 : 4,
            resolution: 1,
        });

        const powerdownGlitch = new GlitchFilter({
            average: false,
            blue: {x: 0.5, y: 0.5},
            green: {x: 0.5, y: 0.5},
            red: {x: 0.5, y: 0.5},
            direction: 0,
            fillMode: 1,
            offset: isFirefox ? 1 : 2,
            sampleSize: isFirefox ? 256 : 512,
            seed: 0,
            slices: isFirefox ? 100 : 200,
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

        if (isFirefox) {
            menu.baseFilters = [glow, advancedBloom, crtFilter];
            menu.powerupFilters = [powerupGlow, advancedBloom, powerupCRT, powerupDropShadow];
            menu.powerdownFilters = [powerdownGlow, advancedBloom, powerupCRT, powerdownDropShadow];
            menu.ballchangeFilters = [ballChangeGlow, advancedBloom, powerupCRT, ballChangeDropShadow];
            menu.powerupClassicFilters = [advancedBloom, powerupCRT];
        } else {
            menu.baseFilters = [glow, advancedBloom, bulgePinch, crtFilter, rgbSplit];
            menu.powerupFilters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow];
            menu.powerdownFilters = [powerdownGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerdownDropShadow, powerdownGlitch];
            menu.ballchangeFilters = [ballChangeGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, ballChangeDropShadow];
            menu.powerupClassicFilters = [advancedBloom, bulgePinch, powerupCRT, rgbSplit];
        }

        menu.visualRoot.filters = menu.baseFilters;
        menu.menuContainer.filters = menu.baseFilters;
        menu.renderLayers.overlays.filters = menu.baseFilters;
        menu.renderLayers.powerups.filters = menu.powerupFilters;
        menu.renderLayers.powerdowns.filters = menu.powerdownFilters;
        menu.renderLayers.ballchanges.filters = menu.ballchangeFilters;
        menu.renderLayers.overlayQuits.filters = menu.baseFilters;
    }
}