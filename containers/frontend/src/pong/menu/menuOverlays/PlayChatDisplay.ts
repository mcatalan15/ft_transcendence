/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayChatDisplay.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 12:23:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/27 12:14:31 by hmunoz-g         ###   ########.fr       */
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
	//! OJO
	placeHolderText: Text[] = [];
	inputText: Text;
	inputBg: Graphics;
	isInputActive: boolean = false;
	currentInput: string = "";

	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);

		this.menu = menu;

		this.header = new HeaderBar(this.menu, 'nextMatchHeader', 'overlays', 'chat', 1098, 180, 554, 20);
		const headerBar = this.header.getComponent('render') as RenderComponent;
		this.addComponent(headerBar, 'barRender');
		const headerText = this.header.getComponent('text') as RenderComponent;
		this.addComponent(headerText, 'barText');

		this.createChatWindow();
		const chatWindowComponent = new RenderComponent(this.chatWindowGraphic);
		this.addComponent(chatWindowComponent, 'chatWindow');

/* 		this.placeHolderText = this.createPlaceHolderTexts();
		for (let i = 0; i < this.placeHolderText.length; i++) {
			const textComponent = new TextComponent(this.placeHolderText[i]);
			this.addComponent(textComponent, `placeHolderText${i}`);
		} */
		this.inputBg.alpha = 0.5;
	}

	createPlaceHolderTexts(): Text[] {
		const placeHolderTexts: Text[] = [];

		placeHolderTexts.push({
			text: "PSCHERB: Te voy a destruir\n" +
				"HMUNOZ-G: No lo creo\n" +
				"PSCHERB: ¡Prepárate!\n" +
				"HMUNOZ-G: ¡Vamos a ver!\n" +
				"PSCHERB: ¡Buena suerte!\n" +
				"HMUNOZ-G: ¡Igualmente!\n",
			x: 1230,
			y: 425,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1 },
				fontSize: 14,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 20,
			},
		} as Text);

		/* 		placeHolderTexts.push({
					text: "> Type your message here",
					x: 1220,
					y: 505,
					style: {
						fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1 },
						fontSize: 14,
						fontWeight: 'bold' as const,
						align: 'left' as const,
						fontFamily: '"Roboto Mono", monospace',
						lineHeight: 20,
					},
				} as Text); */

		return placeHolderTexts;
	}

	createChatWindow(): void {
		this.chatWindowGraphic.rect(1100, 215, 550, 265);
		this.chatWindowGraphic.rect(1100, 490, 550, 40);
		this.chatWindowGraphic.stroke({ color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 3 });

		// Input background (clickable area)
		this.inputBg = new Graphics();
		this.inputBg.beginFill(0x171717, 1);
		this.inputBg.drawRect(1120, 500, 400, 30);
		this.inputBg.endFill();
		this.inputBg.interactive = true;
		this.inputBg.buttonMode = true;
		this.inputBg.on('pointerdown', () => {
			console.log('Input background clicked!');
			this.isInputActive = true;
			this.updateInputText();
		});
		this.addComponent(new RenderComponent(this.inputBg), 'inputBg');

		// Input text
		this.inputText = new Text("> Type your message here", {
			fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1 },
			fontSize: 14,
			fontWeight: 'bold',
			align: 'left',
			fontFamily: '"Roboto Mono", monospace',
			lineHeight: 20,
		});
		this.inputText.x = 1130;
		this.inputText.y = 505;
		this.addComponent(new TextComponent(this.inputText), 'inputText');

		// Listen for keyboard input globally
		window.addEventListener('keydown', (e) => this.handleKeyDown(e));
	}

	redrawDisplay(): void {
		this.header.redrawBar(this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue);

		this.chatWindowGraphic.clear();
		this.createChatWindow();

		const newPlaceHolderTexts = this.createPlaceHolderTexts();
		for (let i = 0; i < this.placeHolderText.length; i++) {
			const placeHolderTextComponent = new TextComponent(newPlaceHolderTexts[i]);
			this.replaceComponent(`text`, placeHolderTextComponent, `placeHolderText${i}`);
		}
	}

	handleKeyDown(e: KeyboardEvent) {
		if (!this.isInputActive) return;
	
		if (e.key === 'Enter') {
			if (this.currentInput.trim() !== "") {
				//this.sendLobbyChatMessage(this.currentInput);
				this.currentInput = "";
				this.updateInputText();
			}
			return;
		}
		if (e.key === 'Backspace') {
			this.currentInput = this.currentInput.slice(0, -1);
		} else if (e.key.length === 1 && this.currentInput.length < 100) {
			this.currentInput += e.key;
			this.inputText.text += e.key; // Append the character to the input text
			(this.inputText as any).setText?.(this.currentInput);
		}
		this.updateInputText();
	}
	
	updateInputText() {
		this.inputBg.alpha = this.isInputActive ? 0.8 : 0.5;
		if (this.isInputActive) {
			// Remove and re-add the TextComponent (if needed)
			this.removeComponent('inputText');
			this.inputText.text = this.currentInput.length > 0 ? this.currentInput : "> ";
			this.addComponent(new TextComponent(this.inputText), 'inputText');
			console.log("Input active, updating text:", this.currentInput);
		} else {
			//this.inputText.text = "> Type your message here";
			console.log("Input inactive, not updating text.");
		}
	}
}