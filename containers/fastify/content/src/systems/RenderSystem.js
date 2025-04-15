/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.js                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 17:23:49 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/15 14:08:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class RenderSystem {
    constructor(game, app) {
        this.game = game;
		this.app = app;
        this.renderedTextComponents = new Set();
    }

    update(entities, delta) {
        entities.forEach(entity => {
            const renderComponent = entity.getComponent('render');
            const physicsComponent = entity.getComponent('physics');

            // Handle rendering for physics objects
            if (renderComponent && physicsComponent) {
                renderComponent.graphic.x = physicsComponent.x;
                renderComponent.graphic.y = physicsComponent.y;
            }

            // Handle text components for paddles
            if (entity.hasComponent('text') && physicsComponent && (entity.id === 'paddleL' || entity.id === 'paddleR')) {
                const textComponent = entity.getComponent('text');
                const textObject = textComponent.getRenderable();
                const isLeftPaddle = entity.id === 'paddleL';
                
                if (isLeftPaddle) {
                    textObject.x = physicsComponent.x - 25;
                    textObject.y = physicsComponent.y;
                } else {
                    textObject.x = physicsComponent.x + 25;
                    textObject.y = physicsComponent.y;
                }
            }
        });
    }
}