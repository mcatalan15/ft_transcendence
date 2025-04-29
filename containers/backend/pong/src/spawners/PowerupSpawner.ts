/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSpawner.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:44:42 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/29 18:43:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { EnlargePowerup } from "../entities/powerups/EnlargePowerup";
import { ShrinkPowerDown } from "../entities/powerups/ShrinkPowerDown";
import { CurveBallPowerup } from "../entities/powerups/CurveBallPowerup";

import { RenderComponent } from "../components/RenderComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";

export class PowerupSpawner {
    static spawnPowerup(game: PongGame, width: number, height: number): void {
        const uniqueId = `powerup-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Boundaries for spawning
        const extraOffset = 50;
        const topBoundary = game.topWallOffset + game.wallThickness + extraOffset;
        const bottomBoundary = height - game.bottomWallOffset - extraOffset;
        const availableHeight = bottomBoundary - topBoundary;
        
        const spawnAreaWidth = width / 2;
        
        // Random position within the spawn area
        const randomX = (width - spawnAreaWidth) / 2 + Math.random() * spawnAreaWidth;
        const randomY = topBoundary + Math.random() * availableHeight;
        
        let powerup;
        let spawnIndex = Math.floor(Math.random() * 3);

        switch (spawnIndex) {
            case (0):
                powerup = new EnlargePowerup(uniqueId, 'powerup', game, randomX, randomY);
                break;
            case (1):
                powerup = new CurveBallPowerup(uniqueId, 'ballChange', game, randomX, randomY);
                break;
            default:
                powerup = new ShrinkPowerDown(uniqueId, 'powerdown', game, randomX, randomY);
                break;
        }
    
        game.addEntity(powerup);
    
        const render = powerup.getComponent('render') as RenderComponent;
        const physics = powerup.getComponent('physics') as PhysicsComponent;
        
        render.graphic.x = physics.x;
        render.graphic.y = physics.y;
    
        //game.renderLayers.powerup.addChild(render.graphic);
        console.log(powerup.layer);
        if (powerup.layer === 'powerup') {
            game.renderLayers.powerup.addChild(render.graphic);
        } else if (powerup.layer === 'powerdown') {
            game.renderLayers.powerdown.addChild(render.graphic);
        } else if (powerup.layer === 'ballChange') {
            game.renderLayers.ballChange.addChild(render.graphic);
        }
    }
}
