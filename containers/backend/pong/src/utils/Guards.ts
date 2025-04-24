/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Guards.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:27:17 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 11:27:46 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle';
import { Ball } from '../entities/Ball';
import { Wall } from '../entities/Wall';

export function isPaddle(entity: Entity): entity is Paddle {
	return entity instanceof Paddle;
}

export function isBall(entity: Entity): entity is Ball {
	return entity instanceof Ball;
}

export function isWall(entity: Entity): entity is Wall {
	return entity instanceof Wall;
}