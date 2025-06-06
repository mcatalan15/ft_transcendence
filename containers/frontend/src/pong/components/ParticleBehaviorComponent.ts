/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleBehaviorComponent.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:43:38 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/23 09:40:17 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

interface ParticleBehaviorOptions {
	rotate?: boolean;
	shrink?: boolean;
	rotationSpeed?: number;
}

export class ParticleBehaviorComponent {
	type: string;
	rotate: boolean;
	shrink: boolean;
	rotationSpeed: number;

	constructor(options: ParticleBehaviorOptions = {}) {
		this.type = 'particleBehavior';
		this.rotate = options.rotate ?? false;
		this.shrink = options.shrink ?? false;
		this.rotationSpeed = 0.1;
	}
}