/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Paddle.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:33:11 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 17:49:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';
import { InputComponent } from '../components/InputComponent.js';

export class Paddle extends Entity {
    constructor(id, x, y, isLeftPaddle) {
        super(id);
        
        // Create graphics
        const graphic = new PIXI.Graphics();
        graphic.rect(0, 0, 10, 100);
        graphic.fill('white');
        
        // Create components
        const renderComponent = new RenderComponent(graphic);
        const physicsComponent = new PhysicsComponent(0, 0, 10, 100);
        physicsComponent.x = x;
        physicsComponent.y = y;
        physicsComponent.speed = 20;
        
        // Add components to entity
        this.addComponent(renderComponent);
        this.addComponent(physicsComponent);
        
        // Add input component with key bindings
        const keys = isLeftPaddle ? 
            { up: ['w'], down: ['s'] } : 
            { up: ['ArrowUp'], down: ['ArrowDown'] };
        const inputComponent = new InputComponent(keys);
        this.addComponent(inputComponent);
        
        // Set up event listeners
        document.addEventListener('paddleInput', (e) => {
            const detail = e.detail;
            const isPaddleMatch = 
                (isLeftPaddle && detail.paddle === 'left') || 
                (!isLeftPaddle && detail.paddle === 'right');
                
            if (isPaddleMatch) {
                if (detail.key === (isLeftPaddle ? 'w' : 'ArrowUp')) {
                    inputComponent.upPressed = detail.state === 'down';
                } else if (detail.key === (isLeftPaddle ? 's' : 'ArrowDown')) {
                    inputComponent.downPressed = detail.state === 'down';
                }
            }
        });
    }
}