/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Bracket.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 15:13:31 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/25 18:01:32 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { NameCell } from "./NameCell";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

export class Bracket extends Entity {
	menu: Menu;
	playerAmount: number = 8;
	nameCells: NameCell[] = [];
	bracketGraphic: Graphics = new Graphics();
	roundGraphic: Graphics = new Graphics();
	upperRoundLegend: Text[] = [];
	lowerRoundLegend: Text[] = [];
	dashedLines: Text[] = [];
	crown: any;

	private readonly CELL_WIDTH = 150;
	private readonly CELL_HEIGHT = 30;
	private readonly TIER_SPACING = 224;
	private readonly LINE_LENGTH = 30;
	private readonly LINE_GAP = 5;
	private readonly BASE_X = 142.5;
	private readonly HORIZONTAL_LINE_EXTENSION = 1.5;

	constructor(menu: Menu, id: string, layer: string, playerAmount: number) {
		super(id, layer);
		
		this.menu = menu;
		this.playerAmount = playerAmount;

		this.createBracketStructure();
		this.addNameCellComponents();
		this.createBracketGraphic();
		this.createRoundGraphic();
		this.createCrownElement();

		this.dashedLines = this.createDashedLines();
		this.dashedLines.forEach(element => {
			const dashedLinesComponent = new TextComponent(element);
			this.addComponent(dashedLinesComponent, `dashedLines${this.dashedLines.indexOf(element)}`);
		});

		this.upperRoundLegend = this.createUpperRoundLegend();
		const upperRoundLegendComponent = new TextComponent(this.upperRoundLegend[0]);
		this.addComponent(upperRoundLegendComponent, 'upperRoundLegend');
		const upperRoundLegendTextComponent = new TextComponent(this.upperRoundLegend[1]);
		this.addComponent(upperRoundLegendTextComponent, 'upperRoundLegendText');
		
		this.lowerRoundLegend = this.createLowerRoundLegend();
		const lowerRoundLegendComponent = new TextComponent(this.lowerRoundLegend[0]);
		this.addComponent(lowerRoundLegendComponent, 'lowerRoundLegend');
		const lowerRoundLegendTextComponent = new TextComponent(this.lowerRoundLegend[1]);
		this.addComponent(lowerRoundLegendTextComponent, 'lowerRoundLegendText');
	}

	createUpperRoundLegend(): Text[] {
		const legend: Text[] = [];

		legend.push({
			text: "⩔⩔⩔⩔⩔\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
				fontSize: 18,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
				letterSpacing: 212,
			},
		} as Text);

		legend[0].anchor = { x: 0.5, y: 0.5 };
		legend[0].x = 552;
		legend[0].y = 155;

		legend.push({
			text: "第一回戦                     第二回戦                     第三回戦                      終わり\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
				fontSize: 12,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
			},
		} as Text);

		legend[1].x = 550;
		legend[1].y = 155;

		return (legend);
	}

	createLowerRoundLegend(): Text[] {
		const legend: Text[] = [];
		
		legend.push({
			text: "⩔⩔⩔⩔⩔\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
				fontSize: 18,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
				letterSpacing: 212,
			},
		} as Text);
	
		legend[0].anchor = { x: 0.5, y: 0.5 };
		legend[0].x = 552;
		legend[0].y = 635;
		legend[0].rotation = Math.PI;
	
		legend.push({
			text: "第一回戦                     第二回戦                     第三回戦                      終わり\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
				fontSize: 12,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
			},
		} as Text);
	
		legend[1].x = 550;
		legend[1].y = 655;
	
		return (legend);
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
			const lineEndX = lineStartX + this.LINE_LENGTH + this.HORIZONTAL_LINE_EXTENSION; // Use the constant
			
			this.bracketGraphic.moveTo(lineStartX, lineY);
			this.bracketGraphic.lineTo(lineEndX, lineY);
			
			horizontalLines.push({ x: lineEndX - this.HORIZONTAL_LINE_EXTENSION, y: lineY }); // Use the constant here too
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

	createDashedLines(): Text[] {
		const dashedLines: Text[] = [];
		
		for (let i = 0; i < 5; i++) {
			dashedLines.push({
				text: "----------------------------------------------", 
				x: 105.2 + (i * 224),
				y: 397,
				style: {
					fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
					fontSize: 14,
					fontWeight: 'bold' as const,
					align: 'left' as const,
					fontFamily: 'monospace',
					lineHeight: 252,
				},
			} as Text);
			dashedLines[i].rotation = 1.5708;
		}

		return (dashedLines);
	}

	createRoundGraphic() {
		const hOffset = 30;
		const baseX = 135;
		const baseY = 160;
		const bottomY = 615;
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
	private createCrownElement() {
		this.crown = this.createCrown();
		const crownTextComponent = new TextComponent(this.crown);
		this.addComponent(crownTextComponent, 'crown');
	}

	createCrown() {
		return {
			text: "♛",
			x: this.menu.width / 2 - 10,
			y: this.menu.height / 2 - 50,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 0.3 },
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

		const updatedCrown = this.createCrown();
		const crownComponent = new TextComponent(updatedCrown);
		this.replaceComponent('text', crownComponent, 'crown');

		this.nameCells.forEach(element => {
			element.redrawCell(); 
		 });

		this.roundGraphic.clear();
		this.createRoundGraphic();

		const newDashedLines = this.createDashedLines();
		for (let i = 0; i < this.dashedLines.length; i++) {
			const dashedLinesComponent = new TextComponent(newDashedLines[i]);
			this.replaceComponent('text', dashedLinesComponent, `dashedLines${i}`);
		};

		const newUpperRoundLegend = this.createUpperRoundLegend();
		const upperRoundLegendComponent = new TextComponent(newUpperRoundLegend[0]);
		this.replaceComponent('text', upperRoundLegendComponent, 'upperRoundLegend');
		const upperRoundLegendTextComponent = new TextComponent(newUpperRoundLegend[1]);
		this.replaceComponent('text', upperRoundLegendTextComponent, 'upperRoundLegendText');

		const newLowerRoundLegend = this.createLowerRoundLegend();
		const lowerRoundLegendComponent = new TextComponent(newLowerRoundLegend[0]);
		this.replaceComponent('text', lowerRoundLegendComponent, 'lowerRoundLegend');
		const lowerRoundLegendTextComponent = new TextComponent(newLowerRoundLegend[1]);
		this.replaceComponent('text', lowerRoundLegendTextComponent, 'lowerRoundLegendText');
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