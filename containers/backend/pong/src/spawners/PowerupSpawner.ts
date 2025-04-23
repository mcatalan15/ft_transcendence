/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSpawner.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 16:07:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:12:06 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSpawner.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/20 12:34:48 by marvin            #+#    #+#             */
/*   Updated: 2025/04/20 12:34:48 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { TestPowerup } from "../powerups/TestPowerup";

// Define interfaces for game object
interface Game {
    addEntity: (entity: any) => void;
    renderLayers: {
        background?: any;
        midground?: any;
        foreground?: any;
    };
}

// Define interface for powerup components
interface RenderComponent {
    graphic: any;
}

interface PhysicsComponent {
    x: number;
    y: number;
}

export class PowerupSpawner {
    static spawnPowerup(game: Game, width: number, height: number): void {
        const uniqueId = `powerup-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const powerup = new TestPowerup(uniqueId, 'foreground', game, width / 2, height / 2, {});

        game.addEntity(powerup);

        const render = powerup.getComponent('render') as RenderComponent;
        const physics = powerup.getComponent('physics') as PhysicsComponent;
        
        render.graphic.x = physics.x;
        render.graphic.y = physics.y;

        game.renderLayers.foreground.addChild(powerup.getComponent('render').graphic);
    }
}
