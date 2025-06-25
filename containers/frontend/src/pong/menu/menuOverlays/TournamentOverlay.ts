/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentOverlay.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/25 20:01:09 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Text } from "pixi.js";

import { Menu } from "../Menu";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { Overlay } from "./Overlay";

import { TournamentTexts } from "./TournamentTexts";
import { OverlayHeader } from "./OverlayHeader";
import { HeaderBar } from "./HeaderBar";
import { Bracket } from "./Bracket";
import { TournamentNextMatchDisplay } from "./TournamentNextMatchDisplay";

import { GAME_COLORS } from "../../utils/Types";
import { TextComponent } from "../../components/TextComponent";

export class TournamentOverlay extends Overlay {
    tournamentTexts!: TournamentTexts;
    header!: OverlayHeader;
    bracket!: Bracket;
    nextMatchHeader!: HeaderBar;
    dummyButton!: HeaderBar;
    nextMatchDisplay!: TournamentNextMatchDisplay;

    constructor(menu: Menu) {
        super('tournamentOverlay', menu, 0x151515, GAME_COLORS.menuBlue);
        
        this.menu = menu;
        
        this.initialize();
    }

    protected initializeContent(): void {      
        /* this.tournamentTexts = new TournamentTexts(this.menu, 'tournamentTexts', 'overlays');
        this.addContent(this.tournamentTexts, 'overlays'); */

        this.header = new OverlayHeader(this.menu, 'tournamentHeader', 'overlays', 'tournament');
        this.addContent(this.header, 'overlays');

        this.bracket = new Bracket(this.menu, 'tournamentBracket', 'overlays', 8);
        this.addContent(this.bracket, 'overlays');
        for (let i = 0; i < this.bracket.nameCells.length; i++) {
            this.addContent(this.bracket.nameCells[i], 'overlays');
        }

        this.nextMatchDisplay = new TournamentNextMatchDisplay(this.menu, 'nextMatchDisplay', 'overlays');
        this.addContent(this.nextMatchDisplay, 'overlays');

        MenuImageManager.createTournamentAvatars(this.menu);

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
        MenuImageManager.prepareTournamentAvatarImages(this.menu);
        this.menu.renderLayers.overlays.addChild(this.menu.readyButton.getContainer());
        this.menu.renderLayers.overlays.addChild(this.menu.tournamentTauntButton.getContainer());
        this.menu.renderLayers.overlays.addChild(this.menu.tournamentFiltersButton.getContainer());
    }

    public hide(): void {
        super.hide();
        this.menu.menuHidden.addChild(this.menu.readyButton.getContainer());
        this.menu.menuHidden.addChild(this.menu.tournamentTauntButton.getContainer());
        this.menu.menuHidden.addChild(this.menu.tournamentFiltersButton.getContainer());
    }

    protected onHideComplete(): void {
        /* if (this.menu.config.classicMode) {
            MenuImageManager.hideSquareAvatarImagesFromPlay(this.menu);
        } else {
            MenuImageManager.hideSquareAvatarImagesFromPlay(this.menu);
        } */

        MenuImageManager.hideTournamentAvatarImages(this.menu);
    }
}