/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingSystem.js                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/17 12:44:38 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/17 18:08:53 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PostProcessingSystem {
	constructor() {
		this.time = 0;
	}

	update(entities, delta) {
		this.time += delta.deltaTime * 0.3;

		entities.forEach(entity => {
			if (!entity.hasComponent('postProcessing')) return;

			const postProcessing = entity.getComponent('postProcessing');
			const options = postProcessing.options;

			// Update CRTFilter time if it exists
			if (options.crtFilter) {
				options.crtFilter.time = this.time;
                options.crtFilter.seed = Math.sin(this.time) * 10000 % 1;
			}
		});
	}
}
