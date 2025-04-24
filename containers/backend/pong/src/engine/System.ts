/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   System.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 13:36:37 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 14:22:06 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { Entity } from './Entity';
import { FrameData } from '../utils/Types'

export interface System {
	update(entities: Entity[], delta?: FrameData): void;
}