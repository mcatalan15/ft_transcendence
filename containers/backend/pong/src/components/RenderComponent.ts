/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderComponent.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 11:30:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 11:46:17 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Graphics } from 'pixi.js';
import { Component } from '../engine/Component.ts'

export class RenderComponent implements Component {
	type = 'render';
	instanceId?: string;
	graphic: Graphics;

	constructor(graphic: Graphics) {
		this.graphic = graphic;
	}
}