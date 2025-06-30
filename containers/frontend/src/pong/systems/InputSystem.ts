/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:52:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/30 17:35:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { InputComponent } from '../components/InputComponent'
import { isPaddle } from '../utils/Guards';
import { Paddle } from '../entities/Paddle';

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
			if (isPaddle(entity)) {
				const paddle = entity as Paddle;
			
				if (paddle.isAI) {
					console.log(`⏭️ InputSystem skipping AI paddle: ${paddle.id}`);
					continue;
				}

				const input = entity.getComponent('input') as InputComponent;
				if (!input) return;
				input.upPressed = input.keys.up.some((key: string) => this.keysDown.has(key));
				input.downPressed = input.keys.down.some((key: string) => this.keysDown.has(key));
			}
		}
	}
}