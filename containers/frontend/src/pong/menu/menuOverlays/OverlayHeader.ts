/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   OverlayHeader.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 14:06:18 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:05:06 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text, Sprite } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { GAME_COLORS } from "../../utils/Types";

export class OverlayHeader extends Entity {
	menu: Menu;
    overlayType: string;
    headerSprite!: Sprite;
    blocking!: Graphics;
    overHead!: Graphics;
    headerText!: any;
    logoText!: any;

    constructor(menu: Menu, id: string, layer: string, preType: string) {
		super(id, layer);
		
		this.menu = menu;
		this.overlayType = preType;
	
		this.headerSprite = MenuImageManager.createHeaderSprite(preType, menu)!;
		if (this.headerSprite) {
			MenuImageManager.prepareHeaderForOverlay(this.headerSprite, menu);
			const renderComponent = new RenderComponent(this.headerSprite);
			this.addComponent(renderComponent, 'headerSprite');
		}
	
		const type = this.getType(preType);
		this.headerText = this.createHeaderText(type);
		const headerTextComponent = new TextComponent(this.headerText);
		this.addComponent(headerTextComponent, 'headerText');
	}

	getType(overlayBase: string): string {
		if (this.menu.language === 'en' || overlayBase === 'info') {
			return (overlayBase);
		}

		switch (this.menu.language) {
			case('es'): {
				switch (overlayBase) {
					case ('glossary'): {
						return ('glosario');
					}
					
					case ('play'): {
						return ('jugar');
					}

					case ('tournament'): {
						return ('torneo');
					}
					
					case ('local'):	{
						return ('local');
					}

					case ('online'):	{
						return ('en línea');
					}
				}
				break;
			}

			case ('fr'): {
				switch (overlayBase) {
					case ('glossary'): {
						return ('glossaire');
					}
					
					case ('play'): {
						return ('jouer');
					}

					case ('tournament'): {
						return ('tournoi');
					}

					case ('local'):	{
						return ('local');
					}

					case ('online'):	{
						return ('en ligne');
					}
				}
				break;
			}

			case ('cat'): {
				switch (overlayBase) {
					case ('glossary'): {
						return ('glossari');
					}
					
					case ('play'): {
						return ('jugar');
					}

					case ('tournament'): {
						return ('torneig');
					}

					case ('local'):	{
						return ('local');
					}

					case ('online'):	{
						return ('en línia');
					}
				}
			}
		}

		return ('unknown');
	}

	getColor(overlay: string) {
		if (overlay === 'glossary' || overlay === 'glossaire' || overlay === 'glosario' || overlay === 'glossari') {
			if (this.menu.config.classicMode) {
				return (GAME_COLORS.white) as number;
			}
			return (GAME_COLORS.menuOrange) as number;
		} else if (overlay === 'play' || overlay === 'jouer' || overlay === 'jugar' || overlay === 'tournament' || overlay === 'torneo' || overlay === 'tornoi' || overlay === 'torneig') {
			if (this.menu.config.classicMode) {
				return (GAME_COLORS.white) as number;
			}
			return (GAME_COLORS.menuBlue) as number;
		} else if (overlay === 'info') {
			if (this.menu.config.classicMode) {
				return (GAME_COLORS.white) as number;
			}
			return (GAME_COLORS.menuPink) as number;
		}

		return (GAME_COLORS.white) as number;
	}

	createHeaderText(type: string) {
		let x = 100 + (type.length - 4) * 5;

		switch (type.length) {

		}
		
		return {
			text: type.toUpperCase(),
			x: x,
			y: 107.5,
			style: {
				fill: GAME_COLORS.black,
				fontSize: 15,
				fontWeight: 'bold' as const,
				align: 'left' as const,
			},
		};
	}

	redrawOverlayElements(): void {
        const color = this.menu.config.classicMode ? GAME_COLORS.white : this.getColor(this.overlayType);
		
        if (this.headerSprite) {
            if (this.headerSprite.parent) {
                this.headerSprite.parent.removeChild(this.headerSprite);
            }
            this.headerSprite.destroy();
        }
        
        this.headerSprite = MenuImageManager.createHeaderSprite(this.overlayType, this.menu)!;
        if (this.headerSprite) {
            const renderComponent = new RenderComponent(this.headerSprite);
            this.replaceComponent('render', renderComponent, 'headerSprite');
        }
        
        let preType;
        if (this.menu.config.mode === 'local') {
            preType = 'local';
        } else if (this.menu.config.mode === 'online') {
            preType = 'online'
        }

        if (this.menu.config.variant === 'tournament') {
            preType = 'tournament';
        } else if (this.overlayType === 'info') {
            preType = 'info';
        } else if (this.overlayType === 'glossary') {
            preType = 'glossary';
        }

        let langType = this.getType(preType!);
        let finalType = langType;

        if (this.overlayType !== 'info' && this.overlayType !== 'glossary') {
            if (this.menu.config.variant === '1v1') {
                finalType += " - 1 vs 1";
            } else if (this.menu.config.variant === '1vAI') {
                finalType += " - 1 vs AI";
            }
        }
        
        const newHeaderText = this.createHeaderText(finalType!);
        const headerTextComponent = new TextComponent(newHeaderText);
        this.replaceComponent('text', headerTextComponent, 'headerText');
    }

    getAllRenderables(): any[] {
		const renderables = [];
		if (this.headerSprite) renderables.push(this.headerSprite);
		
		const headerTextComponent = this.getComponent('text') as TextComponent;
		if (headerTextComponent && headerTextComponent.getRenderable()) {
			renderables.push(headerTextComponent.getRenderable());
		}
		
		return renderables;
	}
}