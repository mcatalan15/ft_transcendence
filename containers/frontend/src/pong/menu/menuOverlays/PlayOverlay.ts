/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayOverlay.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/19 18:02:54 by hmunoz-g         ###   ########.fr       */
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

        if (this.menu.config.variant === '1v1') {
            this.inputButton = this.menu.playInputButton;
            this.setPlayInputButton(this.inputButton);
        }
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

    public async show(): Promise<void> {
        this.changeStrokeColor(this.getStrokeColor());
        this.updateOverlayTexts();
        
        await MenuImageManager.preparePlayAvatarImages(this.menu);
        super.show();
    
        MenuImageManager.bringAvatarsToFront(this.menu);
        
        const avatars = MenuImageManager.getAllPlayAvatarImages();
        
        avatars.forEach(avatar => {
            if (avatar) {
                avatar.alpha = 0;
            }
        });
    
        this.menu.renderLayers.overlays.addChild(this.menu.readyButton.getContainer());
        this.menu.renderLayers.overlays.addChild(this.menu.tournamentGlossaryButton.getContainer());
        this.menu.renderLayers.overlays.addChild(this.menu.tournamentFiltersButton.getContainer());
        
        this.menu.readyButton.setHidden(false);
        this.menu.tournamentGlossaryButton.setHidden(false);
        this.menu.tournamentFiltersButton.setHidden(false);
    
        this.quitButton!.setHidden(false);
        this.quitButton!.setClickable(true);
        
        this.inputButton!.setHidden(false);
        this.inputButton!.setClickable(true);
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
        
        this.quitButton!.setHidden(true);
        this.quitButton!.setClickable(false);
        
        this.inputButton!.setHidden(true);
        this.inputButton!.setClickable(false);

        MenuImageManager.hidePlayAvatarImages(this.menu);

        this.menu.playInputButton.resetButton();

        this.menu.playInputButton.getButtonText().alpha = 1;
    }
}