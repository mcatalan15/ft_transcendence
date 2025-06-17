/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AboutOverlay.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/17 12:07:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { Overlay } from "./Overlay";

import { AboutTexts } from "./AboutTexts";

import { GAME_COLORS } from "../../utils/Types";

export class AboutOverlay extends Overlay {
    private aboutTexts!: AboutTexts;

    constructor(menu: Menu) {
        super('aboutOverlay', menu, 0x151515, GAME_COLORS.menuPink);
        this.initialize();
    }

    protected initializeContent(): void {
        this.aboutTexts = new AboutTexts('aboutTexts', 'overlays');
        this.addContent(this.aboutTexts, 'overlays');

        MenuImageManager.createAvatars(this.menu);
        MenuImageManager.createPinkLogos(this.menu);
        MenuImageManager.createClassicLogos(this.menu);
        
        this.setQuitButton(this.menu.aboutQuitButton);
    }

    public redrawTitles(): void {
        if (this.aboutTexts) {
            this.aboutTexts.redrawAboutTitles(this.menu.config.classicMode);
        }
    }

    protected getStrokeColor(): number {
        return this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuPink;
    }

    public show(): void {
        this.changeStrokeColor(this.getStrokeColor());

        super.show();

        MenuImageManager.prepareAvatarImagesForAbout(this.menu);
        if (this.menu.config.classicMode) {
            MenuImageManager.prepareClassicLogosForAbout(this.menu);
        } else {
            MenuImageManager.preparePinkLogosForAbout(this.menu);
        }
    }

    public hide(): void {
        super.hide();
    }

    protected onHideComplete(): void {
        MenuImageManager.hideAvatarImagesFromAbout(this.menu);
        
        if (this.menu.config.classicMode) {
            MenuImageManager.hideClassicLogosFromAbout(this.menu);
        } else {
            MenuImageManager.hidePinkLogosFromAbout(this.menu);
        }
    }
}