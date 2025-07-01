/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:52:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 15:01:28 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { InputComponent } from '../components/InputComponent'
import { isPaddle } from '../utils/Guards';
import { Paddle } from '../entities/Paddle';

export class InputSystem implements System {
	private game: PongGame;
	private keysDown: Set<string> = new Set();

	constructor(game: PongGame) {
		this.game = game;

		window.addEventListener('keydown', (e) => {
			this.keysDown.add(e.key);
		});

		window.addEventListener('keyup', (e) => {
			this.keysDown.delete(e.key);
		});
	}

	update(entities: Entity[]): void {
		if (this.game.hasEnded) return;
		for (const entity of entities) {
			if (isPaddle(entity)) {
				const paddle = entity as Paddle;
			
				if (paddle.isAI) {
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