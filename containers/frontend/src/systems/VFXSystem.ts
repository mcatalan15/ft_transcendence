/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   VFXSystem.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:37:22 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:32 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import { System } from '../engine/System';

import { VFXComponent } from '../components/VFXComponent';
import { RenderComponent } from '../components/RenderComponent';

import { FrameData } from '../utils/Types';

export class VFXSystem implements System {
	private game: PongGame;
	private width: number;
	private height: number;
	private dustSpawnInterval = 1;
	private lastDustSpawnTime = 0;

	constructor(game: PongGame, width: number, height: number) {
		this.game = game;
		this.width = width;
		this.height = height;
	}

	update(entities: Entity[], delta: FrameData): void {
		for (const entity of entities) {
			if (!entity.hasComponent('vfx') || !entity.hasComponent('render')) continue;

			const vfx = entity.getComponent('vfx') as VFXComponent;
			const render = entity.getComponent('render') as RenderComponent;

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
			} else {
				if (render.graphic) {
					render.graphic.tint = vfx.originalTint;
				}
			}
		}
	}
}