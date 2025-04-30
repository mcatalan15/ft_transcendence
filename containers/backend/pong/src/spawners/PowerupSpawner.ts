/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSpawner.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:44:42 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/30 17:26:06 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { EnlargePowerup } from "../entities/powerups/EnlargePowerup";
import { ShrinkPowerDown } from "../entities/powerups/ShrinkPowerDown";
import { CurveBallPowerup } from "../entities/powerups/CurveBallPowerup";
import { MultiplyBallPowerup } from "../entities/powerups/MultiplyBallPowerup";
import { BurstBallPowerup } from "../entities/powerups/BurstBallPowerup"

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
                powerup = new EnlargePowerup(uniqueId, 'powerup', game, randomX, randomY); // Radius of the inscribed triangle
                //powerup = this.getBallChange(uniqueId, game, randomY, randomX);
                break;
            case (1):
                powerup = new ShrinkPowerDown(uniqueId, 'powerdown', game, randomX, randomY);
                //powerup = this.getBallChange(uniqueId, game, randomY, randomX);
                break;
            default:
                powerup = this.getBallChange(uniqueId, game, randomY, randomX);
                break;
        }
    
        game.addEntity(powerup);
    
        const render = powerup.getComponent('render') as RenderComponent;
        const physics = powerup.getComponent('physics') as PhysicsComponent;
        
        render.graphic.x = physics.x;
        render.graphic.y = physics.y;
    
        console.log(powerup.layer);
        if (powerup.layer === 'powerup') {
            game.renderLayers.powerup.addChild(render.graphic);
        } else if (powerup.layer === 'powerdown') {
            game.renderLayers.powerdown.addChild(render.graphic);
        } else if (powerup.layer === 'ballChange') {
            game.renderLayers.ballChange.addChild(render.graphic);
        }
    }

    static getBallChange(uniqueId: string, game: PongGame, randomX: number, randomY: number) {
        let idx = Math.floor(Math.random() * 3);

        let powerup;

        switch(idx) {
            case(0):
                powerup = new CurveBallPowerup(uniqueId, 'ballChange', game, randomY, randomX);
                break;
            case(1):
                powerup =  new MultiplyBallPowerup(uniqueId, 'ballChange', game, randomY, randomX);
                break;
            default:
                powerup = new BurstBallPowerup(uniqueId, 'ballChange', game, randomY, randomX);
                break;
        };
        return (powerup);
    }
}
