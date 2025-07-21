/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingLayer.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 17:47:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 20:33:55 by hmunoz-g         ###   ########.fr       */
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

        const advancedBloom = new AdvancedBloomFilter({
            threshold: 0.7,
            bloomScale: 0.2,
            brightness: 1,
            blur: 1,
            quality: 10,
            pixelSize: 0.5,
        });

        const crtFilter = new CRTFilter({
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,
            lineWidth: 0.1,
            lineContrast: 0.2,
            verticalLine: false,
            noise: 0.1, 
            noiseSize: 0.5,
            seed: Math.random(),
            vignetting: 0.45,
            vignettingAlpha: 0.6,
            vignettingBlur: 0.1,
            time: 0 
        });


        const bulgePinch = new BulgePinchFilter({
            center: new Point(0.5, 0.5), 
            radius: Math.min(game.width, game.height) * 1.6,
            strength: (1 / game.width / game.height) * 70000,
        });

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

        const depthLineCRTFilter = new CRTFilter({
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,
            lineWidth: 0.1,
            lineContrast: 0.2,
            verticalLine: false,
            noise: 0,
            noiseSize: 0.5,
            seed: Math.random(),
            vignetting: 0.5,
            vignettingAlpha: 1,
            vignettingBlur: 0.2,
            time: 0
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

        const powerupCRT = new CRTFilter({
            curvature: (game.width * 0.0005 + game.height * 0.0005) / 2,
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

        const powerupMotionBlur = new MotionBlurFilter({
           kernelSize: 5,
           offset: 1,
           velocity: {x: 0, y:0},
        });

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

        game.renderLayers.background.filters = [depthLineGlow, bulgePinch, depthLineCRTFilter];
        game.renderLayers.powerup.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur];
        game.renderLayers.powerupGlitched.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur, powerdownGlitch];
        game.renderLayers.powerdown.filters = [powerdownGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerdownDropShadow, powerupMotionBlur, powerdownGlitch];
        game.renderLayers.ballChange.filters = [ballChangeGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, ballChangeDropShadow, powerupMotionBlur];
        game.renderLayers.crossCut.filters = [powerupGlow, advancedBloom, bulgePinch, powerupCRT, rgbSplit, powerupDropShadow, powerupMotionBlur];
    }
}
