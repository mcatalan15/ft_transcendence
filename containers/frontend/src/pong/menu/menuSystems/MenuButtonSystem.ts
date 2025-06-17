/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButtonSystem.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:32:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/17 14:53:57 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { System } from "../../engine/System";

import { Paddle } from "../../entities/Paddle";

import { GAME_COLORS, GameEvent } from "../../utils/Types";
import { PongGame } from "../../engine/Game";
import { RenderComponent } from "../../components/RenderComponent";
import { isBall } from "../../utils/Guards";

import { ShootPowerup } from "../../entities/powerups/ShootPowerup";
import { EnlargePowerup } from "../../entities/powerups/EnlargePowerup";
import { MagnetizePowerup } from "../../entities/powerups/MagnetizePowerup";
import { ShieldPowerup } from "../../entities/powerups/ShieldPowerUp";
import { ShrinkPowerDown } from "../../entities/powerups/ShrinkPowerDown";
import { InvertPowerDown } from "../../entities/powerups/InvertPowerDown";
import { FlatPowerDown } from "../../entities/powerups/FlatPowerDown";
import { SlowPowerDown } from "../../entities/powerups/SlowPowerDown";
import { CurveBallPowerup } from "../../entities/powerups/CurveBallPowerup";
import { SpinBallPowerup } from "../../entities/powerups/SpinBallPowerup";
import { BurstBallPowerup } from "../../entities/powerups/BurstBallPowerup";
import { MultiplyBallPowerup } from "../../entities/powerups/MultiplyBallPowerup";

export class ButtonSystem implements System {
    private menu: Menu;

    constructor(menu: Menu) {
        this.menu = menu;
    }

    update(): void {
        const unhandledEvents = [];

        while (this.menu.eventQueue.length > 0) {
            const event = this.menu.eventQueue.shift() as GameEvent;
            
            if (event.type === 'START_CLICK') {
                this.handleStartClick();
            } else if (event.type === 'OPTIONS_CLICK') {
                this.handleOptionsClick();
            } else if (event.type === 'GLOSSARY_CLICK') {
                this.handleGlossaryClick();
            } else if (event.type === 'ABOUT_CLICK') {
                this.handleAboutClick();
            } else if (event.type === 'PLAY_CLICK') {
                this.handlePlayClick();
            } else if (event.type === 'ONLINE_CLICK') {
                this.handleOnlineClick();
            } else if (event.type === 'LOCAL_CLICK') {
                this.handleLocalClick();
            } else if (event.type === 'IA_CLICK') {
                this.handleIAClick();
            } else if (event.type === 'DUEL_CLICK') {
                this.handleDuelClick();
            } else if (event.type === 'TOURNAMENT_CLICK') {
                this.handleTournamentClick();
            } else if (event.type === 'FILTERS_CLICK') {
                this.handleFiltersClicked();
            } else if (event.type === 'CLASSIC_CLICK') {
                this.handleClassicClicked();
            } else if (event.type === 'GLOSSARY_ESC' || event.type === 'ABOUT_ESC') {
                this.resetLayer(event);
            } else if (event.type.endsWith('BACK')) {
                this.resetLayer(event);
            } else {
                unhandledEvents.push(event);
            }
        }
        
        this.menu.eventQueue.push(...unhandledEvents);
    }

    handleStartClick(){
        //Hide Start Button
        this.menu.startButton.setHidden(true);
        this.menu.menuHidden.addChild(this.menu.startButton.getContainer());

        // Show Play Button
        this.menu.playButton.setClicked(false);
        this.menu.playButton.setHidden(false);
        this.menu.menuContainer.addChild(this.menu.playButton.getContainer());

        this.menu.onlineButton.setHidden(!this.menu.onlineButton.getIsHidden());
        this.menu.localButton.setHidden(!this.menu.localButton.getIsHidden());
        this.menu.IAButton.setHidden(!this.menu.IAButton.getIsHidden());
        this.menu.duelButton.setHidden(!this.menu.duelButton.getIsHidden());
        this.menu.startXButton.setHidden(!this.menu.startXButton.getIsHidden());

        this.menu.menuContainer.addChild(this.menu.onlineButton.getContainer());
        this.menu.menuContainer.addChild(this.menu.localButton.getContainer());
        this.menu.menuContainer.addChild(this.menu.IAButton.getContainer());
        this.menu.menuContainer.addChild(this.menu.duelButton.getContainer());
        this.menu.menuContainer.addChild(this.menu.startXButton.getContainer());

        this.menu.menuHidden.addChild(this.menu.startOrnament.getGraphic());
        this.menu.menuContainer.addChild(this.menu.playOrnament.getGraphic());
        this.menu.redrawFrame();
    }

    handlePlayClick(){
        this.menu.cleanup();

        this.setFinalConfig();

        const game = new PongGame(this.menu.app, this.menu.config); //! send menu config to the game
        game.init();
    }

    handleOptionsClick() {
        this.menu.optionsButton.setHidden(true);
        this.menu.menuHidden.addChild(this.menu.optionsButton.getContainer());

        this.menu.filtersButton.setHidden(false);
        this.menu.menuContainer.addChild(this.menu.filtersButton.getContainer());

        this.menu.classicButton.setHidden(false);
        this.menu.menuContainer.addChild(this.menu.classicButton.getContainer());

        this.menu.optionsXButton.setHidden(false);
        this.menu.menuContainer.addChild(this.menu.optionsXButton.getContainer());

        this.menu.menuHidden.addChild(this.menu.optionsOrnament.getGraphic());
        this.menu.menuContainer.addChild(this.menu.optionsClickedOrnament.getGraphic());
    }

    handleGlossaryClick() {
        this.menu.glossaryButton.setClicked(true);
        this.menu.glossaryOverlay.show();
        this.setButtonsClickability(false);
    }

    handleAboutClick() {
        this.menu.aboutButton.setClicked(true);
        this.menu.aboutOverlay.show();
        this.setButtonsClickability(false);
    }

    resetLayer(event: GameEvent){
        if (event.type.includes('START')) {
            this.resetStartOptions();

            this.menu.startXButton.setHidden(true);
            this.menu.menuHidden.addChild(this.menu.startXButton.getContainer());

            this.menu.startButton.setHidden(false);
            this.menu.playButton.setHidden(true);
            this.menu.menuContainer.addChild(this.menu.startButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.playButton.getContainer());

            this.menu.onlineButton.setHidden(true);
            this.menu.localButton.setHidden(true);
            this.menu.IAButton.setHidden(true);
            this.menu.duelButton.setHidden(true);
            this.menu.tournamentButton.setHidden(true);

            this.menu.menuHidden.addChild(this.menu.onlineButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.localButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.IAButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.duelButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.tournamentButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.startXButton.getContainer());

            this.menu.menuContainer.addChild(this.menu.startOrnament.getGraphic());
            this.menu.menuHidden.addChild(this.menu.playOrnament.getGraphic());
            this.menu.redrawFrame();

            this.menu.startButton.resetButton();
            this.menu.startXButton.resetButton();
        } else if (event.type.includes('OPTIONS')) {
            this.menu.optionsXButton.setHidden(!this.menu.onlineButton.getIsHidden());
            this.menu.menuHidden.addChild(this.menu.optionsXButton.getContainer());

            this.menu.optionsButton.setHidden(false);
            this.menu.filtersButton.setHidden(true);
            this.menu.classicButton.setHidden(true);

            this.menu.menuContainer.addChild(this.menu.optionsButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.filtersButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.classicButton.getContainer());

            this.menu.menuContainer.addChild(this.menu.optionsOrnament.getGraphic());
            this.menu.menuHidden.addChild(this.menu.optionsClickedOrnament.getGraphic());
            this.menu.redrawFrame();

            this.menu.optionsButton.resetButton();
            this.menu.optionsXButton.resetButton();
        } else if (event.type.includes('GLOSSARY')) {
            this.setButtonsClickability(true)

            this.menu.glossaryButton.setClicked(false);

            this.menu.glossaryButton.resetButton();
            this.menu.glossaryQuitButton.resetButton();
            
            this.menu.glossaryOverlay.hide();
        } else if (event.type.includes('ABOUT')) {
            this.setButtonsClickability(true);
            
            this.menu.aboutButton.setClicked(false);

            this.menu.aboutButton.resetButton();
            this.menu.aboutQuitButton.resetButton();
            
            this.menu.aboutOverlay.hide();

            this.setButtonsClickability(true);
        }
    }

    handleLocalClick() {
        this.menu.localButton.setClicked(!this.menu.localButton.getIsClicked());
        
        if (this.menu.onlineButton.getIsClicked()) {
            this.menu.onlineButton.setClicked(!this.menu.onlineButton.getIsClicked());
        }

        if (this.menu.localButton.getIsClicked()) {
            this.menu.config.mode = 'local';
            this.menu.menuHidden.addChild(this.menu.tournamentButton.getContainer());
            this.menu.menuContainer.addChild(this.menu.IAButton.getContainer());
        }

        this.menu.localButton.resetButton();
        this.menu.onlineButton.resetButton();

        this.updatePlayButtonState();
    };

    handleOnlineClick() {
        this.menu.onlineButton.setClicked(!this.menu.onlineButton.getIsClicked());

        if (this.menu.localButton.getIsClicked()) {
            this.menu.localButton.setClicked(!this.menu.localButton.getIsClicked());
        }

        if (this.menu.onlineButton.getIsClicked()) {
            this.menu.config.mode = 'online';
            this.menu.menuContainer.addChild(this.menu.tournamentButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.IAButton.getContainer());
        }

        this.menu.localButton.resetButton();
        this.menu.onlineButton.resetButton();

        this.updatePlayButtonState();
    };

    handleIAClick() {
        this.menu.IAButton.setClicked(!this.menu.IAButton.getIsClicked());

        if (this.menu.duelButton.getIsClicked()) {
            this.menu.duelButton.setClicked(!this.menu.duelButton.getIsClicked());
        }

        if (this.menu.IAButton.getIsClicked()) {
            this.menu.config.variant = '1vAI';
        }

        this.menu.IAButton.resetButton();
        this.menu.duelButton.resetButton();

        this.updatePlayButtonState();
    };

    handleDuelClick() {
        this.menu.duelButton.setClicked(!this.menu.duelButton.getIsClicked());

        if (this.menu.IAButton.getIsClicked()) {
            this.menu.IAButton.setClicked(!this.menu.IAButton.getIsClicked());
        } else if (this.menu.tournamentButton.getIsClicked()) {
            this.menu.tournamentButton.setClicked(!this.menu.tournamentButton.getIsClicked());
        }

        if (this.menu.duelButton.getIsClicked()) {
            this.menu.config.variant = '1v1';
        }

        this.menu.duelButton.resetButton();
        this.menu.IAButton.resetButton();
        this.menu.tournamentButton.resetButton();

        this.updatePlayButtonState();
    };

    handleTournamentClick() {
        this.menu.tournamentButton.setClicked(!this.menu.tournamentButton.getIsClicked());

        if (this.menu.duelButton.getIsClicked()) {
            this.menu.duelButton.setClicked(!this.menu.duelButton.getIsClicked());
        }

        if (this.menu.tournamentButton.getIsClicked()) {    
            this.menu.config.mode = 'online';
            this.menu.config.variant = 'tournament';
        }

        this.menu.tournamentButton.resetButton();
        this.menu.duelButton.resetButton();

        this.updatePlayButtonState();
    };

    handleFiltersClicked() {
        const text = this.menu.filtersButton.getText();
        const isClicked = this.menu.filtersButton.getIsClicked();
    
        if (isClicked) {
            this.menu.filtersButton.updateText(text.substring(0, text.indexOf('ON')) + 'OFF');
            this.menu.visualRoot.filters = [];
            this.menu.menuContainer.filters = [];
            this.menu.renderLayers.overlays.filters = [];
            this.menu.renderLayers.powerups.filters = [];
            this.menu.renderLayers.powerdowns.filters = [];
            this.menu.renderLayers.ballchanges.filters = [];
            this.menu.renderLayers.overlayQuits.filters = [];
            this.menu.config.filters = false;
        } else {
            this.menu.filtersButton.updateText(text.substring(0, text.indexOf('OFF')) + 'ON');
            this.menu.visualRoot.filters = this.menu.baseFilters;
            this.menu.menuContainer.filters = this.menu.baseFilters;
            this.menu.renderLayers.overlays.filters = this.menu.baseFilters;
            this.menu.renderLayers.overlayQuits.filters = this.menu.baseFilters;
            
            if (this.menu.config.classicMode) {
                this.menu.renderLayers.powerups.filters = this.menu.powerupClassicFilters;
                this.menu.renderLayers.powerdowns.filters = this.menu.powerupClassicFilters;
                this.menu.renderLayers.ballchanges.filters = this.menu.powerupClassicFilters;
            } else {
                this.menu.renderLayers.powerups.filters = this.menu.powerupFilters;
                this.menu.renderLayers.powerdowns.filters = this.menu.powerdownFilters;
                this.menu.renderLayers.ballchanges.filters = this.menu.ballchangeFilters;
            }

            this.menu.config.filters = true;
        }
    
        this.menu.filtersButton.setClicked(!this.menu.filtersButton.getIsClicked());
        this.menu.filtersButton.resetButton();

        this.updatePowerups();
        this.updatePaddles();
    }

    resetStartOptions() {
        this.menu.localButton.setClicked(true);
        this.menu.onlineButton.setClicked(false);
        this.menu.IAButton.setClicked(false);
        this.menu.duelButton.setClicked(false);
        this.menu.tournamentButton.setClicked(false);

        this.menu.onlineButton.resetButton();
        this.menu.localButton.resetButton();
        this.menu.IAButton.resetButton();
        this.menu.duelButton.resetButton();
        this.menu.tournamentButton.resetButton();

        this.menu.localButton.setHidden(false);
        this.menu.onlineButton.setHidden(false);
        this.menu.IAButton.setHidden(false);
        this.menu.duelButton.setHidden(false);
        this.menu.tournamentButton.setHidden(true);

        this.menu.startXButton.setHidden(true); 
    }

    handleClassicClicked() {
        this.menu.config.classicMode = !this.menu.config.classicMode;
        this.menu.ballAmount = 0;
    
        const text = this.menu.classicButton.getText();
        const isClicked = this.menu.classicButton.getIsClicked();
    
        if (isClicked) {
            this.menu.classicButton.updateText(text.substring(0, text.indexOf('ON')) + 'OFF');
        } else if (!isClicked) {
            this.menu.classicButton.updateText(text.substring(0, text.indexOf('OFF')) + 'ON');
        }
    
        this.menu.classicButton.setClicked(!this.menu.classicButton.getIsClicked());
    
        const menu = this.menu;

        const entitiesToRemove: string[] = [];

        for (const entity of this.menu.entities) {
            if (isBall(entity)) {
                entitiesToRemove.push(entity.id);
            }
        }

        for (const id of entitiesToRemove) {
            this.menu.removeEntity(id);
        }

        this.resetButtons();

    
        if (menu.title) {
            menu.title.updateBlockingVisibility();
        }

        const titleORender = this.menu.titleO.getComponent('render') as RenderComponent;

        if (this.menu.config.classicMode) {
            this.menu.menuHidden.addChild(this.menu.ballButton.getContainer());       
            this.menu.renderLayers.logo.addChild(titleORender.graphic);
            this.menu.glossaryOverlay.changeStrokeColor(GAME_COLORS.white);

            if (this.menu.config.filters) {
                this.menu.renderLayers.powerups.filters = this.menu.powerupClassicFilters;
                this.menu.renderLayers.powerdowns.filters = this.menu.powerupClassicFilters;
                this.menu.renderLayers.ballchanges.filters = this.menu.powerupClassicFilters;
            }
        } else {
            this.menu.renderLayers.foreground.addChild(this.menu.ballButton.getContainer());
            this.menu.menuHidden.addChild(titleORender.graphic);
            if (this.menu.glossaryButton.getIsClicked()) {
                this.menu.overlayBackground.changeStrokeColor(GAME_COLORS.menuOrange);
            } else if (this.menu.aboutButton.getIsClicked()) {
                this.menu.overlayBackground.changeStrokeColor(GAME_COLORS.menuPink);
            }

            if (this.menu.config.filters) {
                this.menu.renderLayers.powerups.filters = this.menu.powerupFilters;
                this.menu.renderLayers.powerdowns.filters = this.menu.powerdownFilters;
                this.menu.renderLayers.ballchanges.filters = this.menu.ballchangeFilters;
            }
        }

        this.updatePowerups();
        this.updatePaddles();
        this.menu.glossaryOverlay.redrawTitles();
        this.menu.aboutOverlay.redrawTitles();
    }

    public updatePlayButtonState(): void {
        let shouldBeClickable = false;
        
        if (this.menu.localButton.getIsClicked()) {
            shouldBeClickable = this.menu.IAButton.getIsClicked() || this.menu.duelButton.getIsClicked();
        } else if (this.menu.onlineButton.getIsClicked()) {
            shouldBeClickable = this.menu.tournamentButton.getIsClicked() || this.menu.duelButton.getIsClicked();
        }
        
        const playButton = this.menu.playButton;
        const wasClickable = playButton.getIsClickable();
        
        if (wasClickable !== shouldBeClickable) {
            playButton.setClickable(shouldBeClickable);
            
            if (shouldBeClickable) {
                playButton.getContainer().eventMode = 'static';
                playButton.getContainer().cursor = 'pointer';
                playButton.setClicked(false);
                
                // Remove old listeners and add new ones
                playButton.getContainer().removeAllListeners();
                playButton.setupEventHandlers();
            } else {
                playButton.getContainer().eventMode = 'none';
                playButton.getContainer().cursor = 'default';
                playButton.setClicked(true);
                playButton.getContainer().removeAllListeners();
            }
            
            playButton.resetButton();
        }
    }

    resetButtons(resetPlay: boolean = true): void {
        this.menu.startButton.resetButton();
        this.menu.optionsButton.resetButton();
        this.menu.glossaryButton.resetButton();
        this.menu.aboutButton.resetButton();
        this.menu.filtersButton.resetButton();
        this.menu.classicButton.resetButton();
        this.menu.onlineButton.resetButton();
        this.menu.localButton.resetButton();
        this.menu.IAButton.resetButton();
        this.menu.duelButton.resetButton();
        this.menu.tournamentButton.resetButton();
        this.menu.startXButton.resetButton();
        this.menu.optionsXButton.resetButton();
        this.menu.glossaryQuitButton.resetButton();
        this.menu.aboutQuitButton.resetButton();
        
        this.menu.playOrnament.resetOrnament();
        this.menu.startOrnament.resetOrnament();
        this.menu.optionsOrnament.resetOrnament();
        this.menu.optionsClickedOrnament.resetOrnament();

        if (resetPlay) {
            this.menu.playButton.resetButton();
        }
    }

    updatePowerups() {
        (this.menu.enlargePowerup as EnlargePowerup).redrawPowerup();
        (this.menu.magnetizePowerup as MagnetizePowerup).redrawPowerup();
        (this.menu.shieldPowerup as ShieldPowerup).redrawPowerup();
        (this.menu.shootPowerup as ShootPowerup).redrawPowerup();

        (this.menu.shrinkPowerdown as ShrinkPowerDown).redrawPowerup();
        (this.menu.invertPowerdown as InvertPowerDown).redrawPowerup();
        (this.menu.flattenPowerdown as FlatPowerDown).redrawPowerup();
        (this.menu.slowPowerdown as SlowPowerDown).redrawPowerup();

        (this.menu.curveBallChange as CurveBallPowerup).redrawPowerup();
        (this.menu.spinBallChange as SpinBallPowerup).redrawPowerup();
        (this.menu.burstBallChange as BurstBallPowerup).redrawPowerup();
        (this.menu.multiplyBallChange as MultiplyBallPowerup).redrawPowerup();
    }

    updatePaddles() {
        (this.menu.paddleL as Paddle).redrawFullPaddle(true, 'powerup');
        (this.menu.paddleR as Paddle).redrawFullPaddle(true, 'powerdown');
    }

    setButtonsClickability(clickable: boolean): void {       
        this.menu.startButton.setClickable(clickable);
        this.menu.optionsButton.setClickable(clickable);
        this.menu.glossaryButton.setClickable(clickable);
        this.menu.aboutButton.setClickable(clickable);
        this.menu.localButton.setClickable(clickable);
        this.menu.onlineButton.setClickable(clickable);
        this.menu.IAButton.setClickable(clickable);
        this.menu.duelButton.setClickable(clickable);
        this.menu.tournamentButton.setClickable(clickable);
        this.menu.filtersButton.setClickable(clickable);
        this.menu.classicButton.setClickable(clickable);
        this.menu.startXButton.setClickable(clickable);
        this.menu.optionsXButton.setClickable(clickable);
        this.menu.ballButton.setClickable(clickable);
        
        if (clickable) {
            this.updatePlayButtonState();
        } else {
            this.menu.playButton.setClickable(false);
        }
    }

    cleanup(): void {
        this.menu.eventQueue = [];
        
        if (this.menu.startButton) this.menu.startButton.resetButton();
        if (this.menu.playButton) this.menu.playButton.resetButton();
        if (this.menu.optionsButton) this.menu.optionsButton.resetButton();
        if (this.menu.glossaryButton) this.menu.glossaryButton.resetButton();
        if (this.menu.aboutButton) this.menu.aboutButton.resetButton();
        if (this.menu.localButton) this.menu.localButton.resetButton();
        if (this.menu.onlineButton) this.menu.onlineButton.resetButton();
        if (this.menu.IAButton) this.menu.IAButton.resetButton();
        if (this.menu.duelButton) this.menu.duelButton.resetButton();
        if (this.menu.tournamentButton) this.menu.tournamentButton.resetButton();
        if (this.menu.filtersButton) this.menu.filtersButton.resetButton();
        if (this.menu.classicButton) this.menu.classicButton.resetButton();
        if (this.menu.startXButton) this.menu.startXButton.resetButton();
        if (this.menu.optionsXButton) this.menu.optionsXButton.resetButton();
        if (this.menu.ballButton) this.menu.ballButton.resetButton();
    }

    protected setFinalConfig() {
        if (this.menu.localButton.getIsClicked()) {
            this.menu.config.mode = 'local';
            if (this.menu.IAButton.getIsClicked()) {
                this.menu.config.variant = '1vAI';
            } else if (this.menu.duelButton.getIsClicked()) {
                this.menu.config.variant = '1v1';
            }
        } else if (this.menu.onlineButton.getIsClicked()) {
            this.menu.config.mode = 'online';
            if (this.menu.tournamentButton.getIsClicked()) {
                this.menu.config.variant = 'tournament';
            } else if (this.menu.duelButton.getIsClicked()) {
                this.menu.config.variant = '1v1';
            }
        }
    }
}