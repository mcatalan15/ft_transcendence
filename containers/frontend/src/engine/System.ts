/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   System.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 13:36:37 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 09:51:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { Entity } from './Entity';

export interface System {
	update(entities: Entity[], delta?: number): void;
}