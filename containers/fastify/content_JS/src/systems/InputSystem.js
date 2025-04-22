/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputSystem.js                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 11:21:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/10 11:27:03 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class InputSystem {
	constructor () {
		this.keysDown = new Set();

		window.addEventListener('keydown', (e) => {
			this.keysDown.add(e.key);
		});

		window.addEventListener('keyup', (e) => {
			this.keysDown.delete(e.key);
		})
	}

	update(entities){
		for (const entity of entities) {
			if (!entity.hasComponent('input')) continue;

			const input = entity.getComponent('input');
			input.upPressed = input.keys.up.some(key => this.keysDown.has(key));
			input.downPressed = input.keys.down.some(key => this.keysDown.has(key));
		}
	}
}