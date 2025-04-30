/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Wall.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:58:17 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:37 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";
import { Entity } from "../engine/Entity";
import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';

export class Wall extends Entity {
    constructor(id: string, layer:string, width: number, thickness: number, offset: number) {
        super(id, layer);

        const wallGraphic = this.createWallGraphic(width, thickness);
        
        const renderComponent = new RenderComponent(wallGraphic);
        this.addComponent(renderComponent);

        const physicsData = this.initWallPhysicsData(width, thickness, offset);
        const physicsComponent = new PhysicsComponent(physicsData);
        this.addComponent(physicsComponent);
    }

    createWallGraphic(width: number, thickness: number): Graphics {
        const wallGraphic = new Graphics();
        wallGraphic.rect(0, 0, width, thickness);
        wallGraphic.fill('#FFFBEB');
        wallGraphic.pivot.set(width / 2, thickness / 2);
        return wallGraphic;
    }

    initWallPhysicsData(width: number, thickness: number, offset: number) {
        const data = {
            x: width / 2,
            y: offset,
            width: width,
            height: thickness,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'block' as const,
            restitution: 1.0,
            mass: 100,
        };
        
        return data;
    }
}