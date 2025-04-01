/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupComponent.js                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:35:22 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 17:47:45 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PowerupComponent {
    constructor(type, duration) {
        this.type = 'powerup';
        this.entity = null;
        this.powerupType = type; // 'speedUp', 'speedDown', etc.
        this.duration = duration;
        this.active = false;
    }
    
    activate() {
        this.active = true;
        // Effects will go here
    }
    
    deactivate() {
        this.active = false;
        // Effects will be killed here
    }
}