/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSpawnjer.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/20 12:34:48 by marvin            #+#    #+#             */
/*   Updated: 2025/04/20 12:34:48 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { TestPowerup } from "../powerups/TestPowerup.js";

export class PowerupSpawner {
    static spawnPowerup(game, width, height) {
        const uniqueId = `powerup-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const powerup = new TestPowerup(uniqueId, 'foreground', width / 2, height / 2, {});

        game.addEntity(powerup);

        const render = powerup.getComponent('render');
	    const physics = powerup.getComponent('physics');
        
        render.graphic.x = physics.x;
	    render.graphic.y = physics.y;

        game.renderLayers.foreground.addChild(powerup.getComponent('render').graphic);
    }
}