/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Powerup.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/20 12:09:36 by marvin            #+#    #+#             */
/*   Updated: 2025/04/20 12:09:36 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';
import { VFXComponent } from '../components/VFXComponent.js';
import { LifetimeComponent } from '../components/LifetimeComponent.js';
import { PowerupComponent } from '../components/PowerupComponent.js';

export class TestPowerup extends Entity {
    constructor (id, layer, game, x, y, options = {}) {
        super(id, layer);

        const {
            lifetime = 300,
            despawn = 'time',
            effect = 'enlargePadle',
        } = options;
        
        this.effect = effect;
        this.lifetime = lifetime;

        const powerupGraphic = this.createPowerupGraphic();
        const renderComponent = new RenderComponent(powerupGraphic);
        this.addComponent(renderComponent);

        const physicsData = this.initPowerupPhysicsData(x, y);
        const physicsComponent = new PhysicsComponent(physicsData);
        this.addComponent(physicsComponent);

        const lifetimeComp = new LifetimeComponent(lifetime, 'time');
        this.addComponent(lifetimeComp);

        const powerupComp = new PowerupComponent(game);
        this.addComponent(powerupComp);
        }

    createPowerupGraphic() {
        const powerupGraphic = new PIXI.Graphics();
        powerupGraphic.rect(0, 0, 30 , 300);
        powerupGraphic.fill('#FAF3E0');
        powerupGraphic.pivot.set(15, 150);
        return (powerupGraphic);
    }

    initPowerupPhysicsData(x, y) {
        const data = {
			x: x,
			y: y,
			width: 30,
			height: 300,
			velocityX: 0,
			velocityY: 0,
			isStatic: true,
			behaviour: 'trigger',
			restitution: 1.0,
			mass: 0,
			speed: 0,
		}

		return (data);
    }
}