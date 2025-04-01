/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.js                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:31:27 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 13:46:45 by hmunoz-g         ###   ########.fr       */
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
            
            if (renderComponent && physicsComponent) {
                renderComponent.graphic.x = physicsComponent.x;
                renderComponent.graphic.y = physicsComponent.y;
                
                if (entity.id === 'ball') {
                    renderComponent.graphic.rotation = physicsComponent.rotation;
                }
            }
        });
    }
}