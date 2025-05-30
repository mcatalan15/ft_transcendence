/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Subtitle.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/29 11:39:09 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/30 10:03:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js"
import { Menu } from "./Menu"
import { Entity } from "../engine/Entity"
import { RenderComponent } from "../components/RenderComponent"
import { PhysicsComponent } from "../components/PhysicsComponent"
import { AnimationComponent } from "../components/AnimationComponent"
import { GAME_COLORS, PhysicsData, AnimationOptions } from "../utils/Types"

interface SubtitleLine {
	text: string;
	fontSize: number;
	fontWeight: 'bold' | 'light' | 'normal';
	offsetY?: number; // Optional offset from calculated position
}

interface SubtitleConfig {
	lines: SubtitleLine[];
	baseX?: number; // Base X position (default: calculated from screen)
	baseY?: number; // Base Y position (default: calculated from screen)
	spacing?: number; // Spacing between lines (default: 30)
	marginFromEdge?: number; // Margin from screen edge (default: 430)
}

export class Subtitle extends Entity {
	menu: Menu;
	width: number;
	height: number;
	private config: SubtitleConfig;
	
	constructor(id: string, layer: string, menu: Menu, config?: Partial<SubtitleConfig>) {
		super(id, layer);

		this.menu = menu;
		this.width = menu.width;
		this.height = menu.height;

		this.config = {
			lines: [
				{
					text: "AN ECHO FROM A DISTANT PAST",
					fontSize: 20,
					fontWeight: 'bold'
				},
				{
					text: "eva + hugo + marc + nico x ft_transcendence", 
					fontSize: 10,
					fontWeight: 'bold'
				},
				{
					text: "MCMLXXII - MMXXV",
					fontSize: 10,
					fontWeight: 'bold',
					offsetY: 25
				},
				{
					text: "42bcn",
					fontSize: 8,
					fontWeight: 'bold',
					offsetY: 45
				}
			],
			spacing: 30,
			marginFromEdge: 430,
			...config
		};

		this.createSubtitleLines();
	}

	private createSubtitleLines(): void {
		const baseX = this.config.baseX ?? (this.menu.app.screen.width - this.config.marginFromEdge!);
		const baseY = this.config.baseY ?? (this.menu.app.screen.height / 1.5 + 0);

		this.config.lines.forEach((lineConfig, index) => {
			const yPosition = this.calculateYPosition(baseY, index, lineConfig.offsetY);
			const textElement = this.createTextLine(
				lineConfig.text,
				lineConfig.fontSize,
				lineConfig.fontWeight,
				baseX,
				yPosition
			);
			
			const renderComponent = new RenderComponent(textElement);
			this.addComponent(renderComponent, `line${index + 1}`);
		});
	}

	private calculateYPosition(baseY: number, index: number, offsetY?: number): number {
		if (offsetY !== undefined) {
			return baseY + offsetY;
		}
		return baseY + (index * this.config.spacing!) - 30;
	}

	private createTextLine(text: string, size: number, weight: 'bold' | 'light' | 'normal' | any, x: number, y: number): Text {
		const subtitle = new Text({
			text: text,
			style: {
				fill: GAME_COLORS.white,
				fontSize: size,
				fontFamily: 'monospace',
				fontWeight: weight,
				align: 'center',
			}
		});
		
		subtitle.anchor.set(0.5);
		subtitle.x = x;
		subtitle.y = y;
		
		return subtitle;
	}

	public updateLineText(lineIndex: number, newText: string): void {
		const component = this.getComponent(`line${lineIndex + 1}`) as RenderComponent;
		if (component && component.graphic instanceof Text) {
			component.graphic.text = newText;
		}
	}

	public addLine(lineConfig: SubtitleLine, position?: number): void {
		const insertIndex = position ?? this.config.lines.length;
		this.config.lines.splice(insertIndex, 0, lineConfig);
		this.recreateLines();
	}

	public removeLine(index: number): void {
		if (index >= 0 && index < this.config.lines.length) {
			this.removeComponent(`line${index + 1}`);

			this.config.lines.splice(index, 1);

			this.recreateLines();
		}
	}

	private recreateLines(): void {
		this.config.lines.forEach((_, index) => {
			this.removeComponent(`line${index + 1}`);
		});

		this.createSubtitleLines();
	}
}