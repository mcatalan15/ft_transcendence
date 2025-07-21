/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayChatDisplay.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 12:23:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:05:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { HeaderBar } from "./HeaderBar";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";


export class PlayChatDisplay extends Entity {
	menu: Menu;
	header: HeaderBar;
	chatWindowGraphic: Graphics = new Graphics();
	dashedLines: Text[] = [];
	instructionsText: Text[] = [];
	
	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.header = new HeaderBar(this.menu, 'nextMatchHeader', 'overlays', 'HOW TO PLAY', 1098, 180, 554, 20);
		const headerBar = this.header.getComponent('render') as RenderComponent;
		this.addComponent(headerBar, 'barRender');
		const headerText = this.header.getComponent('text') as RenderComponent;
		this.addComponent(headerText, 'barText');

		this.dashedLines = this.createDashedLines();
		this.dashedLines.forEach(element => {
			const dashedLinesComponent = new TextComponent(element);
			this.addComponent(dashedLinesComponent, `dashedLines${this.dashedLines.indexOf(element)}`);
		});

		this.createInstructionsWindow();
		const chatWindowComponent = new RenderComponent(this.chatWindowGraphic);
		this.addComponent(chatWindowComponent, 'chatWindow');
		
		this.instructionsText = this.createInstructionsTexts();
		for (let i = 0; i < this.instructionsText.length; i++) {
			const textComponent = new TextComponent(this.instructionsText[i]);
			this.addComponent(textComponent, `placeHolderText${i}`);
		}
	}

	createDashedLines(): Text[] {
		const dashedLines: Text[] = [];
		
		dashedLines.push({
				text: "--------- ----------", 
				x: 1375,
				y: 330,
				style: {
					fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
					fontSize: 14,
					fontWeight: 'lighter' as const,
					align: 'left' as const,
					fontFamily: 'monospace',
					lineHeight: 372,
				},
			} as Text);
			dashedLines[0].rotation = 1.5708;

		return (dashedLines);
	}

	createInstructionsTexts(): Text[] {
		const placeHolderTexts: Text[] = [];

		placeHolderTexts.push({
			text: "0 - 0",
			x: 1375,
			y: 220,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 18,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 30,
			},
		} as Text);
		placeHolderTexts[0].anchor = { x: 0.5, y: 0.5 };
		
		placeHolderTexts.push({
			text: this.getTranslatedInstructions(),
			x: 1360,
			y: 495,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 10.5,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 20,
			},
		} as Text);
		placeHolderTexts[1].anchor = { x: 0.5, y: 0.5 };

		placeHolderTexts.push({
			text: "  W\n" +
				"  S",
			x: 1121,
			y: 325,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 18,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 185,
			},
		} as Text);

		placeHolderTexts.push({
			text: "  ⬆\n" +
				"  ⬇",
			x: 1592,
			y: 324.8,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 33,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 186,
			},
		} as Text);

		placeHolderTexts.push({
			text: "➀",
			x: 1160,
			y: 235,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 15,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 186,
			},
		} as Text);

			placeHolderTexts.push({
			text: "➀",
			x: 1160,
			y: 420,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 15,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 186,
			},
		} as Text);

		placeHolderTexts.push({
			text: "➀",
			x: 1585,
			y: 235,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 15,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 186,
			},
		} as Text);

		placeHolderTexts.push({
			text: "➀",
			x: 1585,
			y: 420,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 15,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 186,
			},
		} as Text);

		placeHolderTexts.push({
			text: "➁",
			x: 1420,
			y: 235,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 15,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 186,
			},
		} as Text);

		placeHolderTexts.push({
			text: "➂",
			x: 1435,
			y: 345,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 15,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 186,
			},
		} as Text);

		return placeHolderTexts;
	}

	getTranslatedInstructions(): string {
		switch (this.menu.language) {
			case ('es'): {
				return "➀ ¡Los controles dependen del lado de la pantalla!\n" +
					"➁ ¡Apunta a los potenciadores,evita los debilitadores!\n" +
					"➂ ¡El primero en llegar a 11 gana, o por diferencia de 2 hasta 21!";
			}

			case ('fr'): {
				return "➀ Les contrôles dépendent du côté de l'écran !\n" +
					"➁ Visez les power-ups et les changements de balle, évitez les power-downs !\n" +
					"➂ Le premier à atteindre 11 gagne, ou par une différence de 2 jusqu'à 21 !";
			}

			case ('cat'): {
				return "➀ Els controls depenen del costat de la pantalla!\n" +
					"➁ Apunta als potenciadors i canvis de pilota, evita els debilitadors!\n" +
					"➂ El primer a arribar a 11 guanya, o per diferència de 2 fins a 21!";
			}
		
			default :
				return "➀ Input depends on what side of the arena you are on!\n" +
					"➁ Aim for the power-ups and ball changes, avoid power-downs!\n" +
					"➂ First to reach 11 wins, or first to gain a difference of 2 up to 21!";
		}
	}

	createInstructionsWindow(): void {
		this.chatWindowGraphic.rect(1099.5, 200, 551, 250);
		this.chatWindowGraphic.stroke({color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 3});
		this.chatWindowGraphic.rect(1120, 220, 25, 25);
		this.chatWindowGraphic.rect(1120, 405, 25, 25);
		this.chatWindowGraphic.rect(1600, 220, 25, 25);
		this.chatWindowGraphic.rect(1600, 405, 25, 25);
		this.chatWindowGraphic.stroke({color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 2});
		this.chatWindowGraphic.rect(1130, 285, 7, 70);
		this.chatWindowGraphic.rect(1610, 285, 7, 70);
		this.chatWindowGraphic.fill({color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue });
		this.chatWindowGraphic.circle(1330, 325, 8);
		this.chatWindowGraphic.fill({color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.green });
		this.chatWindowGraphic.circle(1375, 325, 8);
		this.chatWindowGraphic.fill({color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange });
		this.chatWindowGraphic.circle(1420, 325, 8);
		this.chatWindowGraphic.fill({color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.red });

		if (this.menu.config.classicMode) {
			this.chatWindowGraphic.moveTo(1300, 325);
			this.chatWindowGraphic.lineTo(1450, 325);
			this.chatWindowGraphic.moveTo(1420, 345);
			this.chatWindowGraphic.lineTo(1450, 345);
			this.chatWindowGraphic.moveTo(1099.5, 495);
			this.chatWindowGraphic.lineTo(1650, 495);
			this.chatWindowGraphic.stroke({color: GAME_COLORS.white, width: 2});
		}
	}

	redrawDisplay(): void {
		this.header.redrawBar(this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue);

		const newDashedLines = this.createDashedLines();
		for (let i = 0; i < this.dashedLines.length; i++) {
			const dashedLinesComponent = new TextComponent(newDashedLines[i]);
			this.replaceComponent('text', dashedLinesComponent, `dashedLines${i}`);
		};

		this.chatWindowGraphic.clear();
		this.createInstructionsWindow();

		const newInstructionsTexts = this.createInstructionsTexts();
		for (let i = 0; i < this.instructionsText.length; i++) {
			const placeHolderTextComponent = new TextComponent(newInstructionsTexts[i]);
			this.replaceComponent(`text`, placeHolderTextComponent, `placeHolderText${i}`);
		}
	}
}