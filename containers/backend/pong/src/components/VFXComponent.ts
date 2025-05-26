/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   VFXComponent.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:45:40 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 10:24:42 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Entity } from '../engine/Entity';
import type { Component } from '../engine/Component';

import { RenderComponent } from '../components/RenderComponent'

import { GAME_COLORS } from '../utils/Types';

export class VFXComponent implements Component {
	type = 'vfx';
	instanceId?: string;

	flashColor: number;
	flashDuration: number;
	flashTimeLeft: number;
	originalTint: number;
	isFlashing: boolean;
	entity?: Entity;

	constructor() {
		this.flashColor = GAME_COLORS.orange;
		this.flashDuration = 0;
		this.flashTimeLeft = 0;
		this.originalTint = GAME_COLORS.orange;
		this.isFlashing = false;
	}

	startFlash(color: number, duration: number): void {
		const render = this.entity?.getComponent('render') as RenderComponent;
		if (!this.isFlashing && render?.graphic) {
			this.originalTint = render.graphic.tint;
		}

		this.flashColor = color;
		this.flashDuration = duration;
		this.flashTimeLeft = duration;
		this.isFlashing = true;
	}
}