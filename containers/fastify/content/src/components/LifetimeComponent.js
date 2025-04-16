/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LifetimeComponent.js                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/14 10:01:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/16 15:50:57 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class LifetimeComponent {
	constructor(lifetime, despawn){
		this.type = 'lifetime';
		this.initial = lifetime;
		this.remaining = lifetime;
		this.despawn = despawn;
	}
}