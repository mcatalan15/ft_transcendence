/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentNextMatchDisplay.ts                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 12:23:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/07 19:14:28 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { HeaderBar } from "./HeaderBar";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";


export class TournamentNextMatchDisplay extends Entity {
	menu: Menu;
	header: HeaderBar;
	vsText: Text[] = [];
	avatarFrames: Graphics = new Graphics();
	statsContainer: Graphics = new Graphics();
	statsTexts: Text[] = [];
	plainStats: string[] = [];
	
	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.getPlainStats()

		this.header = new HeaderBar(this.menu, 'nextMatchHeader', 'overlays', 'next match', 1098, 180, 554, 20);
		const headerBar = this.header.getComponent('render') as RenderComponent;
		this.addComponent(headerBar, 'barRender');
		const headerText = this.header.getComponent('text') as RenderComponent;
		this.addComponent(headerText, 'barText');

		this.createAvatarFrames();
		const avatarFramesComponent = new RenderComponent(this.avatarFrames);
		this.addComponent(avatarFramesComponent, 'avatarFrames');

		this.vsText = this.createVsTexts();
		for (let i = 0; i < this.vsText.length; i++) {
			const vsTextComponent = new TextComponent(this.vsText[i]);
			this.addComponent(vsTextComponent, `vsText${i}`);
		}

		this.statsTexts = this.createStatsTexts();
		for (let i = 0; i < this.statsTexts.length; i++) {
			const statsTextComponent = new TextComponent(this.statsTexts[i]);
			this.addComponent(statsTextComponent, `statsText${i}`);
		}
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
			x: 1225.5,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 6,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: this.getStatsValuesInLanguage(true), 
			x: 1225.5,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.5},
				fontSize: 6,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: this.getStatsTextInLanguage(), 
			x: 1523,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 6,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);
		
		statsTexts.push({
			text: this.getStatsValuesInLanguage(true), 
			x: 1523,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.5},
				fontSize: 6,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		return (statsTexts);
	}

	createStatsContainer(): Graphics{
		const container = new Graphics();
		
		container.moveTo(1140, 485.5);
		container.lineTo(1100, 485.5);
		container.lineTo(1100, 510);
		container.moveTo(1100, 520);
		container.lineTo(1100, 544.5);
		container.lineTo(1350, 544.5);
		container.lineTo(1350, 520);
		container.moveTo(1350, 510);
		container.lineTo(1350, 485.5);
		container.lineTo(1310, 485.5);
		container.stroke( {color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 2, alpha: 1} );
		return (container);
	}

	createAvatarFrames() {
		const color = this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue;

		this.avatarFrames.rect(1100, 215, 250, 250);
		this.avatarFrames.stroke( {color: color, width: 2.5, alpha: 1} )

		this.avatarFrames.rect(1400, 215, 250, 250);
		this.avatarFrames.stroke( {color: color, width: 2.5, alpha: 1} )

	}

	createVsTexts(): Text[] {
        const vsTexts: Text[] = [];
        
        vsTexts.push({
            text: "-----------    ------------------", 
            x: 1375,
            y: 370,
            style: {
                fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
                fontSize: 14,
                fontWeight: 'bold' as const,
                align: 'left' as const,
                fontFamily: 'monospace',
                letterSpacing: 1.2,
            },
        } as Text);

        vsTexts[0].rotation = 1.5708;

		vsTexts.push({
			text: "vs", 
			x: 1375,
			y: 335,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 26,
				fontWeight: 'lighter' as const,
				align: 'left' as const,
				fontFamily: 'anatol-mn',
			},
		} as Text);

		vsTexts.push({
			text: this.menu.playerData!.name.toUpperCase() || "PLAYER 1", 
			x: 1225,
			y: 487.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 30,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		vsTexts.push({
			text: this.menu.playerData!.name.toUpperCase() || "PLAYER 2", 
			x: 1525,
			y: 490,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 30,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

        return vsTexts;
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

	redrawDisplay(): void {
		this.header.redrawBar(this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue);

		const newVsTexts = this.createVsTexts();
		for (let i = 0; i < this.vsText.length; i++) {
			const vsTextComponent = new TextComponent(newVsTexts[i]);
			this.replaceComponent(`text`, vsTextComponent, `vsText${i}`);
		}

		const newStatsTexts = this.createStatsTexts();
		for (let i = 0; i < this.statsTexts.length; i++) {
			const statsTextComponent = new TextComponent(newStatsTexts[i]);
			this.replaceComponent(`text`, statsTextComponent, `statsText${i}`);
		}
		
		this.avatarFrames.clear();
		this.createAvatarFrames();
	}
}