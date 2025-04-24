/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   VFXComponent.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:45:40 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 15:25:02 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Component } from '../engine/Component.ts';
import type { Entity } from '../engine/Entity.ts'; // 👈 You need this!
import { RenderComponent } from '../components/RenderComponent'

export class VFXComponent implements Component {
	type = 'vfx';
	instanceId?: string;

	flashColor: number; // 👈 We'll make this always a number
	flashDuration: number;
	flashTimeLeft: number;
	originalTint: number;
	isFlashing: boolean;
	entity?: Entity; // 👈 Let it be the full Entity class

	constructor() {
		this.flashColor = 0xFFFFFF; // 👈 Default value instead of null
		this.flashDuration = 0;
		this.flashTimeLeft = 0;
		this.originalTint = 0xFBBF24;
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