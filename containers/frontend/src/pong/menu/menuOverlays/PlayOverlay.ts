/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayOverlay.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/16 17:10:25 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { Overlay } from "./Overlay";

import { PlayTexts } from "./PlayTexts";
import { OverlayHeader } from "./OverlayHeader";
import { HeaderBar } from "./HeaderBar";
import { Duel } from "./Duel";
import { PlayChatDisplay } from "./PlayChatDisplay";

import { GAME_COLORS } from "../../utils/Types"

export class PlayOverlay extends Overlay {
    private playTexts!: PlayTexts;
    header!: OverlayHeader;
    duel!: Duel;
    playerHeader!: HeaderBar;
    nextMatchDisplay!: PlayChatDisplay;

    constructor(menu: Menu) {
        super('playOverlay', menu, 'play', 0x151515, GAME_COLORS.menuBlue);
        
        this.menu = menu;
        
        this.initialize();
    }

    protected initializeContent(): void {
        this.header = new OverlayHeader(this.menu, 'tournamentHeader', 'overlays', 'play');
        this.addContent(this.header, 'overlays');

        this.duel = new Duel(this.menu, 'duel', 'overlays');
        this.addContent(this.duel, 'overlays');
        
        this.nextMatchDisplay = new PlayChatDisplay(this.menu, 'nextMatchDisplay', 'overlays');
        this.addContent(this.nextMatchDisplay, 'overlays');
        
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
    
        MenuImageManager.preparePlayAvatarImages(this.menu);
    
        this.menu.renderLayers.overlays.addChild(this.menu.readyButton.getContainer());
        this.menu.renderLayers.overlays.addChild(this.menu.tournamentGlossaryButton.getContainer());
        this.menu.renderLayers.overlays.addChild(this.menu.tournamentFiltersButton.getContainer());
        
        this.menu.readyButton.setHidden(false);
        this.menu.tournamentGlossaryButton.setHidden(false);
        this.menu.tournamentFiltersButton.setHidden(false);  
    }

    public hide(): void {
        super.hide();
    }

    protected onHideComplete(): void {
        this.menu.menuHidden.addChild(this.menu.readyButton.getContainer());
        this.menu.menuHidden.addChild(this.menu.tournamentGlossaryButton.getContainer());
        this.menu.menuHidden.addChild(this.menu.tournamentFiltersButton.getContainer());
        
        this.menu.readyButton.setHidden(true);
        this.menu.tournamentGlossaryButton.setHidden(true);
        this.menu.tournamentFiltersButton.setHidden(true);

        MenuImageManager.hidePlayAvatarImages(this.menu);
    }
}