/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TextComponent.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:55:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 12:23:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Text, TextStyle } from 'pixi.js';

import type { Component } from '../engine/Component';

import { GAME_COLORS } from '../utils/Types.js';

export class TextComponent implements Component {
	type = 'text';
	text: string;
	instanceId?: string;
	
	private textObject: Text;
	private tag: string;

	constructor({
		tag = '',
		text = '',
		x = 0,
		y = 0,
		style = {},
		anchor = { x: 0.5, y: 0.5 },
		rotation = 0,
	}: {
		tag?: string;
		text?: string;
		x?: number;
		y?: number;
		style?: Partial<TextStyle>;
		anchor?: { x: number; y: number };
		rotation?: number;
	}) {
		this.tag = tag;
		this.text = text;

		const defaultStyle: Partial<TextStyle> = {
			fontFamily: '"Roboto Mono", monospace',
			fontSize: 10,
			fill: GAME_COLORS.white,
			align: 'center',
			fontWeight: 'lighter',
			letterSpacing: 1,
		};

		const textStyle = new TextStyle({
			...defaultStyle,
			...style,
		});
		
		this.textObject = new Text({text, style: textStyle});
		this.textObject.anchor.set(anchor.x, anchor.y);
		this.textObject.x = Math.round(x);
		this.textObject.y = Math.round(y);
		this.textObject.rotation = rotation;

		if (rotation === Math.PI / 2 || rotation === -Math.PI / 2) {
			this.textObject.anchor.set(0.5, 0);
		}
	}

	setText(newText: string): void {
		this.textObject.text = newText;
	}

	setRotation(rotation: number): void {
		this.textObject.rotation = rotation;
	}

	updatePosition(x: number, y: number): void {
		this.textObject.x = Math.round(x);
		this.textObject.y = Math.round(y);
	}

	getRenderable(): Text {
		return this.textObject;
	}

	getTag(): string {
		return this.tag;
	}

	getText(): string {
		return this.textObject.text;
	}
}