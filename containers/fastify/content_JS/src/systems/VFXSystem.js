/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   VFXSystem.js                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 16:22:19 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/14 17:10:53 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ParticleSpawner } from '../spawners/ParticleSpawner.js'

export class VFXSystem {
    constructor(game, width, height) {
        this.game = game;
        this.dustSpawnInterval = 1;
        this.lastDustSpawnTime = 0;
        this.width = width;
        this.height = height;
    }
    
    update(entities, delta) {
        for (const entity of entities) {
            if (!entity.hasComponent('vfx') || !entity.hasComponent('render')) continue;

            const vfx = entity.getComponent('vfx');
            const render = entity.getComponent('render');
            
            vfx.entity = entity;
            
            if (vfx.isFlashing) {
                vfx.flashTimeLeft -= delta.deltaTime;
                if (vfx.flashTimeLeft > 0) {
                    if (render.graphic) {
                        render.graphic.tint = vfx.flashColor;
                    }
                } else {
                    if (render.graphic) {
                        render.graphic.tint = vfx.originalTint;
                    }
                    vfx.isFlashing = false;
                }
            } else 
                render.graphic.tint = vfx.originalTint;
        }
    }
}