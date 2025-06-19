/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AboutOverlay.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/19 18:51:30 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { Overlay } from "./Overlay";
import { OverlayHeader } from "./OverlayHeader";

import { AboutTexts } from "./AboutTexts";

import { GAME_COLORS } from "../../utils/Types";

export class AboutOverlay extends Overlay {
    private aboutTexts!: AboutTexts;
    header!: OverlayHeader;

    constructor(menu: Menu) {
        super('aboutOverlay', menu, 0x151515, GAME_COLORS.menuPink);
        
        this.menu = menu;
        
        this.initialize();
    }

    protected initializeContent(): void {
        this.aboutTexts = new AboutTexts(this.menu, 'aboutTexts', 'overlays');
        this.addContent(this.aboutTexts, 'overlays');

        this.header = new OverlayHeader(this.menu, 'glossaryHeader', 'overlays', 'info');
        this.addContent(this.header, 'overlays');

        MenuImageManager.createAvatars(this.menu);
        MenuImageManager.createClassicAvatars(this.menu);
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

        if (this.menu.config.classicMode) {
            MenuImageManager.prepareClassicLogosForAbout(this.menu);
            MenuImageManager.prepareClassicAvatarImagesForAbout(this.menu);
        } else {
            MenuImageManager.preparePinkLogosForAbout(this.menu);
            MenuImageManager.prepareAvatarImagesForAbout(this.menu);
        }
    }

    public hide(): void {
        super.hide();
    }

    protected onHideComplete(): void {
        if (this.menu.config.classicMode) {
            MenuImageManager.hideClassicLogosFromAbout(this.menu);
            MenuImageManager.hideClassicAvatarImagesFromAbout(this.menu);
        } else {
            MenuImageManager.hidePinkLogosFromAbout(this.menu);
            MenuImageManager.hideAvatarImagesFromAbout(this.menu);
        }
    }
}