/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   VFXComponent.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:45:40 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 11:45:52 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Component } from '../engine/Component.js';

export class VFXComponent implements Component {
	type = 'vfx';
	instanceId?: string;

	flashColor: number | null;
	flashDuration: number;
	flashTimeLeft: number;
	originalTint: number;
	isFlashing: boolean;
	entity?: {
		getComponent(type: string): { graphic?: { tint: number } } | undefined;
	};

	constructor() {
		this.flashColor = null;
		this.flashDuration = 0;
		this.flashTimeLeft = 0;
		this.originalTint = 0xFBBF24;
		this.isFlashing = false;
	}

	startFlash(color: number, duration: number): void {
		if (!this.isFlashing) {
			const render = this.entity?.getComponent('render');
			if (render?.graphic) {
				this.originalTint = render.graphic.tint;
			}
		}

		this.flashColor = color;
		this.flashDuration = duration;
		this.flashTimeLeft = duration;
		this.isFlashing = true;
	}
}