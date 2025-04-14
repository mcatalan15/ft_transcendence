/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Background.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/11 17:13:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/14 18:06:14 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { VFXComponent } from '../components/VFXComponent.js';

export class Background extends Entity {
	constructor(id, width, height, topWallOffset, bottomWallOffset) {
		super(id);

		const lines = this.createLines(width, height, topWallOffset, bottomWallOffset, 15);
		//const rectangles = this.createRectangles(width, height, 15);
		const renderComponent = new RenderComponent(lines)
		this.addComponent(renderComponent);

		const vfxComponent = new VFXComponent();
		this.addComponent(vfxComponent);
	}

	createRectangles(width, height, offset){
		const backgroundContainer = new PIXI.Container();

		const totalRectangles = 8;
		const startAlpha = 0.7;
		const endAlpha = 0.1;

		for (let i = 0; i < totalRectangles; i++) {
			const rectangle = new PIXI.Graphics();

			const alpha = startAlpha - (i * (startAlpha - endAlpha) / (totalRectangles - 1));

			rectangle.rect(0, 0, width - (i * offset), height - (i * offset));
			rectangle.fill({ color:0xFFFFFF, alpha: alpha });
			rectangle.pivot.set(0, 0, width / 2, height / 2);
			backgroundContainer.addChild(rectangle);
		}
	}

	createLines(width, height, topWallOffset, bottomWallOffset, spacing) {
        const backgroundContainer = new PIXI.Container();
		
		const totalLines = 8;
		const startAlpha = 0.7;
		const endAlpha = 0.1;

        // Top lines
		for (let i = 0; i < totalLines; i++) {
            const line = new PIXI.Graphics();
            
			const alpha = startAlpha - (i * (startAlpha - endAlpha) / (totalLines - 1));

            line.rect(0, topWallOffset + (i * spacing) + 30, width, 0.5);
			line.fill({ color: 0xFFFFFF, alpha: alpha });
			line.pivot.set(0, 0, width / 2, 0.5);
			
            backgroundContainer.addChild(line);
        }

		// Bottom lines
		for (let i = 0; i < totalLines; i++) {
            const line = new PIXI.Graphics();
            
			const alpha = startAlpha - (i * (startAlpha - endAlpha) / (totalLines - 1));

            line.rect(0, height - (bottomWallOffset) - (i * spacing) - 15, width, 0.5);
			line.fill({ color: 0xFFFFFF, alpha: alpha });
			line.pivot.set(0, 0, width / 2, 0.5);
			
            backgroundContainer.addChild(line);
        }

        return backgroundContainer;
    }
	
}