/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayOverlay.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/16 19:23:56 by hmunoz-g         ###   ########.fr       */
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
            console.log('CUCUCUFUFUADFUOIAUDIOF');
            this.inputButton = this.menu.playInputButton;
            this.setInputButton(this.inputButton);
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
        
        // Prepare avatars BEFORE starting the animation, but don't add them to the scene yet
        await MenuImageManager.preparePlayAvatarImages(this.menu);
        
        // Ensure all avatars start with alpha 0 (they should already be 0 from preparePlayAvatarImages)
        const avatars = MenuImageManager.getAllPlayAvatarImages();
        
        avatars.forEach(avatar => {
            if (avatar) {
                avatar.alpha = 0;
            }
        });

        // Now start the animation - all elements including avatars will start at alpha 0
        super.show();

        this.menu.renderLayers.overlays.addChild(this.menu.readyButton.getContainer());
        this.menu.renderLayers.overlays.addChild(this.menu.tournamentGlossaryButton.getContainer());
        this.menu.renderLayers.overlays.addChild(this.menu.tournamentFiltersButton.getContainer());
        
        this.menu.readyButton.setHidden(false);
        this.menu.tournamentGlossaryButton.setHidden(false);
        this.menu.tournamentFiltersButton.setHidden(false);  
        this.inputButton.setHidden(false);
    }

    public hide(): void {
        super.hide();
    }

    protected onHideComplete(): void {
        this.menu.menuHidden.addChild(this.menu.readyButton.getContainer());
        this.menu.menuHidden.addChild(this.menu.tournamentGlossaryButton.getContainer());
        this.menu.menuHidden.addChild(this.menu.tournamentFiltersButton.getContainer());
        // Remove manual input button hiding - it's now handled by the base class
        
        this.menu.readyButton.setHidden(true);
        this.menu.tournamentGlossaryButton.setHidden(true);
        this.menu.tournamentFiltersButton.setHidden(true);
        this.inputButton.setHidden(true);

        MenuImageManager.hidePlayAvatarImages(this.menu);

        this.menu.playInputButton.resetButton();
    }
}