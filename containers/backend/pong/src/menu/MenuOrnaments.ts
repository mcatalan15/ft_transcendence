/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuOrnaments.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 14:18:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/03 16:46:33 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, FederatedPointerEvent } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { GAME_COLORS } from '../utils/Types';
import { Menu } from './Menu';
import { getButtonPoints, MenuButtonConfig } from '../utils/MenuUtils';
import { isMenuButton } from '../utils/Guards';

export class MenuOrnaments extends Entity {
	menu: Menu;
	private ornamentContainer: Container;
	private ornamentPolygons: Container;
	private startOrnamentPoints: number[] = [];
	private glossaryOrnamentPoints: number[] = [];
	private optionsOrnamentPoints: number[] = [];
	private aboutOrnamentPoints: number[] = [];
	private slantOffset: number = 20;

	constructor(id: string, layer: string, menu: Menu) {
		super(id, layer);
		this.menu = menu;

		this.ornamentContainer = new Container();

		this.startOrnamentPoints = this.getOrnamentPoints('START')!;
		this.glossaryOrnamentPoints = this.getOrnamentPoints('GLOSSARY')!;
		this.optionsOrnamentPoints = this.getOrnamentPoints('OPTIONS')!;
		this.aboutOrnamentPoints = this.getOrnamentPoints('ABOUT')!;

		this.ornamentPolygons = this.createMenuOrnaments();
		const renderComponent = new RenderComponent(this.ornamentPolygons);
		this.addComponent(renderComponent, 'render');
	}

	createMenuOrnaments(): Container {
		const ornaments = new Container();

		const startOrnament = new Graphics();
		startOrnament.poly(this.startOrnamentPoints);
		startOrnament.fill(GAME_COLORS.menuBlue);
		startOrnament.stroke( {color: GAME_COLORS.menuBlue, width: 3} );
		startOrnament.y = (this.menu.app.screen.height / 3);
		startOrnament.label = 'startOrnament';
		ornaments.addChild(startOrnament);

		const optionsOrnament = new Graphics();
		optionsOrnament.poly(this.optionsOrnamentPoints);
		optionsOrnament.fill(GAME_COLORS.menuGreen);
		optionsOrnament.stroke( {color: GAME_COLORS.menuGreen, width: 3} );
		optionsOrnament.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset));
		optionsOrnament.label = 'optionsOrnament';
		ornaments.addChild(optionsOrnament);

		const glossaryOrnament = new Graphics();
		glossaryOrnament.poly(this.glossaryOrnamentPoints);
		glossaryOrnament.fill(GAME_COLORS.menuOrange);
		glossaryOrnament.stroke( {color: GAME_COLORS.menuOrange, width: 3} );
		glossaryOrnament.y = (this.menu.app.screen.height / 3) + (this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 2;
		glossaryOrnament.label = 'glossaryOrnament';
		ornaments.addChild(glossaryOrnament);

		const aboutOrnament = new Graphics();
		aboutOrnament.poly(this.aboutOrnamentPoints);
		aboutOrnament.fill(GAME_COLORS.menuPink);
		aboutOrnament.stroke( {color: GAME_COLORS.menuPink, width: 3} );
		aboutOrnament.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 3);
		aboutOrnament.label = 'aboutOrnament';
		ornaments.addChild(aboutOrnament);

		return (ornaments);
	}

	updateOrnament(graphic: Container, level: string, reset: boolean = false) {
		const redoneGraphic = graphic as Graphics;

		let optionsButton;

		for (const entity of this.menu.entities) {
			if (isMenuButton(entity) && entity.getText() === 'OPTIONS') {
				optionsButton = entity;
			}
		}
		
		switch (level) {
			case ('START'): {
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('START', true, reset)!);
				redoneGraphic.fill(GAME_COLORS.white);
				redoneGraphic.stroke( {color: GAME_COLORS.white, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3);
				redoneGraphic.label = 'startOrnament';
				break;
			}
			case ('OPTIONS'): {
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('OPTIONS', true, reset)!);
				redoneGraphic.fill(reset? GAME_COLORS.menuGreen : GAME_COLORS.white);
				redoneGraphic.stroke( {color: reset? GAME_COLORS.menuGreen : GAME_COLORS.white, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset));
				redoneGraphic.label = 'optionsOrnament';
				break;
			}
			case ('GLOSSARY'): {
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('GLOSSARY', true, reset)!);
				redoneGraphic.fill(GAME_COLORS.white);
				redoneGraphic.stroke( {color: GAME_COLORS.white, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3) + (this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 2;
				redoneGraphic.label = 'glossaryOrnament';
				break;
			}
			case ('ABOUT'): {
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('ABOUT', true, reset)!);
				redoneGraphic.fill(GAME_COLORS.white);
				redoneGraphic.stroke( {color: GAME_COLORS.white, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 3);
				redoneGraphic.label = 'aboutOrnament';
				break;
			}
		}
	}

	getOrnamentPoints(level: string, isClicked: boolean = false, reset:boolean = false): number[] | undefined {
		if (!isClicked || reset) {
			switch (level) {
				case ('START'): {
					return ([
						0, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 3) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 3) + this.menu.ornamentGap, this.menu.buttonHeight,
						0, this.menu.buttonHeight
					]);
				}
				case ('OPTIONS'): {
					return ([
						0, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 2) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 2) + this.menu.ornamentGap, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
				case ('GLOSSARY'): {
					return ([
						0, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset) + this.menu.ornamentGap, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
				case ('ABOUT'): {
					return ([
						0, 0,
						(this.menu.buttonWidth * 3) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
						(this.menu.buttonWidth * 3) + this.menu.ornamentGap, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
			}
		} else {
			switch (level) {
				case ('START'): {
					return ([
						0, 0,
						(this.menu.buttonWidth) + this.menu.buttonSlant -10, 0,
						(this.menu.buttonWidth) - 10, this.menu.buttonHeight,
						0, this.menu.buttonHeight
					]);
				}
				case ('OPTIONS'): {
					return ([
						0, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 2) + this.menu.buttonSlant + 15, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 2) + 15, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
				case ('GLOSSARY'): {
					return ([
						0, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset) + this.menu.ornamentGap, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
				case ('ABOUT'): {
					return ([
						0, 0,
						(this.menu.buttonWidth * 3) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
						(this.menu.buttonWidth * 3) + this.menu.ornamentGap, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
			}
		}
	} 
}