/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Duel.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 15:13:31 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/15 20:51:51 by hmunoz-g         ###   ########.fr       */
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
	plainStats: string[] = [];

	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.getPlainStats()

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

	getPlainStats(){
		this.plainStats = [];
		
		const tournamentsStat = this.menu.playerData?.tournaments || 0;
		this.plainStats.push(this.formatStat(tournamentsStat, 'number'));
	
		const goalsScoredStat = this.menu.playerData?.goalsScored || 0;
		this.plainStats.push(this.formatStat(goalsScoredStat, 'number'));
	
		const goalsConcededStat = this.menu.playerData?.goalsConceded || 0;
		this.plainStats.push(this.formatStat(goalsConcededStat, 'number'));
	
		const winsStat = this.menu.playerData?.wins || 0;
		this.plainStats.push(this.formatStat(winsStat, 'number'));
	
		const lossesStat = this.menu.playerData?.losses || 0;
		this.plainStats.push(this.formatStat(lossesStat, 'number'));
	
		const drawsStat = this.menu.playerData?.draws || 0;
		this.plainStats.push(this.formatStat(drawsStat, 'number'));
	
		const winLossRatioStat = this.calculateWinLossRatio();
		this.plainStats.push(this.formatStat(winLossRatioStat, 'ratio'));
	
		const rankStat = this.menu.playerData?.rank || 0;
		this.plainStats.push(this.formatStat(rankStat, 'rank'));
	
		console.log('Formatted stats:', this.plainStats);
	}

	formatStat(stat: number | string, type: 'number' | 'ratio' | 'rank' = 'number'): string {
		if (stat === undefined || stat === null) {
			return "???";
		}
		
		switch (type) {
			case 'ratio':
				if (typeof stat === 'number') {
					if (stat < 10) {
						const formatted = stat.toFixed(2);
						const [integerPart, decimalPart] = formatted.split('.');
						const paddedInteger = integerPart.padStart(2, '0');
						return `${paddedInteger}.${decimalPart}`;
					} else if (stat < 100) {
						return stat.toFixed(2);
					} else {
						return stat.toFixed(1);
					}
				}
				return stat.toString();
				
			case 'rank':
				if (typeof stat === 'number') {
					const formatted = stat.toFixed(1);
					const [integerPart, decimalPart] = formatted.split('.');
					const paddedInteger = integerPart.padStart(3, '0');
					return `${paddedInteger}.${decimalPart}`;
				}
				return stat.toString();
				
			case 'number':
			default:
				if (typeof stat === 'number') {
					return stat.toString().padStart(3, '0');
				}
				return stat.toString().padStart(3, '0');
		}
	}
	
	calculateWinLossRatio(): number {
		const wins = this.menu.playerData?.wins || 0;
		const losses = this.menu.playerData?.losses || 0;
	
		if (losses === 0) {
			return wins > 0 ? 100 : 0.00;
		}
	
		return parseFloat((wins / losses).toFixed(2));
	}

	createStatsTexts(): Text[] {
		const statsTexts: Text[] = [];

		statsTexts.push({
			text: this.getStatsTextInLanguage(),
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
			text: this.getStatsValuesInLanguage(true), 
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
			text: this.getStatsTextInLanguage(), 
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
			text: this.getStatsValuesInLanguage(false),
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
	
		let leftName =  this.menu.playerData!.name.toUpperCase() || "PLAYER 1"
		let rightName = '';

		/* switch (this.menu.language) {
			case ('en'): {
				rightName = "GUEST";
				break;
			}

			case ('es'): {
				rightName = "INVITADE";
				break;
			}

			case ('fr'): {
				rightName = "INVITÉ";
				break;
			}

			case ('cat'): {
				rightName = "CONVIDAT";
				break;
			}
		} */
	
		if (this.menu.config.variant === '1vAI') {
			rightName = "AI-BOT";
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

	getStatsTextInLanguage(): string {
		switch (this.menu.language) {
			case ('es'): {
				return ("TORNEOS   GOLESMARCADOS   GOLESCONCEDIDOS   \nVICTORIAS   DERROTAS   EMPATES   RATIOVD     ELO     ");
			}

			case ('fr'): {
				return "TOURNOIS   BUTSMARQUÉS   BUTSENCAISSÉS   \nVICTOIRES   DÉFAITES   MATCHSNULS   RATIOVD     ELO     ";
			}

			case ('cat'): {
				return "TORNEIGS   GOLSMARCATS   GOLSENCAIXATS   \nVICTÒRIES   DERROTES   EMPATS   RÀTIOVD     ELO     ";
			}

			default: {
				return "TOURNAMENTS   GOALSSCORED   GOALSCONCEDED   \nWINS   LOSSES   DRAWS   WLRATIO     ELO     ";
			}
		}
	};

	getStatsValuesInLanguage(known: boolean): string {
		if (known) {
			switch (this.menu.language) {
				case ('es'): {
					return (`       ${this.plainStats[0]}             ${this.plainStats[1]}               ${this.plainStats[2]}\n         ${this.plainStats[3]}        ${this.plainStats[4]}       ${this.plainStats[5]}       ${this.plainStats[6]}   ${this.plainStats[7]}`);
				}

				case ('fr'): {
					return (`        ${this.plainStats[0]}           ${this.plainStats[1]}             ${this.plainStats[2]}\n         ${this.plainStats[3]}        ${this.plainStats[4]}          ${this.plainStats[5]}       ${this.plainStats[6]}   ${this.plainStats[7]}`);
				}

				case ('cat'): {
					return (`        ${this.plainStats[0]}           ${this.plainStats[1]}             ${this.plainStats[2]}\n         ${this.plainStats[3]}        ${this.plainStats[4]}      ${this.plainStats[5]}       ${this.plainStats[6]}   ${this.plainStats[7]}`);
				}
				
				default: {
					return (`           ${this.plainStats[0]}           ${this.plainStats[1]}             ${this.plainStats[2]}\n    ${this.plainStats[3]}      ${this.plainStats[4]}     ${this.plainStats[5]}       ${this.plainStats[6]}   ${this.plainStats[7]}`);
				}
			}
		} else {
			switch (this.menu.language) {
				case ('es'): {
					return "       ???             ???               ???\n         ???        ???       ???       ?????   ?????";
				}

				case ('fr'): {
					return "        ???           ???             ???\n         ???        ???          ???       ?????   ?????";
				}

				case ('cat'): {
					return "        ???           ???             ???\n         ???        ???      ???       ?????   ?????";
				}

				default: {
					return "           ???           ???             ???\n    ???      ???     ???       ??????  ?????";
				}
			}
		}
	}	

	public updateOpponentData(opponentData: any): void {
		this.menu.opponentData = opponentData;
		
		// Update only the right player info without full redraw
		this.updateRightPlayerInfo();
		
		// Only update the right player name tag
		this.updateRightPlayerNameTag();
	}

	private updateRightPlayerInfo(): void {
		if (this.menu.opponentData?.name) {
			// Update stats for opponent
			this.getOpponentStats();
			
			// Update right stats text (index 3)
			const newStatsText = this.createStatsTexts();
			const rightStatsComponent = new TextComponent(newStatsText[3]);
			this.replaceComponent('text', rightStatsComponent, 'statsText3');
		}
	}

	private updateRightPlayerNameTag(): void {
		if (this.menu.opponentData?.name) {
			const rightNameTag = this.createNameTags()[1]; // Get the right name tag
			const nameTagComponent = new TextComponent(rightNameTag);
			this.replaceComponent('text', nameTagComponent, 'nameTag1');
		}
	}

	// Add method to get opponent stats
	private getOpponentStats(): void {
		if (!this.menu.opponentData) return;
		
		// Store original player stats
		const originalPlayerStats = [...this.plainStats];
		
		// Temporarily switch to opponent data for formatting
		const tempPlayerData = this.menu.playerData;
		this.menu.playerData = this.menu.opponentData;
		
		this.getPlainStats();
		
		// Store opponent stats
		const opponentStats = [...this.plainStats];
		
		// Restore original player data and stats
		this.menu.playerData = tempPlayerData;
		this.plainStats = originalPlayerStats;
		
		/* this.opponentStats = opponentStats; */
	}
}