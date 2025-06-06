/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuOrnaments.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 14:18:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 16:29:47 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, FederatedPointerEvent } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { GAME_COLORS} from '../utils/Types';
import { Menu } from './Menu';
import { getButtonPoints, MenuButtonConfig } from '../utils/MenuUtils';
import { getThemeColors } from '../utils/Utils';
import { isMenuButton } from '../utils/Guards';
import { MenuButton } from './MenuButton';

export class MenuOrnaments extends Entity {
	menu: Menu;
	private ornamentContainer: Container;
	private ornamentPolygons: Container;
	private playOrnamentPoints: number[] = [];
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
		this.playOrnamentPoints = this.getOrnamentPoints('PLAY')!;
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
		startOrnament.fill(getThemeColors(this.menu.config.classicMode).menuBlue);
		startOrnament.stroke( {color: getThemeColors(this.menu.config.classicMode).menuBlue, width: 3} );
		startOrnament.y = (this.menu.app.screen.height / 3);
		startOrnament.label = 'startOrnament';
		ornaments.addChild(startOrnament);

		const optionsOrnament = new Graphics();
		optionsOrnament.poly(this.optionsOrnamentPoints);
		optionsOrnament.fill(getThemeColors(this.menu.config.classicMode).menuGreen);
		optionsOrnament.stroke( {color: getThemeColors(this.menu.config.classicMode).menuGreen, width: 3} );
		optionsOrnament.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset));
		optionsOrnament.label = 'optionsOrnament';
		ornaments.addChild(optionsOrnament);

		const glossaryOrnament = new Graphics();
		glossaryOrnament.poly(this.glossaryOrnamentPoints);
		glossaryOrnament.fill(getThemeColors(this.menu.config.classicMode).menuOrange);
		glossaryOrnament.stroke( {color: getThemeColors(this.menu.config.classicMode).menuOrange, width: 3} );
		glossaryOrnament.y = (this.menu.app.screen.height / 3) + (this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 2;
		glossaryOrnament.label = 'glossaryOrnament';
		ornaments.addChild(glossaryOrnament);

		const aboutOrnament = new Graphics();
		aboutOrnament.poly(this.aboutOrnamentPoints);
		aboutOrnament.fill(getThemeColors(this.menu.config.classicMode).menuPink);
		aboutOrnament.stroke( {color: getThemeColors(this.menu.config.classicMode).menuPink, width: 3} );
		aboutOrnament.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 3);
		aboutOrnament.label = 'aboutOrnament';
		ornaments.addChild(aboutOrnament);

		const playOrnament = new Graphics();
		playOrnament.poly(this.playOrnamentPoints);
		playOrnament.fill(getThemeColors(this.menu.config.classicMode).menuBlue);
		playOrnament.stroke( {color: getThemeColors(this.menu.config.classicMode).menuBlue, width: 3} );
		playOrnament.y = (this.menu.app.screen.height / 3);
		playOrnament.label = 'playOrnament';
		ornaments.addChild(playOrnament);

		return (ornaments);
	}

	updateOrnament(button: MenuButton, graphic: Container, level: string, reset: boolean = false) {
		let color;
		const redoneGraphic = graphic as Graphics;

		switch (level) {
			case ('START'): {
				if (button.isClicked) {
					color = getThemeColors(this.menu.config.classicMode).white;
				} else {
					if (this.menu.config.classicMode) {
						color = getThemeColors(this.menu.config.classicMode).white;
					} else {
						color = getThemeColors(this.menu.config.classicMode).menuBlue;
					}
				}
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('START', button.isClicked, reset)!);
				redoneGraphic.fill(color);
				redoneGraphic.stroke( {color: this.menu.config.classicMode ? getThemeColors(this.menu.config.classicMode).white : getThemeColors(this.menu.config.classicMode).menuBlue, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3);
				redoneGraphic.label = 'startOrnament';
				break;
			}
			case ('OPTIONS'): {
				if (button.isClicked) {
					color = getThemeColors(this.menu.config.classicMode).white;
				} else {
					if (this.menu.config.classicMode) {
						color = getThemeColors(this.menu.config.classicMode).white;
					} else {
						color = getThemeColors(this.menu.config.classicMode).menuGreen;
					}
				}
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('OPTIONS', button.isClicked, reset)!);
				redoneGraphic.fill(color);
				redoneGraphic.stroke( {color: color, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset));
				redoneGraphic.label = 'optionsOrnament';
				break;
			}
			case ('GLOSSARY'): {
				if (button.isClicked) {
					color = getThemeColors(this.menu.config.classicMode).white;
				} else {
					if (this.menu.config.classicMode) {
						color = getThemeColors(this.menu.config.classicMode).white;
					} else {
						color = getThemeColors(this.menu.config.classicMode).menuOrange;
					}
				}
				
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('GLOSSARY', button.isClicked, reset)!);
				redoneGraphic.fill(color);
				redoneGraphic.stroke( {color: color, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3) + (this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 2;
				redoneGraphic.label = 'glossaryOrnament';
				break;
			}
			case ('ABOUT'): {
				if (button.isClicked) {
					color = getThemeColors(this.menu.config.classicMode).white;
				} else {
					if (this.menu.config.classicMode) {
						color = getThemeColors(this.menu.config.classicMode).white;
					} else {
						color = getThemeColors(this.menu.config.classicMode).menuPink;
					}
				}
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('ABOUT', button.isClicked, reset)!);
				redoneGraphic.fill(color);
				redoneGraphic.stroke( {color: color, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 3);
				redoneGraphic.label = 'aboutOrnament';
				break;
			}
			case ('PLAY'): {	
				redoneGraphic.clear();
				redoneGraphic.poly(this.getOrnamentPoints('PLAY', button.isClicked, reset)!);
				redoneGraphic.fill(reset? getThemeColors(this.menu.config.classicMode).menuBlue : getThemeColors(this.menu.config.classicMode).white);
				redoneGraphic.stroke( {color: reset? getThemeColors(this.menu.config.classicMode).menuBlue : getThemeColors(this.menu.config.classicMode).white, width: 3} );
				redoneGraphic.y = (this.menu.app.screen.height / 3);
				redoneGraphic.label = 'playOrnament';
				break;
			}
		}
	}

	getOrnamentPoints(level: string, isClicked: boolean = false, reset:boolean = false): number[] | undefined {
		if (!isClicked) {
			switch (level) {
				case ('START'): {
					return ([
						0, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 3) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
						(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 3) + this.menu.ornamentGap, this.menu.buttonHeight,
						0, this.menu.buttonHeight
					]);
				}
				case ('PLAY'): {
					return ([
						0, 0,
						0, 0,
						0, 0,
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
						0, 0,
						0, 0,
						0, this.menu.buttonHeight
					]);
				}
				case ('PLAY'): {
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