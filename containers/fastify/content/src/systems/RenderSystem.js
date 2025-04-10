/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.js                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 17:23:49 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/09 17:56:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class RenderSystem {
	constructor(app) {
		this.app = app;
	}

	update(entities, delta){
		entities.forEach(entity => {
			const renderComponent = entity.getComponent('render');
			const physicsComponent = entity.getComponent('physics');

			if (renderComponent && physicsComponent) {
				renderComponent.graphic.x = physicsComponent.x;
				renderComponent.graphic.y = physicsComponent.y;

				//console.log(`x:${renderComponent.graphic.x} y:${renderComponent.graphic.y}`);
				/*if (entity.id === 'ball') {
					renderComponent.graphic.rotation = physicsComponent.rotation;
				}*/
			}			
		})
	}
}