/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:55:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/07 15:33:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point, TextStyle } from 'pixi.js'

import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter, GlowFilter, GlitchFilter } from 'pixi-filters'

import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle'

export interface DepthLineBehavior {
    movement?: 'vertical' | 'horizontal' | string;
    direction?: 'upwards' | 'downwards' | 'left' | 'right' | string;
    fade?: 'in' | 'out' | 'none' | string;
    
	// Pyramid specific properties
    pyramidBaseHeight?: number;
    pyramidBaseWidth?: number;
    pyramidPeakHeight?: number;
    pyramidPeakOffset?: number;
}

export type FrameData = {
	deltaTime: number;
};

type PhysicsBehaviour = 'bounce' | 'block' | 'trigger' | 'none';

export type PhysicsData = {
	x: number;
	y: number;
	width: number;
	height: number;
	velocityX: number;
	velocityY: number;
	isStatic: boolean;
	behaviour: PhysicsBehaviour;
	restitution: number;
	mass: number;
	speed: number;
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
	entitiesMap?: Map<string, Entity>;
	points?: Point[];
	x?: number;
	y?: number;
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
	powerupGlitch?: GlitchFilter | null,
}

export interface GameSounds {
	pong: Howl;
	powerup: Howl;
	powerdown: Howl;
	ballchange: Howl;
	death: Howl;
	paddleReset: Howl;
}

export interface World {
	theme: string;
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

export interface DepthLineOptions {
    initialized?: boolean;
    initialY?: number;
    velocityX?: number;
    velocityY?: number;
    width?: number;
    height?: number;
    upperLimit?: number;
    lowerLimit?: number;
    alpha?: number;
    alphaDecay?: number;
    alphaIncrease?: number;
    lifetime?: number;
    type?: string;
    despawn?: string;
    behavior?: DepthLineBehavior;
}

export interface PyramidDepthLineOptions extends DepthLineOptions {
    // These properties are for backward compatibility - better to use behavior properties
    baseHeight?: number;
    peakHeight?: number;
    peakOffset?: number;
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