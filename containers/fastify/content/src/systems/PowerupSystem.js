/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSystem.js                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:34:21 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:42:49 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PowerupSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.powerups = [];
        this.spawnTimer = 0;
        this.spawnInterval = 10000; // 10 seconds
        this.activeEffects = [];
    }
    
    update(entities, delta) {
        // Update spawn timer
        this.spawnTimer += delta;
        
        // Spawn new powerup if it's time
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnPowerup();
            this.spawnTimer = 0;
        }
        
        // Update active powerups
        this.updatePowerups(entities, delta);
        
        // Update active effects
        this.updateEffects(entities, delta);
    }
    
    spawnPowerup() {
        // Will create a new powerup entity at a random position
        console.log("Powerup spawned (placeholder)");
    }
    
    updatePowerups(entities, delta) {
        // Check for collisions between ball and powerups
        // Apply effects when collected
    }
    
    updateEffects(entities, delta) {
        // Update duration of active effects
        // Remove effects that have expired
    }
}