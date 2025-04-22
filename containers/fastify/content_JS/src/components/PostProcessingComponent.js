/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingComponent.js                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/17 11:12:03 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 09:19:45 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PostProcessingComponent {
	constructor(filter = null, options = {}) {
		this.type = 'postProcessing';
		this.enabled = true;
		this.time = 0;
		this.options = options;

		this.filter = filter || options.filter || null;
	}
}