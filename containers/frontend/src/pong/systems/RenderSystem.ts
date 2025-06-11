/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:55:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/11 14:51:51 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System'
import type { FrameData } from '../utils/Types';

import type { RenderComponent } from '../components/RenderComponent';
import type { PhysicsComponent } from '../components/PhysicsComponent';
import type { TextComponent } from '../components/TextComponent';

export class RenderSystem implements System {
    update(entities: Entity[], delta: FrameData): void {
        entities.forEach((entity) => {
            const renderComponent = entity.getComponent('render') as RenderComponent;
            const physicsComponent = entity.getComponent('physics') as PhysicsComponent;

            if (renderComponent && physicsComponent && renderComponent.graphic) {
                // Update ALL entities regardless of server-controlled status
                renderComponent.graphic.x = physicsComponent.x;
                renderComponent.graphic.y = physicsComponent.y;
                
                // Handle rotation if it exists
                if (physicsComponent.rotation !== undefined) {
                    renderComponent.graphic.rotation = physicsComponent.rotation;
                }
            }

            if (
                entity.hasComponent('text') &&
                physicsComponent &&
                (entity.id === 'paddleL' || entity.id === 'paddleR')
            ) {
                const textComponent = entity.getComponent('text') as TextComponent;
                const textObject = textComponent.getRenderable();

                if (entity.id === 'paddleL') {
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