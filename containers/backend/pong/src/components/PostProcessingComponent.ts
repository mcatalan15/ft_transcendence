/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingComponent.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 12:58:42 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 12:59:07 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Component } from '../engine/Component.ts';

type FilterType = unknown;

export class PostProcessingComponent implements Component {
	type = 'postProcessing';
	instanceId?: string;

	filter: FilterType | null;
	options: Record<string, any>;
	enabled: boolean;
	time: number;

	constructor(filter: FilterType | null = null, options: Record<string, any> = {}) {
		this.filter = filter || options.filter || null;
		this.options = options;
		this.enabled = true;
		this.time = 0;
	}
}