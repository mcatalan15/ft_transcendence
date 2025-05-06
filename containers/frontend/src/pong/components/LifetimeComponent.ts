/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LifetimeComponent.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:43:23 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 12:50:31 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class LifetimeComponent {
	type: string;
	initial: number;
	remaining: number;
	despawn: string;

	constructor(lifetime: number, despawn: string) {
		this.type = 'lifetime';
		this.initial = lifetime;
		this.remaining = lifetime;
		this.despawn = despawn;
	}
}