/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentOverlay.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/19 18:56:47 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { Overlay } from "./Overlay";

import { TournamentTexts } from "./TournamentTexts";
import { OverlayHeader } from "./OverlayHeader";
import { Bracket } from "./Bracket";

import { GAME_COLORS } from "../../utils/Types";

export class TournamentOverlay extends Overlay {
    tournamentTexts!: TournamentTexts;
    header!: OverlayHeader;
    bracket!: Bracket;

    constructor(menu: Menu) {
        super('playOverlay', menu, 0x151515, GAME_COLORS.menuBlue);
        
        this.menu = menu;
        
        this.initialize();
    }

    protected initializeContent(): void {      
        this.tournamentTexts = new TournamentTexts(this.menu, 'tournamentTexts', 'overlays');
        //this.addContent(this.tournamentTexts, 'overlays');

        this.header = new OverlayHeader(this.menu, 'tournamentHeader', 'overlays', 'tournament');
        this.addContent(this.header, 'overlays');

        this.bracket = new Bracket(this.menu, 'tournamentBracket', 'overlays', 8);
        this.addContent(this.bracket, 'overlays');

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