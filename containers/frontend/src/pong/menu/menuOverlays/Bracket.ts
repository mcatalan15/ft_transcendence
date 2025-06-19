/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Bracket.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 15:13:31 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/19 18:26:42 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

export class Bracket extends Entity {
	menu: Menu;

	constructor(menu: Menu, id: string, layer: string, playerAmount: number) {
		super(id, layer);
		
		this.menu = menu;

		const bracketGraphic = this.createBracketGraphic(playerAmount);
		bracketGraphic.y += 50;
		const renderComponent = new RenderComponent(bracketGraphic);
		this.addComponent(renderComponent);

		const bracketNames = this.createBracketNames(playerAmount);
		for (let i = 0; i < bracketNames.length; i++) {
			const nameComponent = new TextComponent(bracketNames[i]);
			this.addComponent(nameComponent);
		}

		const vsText = this.createVSText();
		const vsTextComponent = new TextComponent(vsText);
		this.addComponent(vsTextComponent);
		
		/* const readyTags = this.createReadyTags(playerAmount);
		for (let i = 0; i < readyTags.length; i++) {
			const tag = new TextComponent(readyTags[i]);
			this.addComponent(tag);
		} */
	}

	createBracketGraphic(playerAmount: number): Graphics {
		const bracketGraphic = new Graphics();
		bracketGraphic.moveTo(800, 500);
		bracketGraphic.lineTo(900, 500);
		bracketGraphic.lineTo(900, 575);
		bracketGraphic.lineTo(800, 575);
		bracketGraphic.moveTo(900, 537.5);
		bracketGraphic.lineTo(1000, 537.5);
		bracketGraphic.lineTo(1000, 690);
		bracketGraphic.lineTo(900, 690);
		bracketGraphic.moveTo(800, 650);
		bracketGraphic.lineTo(900, 650);
		bracketGraphic.lineTo(900, 725);
		bracketGraphic.lineTo(800, 725);
		bracketGraphic.moveTo(1000, 613.75);
		bracketGraphic.lineTo(1100, 613.75);

		bracketGraphic.moveTo(1185, 613.75);
		bracketGraphic.lineTo(1285, 613.75);
		bracketGraphic.moveTo(1385, 537.5);
		bracketGraphic.lineTo(1285, 537.5);
		bracketGraphic.lineTo(1285, 690);
		bracketGraphic.lineTo(1385, 690);
		bracketGraphic.moveTo(1485, 500);
		bracketGraphic.lineTo(1385, 500);
		bracketGraphic.lineTo(1385, 575);
		bracketGraphic.lineTo(1485, 575);
		bracketGraphic.moveTo(1485, 650);
		bracketGraphic.lineTo(1385, 650);
		bracketGraphic.lineTo(1385, 725);
		bracketGraphic.lineTo(1485, 725);
		bracketGraphic.stroke({ color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 2 });
		bracketGraphic.pivot.set(250, 250);
		return bracketGraphic;
	}

	createBracketNames(playerAmount: number): Text[] {
		let names: Text[] = [];

		for (let i = 0; i < playerAmount; i++) {
			names.push({
				text: `PLAYER ${i + 1}`,
				x: this.getNamePosition(i).x,
				y: this.getNamePosition(i).y,
				style: {
					fill: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
					fontSize: 15,
					fontWeight: 'bold' as const,
				},
			} as Text);
		};
		
		return (names);
	}

	createVSText() {
		return {
			text: "VS",
			x: this.menu.width / 2 - 5,
			y: this.menu.height/ 2 + 40,
			style: {
				fill: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
				fontSize: 75,
				fontWeight: 'lighter' as const,
				fontFamily: 'anatol-mn',
			},
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	createReadyTags(playerAmount: number): Text[] {
		let names: Text[] = [];

		for (let i = 0; i < playerAmount; i++) {
			names.push({
				text: `ready`,
				x: this.getNamePosition(i).x,
				y: this.getNamePosition(i).y,
				style: {
					fill: { color:GAME_COLORS.white, alpha: 0.75 },
					fontSize: 15,
					fontWeight: 'bold' as const,
				},
			} as Text);
		};
		
		return (names);
	}

	getNamePosition(index: number): { x: number, y: number } {
		switch (index) {
			case (0): {
				return {
					x: 475,
					y: 300,
				};
			}

			case (1): {
				return {
					x: 475,
					y: 375,
				};
			}

			case (2): {
				return {
					x: 475,
					y: 450,
				};
			}

			case (3): {
				return {
					x: 475,
					y: 525,
				};
			}

			case (4): {
				return {
					x: 1300,
					y: 300,
				};
			}

			case (5): {
				return {
					x: 1300,
					y: 375,
				};
			}

			case (6): {
				return {
					x: 1300,
					y: 450,
				};
			}

			case (7): {
				return {
					x: 1300,
					y: 525,
				};
			}
		}
		
		return ({x: 100, y: 100});
	}
}