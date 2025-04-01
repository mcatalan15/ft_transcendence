/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AudioSystem.js                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:33:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:33:57 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class AudioSystem {
    constructor() {
        this.sounds = {
            paddleHit: null,
            wallHit: null,
            score: null
        };
        
        // Initialize sounds
        this.loadSounds();
    }
    
    loadSounds() {
        // Load sound assets here (will implement when needed)
        console.log("Audio system initialized (sounds will be loaded later)");
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
    
    update(entities, delta) {
        // Listen for collision events and play sounds
        // Will be implemented with the event system
    }
}