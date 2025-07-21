/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingSystem.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 18:11:49 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:29:45 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingSystem.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 18:11:49 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 17:29:45 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { Entity } from "../engine/Entity";
import type { System } from '../engine/System'

import { PostProcessingComponent } from "../components/PostProcessingComponent";

import { randomInRange } from "../utils/Utils";

export class PostProcessingSystem implements System {
    game: PongGame;
    time: number;
    powerupGlowTime: number;

    constructor(game: PongGame) {
        this.game = game;
        this.time = 0;
        this.powerupGlowTime = 0;
    }

    update(entities: Entity[], delta: { deltaTime: number }) {
        this.time += delta.deltaTime * 0.3;
        this.powerupGlowTime += delta.deltaTime * 0.04; 
        
        entities.forEach(entity => {
            if (!entity.hasComponent('postProcessing')) return;

            const postProcessing = entity.getComponent('postProcessing') as PostProcessingComponent;
            const options = postProcessing.options;

            if (options.crtFilter) {
                options.crtFilter.time = this.time;
                options.crtFilter.seed = Math.sin(this.time) * 10000 % 1;
            }

            if (options.powerupCRT) {
                options.powerupCRT.time = this.time;
                options.powerupCRT.seed = Math.sin(this.time) * 10000 % 1;
            }

            if (options.powerdownGlitch) {
                const t = this.time;
            
                options.powerdownGlitch.seed = Math.random();
            
                options.powerdownGlitch.offset = 1 + Math.sin(t * 10);
            
                options.powerdownGlitch.direction = Math.sin(t * 0.5) * Math.PI / 2;
            
                options.powerdownGlitch.slices = 100 + Math.floor(Math.random() * 100);
            }

            if (options.powerupGlow) {
                options.powerupGlow.distance = randomInRange(90, 100);
            }
            
            if (options.powerupGlow) {
                const baseStrength = 3;
                const pulseAmplitude = 0.5;
                const pulseValue = baseStrength + Math.sin(this.powerupGlowTime) * pulseAmplitude;
                
                options.powerupGlow.outerStrength = pulseValue;
                
                const baseAlpha = 0.2;
                const alphaAmplitude = 0.05;
                options.powerupGlow.alpha = baseAlpha + Math.sin(this.powerupGlowTime) * alphaAmplitude;
            }
        });
    }

    cleanup(): void {
        this.time = 0;
        this.powerupGlowTime = 0;
        
        for (const entity of this.game.entities) {
            if (entity.hasComponent('postProcessing')) {
                const postProcessing = entity.getComponent('postProcessing') as PostProcessingComponent;
                if (postProcessing?.options) {

                    if (postProcessing.options.crtFilter) {
                        postProcessing.options.crtFilter.time = 0;
                        postProcessing.options.crtFilter.seed = 0;
                    }
                    
                    if (postProcessing.options.powerupCRT) {
                        postProcessing.options.powerupCRT.time = 0;
                        postProcessing.options.powerupCRT.seed = 0;
                    }
                    
                    if (postProcessing.options.powerdownGlitch) {
                        postProcessing.options.powerdownGlitch.seed = 0;
                        postProcessing.options.powerdownGlitch.offset = 0;
                        postProcessing.options.powerdownGlitch.direction = 0;
                        postProcessing.options.powerdownGlitch.slices = 0;
                    }
                    
                    if (postProcessing.options.powerupGlow) {
                        postProcessing.options.powerupGlow.distance = 0;
                        postProcessing.options.powerupGlow.outerStrength = 0;
                        postProcessing.options.powerupGlow.alpha = 0;
                    }
                }
            }
        }
    }
}