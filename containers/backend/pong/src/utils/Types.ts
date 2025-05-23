/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:55:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/23 18:14:44 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point, TextStyle } from 'pixi.js'

import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter, GlowFilter, GlitchFilter } from 'pixi-filters'

import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle'
import { CrossCut } from '../entities/crossCuts/CrossCut';

export interface DepthLineBehavior {
    movement?: 'vertical' | 'horizontal' | string;
    direction?: 'upwards' | 'downwards' | 'left' | 'right' | string;
    fade?: 'in' | 'out' | 'none' | string;
    
	// Pyramid specific properties
    pyramidBaseHeight?: number;
    pyramidBaseWidth?: number;
    linePekHeight?: number;
    pyramidPeakOffset?: number;

	// Ruin specicif properties
	ruinHSegments?: number;
	ruinTSegments?: number;
	maxHeight?: number;
	maxWidth?: number;
	segmentWidths?: number[];
    segmentHeights?: number[];
	hOffset?: number;
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

	// Crosscut related attributes
	isPolygonal?: boolean;
	nPolygons?: number;
	physicsPoints?: Point[][];
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
	target?: Paddle | World | CrossCut;
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
	depthLineCRTFilter?: CRTFilter | null;
    bulgePinch?: BulgePinchFilter | null;
	rgbSpilt?: RGBSplitFilter | null;
    powerupGlow?: GlowFilter | null;
	powerupCRT?: CRTFilter | null,
	powerdownGlitch?: GlitchFilter | null,
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
	tag: string;
	name: string;
	color: number;
}

export const GAME_COLORS = {
	white: 0x171717,
	black: 0xfff8e3,
	orange: 0xfbbf24,
	red: 0xea3d37,
	brown: 0xcf7f45,
	rose: 0xd35461,
	turquoise: 0x25849a,
	violet: 0x835a83,
	violetParticle: 0xD946EF,
	green: 0x2ea17c,
	greenParticle: 0x5EEAD4,
	marine: 0x204c93
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
    baseHeight?: number;
    peakHeight?: number;
    peakOffset?: number;
	flip?: number;
}

export interface RuinDepthLineOptions extends DepthLineOptions {
	ruinHSegments?: number;
	ruinTSegments?: number;
	maxHeight?: number;
	maxWidth?: number;
	segmentWidths?: number[];
    segmentHeights?: number[];
	hOffset?: number;
}

export type AnimationOptions = {
	initialized?: boolean;
    initialY?: number;
    floatAmplitude?: number;
    floatSpeed?: number;
    floatOffset?: number;
	startTime?: number;
	duration?: number;
	initialAlpha?: number;
	targetAlpha?: number;
	despawnStartTime?: number;
	despawnDuration?: number;
	initialDespawnAlpha?: number;
	targetDespawnAlpha?: number;
	easeExponent?: number;
}

export type Player = {
	id: string;
	name: string;
};

export type PlayerData = {
	players: Player[];
};

export interface ObstacleBehavior {
    animation: string;
    fade: 'in' | 'out' | 'none' | string;
}

export interface ObstacleOptions {
    initialized: boolean,
    initialY: number,
    width: number,
    height: number,
    alpha: number,
    targetAlpha: number,
    initialScale: number,
    targetScale: number,
    lifetime: number,
    type: string,
    despawn: string,
    behavior: ObstacleBehavior,
	pattern?: number
}