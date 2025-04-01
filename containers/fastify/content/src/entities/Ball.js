/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ball.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:33:23 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 17:49:12 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';

export class Ball extends Entity {
    constructor(id, x, y) {
        super(id);
        
        // Create graphics
        const graphic = new PIXI.Graphics();
        graphic.rect(0, 0, 20, 20);
        graphic.fill(0xFFAC1C);
        graphic.pivot.set(10, 10);
        
        // Create components
        const renderComponent = new RenderComponent(graphic);
        
        // Initialize physics with random direction
        const speed = 10;
        let angle = (Math.random() * 120 - 60) * (Math.PI / 180);
        const velocityX = Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1);
        const velocityY = Math.sin(angle) * speed;
        
        const physicsComponent = new PhysicsComponent(velocityX, velocityY, 10, 10);
        physicsComponent.x = x;
        physicsComponent.y = y;
        
        // Add components to entity
        this.addComponent(renderComponent);
        this.addComponent(physicsComponent);
    }
}