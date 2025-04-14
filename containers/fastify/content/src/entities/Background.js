/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Background.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/11 17:13:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/14 09:53:06 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';

export class Background extends Entity {
	constructor(id, width, height) {
		super(id);

		const lines = this.createLines(width, height, 90, 15);
		const renderComponent = new RenderComponent(lines)
		this.addComponent(renderComponent);
	}

	createLines(width, height, topOffset, spacing) {
        const backgroundContainer = new PIXI.Container();
		
		const totalLines = 8;
		const startAlpha = 0.7;
		const endAlpha = 0.1;

        // Top lines
		for (let i = 0; i < totalLines; i++) {
            const line = new PIXI.Graphics();
            
			const alpha = startAlpha - (i * (startAlpha - endAlpha) / (totalLines - 1));

            line.rect(0, topOffset + (i * spacing), width, 1);
			line.fill({ color: 0xFFFFFF, alpha: alpha });
			line.pivot.set(0, 0, width / 2, 0.5);
			
            backgroundContainer.addChild(line);
        }

		// Bottom lines
		for (let i = 0; i < totalLines; i++) {
            const line = new PIXI.Graphics();
            
			const alpha = startAlpha - (i * (startAlpha - endAlpha) / (totalLines - 1));

            line.rect(0, height - (topOffset) - (i * spacing), width, 1);
			line.fill({ color: 0xFFFFFF, alpha: alpha });
			line.pivot.set(0, 0, width / 2, 0.5);
			
            backgroundContainer.addChild(line);
        }

        return backgroundContainer;
    }
	
}