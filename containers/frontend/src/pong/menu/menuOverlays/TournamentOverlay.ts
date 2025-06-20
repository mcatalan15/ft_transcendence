/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentOverlay.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/20 17:56:30 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { Overlay } from "./Overlay";

import { TournamentTexts } from "./TournamentTexts";
import { OverlayHeader } from "./OverlayHeader";
import { HeaderBar } from "./HeaderBar";
import { Bracket } from "./Bracket";

import { GAME_COLORS } from "../../utils/Types";

export class TournamentOverlay extends Overlay {
    tournamentTexts!: TournamentTexts;
    header!: OverlayHeader;
    bracket!: Bracket;
    playerHeader!: HeaderBar;
    rivalHeader!: HeaderBar;
    dummyButton!: HeaderBar;

    constructor(menu: Menu) {
        super('tournamentOverlay', menu, 0x151515, GAME_COLORS.menuBlue);
        
        this.menu = menu;
        
        this.initialize();
    }

    protected initializeContent(): void {      
        this.tournamentTexts = new TournamentTexts(this.menu, 'tournamentTexts', 'overlays');
        this.addContent(this.tournamentTexts, 'overlays');

        this.header = new OverlayHeader(this.menu, 'tournamentHeader', 'overlays', 'tournament');
        this.addContent(this.header, 'overlays');

        this.bracket = new Bracket(this.menu, 'tournamentBracket', 'overlays', 8);
        this.addContent(this.bracket, 'overlays');

        this.playerHeader = new HeaderBar(this.menu, 'playerHeader', 'overlays', 'profile', 1100, 180, 550, 20);
        this.addContent(this.playerHeader, 'overlays');

        this.rivalHeader = new HeaderBar(this.menu, 'playerHeader', 'overlays', 'next match', 1100, 380, 550, 20);
        this.addContent(this.rivalHeader, 'overlays');

        this.dummyButton = new HeaderBar(this.menu, 'dummyButton', 'overlays', 'dummy', 1088, 585, 573, 50);
        this.addContent(this.dummyButton, 'overlays');

        MenuImageManager.createSquareAvatars(this.menu);

        this.setQuitButton(this.menu.playQuitButton);
    }

    public redrawTitles(): void {
        if (this.tournamentTexts) {
            this.tournamentTexts.redrawPlayTitles(this.menu.config.classicMode);
        }
    }

    protected getStrokeColor(): number {
        return this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue;
    }

    private updateOverlayTexts(): void {
        if (this.tournamentTexts) {
            this.tournamentTexts.recreateTexts();

            this.tournamentTexts.redrawPlayTitles(this.menu.config.classicMode);
        }
    }

    public show(): void {
        this.changeStrokeColor(this.getStrokeColor());
        this.updateOverlayTexts();
        super.show();

        //! OJO classic mode
        MenuImageManager.prepareSquareAvatarImagesForPlay(this.menu);
    }

    public hide(): void {
        super.hide();
    }

    protected onHideComplete(): void {
        /* if (this.menu.config.classicMode) {
            MenuImageManager.hideSquareAvatarImagesFromPlay(this.menu);
        } else {
            MenuImageManager.hideSquareAvatarImagesFromPlay(this.menu);
        } */

        MenuImageManager.hideSquareAvatarImagesFromPlay(this.menu);
    }
}