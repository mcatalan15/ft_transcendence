/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentOverlay.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:20:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 18:46:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { Overlay } from "./Overlay";

import { TournamentTexts } from "./TournamentTexts";
import { OverlayHeader } from "./OverlayHeader";
import { HeaderBar } from "./HeaderBar";
import { Bracket } from "./Bracket";
import { TournamentNextMatchDisplay } from "./TournamentNextMatchDisplay";

import { GAME_COLORS } from "../../utils/Types";
import { TournamentEndDisplay } from "./TournamentEndDisplay";

export class TournamentOverlay extends Overlay {
	tournamentTexts!: TournamentTexts;
	header!: OverlayHeader;
	bracket!: Bracket;
	nextMatchHeader!: HeaderBar;
	dummyButton!: HeaderBar;
	nextMatchDisplay!: TournamentNextMatchDisplay;
	tournamentEndDisplay!: TournamentEndDisplay;

	constructor(menu: Menu) {
		super('tournamentOverlay', menu, 'tournament', 0x151515, GAME_COLORS.menuBlue);
		
		this.menu = menu;
		
		this.initialize();
	}

	protected initializeContent(): void {      
		this.header = new OverlayHeader(this.menu, 'tournamentHeader', 'overlays', 'tournament');
		this.addContent(this.header, 'overlays');

		this.bracket = new Bracket(this.menu, 'tournamentBracket', 'overlays', 8);
		this.addContent(this.bracket, 'overlays');
		for (let i = 0; i < this.bracket.nameCells.length; i++) {
			this.addContent(this.bracket.nameCells[i], 'overlays');
		}

		
		if (this.menu.tournamentManager.getHasActiveTournament() && this.menu.tournamentManager.getTournamentConfig()!.isFinished) {
			this.tournamentEndDisplay = new TournamentEndDisplay(this.menu, 'tournamentEndDisplay', 'overlays');
			this.addContent(this.tournamentEndDisplay, 'overlays');
		}else {
			this.nextMatchDisplay = new TournamentNextMatchDisplay(this.menu, 'nextMatchDisplay', 'overlays');
			this.addContent(this.nextMatchDisplay, 'overlays');
		}

		if (this.menu.tournamentManager.getHasActiveTournament() && this.menu.tournamentManager.getTournamentConfig()!.isFinished) {
			MenuImageManager.createTournamentWinnerAvatar(this.menu);
		} else {
			MenuImageManager.createTournamentAvatars(this.menu);
		}

		this.setQuitButton(this.menu.playQuitButton);
		
		if (this.menu.tournamentInputButtons && this.menu.tournamentInputButtons.length > 0 && !this.menu.tournamentManager.getHasActiveTournament()) {
			this.setTournamentInputButtons(this.menu.tournamentInputButtons);
		}
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

	public getNextMatchDisplay(): TournamentNextMatchDisplay {
	return this.nextMatchDisplay;
}

	public show(): void {	
		this.changeStrokeColor(this.getStrokeColor());
		this.updateOverlayTexts();
		super.show();

		MenuImageManager.prepareTournamentAvatarImages(this.menu);
		
		if (this.menu.tournamentManager.getHasActiveTournament() && this.menu.tournamentManager.getTournamentConfig()!.isFinished) {
			console.log('Tournament is finished, hiding ready button and glossary/filters buttons');
			this.menu.readyButton.setHidden(true);
			this.menu.tournamentGlossaryButton.setHidden(true);
			this.menu.tournamentFiltersButton.setHidden(true);
		} else {
			this.menu.readyButton.setHidden(false);
			this.menu.tournamentGlossaryButton.setHidden(false);
			this.menu.tournamentFiltersButton.setHidden(false);
			this.menu.renderLayers.overlays.addChild(this.menu.readyButton.getContainer());
			this.menu.renderLayers.overlays.addChild(this.menu.tournamentGlossaryButton.getContainer());
			this.menu.renderLayers.overlays.addChild(this.menu.tournamentFiltersButton.getContainer());
		}
		
		if (this.menu.tournamentManager.getHasActiveTournament() && !this.menu.tournamentManager.getTournamentConfig()!.isFinished) {
			this.menu.readyButton.setClickable(true);
		} else {
			this.menu.readyButton.setClickable(false);
		}

		this.quitButton!.setHidden(false);

		if (!this.menu.tournamentManager.getHasActiveTournament()) {
			for (let i = 0; i < this.tournamentInputButtons.length; i++) {
				this.tournamentInputButtons[i].setHidden(false);
				this.tournamentInputButtons[i].setClickable(true);
			}
		}

		if (!this.menu.tournamentManager.getHasActiveTournament() || 
			(this.menu.tournamentManager.getTournamentConfig() && this.menu.tournamentManager.getTournamentConfig()!.isFinished)) {
			this.quitButton!.setClickable(true);
		} else {
			this.quitButton!.setClickable(false);
		}
	}
	
	public hide(): void {
		super.hide();
	}
	
	protected onHideComplete(): void {
		this.menu.menuHidden.addChild(this.menu.readyButton.getContainer());
		this.menu.menuHidden.addChild(this.menu.tournamentGlossaryButton.getContainer());
		this.menu.menuHidden.addChild(this.menu.tournamentFiltersButton.getContainer());
		
		this.menu.readyButton.setHidden(true);
		this.menu.readyButton.setClickable(true);
		this.menu.tournamentGlossaryButton.setHidden(true);
		this.menu.tournamentFiltersButton.setHidden(true);
	
		MenuImageManager.hideTournamentAvatarImages(this.menu);
	
		this.quitButton!.setHidden(true);
		this.quitButton!.setClickable(false);
	
		if (!this.menu.tournamentManager.getHasActiveTournament()) {
			for (let i = 0; i < this.tournamentInputButtons.length; i++) {
				this.tournamentInputButtons[i].setHidden(true);
				this.tournamentInputButtons[i].setClickable(false);
				this.tournamentInputButtons[i].isFilled = false;
				this.tournamentInputButtons[i].getButtonText().alpha = 1;
			}
		}
	}
}