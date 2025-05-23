/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:52:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { InputComponent } from '../components/InputComponent'

export class InputSystem implements System {
	private keysDown: Set<string> = new Set();

	constructor() {
		window.addEventListener('keydown', (e) => {
			this.keysDown.add(e.key);
		});

		window.addEventListener('keyup', (e) => {
			this.keysDown.delete(e.key);
		});
	}

	update(entities: Entity[]): void {
		for (const entity of entities) {
			if (!entity.hasComponent('input')) continue;

			const input = entity.getComponent('input') as InputComponent;
			if (!input) return;
			input.upPressed = input.keys.up.some((key: string) => this.keysDown.has(key));
			input.downPressed = input.keys.down.some((key: string) => this.keysDown.has(key));
		}
	}
}