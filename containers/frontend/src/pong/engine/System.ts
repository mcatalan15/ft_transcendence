/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   System.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 13:36:37 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 12:38:58 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from './Entity';

import { FrameData } from '../utils/Types'

export interface System {
	update(entities: Entity[], delta?: FrameData): void;
	cleanup?(): void;
}