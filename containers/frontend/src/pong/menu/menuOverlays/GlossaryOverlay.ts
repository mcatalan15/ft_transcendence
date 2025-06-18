/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GlossaryOverlay.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:15:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/18 11:58:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Overlay } from "./Overlay";
import { GlossaryTexts } from "./GlossaryTexts";
import { Menu } from "../Menu";
import { MenuPowerupManager } from "../menuManagers/MenuPowerupManager";
import { MenuImageManager } from "../menuManagers/MenuImageManager";
import { GAME_COLORS } from "../../utils/Types";

export class GlossaryOverlay extends Overlay {
    private glossaryTexts!: GlossaryTexts;

    constructor(menu: Menu) {
        super('glossaryOverlay', menu, 0x151515, GAME_COLORS.menuOrange);
        
        this.initialize();
    }

    protected initializeContent(): void {
        this.glossaryTexts = new GlossaryTexts(this.menu, 'glossaryTexts', 'overlays');
        
        this.addContent(this.glossaryTexts, 'overlays');

        MenuPowerupManager.createPowerdowns(this.menu);
        
        MenuPowerupManager.createGlossaryPaddles(this.menu);

        MenuImageManager.createImages(this.menu);

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

        MenuImageManager.prepareWallImagesForGlossary(this.menu);
    }

    public hide(): void {
        super.hide();
    }

    protected onHideComplete(): void {
        MenuPowerupManager.hideFromGlossary(this.menu);
        MenuImageManager.hideWallImagesFromGlossary(this.menu);
    }

    public getGlossaryTexts(): GlossaryTexts {
        return this.glossaryTexts;
    }
}