/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentEndDisplay.ts                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 12:23:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/19 13:12:29 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { HeaderBar } from "./HeaderBar";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";


export class TournamentEndDisplay extends Entity {
	menu: Menu;
	header: HeaderBar;
	vsText: Text[] = [];
	nameText: Text | null = null;
	avatarFrame: Graphics = new Graphics();
	statsTexts: Text[] = [];
	plainStats: string[] = [];
	
	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.getPlainStats();

		this.header = new HeaderBar(this.menu, 'tournamentEndHeader', 'overlays', 'tournament winner', 1098, 180, 554, 20);
		const headerBar = this.header.getComponent('render') as RenderComponent;
		this.addComponent(headerBar, 'barRender');
		const headerText = this.header.getComponent('text') as RenderComponent;
		this.addComponent(headerText, 'barText');

		this.createAvatarFrame();
		const avatarFrameComponent = new RenderComponent(this.avatarFrame);
		this.addComponent(avatarFrameComponent, 'avatarFrame');

		this.vsText = this.createVsTexts();
		for (let i = 0; i < this.vsText.length; i++) {
			const vsTextComponent = new TextComponent(this.vsText[i]);
			this.addComponent(vsTextComponent, `vsText${i}`);
		}

		this.nameText = this.createNameText();
		const nameComponent = new TextComponent(this.nameText);
		this.addComponent(nameComponent, 'nameText');

		this.statsTexts = this.createStatsTexts();
		for (let i = 0; i < this.statsTexts.length; i++) {
			const statsTextComponent = new TextComponent(this.statsTexts[i]);
			this.addComponent(statsTextComponent, `statsText${i}`);
		}
	}

	getPlainStats(winnerData?: any){
		this.plainStats = [];
		
		const data = winnerData || this.menu.winnerData;
	
		const tournamentsStat = data?.tournaments || 0;
		this.plainStats.push(this.formatStat(tournamentsStat, 'number'));
	
		const goalsScoredStat = data?.goalsScored || 0;
		this.plainStats.push(this.formatStat(goalsScoredStat, 'number'));
	
		const goalsConcededStat = data?.goalsConceded || 0;
		this.plainStats.push(this.formatStat(goalsConcededStat, 'number'));
	
		const winsStat = data?.wins || 0;
		this.plainStats.push(this.formatStat(winsStat, 'number'));
	
		const lossesStat = data?.losses || 0;
		this.plainStats.push(this.formatStat(lossesStat, 'number'));
	
		const drawsStat = data?.draws || 0;
		this.plainStats.push(this.formatStat(drawsStat, 'number'));
	
		const winLossRatioStat = this.calculateWinLossRatio(data);
		this.plainStats.push(this.formatStat(winLossRatioStat, 'ratio'));
	
		const rankStat = data?.rank || 0;
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
	
	calculateWinLossRatio(winnerData?: any): number {
		const data = winnerData || this.menu.winnerData;
		const wins = data?.wins || 0;
		const losses = data?.losses || 0;
	
		if (losses === 0) {
			return wins > 0 ? 100 : 0.00;
		}
	
		return parseFloat((wins / losses).toFixed(2));
	}

	createAvatarFrame(): void {
		const color = this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange;
		const centerX = (this.menu.width / 2) + 198 + (350 / 2);
		const frameSize = 350;
		const frameX = centerX - frameSize / 2;
		const frameY = 220;

		this.avatarFrame.rect(frameX, frameY, frameSize, frameSize);
		this.avatarFrame.stroke({ color: color, width: 2.5, alpha: 1 });
	}

	createNameText(): Text {
		const centerX = (this.menu.width / 2) + 198 + (350 / 2);

		return {
			text: this.menu.winnerData?.name?.toUpperCase() || 'UNKNOWN',
			x: centerX,
			y: 600,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1 },
				fontSize: 36,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text;
	}

	createStatsTexts(): Text[] {
		const statsTexts :Text[] = [];
		
		const centerX = (this.menu.width / 2) + 198 + (350 / 2);
		
		statsTexts.push({
			text: this.getStatsTextInLanguage(),
			x: centerX,
			y: 630, 
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1 },
				fontSize: 8,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: this.getStatsValuesInLanguage(this.menu.winnerData!.goalsScored !== undefined ? true: false),
			x: centerX,
			y: 630, 
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 0.3 },
				fontSize: 8,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		return (statsTexts);
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
	}

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

	createVsTexts(): Text[] {
        const vsTexts: Text[] = [];
        
        vsTexts.push({
            text: "--------------------------------------------", 
            x: 1470,
            y: 430,
            style: {
                fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 0.3},
                fontSize: 14,
                fontWeight: 'bold' as const,
                align: 'left' as const,
                fontFamily: 'monospace',
                letterSpacing: 1.2,
            },
        } as Text);

        vsTexts[0].rotation = 1.5708;

		vsTexts.push({
			text: "★", 
			x: 1565,
			y: 300,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1},
				fontSize: 190,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: 'anatol-mn',
			},
		} as Text);

		vsTexts.push({
			text: "+1", 
			x: 1560,
			y: 380,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1},
				fontSize: 26,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: 'monospace',
			},
		} as Text);

		vsTexts.push({
			text: this.getTranslatedText("tournament victories"), 
			x: 1570,
			y: 405,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1},
				fontSize: 13,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: 'monospace',
			},
		} as Text);

		vsTexts.push({
			text: "۞", 
			x: 1560,
			y: 480,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1},
				fontSize: 100,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: 'anatol-mn',
			},
		} as Text);

		vsTexts.push({
			text: this.getTranslatedText("ELO upgrade") ,
			x: 1560,
			y: 535,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1},
				fontSize: 13,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: 'monospace',
			},
		} as Text);

		vsTexts.push({
			text: "♕", 
			x: 1560,
			y: 585,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1},
				fontSize: 85,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: 'monospace',
			},
		} as Text);

		vsTexts.push({
			text: "♔  ♔", 
			x: 1560,
			y: 600,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1},
				fontSize: 45,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: 'monospace',
			},
		} as Text);

		vsTexts.push({
			text: this.getTranslatedText("history made"), 
			x: 1560,
			y: 630,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1},
				fontSize: 13,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: 'monospace',
			},
		} as Text);

        return vsTexts;
    }

	redrawDisplay(): void {
		this.header.redrawBar(this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange);
		
		this.avatarFrame.clear();
		this.createAvatarFrame();

		const newVsTexts = this.createVsTexts();
		for (let i = 0; i < this.vsText.length; i++) {
			const vsTextComponent = new TextComponent(newVsTexts[i]);
			this.replaceComponent(`text`, vsTextComponent, `vsText${i}`);
		}

		if (this.nameText) {
			this.nameText.text = this.menu.winnerData!.name.toUpperCase();
			this.nameText.style.fill = { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 1 };
			const nameComponent = new TextComponent(this.nameText);
			this.replaceComponent('text', nameComponent, 'nameText');
		}

		const newStatsTexts = this.createStatsTexts();
		for (let i = 0; i < this.statsTexts.length; i++) {
			const statsTextComponent = new TextComponent(newStatsTexts[i]);
			this.replaceComponent(`text`, statsTextComponent, `statsText${i}`);
		}
	}

	getTranslatedText(key: string): string {
		switch (this.menu.language) {
			case ('es'): {
				switch (key) {
					case ('tournament victories'): {
						return 'victorias de torneo';
					}
					case ('ELO upgrade'): {
						return 'mejora de ELO';
					}
					default: {
						return 'historia escrita';
					}
				}
				
			}
			case ('fr'): {
				switch (key) {
					case ('tournament victories'): {
						return 'victoires de tournoi';
					}
					case ('ELO upgrade'): {
						return 'amélioration ELO';
					}
					default: {
						return 'histoire écrite';
					}
				}
			}
			case ('cat'): {
				switch (key) {
					case ('tournament victories'): {
						return 'victòries de torneig';
					}
					case ('ELO upgrade'): {
						return 'millora d\'ELO';
					}
					default: {
						return 'història escrita';
					}
				}
			}
			default: {
				return key;
			}
		}
	}
}