/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Border.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:33:34 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:33:34 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';

export class Border extends Entity {
    constructor(id, width, height) {
        super(id);
        
        // Create graphics
        const graphic = new PIXI.Graphics();
        graphic.rect(0, 0, width, height);
        graphic.stroke({ color: "white", width: 10 });
        
        // Create component
        const renderComponent = new RenderComponent(graphic);
        
        // Add component to entity
        this.addComponent(renderComponent);
    }
}