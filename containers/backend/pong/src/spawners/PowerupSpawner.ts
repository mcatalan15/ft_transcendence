/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSpawner.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:44:42 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";
import { Powerup } from "../powerups/TestPowerup";
import { RenderComponent } from "../components/RenderComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";

export class PowerupSpawner {
    static spawnPowerup(game: PongGame, width: number, height: number): void {
        const uniqueId = `powerup-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const powerup = new Powerup(uniqueId, 'foreground', game, width / 2, height / 2, {});

        game.addEntity(powerup);

        const render = powerup.getComponent('render') as RenderComponent;
        const physics = powerup.getComponent('physics') as PhysicsComponent;
        
        render.graphic.x = physics.x;
        render.graphic.y = physics.y;

        game.renderLayers.foreground.addChild(render.graphic);
    }
}
