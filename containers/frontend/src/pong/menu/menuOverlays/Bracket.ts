/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Bracket.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 15:13:31 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/23 18:29:52 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { NameCell } from "./NameCell";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

interface BracketTier {
	cells: NameCell[];
	startX: number;
	spacing: number;
}

export class Bracket extends Entity {
	menu: Menu;
	playerAmount: number = 8;
	nameCells: NameCell[] = [];
	bracketGraphic: Graphics = new Graphics();
	roundGraphic: Graphics = new Graphics();
	statsCell: Graphics = new Graphics();
	bracketNames: Text[] = [];
	dashedLines: Text[] = [];
	crown: any;

	private readonly CELL_WIDTH = 150;
	private readonly CELL_HEIGHT = 30;
	private readonly TIER_SPACING = 224;
	private readonly LINE_LENGTH = 30;
	private readonly LINE_GAP = 5;
	private readonly BASE_X = 142.5;

	constructor(menu: Menu, id: string, layer: string, playerAmount: number) {
		super(id, layer);
		
		this.menu = menu;
		this.playerAmount = playerAmount;

		this.createBracketStructure();
		this.addNameCellComponents();
		this.createBracketGraphic();
		this.createRoundGraphic();
		this.createStatsCell();
		this.createDashedLines();
		this.createCrownElement();
	}

	private createBracketStructure() {
		const bracketCenterY = this.menu.height / 2 + 10;

		this.createTierCells(8, this.BASE_X, bracketCenterY, 55);

		this.createTierCells(4, this.BASE_X + this.TIER_SPACING, bracketCenterY, 110);

		this.createTierCells(2, this.BASE_X + (this.TIER_SPACING * 2), bracketCenterY, 220);

		this.createTierCells(1, this.BASE_X + (this.TIER_SPACING * 3), bracketCenterY, 0);
	}

	private createTierCells(playerCount: number, baseX: number, centerY: number, verticalSpacing: number) {
		const totalHeight = (playerCount - 1) * verticalSpacing;
		const startY = centerY - (totalHeight / 2);
		
		for (let i = 0; i < playerCount; i++) {
			const x = baseX;
			const y = startY + (i * verticalSpacing);
			
			this.nameCells.push(new NameCell(
				`nameCell_${this.nameCells.length}`,
				'bracket',
				this.menu,
				this.getRandomName(this.nameCells.length + 1),
				x,
				y,
				this.CELL_WIDTH,
				this.CELL_HEIGHT
			));
		}
	}

	private addNameCellComponents() {
		for (let i = 0; i < this.nameCells.length; i++) {
			const nameCellComponent = this.nameCells[i].getComponent('render') as RenderComponent;
			const textCellComponent = this.nameCells[i].getComponent('text') as TextComponent;
			this.addComponent(nameCellComponent, `nameCell_${i}`);
			this.addComponent(textCellComponent, `nameCellText_${i}`);
		}
	}

	private createBracketGraphic() {
		this.bracketGraphic.clear();

		const tiers = [
			{ startIndex: 0, count: 8, nextTierIndex: 8 },
			{ startIndex: 8, count: 4, nextTierIndex: 12 },
			{ startIndex: 12, count: 2, nextTierIndex: 14 }
		];

		tiers.forEach(tier => this.drawTierConnections(tier));
		
		this.bracketGraphic.stroke({ 
			color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, 
			width: 3 
		});

		const renderComponent = new RenderComponent(this.bracketGraphic);
		this.addComponent(renderComponent);
	}

	private drawTierConnections(tier: { startIndex: number, count: number, nextTierIndex: number }) {
		const horizontalLines: { x: number, y: number }[] = [];

		for (let i = 0; i < tier.count && (tier.startIndex + i) < this.nameCells.length; i++) {
			const cellIndex = tier.startIndex + i;
			const nameCell = this.nameCells[cellIndex];
			const lineY = nameCell.y + (this.CELL_HEIGHT / 2);
			const lineStartX = nameCell.x + nameCell.width + this.LINE_GAP;
			const lineEndX = lineStartX + this.LINE_LENGTH;
			
			this.bracketGraphic.moveTo(lineStartX, lineY);
			this.bracketGraphic.lineTo(lineEndX, lineY);
			
			horizontalLines.push({ x: lineEndX, y: lineY });
		}

		for (let i = 0; i < horizontalLines.length - 1; i += 2) {
			const line1 = horizontalLines[i];
			const line2 = horizontalLines[i + 1];

			this.bracketGraphic.moveTo(line1.x, line1.y);
			this.bracketGraphic.lineTo(line1.x, line2.y);
			
			const nextTierCellIndex = tier.nextTierIndex + Math.floor(i / 2);
			
			if (nextTierCellIndex < this.nameCells.length) {
				const nextCell = this.nameCells[nextTierCellIndex];
				const nextCellCenterY = nextCell.y + (this.CELL_HEIGHT / 2);
				const connectionStartX = line1.x;
				const connectionEndX = nextCell.x - this.LINE_GAP;

				this.bracketGraphic.moveTo(connectionStartX, nextCellCenterY);
				this.bracketGraphic.lineTo(connectionEndX, nextCellCenterY);
			}
		}
	}

	createDashedLines() {
		for (let i = 0; i < 5; i++) {
			this.dashedLines.push({
				text: "------------------------------------------------", 
				x: 104.5 + (i * 224),
				y: 400,
				style: {
					fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
					fontSize: 14,
					fontWeight: 'bold' as const,
					align: 'left' as const,
					fontFamily: 'monospace',
					lineHeight: 250,
				},
			} as Text);
			this.dashedLines[i].rotation = 1.5708;
		}
		
		for (let i = 0; i < this.dashedLines.length; i++) {
			const dashedLinesComponent = new TextComponent(this.dashedLines[i]);
			this.addComponent(dashedLinesComponent, `dashedLines${i}`);
		}
	}

	createRoundGraphic() {
		const hOffset = 30;
		const baseX = 135;
		const baseY = 150;
		const bottomY = 625;
		const groupWidth = 16;
		const groupHeight = 20;
		const numGroups = 4;
		const linesPerGroup = 14;
		const lineLength = 10;

		// Top section
		for (let group = 0; group < numGroups + 1; group++) {
			const groupX = baseX + group * (linesPerGroup * groupWidth);

			this.roundGraphic.moveTo(groupX - hOffset, baseY);
			this.roundGraphic.lineTo(groupX - hOffset, baseY + groupHeight);
			this.roundGraphic.stroke({
				color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
				width: 3,
				alpha: 0.5,
			});

			if (group === numGroups) break;
			
			for (let line = 0; line < linesPerGroup; line++) {
				if (line === 0) continue;
				const lineX = groupX + line * groupWidth;
				this.roundGraphic.moveTo(lineX - hOffset, baseY);
				this.roundGraphic.lineTo(lineX - hOffset, baseY + lineLength);
			}

			this.roundGraphic.stroke({
				color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
				width: 1.5,
				alpha: 0.5,
			});
		}

		// Bottom section
		for (let group = 0; group < numGroups + 1; group++) {
			const groupX = baseX + group * (linesPerGroup * groupWidth);
		
			this.roundGraphic.moveTo(groupX - hOffset, bottomY);
			this.roundGraphic.lineTo(groupX - hOffset, bottomY + groupHeight);
			this.roundGraphic.stroke({
				color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
				width: 3,
				alpha: 0.5,
			});
		
			if (group === numGroups) break;
			
			for (let line = 0; line < linesPerGroup; line++) {
				if (line === 0) continue;
				const lineX = groupX + line * groupWidth;
				this.roundGraphic.moveTo(lineX - hOffset, bottomY + lineLength);
				this.roundGraphic.lineTo(lineX - hOffset, bottomY + (2 * lineLength));
			}
		
			this.roundGraphic.stroke({
				color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
				width: 1.5,
				alpha: 0.5,
			});
		}

		const roundComponent = new RenderComponent(this.roundGraphic);
		this.addComponent(roundComponent, 'roundGraphic');
	}

	createStatsCell() {
		this.statsCell.rect(1090, 170, 570, 405);
		this.statsCell.stroke({ color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 3 });
		
		const statsCellComponent = new RenderComponent(this.statsCell);
		this.addComponent(statsCellComponent, 'statsCell');
	}

	private createCrownElement() {
		this.crown = this.createCrown();
		const crownTextComponent = new TextComponent(this.crown);
		this.addComponent(crownTextComponent, 'crown');
	}

	createCrown() {
		return {
			text: "♔",
			x: this.menu.width / 2 - 10,
			y: this.menu.height / 2 - 50,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 0.5 },
				fontSize: 75,
				fontWeight: 'lighter' as const,
				fontFamily: 'anatol-mn',
			},
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	redrawBracket(): void {
		this.bracketGraphic.clear();
		this.createBracketStructure();
		this.createBracketGraphic();

		for (let i = 0; i < this.playerAmount; i++) {
			this.removeComponent('text', `bracketName_${i}`);
		}

		const updatedCrown = this.createCrown();
		const crownComponent = new TextComponent(updatedCrown);
		this.replaceComponent('text', crownComponent, 'crown');
	}

	getRandomName(index: number): string {
		const names = [
			"HMUNOZ_G",
			"MCATALAN", 
			"VIMAZURO",
			"GPICO-CO",
			"ARCEBRIA",
			"NPONCHON",
			"EFERRE-M",
			"HARRISON",
			"ISABELLA",
			"JENNIFER",
			"KATHERIN",
			"LEONARDO",
			"MARGARET",
			"NICHOLAS",
			"PATRICIA",
			"QUENTIN_",
			"REBECCA_",
			"SAMUEL__",
			"THEODORE",
			"VICTORIA"
		];
		
		const nameIndex = Math.floor(index) % names.length;
		return names[nameIndex];
	}
}