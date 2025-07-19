/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GlossaryOverlay.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:15:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/17 15:59:34 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";
import { Overlay } from "./Overlay";
import { GlossaryTexts } from "./GlossaryTexts";
import { OverlayHeader } from "./OverlayHeader";
import { HeaderBar } from "./HeaderBar";
import { MenuPowerupManager } from "../menuManagers/MenuPowerupManager";
import { MenuImageManager } from "../menuManagers/MenuImageManager";
import { GAME_COLORS } from "../../utils/Types";

export class GlossaryOverlay extends Overlay {
    private glossaryTexts!: GlossaryTexts;
    header!: OverlayHeader;
    powerupBar!: HeaderBar;
    powerdownBar!: HeaderBar;
    ballchangeBar!: HeaderBar;
    affectationsBar!: HeaderBar;
    wallfiguresBar!: HeaderBar;

    constructor(menu: Menu) {
        super('glossaryOverlay', menu, 'glossary', 0x151515, GAME_COLORS.menuOrange);
        
        this.initialize();
    }

    protected initializeContent(): void {
        this.glossaryTexts = new GlossaryTexts(this.menu, 'glossaryTexts', 'overlays');
        this.addContent(this.glossaryTexts, 'overlays');
    
        this.header = new OverlayHeader(this.menu, 'glossaryHeader', 'overlays', 'glossary');
        this.addContent(this.header, 'overlays');
    
        this.powerupBar = new HeaderBar(this.menu, 'glossaryPowerupBar', 'overlays', 'POWER-UPS', 120, 160, 475, 20);
        this.addContent(this.powerupBar, 'overlays');
    
        this.powerdownBar = new HeaderBar(this.menu, 'glossaryPowerdownBar', 'overlays', 'POWER-DOWNS', 660, 160, 475, 20);
        this.addContent(this.powerdownBar, 'overlays');
    
        this.ballchangeBar = new HeaderBar(this.menu, 'glossaryBallchangeBar', 'overlays', 'BALL-CHANGES', 1200, 160, 475, 20);
        this.addContent(this.ballchangeBar, 'overlays');
    
        this.affectationsBar = new HeaderBar(this.menu, 'glossaryAffectationsBar', 'overlays', 'AFFECTATIONS', 120, 470, 475, 20);
        this.addContent(this.affectationsBar, 'overlays');
    
        this.wallfiguresBar = new HeaderBar(this.menu, 'glossaryWallfiguresBar', 'overlays', 'WALL FIGURES', 660, 470, 1010, 20);
        this.addContent(this.wallfiguresBar, 'overlays');
    
        MenuImageManager.createImages(this.menu);
        MenuPowerupManager.createGlossaryPaddles(this.menu);
    
        this.setQuitButton(this.menu.glossaryQuitButton);
    }

    public redrawTitles(): void {
        if (!this.glossaryTexts) {
            const glossaryContent = this.content.find(c => c.entity.id === 'glossaryTexts');
            if (glossaryContent && glossaryContent.entity instanceof GlossaryTexts) {
                this.glossaryTexts = glossaryContent.entity as GlossaryTexts;
            } else {
                return;
            }
        }
        
        if (this.glossaryTexts && typeof this.glossaryTexts.redrawGlossaryTitles === 'function') {
            this.glossaryTexts.redrawGlossaryTitles(this.menu.config.classicMode);
        } else {
            console.error('GlossaryTexts exists but redrawGlossaryTitles method is missing');
        }
    }

    protected getStrokeColor(): number {
        return this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuOrange;
    }

    public show(): void {
        this.changeStrokeColor(this.getStrokeColor());
    
        super.show();
    
        MenuPowerupManager.prepareForGlossary(this.menu);
        
        if (!this.menu.paddleL || !this.menu.paddleR) {
            MenuPowerupManager.createGlossaryPaddles(this.menu);
        }

        this.quitButton!.setHidden(false);
        this.quitButton!.setClickable(true);
    
        MenuImageManager.prepareWallImagesForGlossary(this.menu);
    }

    public hide(): void {
        super.hide();
    }

    protected onHideComplete(): void {
        this.quitButton!.setHidden(true);
        this.quitButton!.setClickable(false);
        
        MenuPowerupManager.hideFromGlossary(this.menu);
        MenuImageManager.hideWallImagesFromGlossary(this.menu);
    }

    public getGlossaryTexts(): GlossaryTexts {
        return this.glossaryTexts;
    }
}