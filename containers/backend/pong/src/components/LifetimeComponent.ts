/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LifetimeComponent.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 12:58:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 12:58:11 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Component } from '../engine/Component.ts';

export class LifetimeComponent implements Component {
	type = 'lifetime';
	instanceId?: string;

	initial: number;
	remaining: number;
	despawn: boolean;

	constructor(lifetime: number, despawn: boolean) {
		this.initial = lifetime;
		this.remaining = lifetime;
		this.despawn = despawn;
	}
}