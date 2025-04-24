/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Utils.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:06:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 11:08:24 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';

export function createEntitiesMap(entities: Entity[]): Map<string, Entity> {
	const map = new Map<string, Entity>();
	for (const entity of entities) {
		map.set(entity.id, entity);
	}
	return map;
}