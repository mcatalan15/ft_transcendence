/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Wall.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 14:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:11:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";
import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { Graphics } from "pixi.js";

export class Wall extends Entity {
    constructor(id: string, layer:string, width: number, height: number, thickness: number, offset: number) {
        super(id, layer);

        const wallGraphic = this.createWallGraphic(width, thickness);
        
        const renderComponent = new RenderComponent(wallGraphic);
        this.addComponent(renderComponent);

        const physicsData = this.initWallPhysicsData(width, thickness, height, offset);
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

    initWallPhysicsData(width: number, thickness: number, height: number, offset: number) {
        const data = {
            x: 0,
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