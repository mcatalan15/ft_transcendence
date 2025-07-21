/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:55:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:30:31 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System'
import type { FrameData } from '../utils/Types';

import type { RenderComponent } from '../components/RenderComponent';
import type { PhysicsComponent } from '../components/PhysicsComponent';
import type { TextComponent } from '../components/TextComponent';

export class RenderSystem implements System {
    game: PongGame;

    constructor (game: PongGame) {
        this.game = game;
    }
    
    update(entities: Entity[], delta: FrameData): void {
        entities.forEach((entity) => {
            const renderComponent = entity.getComponent('render') as RenderComponent;
            const physicsComponent = entity.getComponent('physics') as PhysicsComponent;

            if (renderComponent && physicsComponent && renderComponent.graphic) {
                renderComponent.graphic.x = physicsComponent.x;
                renderComponent.graphic.y = physicsComponent.y;
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

    cleanup(): void {
        for (const entity of this.game.entities) {
            const renderComponent = entity.getComponent('render') as RenderComponent;
            const physicsComponent = entity.getComponent('physics') as PhysicsComponent;
            
            if (renderComponent && physicsComponent && renderComponent.graphic) {
                renderComponent.graphic.x = physicsComponent.x;
                renderComponent.graphic.y = physicsComponent.y;
                renderComponent.graphic.rotation = 0;
                renderComponent.graphic.alpha = 1;
                renderComponent.graphic.scale.set(1, 1);
            }

            if ((entity.id === 'paddleL' || entity.id === 'paddleR') && entity.hasComponent('text')) {
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
        }
    }
}