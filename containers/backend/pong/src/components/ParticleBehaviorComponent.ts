/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleBehaviorComponent.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 12:58:21 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 12:58:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Component } from '../engine/Component.ts';

type ParticleOptions = {
	rotate?: boolean;
	shrink?: boolean;
};

export class ParticleBehaviorComponent implements Component {
	type = 'particleBehavior';
	instanceId?: string;

	rotate: boolean;
	shrink: boolean;
	rotationSpeed: number;

	constructor(options: ParticleOptions = {}) {
		this.rotate = options.rotate ?? false;
		this.shrink = options.shrink ?? false;
		this.rotationSpeed = 0.1;
	}
}