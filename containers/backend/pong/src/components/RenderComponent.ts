/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderComponent.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:54:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/29 12:21:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Graphics, Container } from 'pixi.js';

import { Component } from '../engine/Component'

export class RenderComponent implements Component {
	type = 'render';
	instanceId?: string;
	graphic: Graphics | Container;

	constructor(graphic: Graphics | Container, id?:string) {
		this.graphic = graphic;
		this.instanceId = id;
	}
}