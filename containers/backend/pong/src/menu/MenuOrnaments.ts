/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuOrnaments.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 14:18:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/02 18:00:19 by hmunoz-g         ###   ########.fr       */
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
		startOrnament.stroke( {color: GAME_COLORS.menuBlue, width: 2} );
		startOrnament.x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2;
		startOrnament.y = (this.menu.app.screen.height / 3);
		startOrnament.label = 'startOrnament';
		ornaments.addChild(startOrnament);

		const glossaryOrnament = new Graphics();
		glossaryOrnament.poly(this.glossaryOrnamentPoints);
		glossaryOrnament.fill(GAME_COLORS.menuGreen);
		glossaryOrnament.stroke( {color: GAME_COLORS.menuGreen, width: 2} );
		glossaryOrnament.x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2  - this.menu.ornamentOffset;
		glossaryOrnament.y = (this.menu.app.screen.height / 3) + (this.menu.buttonHeight + this.menu.buttonSpacing);
		glossaryOrnament.label = 'glossaryOrnament';
		ornaments.addChild(glossaryOrnament);

		const optionsOrnament = new Graphics();
		optionsOrnament.poly(this.optionsOrnamentPoints);
		optionsOrnament.fill(GAME_COLORS.menuOrange);
		optionsOrnament.stroke( {color: GAME_COLORS.menuOrange, width: 2} );
		optionsOrnament.x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset * 2;
		optionsOrnament.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonSpacing) * 2);
		optionsOrnament.label = 'optionsOrnament';
		ornaments.addChild(optionsOrnament);

		const aboutOrnament = new Graphics();
		aboutOrnament.poly(this.aboutOrnamentPoints);
		aboutOrnament.fill(GAME_COLORS.menuPink);
		aboutOrnament.stroke( {color: GAME_COLORS.menuPink, width: 2} );
		aboutOrnament.x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset * 3;
		aboutOrnament.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonSpacing) * 3);
		aboutOrnament.label = 'aboutOrnament';
		ornaments.addChild(aboutOrnament);

		return (ornaments);
	}

	updateOrnament(graphic: Container, level: string) {
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
				redoneGraphic.poly(this.getOrnamentPoints('START', true)!);
				redoneGraphic.fill(GAME_COLORS.white);
				redoneGraphic.stroke( {color: GAME_COLORS.white, width: 2} );
				redoneGraphic.x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2;
				redoneGraphic.y = (this.menu.app.screen.height / 3);
				redoneGraphic.label = 'startOrnament';
				break;
			}
			case ('GLOSSARY'): {
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('GLOSSARY', true)!);
				redoneGraphic.fill(GAME_COLORS.white);
				redoneGraphic.stroke( {color: GAME_COLORS.white, width: 2} );
				redoneGraphic.x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2  - this.menu.ornamentOffset;
				redoneGraphic.y = (this.menu.app.screen.height / 3) + (this.menu.buttonHeight + this.menu.buttonSpacing);
				redoneGraphic.label = 'glossaryOrnament';
				break;
			}
			case ('OPTIONS'): {
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('OPTIONS', true)!);
				redoneGraphic.fill(GAME_COLORS.white);
				redoneGraphic.stroke( {color: GAME_COLORS.white, width: 2} );
				redoneGraphic.x = ((this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset * 2);
				redoneGraphic.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonSpacing) * 2);
				redoneGraphic.label = 'optionsOrnament';
				break;
			}
			case ('ABOUT'): {
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('ABOUT', true)!);
				redoneGraphic.fill(GAME_COLORS.white);
				redoneGraphic.stroke( {color: GAME_COLORS.white, width: 2} );
				redoneGraphic.x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset * 3;
				redoneGraphic.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonSpacing) * 3);
				redoneGraphic.label = 'aboutOrnament';
				break;
			}
		}
	}

	getOrnamentPoints(level: string, isClicked: boolean = false): number[] | undefined {
		const startOrnamentOffset = 300;
		const glossaryOrnamentOffset = 400;
		const optionsOrnamentOffset = 477;
		const aboutOrnamentOffset = 600;
		
		if (!isClicked) {
			switch (level) {
				case ('START'): {
					return ([
						0, 0,
						this.menu.buttonWidth / 2.3 + this.slantOffset, 0,
						this.menu.buttonWidth / 2.3, this.menu.buttonHeight,
						0, this.menu.buttonHeight
					]);
				}
				case ('GLOSSARY'): {
					return ([
						0, 0,
						this.menu.buttonWidth / 2.3 + this.slantOffset, 0,
						this.menu.buttonWidth / 2.3, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
				case ('OPTIONS'): {
					return ([
						0, 0,
						this.menu.buttonWidth / 2.3 + this.slantOffset, 0,
						this.menu.buttonWidth / 2.3, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
				case ('ABOUT'): {
					return ([
						0, 0,
						this.menu.buttonWidth / 2.3 + this.slantOffset, 0,
						this.menu.buttonWidth / 2.3, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
			}
		} else {
			switch (level) {
				case ('START'): {
					return ([
						0, 0,
						this.menu.buttonWidth / 2.3 + this.slantOffset - startOrnamentOffset, 0,
						this.menu.buttonWidth / 2.3 - startOrnamentOffset, this.menu.buttonHeight,
						0, this.menu.buttonHeight
					]);
				}
				case ('GLOSSARY'): {
					return ([
						0, 0,
						this.menu.buttonWidth / 2.3 + this.slantOffset - glossaryOrnamentOffset, 0,
						this.menu.buttonWidth / 2.3 - glossaryOrnamentOffset, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
				case ('OPTIONS'): {
					return ([
						0, 0,
						this.menu.buttonWidth / 2.3 + this.slantOffset - optionsOrnamentOffset, 0,
						this.menu.buttonWidth / 2.3 - optionsOrnamentOffset, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
				case ('ABOUT'): {
					return ([
						0, 0,
						this.menu.buttonWidth / 2.3 + this.slantOffset - aboutOrnamentOffset, 0,
						this.menu.buttonWidth / 2.3 - aboutOrnamentOffset, this.menu.buttonHeight,
						0, this.menu.buttonHeight,
					]);
				}
			}
		}
	} 
}