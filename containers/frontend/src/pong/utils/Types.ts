/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:55:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 18:54:52 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { TextStyle } from 'pixi.js'

import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter, GlowFilter } from 'pixi-filters'

import { Paddle } from '../entities/Paddle'

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
	target?: Paddle | World;
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
    powerupGlow?: GlowFilter | null;
	powerupCRT?: CRTFilter | null,
}

export interface GameSounds {
	pong: Howl;
	powerup: Howl;
	death: Howl;
	paddleReset: Howl;
}

export interface World {
	name: string;
	color: number;
}

export const WORLD_COLORS = {
	desert: 0xFBBF24,
	city: 0xF32A4D,
	abyss: 0xD946EF,
	forest: 0x65A30D,
	ice: 0x67E8F9,
	fire: 0xEA580C,
	sky: 0x38BDF8,
	void: 0x7C3AED
}

export type AnimationOptions = {
	initialized?: boolean;
    initialY?: number;
    floatAmplitude?: number;
    floatSpeed?: number;
    floatOffset?: number;
}

export type Player = {
	id: string;
	name: string;
};

export type PlayerData = {
	players: Player[];
};
