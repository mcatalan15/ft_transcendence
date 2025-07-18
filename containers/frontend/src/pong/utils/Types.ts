/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Types.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:55:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/16 14:15:58 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Container, Point, TextStyle } from 'pixi.js'

import { AdvancedBloomFilter, CRTFilter, BulgePinchFilter, RGBSplitFilter, GlowFilter, GlitchFilter, ShockwaveFilter } from 'pixi-filters'

import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle'
import { CrossCut } from '../entities/crossCuts/CrossCut';
import { MenuButton } from '../menu/menuButtons/MenuButton';
import { BigInputButton } from '../menu/menuButtons/BigInputButton';

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
	side?: 'left' | 'right';
	target?: Paddle | World | CrossCut | MenuButton | BigInputButton | Container | null;
	affectationTime?: number;
	entitiesMap?: Map<string, Entity>;
	points?: Point[];
	x?: number;
	y?: number;
	buttonName?: string;
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
	crtOverlay?: CRTFilter | null;
	depthLineCRTFilter?: CRTFilter | null;
    bulgePinch?: BulgePinchFilter | null;
	rgbSpilt?: RGBSplitFilter | null;
    powerupGlow?: GlowFilter | null;
	powerupCRT?: CRTFilter | null,
	powerdownGlitch?: GlitchFilter | null,
}

export interface GameSounds {
	bgm: Howl;
	pong: Howl;
	thud: Howl;
	shoot: Howl;
	hit: Howl;
	shieldBreak: Howl;
	powerup: Howl;
	powerdown: Howl;
	ballchange: Howl;
	death: Howl;
	paddleResetUp: Howl;
	paddleResetDown: Howl;
	[key: string]: Howl;
}

export interface MenuSounds {
	menuBGM: Howl;
	menuMove: Howl;
	menuSelect: Howl;
	menuConfirm: Howl;
	ballClick: Howl;
}

export interface World {
	tag: string;
	name: string;
	color: number;
}

export const GAME_COLORS = {
	white: 0xfff8e3,
	black: 0x171717,
	particleGray: 0x888888,
	orange: 0xfbbf24,
	red: 0xea3d37,
	brown: 0xcf7f45,
	rose: 0xd35461,
	turquoise: 0x25849a,
	violet: 0x835a83,
	violetParticle: 0xD946EF,
	green: 0x2ea17c,
	greenParticle: 0x5EEAD4,
	marine: 0x204c93,
	menuBlue: 0x009fd6,
	menuGreen: 0x73ae16,
	menuOrange: 0xef6210,
	menuPink: 0xfd3480,
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
	initialX?: number;
    backdropInitialX?: number;
    backdropInitialY?: number;
    textInitialX?: number;
    textInitialY?: number;
	ballInitialX?: number;
	ballInitialY?: number;
    blockInitialX?: number;
    blockInitialY?: number;
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