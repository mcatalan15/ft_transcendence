/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.js                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 17:23:49 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/11 16:56:51 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class RenderSystem {
	constructor(app) {
		this.app = app;
	}

	update(entities, delta){
		entities.forEach(entity => {
			const renderComponent = entity.getComponent('render');
			const physicsComponent = entity.getComponent('physics');
			const textComponent = entity.getComponent('text');

			if (renderComponent && physicsComponent) {
				renderComponent.graphic.x = physicsComponent.x;
				renderComponent.graphic.y = physicsComponent.y;
			}

			if (textComponent && physicsComponent) {
				const textObject = textComponent.getRenderable();
				const isLeftPaddle = entity.id === 'paddleL';
				
				if (isLeftPaddle) {
					// For left paddle, position text between paddle and left wall
					textObject.x = physicsComponent.x - 25; // Adjust this value as needed
					textObject.y = physicsComponent.y; // Same vertical position as paddle
				} else {
					// For right paddle, position text between paddle and right wall
					textObject.x = physicsComponent.x + 25; // Adjust this value as needed
					textObject.y = physicsComponent.y; // Same vertical position as paddle
				}
			}
		})
	}
}