/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleBehaviorComponent.js                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/14 10:02:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/14 16:22:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class ParticleBehaviorComponent {
	constructor (options = {}) {
		this.type = 'particleBehavior';
		this.rotate = options.rotate || false;
		this.shrink = options.shrink || false;
		this.rotationSpeed = 0.1
	}
}