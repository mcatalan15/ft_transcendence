/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   NameCell.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/23 16:07:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/25 11:30:53 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

export class NameCell extends Entity {
	menu: Menu;
	nameString: string;
	cellName: {};
	color!: number;
	x: number;
	y: number;
	width: number;
	height: number;
	cell: Graphics = new Graphics();

	constructor(id: string, layer: string, menu: Menu, name: string, x: number, y: number, width: number, height: number) {
		super(id, layer);

		this.menu = menu;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.nameString = name;

		this.createCell();
		const renderComponent = new RenderComponent(this.cell);
		this.addComponent(renderComponent);

		this.cellName = this.createName(name, x, y);
		const nameComponent = new TextComponent(this.cellName);
		this.addComponent(nameComponent, 'cellName');
	}

	private createCell() {
		this.cell.rect(this.x, this.y, this.width, this.height);
		this.cell.stroke({
			color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
			width: 3,
		});
	}

	createName(name: string, x: number = this.x, y: number = this.y){
		return {
			text: name,
			x: x + this.width / 2,
			y: y + this.height / 2,
			style: {
				fill: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
				fontSize: 15,
				fontWeight: 'bolder' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
				letterSpacing: 0.5,
			},
			rotation: 0,
		}
	}

	redrawCell() {
		this.cell.clear();
		this.createCell();

		const updatedName = this.createName(this.nameString, this.x, this.y);
		const updatedComponent = new TextComponent(updatedName);
		this.replaceComponent('text', updatedComponent, 'nameCell');
	}
}