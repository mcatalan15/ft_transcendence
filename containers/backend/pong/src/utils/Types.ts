/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:55:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 18:44:49 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { TextStyle } from 'pixi.js'
import { Paddle } from '../entities/Paddle'
import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter } from 'pixi-filters'

export interface DepthLineBehavior {
	movement: 'vertical';
	direction: 'upwards' | 'downwards';
	fade: 'in' | 'out' | 'none';
}

export type FrameData = {
	deltaTime: number;
};

export type TextData = {
	tag?: string;
	text?: string;
	x?: number;
	y?: number;
	style?: Partial<TextStyle>;
	anchor?: { x: number; y: number };
	rotation?: number;
};

export type GameEvent = {
    type: string;
    side?: 'left' | 'right'; // For example, for the SCORE event
	target?: Paddle;
    // Add any other fields you expect in an event here
};

export type BoundingBox = {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export interface PostProcessingOptions {
    advancedBloom?: AdvancedBloomFilter | null;
	crtFilter?: CRTFilter | null;
    bulgePinch?: BulgePinchFilter | null;
	rgbSpilt?: RGBSplitFilter | null;
    
}

export interface GameSounds {
	pong: Howl;
	powerup: Howl;
	death: Howl;
	paddleReset: Howl;
}