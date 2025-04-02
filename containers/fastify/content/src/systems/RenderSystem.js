/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.js                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:31:27 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/02 11:15:32 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class RenderSystem {
    constructor(app) {
        this.app = app;
    }
    
    update(entities, delta) {
        entities.forEach(entity => {
            const renderComponent = entity.getComponent('render');
            const physicsComponent = entity.getComponent('physics');
            const textComponent = entity.getComponent('text');
            
            if (renderComponent && physicsComponent) {
                renderComponent.graphic.x = physicsComponent.x;
                renderComponent.graphic.y = physicsComponent.y;
                
                if (entity.id === 'ball') {
                    renderComponent.graphic.rotation = physicsComponent.rotation;
                }
            }
            
            // Update text component position if it exists
            if (textComponent && physicsComponent) {
                if (entity.id === 'paddleL') {
                    // For left paddle: text rotated 90° counterclockwise (text reads upward)
                    textComponent.textObject.rotation = -Math.PI/2; // Rotate 90° counterclockwise
                    
                    // Position text behind (to the left of) the left paddle
                    textComponent.updatePosition(
                        Math.round(physicsComponent.x - textComponent.textObject.height - 5), 
                        Math.round(physicsComponent.y + physicsComponent.height / 2 + textComponent.textObject.width / 2)
                    );
                } else if (entity.id === 'paddleR') {
                    // For right paddle: text rotated 90° clockwise (text reads downward)
                    textComponent.textObject.rotation = Math.PI/2; // Rotate 90° clockwise
                    
                    // Position text behind (to the right of) the right paddle
                    textComponent.updatePosition(
                        Math.round(physicsComponent.x + physicsComponent.width + textComponent.textObject.height + 5), 
                        Math.round(physicsComponent.y + physicsComponent.height / 2 - textComponent.textObject.width / 2)
                    );
                }
            }
        });
    }
}