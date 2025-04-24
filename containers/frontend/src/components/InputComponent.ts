/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputComponent.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:31:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 10:31:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Component } from '../engine/Component.js';

type KeysConfig = {
	up: string[];
	down: string[];
};

export class InputComponent implements Component {
	type = 'input';
	instanceId?: string;
	side: string;

	keys: KeysConfig;
	upPressed: boolean;
	downPressed: boolean;

	constructor(keys: KeysConfig) {
		this.keys = keys;
		this.upPressed = false;
		this.downPressed = false;
		this.side = '';
	}
}