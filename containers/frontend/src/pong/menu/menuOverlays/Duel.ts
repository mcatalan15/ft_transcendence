/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Duel.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 15:13:31 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/04 16:33:32 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

export class Duel extends Entity {
	menu: Menu;
	duelGraphic: Graphics = new Graphics();
	roundGraphic: Graphics = new Graphics();
	avatarFrames: Graphics = new Graphics();
	upperRoundLegend: Text[] = [];
	lowerRoundLegend: Text[] = [];
	dashedLines: Text[] = [];
	vsText: Text = new Text();
	nameTags: Text[] = [];
	statsTexts: Text[] = [];

	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.createDuelGraphic();

		this.createAvatarFrames();
		const avatarFramesComponent = new RenderComponent(this.avatarFrames);
		this.addComponent(avatarFramesComponent, 'avatarFrames');

		this.vsText = this.createVSText();
		const vsTextComponent = new TextComponent(this.vsText);
		this.addComponent(vsTextComponent, 'vsText');

		this.nameTags = this.createNameTags();
		for (let i = 0; i < this.nameTags.length; i++) {
			const nameTagComponent = new TextComponent(this.nameTags[i]);
			this.addComponent(nameTagComponent, `nameTag${i}`);
		}

		this.statsTexts = this.createStatsTexts();
		for (let i = 0; i < this.statsTexts.length; i++) {
			const statsTextComponent = new TextComponent(this.statsTexts[i]);
			this.addComponent(statsTextComponent, `statsText${i}`);
		}

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

	createStatsTexts(): Text[] {
		const statsTexts: Text[] = [];

		statsTexts.push({
			text: "TOURNAMENTS   GOALSSCORED   GOALSCONCEDED   \nWINS   LOSSES   DRAWS   W-LRATIO     RANK   ", 
			x: 340,
			y: 600,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 8,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: "           000           000             000\n    000      000     000        0.000    000", 
			x: 340,
			y: 600,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.5},
				fontSize: 8,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: "TOURNAMENTS   GOALSSCORED   GOALSCONCEDED   \nWINS   LOSSES   DRAWS   W-LRATIO     RANK   ", 
			x: 785,
			y: 600,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 8,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);
		
		statsTexts.push({
			text: this.menu.config.variant === "1vAI" ? "           ???           ???             ???\n    ???      ???     ???        ?????    ???" : "           000           000             000\n    000      000     000        0.000    000" , 
			x: 785,
			y: 600,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.5},
				fontSize: 8,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		return (statsTexts);
	}

	createNameTags(): Text[] {
		const nameTags: Text[] = [];
	
		let leftName = "UNKNOWN";
		let rightName = "UNKNOWN";
	
		if (this.menu.config.variant === '1vAI') {
			leftName = "PLAYER";
			rightName = "AI-BOT";
		} else {
			leftName = "PLAYER 1";
			rightName = "PLAYER 2";
		}
	
		nameTags.push({
			text: leftName, 
			x: 340,
			y: 570,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 30,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);
	
		nameTags.push({
			text: rightName, 
			x: 785,
			y: 570,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 30,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);
	
		return nameTags;
	}

	createVSText(): Text {
		const vsText = {
			text: "vs", 
			x: 560,
			y: 360,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 50,
				fontWeight: 'lighter' as const,
				align: 'left' as const,
				fontFamily: 'anatol-mn',
			},
		} as Text;
		return vsText;
	}

	createAvatarFrames(){
		this.avatarFrames.rect(155, 185, 360, 360);
		this.avatarFrames.rect(605, 185, 360, 360);
		this.avatarFrames.stroke({
			color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
			width: 2,
			alpha: 1,
		});
	}

	createUpperRoundLegend(): Text[] {
		const legend: Text[] = [];

		legend.push({
			text: "⩔⩔⩔\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
				fontSize: 18,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
				letterSpacing: 435.5,
			},
		} as Text);

		legend[0].anchor = { x: 0.5, y: 0.5 };
		legend[0].x = 561;
		legend[0].y = 160;

		legend.push({
			text: "プレイヤー情報                                            プレイヤー情報                       \n",
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

		legend[1].x = 645;
		legend[1].y = 155;

		return (legend);
	}

	createLowerRoundLegend(): Text[] {
		const legend: Text[] = [];
		
		legend.push({
			text: "⩔⩔⩔\n" ,
			x: 0,
			y: 0,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
				fontSize: 18,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: 'monospace',
				letterSpacing: 435.5,
			},
		} as Text);
	
		legend[0].anchor = { x: 0.5, y: 0.5 };
		legend[0].x = 561;
		legend[0].y = 635;
		legend[0].rotation = Math.PI;
	
		legend.push({
			text: "プレイヤー情報                                            プレイヤー情報                       \n",
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
	
		legend[1].x = 645;
		legend[1].y = 655;
	
		return (legend);
	}

	createDashedLines(): Text[] {
		const dashedLines: Text[] = [];
		
		for (let i = 0; i < 3; i++) {
			dashedLines.push({
				text: i === 1 ? "----------------      -----------------------" : "----------------------------------------------", 
				x: 114 + (i * 448),
				y: 397,
				style: {
					fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
					fontSize: 14,
					fontWeight: 'bold' as const,
					align: 'left' as const,
					fontFamily: 'monospace',
					lineHeight: 372,
				},
			} as Text);
			dashedLines[i].rotation = 1.5708;
		}

		return (dashedLines);
	}

	createDuelGraphic() {
		const hOffset = 30;
		const baseX = 144;
		const baseY = 160;
		const bottomY = 615;
		const groupWidth = 16;
		const groupHeight = 20;
		const numGroups = 2;
		const linesPerGroup = 28;
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

	redrawDuel(): void {
		this.duelGraphic.clear();
	
		this.roundGraphic.clear();
		this.createDuelGraphic();
	
		this.avatarFrames.clear();
		this.createAvatarFrames();
	
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
		
		const newVsText = this.createVSText();
		const vsTextComponent = new TextComponent(newVsText);
		this.replaceComponent('text', vsTextComponent, 'vsText');

		const newNameTags = this.createNameTags();
		for (let i = 0; i < this.nameTags.length; i++) {
			const nameTagComponent = new TextComponent(newNameTags[i]);
			this.replaceComponent('text', nameTagComponent, `nameTag${i}`);
		}

		const newStatsTexts = this.createStatsTexts();
		for (let i = 0; i < this.statsTexts.length; i++) {
			const statsTextComponent = new TextComponent(newStatsTexts[i]);
			this.replaceComponent('text', statsTextComponent, `statsText${i}`);
		}
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