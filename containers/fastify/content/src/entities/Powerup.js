/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Powerup.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:35:46 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:35:47 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';
import { PowerupComponent } from '../components/PowerupComponent.js';
import { GAME_CONSTANTS } from '../utils/Constants.js';

export class Powerup extends Entity {
    constructor(id, x, y, type) {
        super(id);
        
        // Create graphics based on powerup type
        const graphic = new PIXI.Graphics();
        graphic.circle(0, 0, 15);
        
        // Different colors for different powerup types
        switch (type) {
            case 'speedUp':
                graphic.fill(0x00FF00);
                break;
            case 'speedDown':
                graphic.fill(0xFF0000);
                break;
            case 'paddleSize':
                graphic.fill(0x0000FF);
                break;
            case 'ballSize':
                graphic.fill(0xFFFF00);
                break;
            default:
                graphic.fill(0xFFFFFF);
        }
        
        // Create components
        const renderComponent = new RenderComponent(graphic);
        const physicsComponent = new PhysicsComponent(0, 0, 30, 30);
        physicsComponent.x = x;
        physicsComponent.y = y;
        
        const powerupComponent = new PowerupComponent(
            type, 
            GAME_CONSTANTS.POWERUP_DURATION
        );
        
        // Add components to entity
        this.addComponent(renderComponent);
        this.addComponent(physicsComponent);
        this.addComponent(powerupComponent);
    }
}