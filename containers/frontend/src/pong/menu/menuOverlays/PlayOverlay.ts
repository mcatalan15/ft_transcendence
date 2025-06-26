/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayOverlay.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/25 20:20:29 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { Overlay } from "./Overlay";

import { PlayTexts } from "./PlayTexts";
import { OverlayHeader } from "./OverlayHeader";
import { HeaderBar } from "./HeaderBar";

import { GAME_COLORS } from "../../utils/Types"

export class PlayOverlay extends Overlay {
    private playTexts!: PlayTexts;
    header!: OverlayHeader;
    playerHeader!: HeaderBar;

    constructor(menu: Menu) {
        super('playOverlay', menu, 'play', 0x151515, GAME_COLORS.menuBlue);
        
        this.menu = menu;
        
        this.initialize();
    }

    protected initializeContent(): void {
        /* this.playTexts = new PlayTexts(this.menu, 'playTexts', 'overlays');
        this.addContent(this.playTexts, 'overlays'); */
        this.header = new OverlayHeader(this.menu, 'tournamentHeader', 'overlays', 'play');
        this.addContent(this.header, 'overlays');
        
        this.setQuitButton(this.menu.playQuitButton);
    }

    public redrawTitles(): void {
        if (this.playTexts) {
            this.playTexts.redrawPlayTitles(this.menu.config.classicMode);
        }
    }

    protected getStrokeColor(): number {
        return this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue;
    }

    private updateOverlayTexts(): void {
        if (this.playTexts) {
            this.playTexts.recreateTexts();

            this.playTexts.redrawPlayTitles(this.menu.config.classicMode);
        }
    }

    public show(): void {
        this.changeStrokeColor(this.getStrokeColor());
        this.updateOverlayTexts();

        super.show();
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