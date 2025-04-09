/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Borders.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:33:34 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/09 10:00:03 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';

export class Borders {
    constructor(width, height, offset = 50) {
        this.entities = [];
        const wallThickness = 10;

        // Top wall
        const topGraphic = new PIXI.Graphics();
        topGraphic.rect(0, 0, width, wallThickness);
        topGraphic.fill('white');

        const top = new Entity("top-wall");
        top.addComponent(new RenderComponent(topGraphic));
        top.addComponent(new PhysicsComponent({
            x: 0,
            y: offset,
            width: width,
            height: wallThickness,
            static: true,
            bounce: true,
        }));

        this.entities.push(top);

        // Bottom wall
        const bottomGraphic = new PIXI.Graphics();
        bottomGraphic.rect(0, 0, width, wallThickness);
        bottomGraphic.fill('white');

        const bottom = new Entity("bottom-wall");
        bottom.addComponent(new RenderComponent(bottomGraphic));
        bottom.addComponent(new PhysicsComponent({
            x: 0,
            y: height - wallThickness - offset,
            width: width,
            height: wallThickness,
            static: true,
            bounce: true,
        }));

        this.entities.push(bottom);
    }

    getEntities() {
        return this.entities;
    }
}