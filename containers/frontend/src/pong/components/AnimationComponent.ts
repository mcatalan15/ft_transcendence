/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AnimationComponent.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:42:55 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/19 16:46:39 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Component } from '../engine/Component';

import { AnimationOptions } from '../utils/Types'

export class AnimationComponent implements Component {
    type = 'animation';
	initialized = false;
	options: AnimationOptions | null;
	despawnStarted: boolean;
    
    constructor(options?: AnimationOptions) {
		this.options = options? options : null;
		this.despawnStarted = false;
    }
}