/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingLayer.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 17:47:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/22 10:17:21 by hmunoz-g         ###   ########.fr       */
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

        const isFirefox = game.isFirefox;

        const advancedBloom = new AdvancedBloomFilter({
            threshold: isFirefox ? 0.8 : 0.7,
            bloomScale: isFirefox ? 0.15 : 0.2,
            brightness: 1,
            blur: isFirefox ? 0.8 : 1,
            quality: isFirefox ? 6 : 10,
            pixelSize: isFirefox ? 0.8 : 0.5,
        });

        const crtFilter = new CRTFilter({
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,
            lineWidth: isFirefox ? 0.08 : 0.1,
            lineContrast: isFirefox ? 0.15 : 0.2,
            verticalLine: false,
            noise: isFirefox ? 0.07 : 0.1,
            noiseSize: isFirefox ? 0.7 : 0.5,
            seed: Math.random(),
            vignetting: isFirefox ? 0.35 : 0.45,
            vignettingAlpha: isFirefox ? 0.4 : 0.6,
            vignettingBlur: isFirefox ? 0.05 : 0.1,
            time: 0 
        });

        const bulgePinch = new BulgePinchFilter({
            center: new Point(0.5, 0.5), 
            radius: Math.min(game.width, game.height) * (isFirefox ? 1.4 : 1.6),
            strength: (1 / game.width / game.height) * (isFirefox ? 50000 : 70000),
        });

        const rgbSplit = new RGBSplitFilter({
            red:   new Point(isFirefox ? -0.3 : -0.5, 0),
            green: new Point(0, isFirefox ? 0.3 : 0.5),
            blue:  new Point(isFirefox ? 0.3 : 0.5, isFirefox ? -0.3 : -0.5),
        });

        const glow = new GlowFilter({
            alpha: isFirefox ? 0.08 : 0.1,
            color: GAME_COLORS.white,
            distance: isFirefox ? 7 : 10,
            innerStrength: 0,
            knockout: false,
            outerStrength: isFirefox ? 1.5 : 2,
            quality: isFirefox ? 0.05 : 0.1,
        });

        const depthLineCRTFilter = new CRTFilter({
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,
            lineWidth: isFirefox ? 0.08 : 0.1,
            lineContrast: isFirefox ? 0.15 : 0.2,
            verticalLine: false,
            noise: 0,
            noiseSize: 0.5,
            seed: Math.random(),
            vignetting: isFirefox ? 0.4 : 0.5,
            vignettingAlpha: isFirefox ? 0.8 : 1,
            vignettingBlur: isFirefox ? 0.15 : 0.2,
            time: 0
        });

        const depthLineGlow = new GlowFilter({
            alpha: isFirefox ? 0.08 : 0.1,
            color: GAME_COLORS.white,
            distance: isFirefox ? 7 : 10,
            innerStrength: 0,
            knockout: false,
            outerStrength: isFirefox ? 0.8 : 1,
            quality: isFirefox ? 0.05 : 0.1,
        });

        const powerupCRT = new CRTFilter({
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,
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

        const powerupMotionBlur = new MotionBlurFilter({
           kernelSize: isFirefox ? 3 : 5,
           offset: isFirefox ? 0.7 : 1,
           velocity: {x: 0, y: 0},
        });

        if (isFirefox) {
            game.visualRoot.filters = [glow, advancedBloom, crtFilter];

            game.renderLayers.background.filters = [depthLineGlow, depthLineCRTFilter];

            game.renderLayers.powerup.filters = [powerupGlow, advancedBloom, powerupCRT, powerupDropShadow];
            game.renderLayers.powerupGlitched.filters = [powerupGlow, advancedBloom, powerupCRT, powerupDropShadow, powerdownGlitch];
            game.renderLayers.powerdown.filters = [powerdownGlow, advancedBloom, powerupCRT, powerdownDropShadow, powerdownGlitch];
            game.renderLayers.ballChange.filters = [ballChangeGlow, advancedBloom, powerupCRT, ballChangeDropShadow];
            game.renderLayers.crossCut.filters = [powerupGlow, advancedBloom, powerupCRT, powerupDropShadow];
        } else {
            game.visualRoot.filters = [glow, advancedBloom, bulgePinch, crtFilter, rgbSplit];
            
            game.renderLayers.background.filters = [depthLineGlow, bulgePinch, depthLineCRTFilter];
            game.renderLayers.powerup.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur];
            game.renderLayers.powerupGlitched.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur, powerdownGlitch];
            game.renderLayers.powerdown.filters = [powerdownGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerdownDropShadow, powerupMotionBlur, powerdownGlitch];
            game.renderLayers.ballChange.filters = [ballChangeGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, ballChangeDropShadow, powerupMotionBlur];
            game.renderLayers.crossCut.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur];
        }

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
    }
}