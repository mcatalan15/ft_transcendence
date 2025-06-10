/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButtonSystem.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:32:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/10 16:58:16 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "./Menu";

import { System } from "../engine/System";

import { GameEvent } from "../utils/Types";
import { PongGame } from "../engine/Game";
import { RenderComponent } from "../components/RenderComponent";
import { isBall } from "../utils/Guards";
import { TextComponent } from "../components/TextComponent";

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

        // Show Start HalfButtons
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
        this.menu.glossaryButton.setClicked(!this.menu.glossaryButton.getIsClicked());
        this.menu.glossaryButton.setClickable(!this.menu.glossaryButton.getIsClicked());
        this.menu.glossaryButton.resetButton();

        this.menu.menuHidden.addChild(this.menu.glossaryOrnament.getGraphic());
        this.menu.menuContainer.addChild(this.menu.glossaryClickedOrnament.getGraphic());
        this.menu.redrawFrame();
        
        if (this.menu.glossaryButton.getIsClicked()) {
            if (!this.menu.overlayBackground.getIsDisplayed()) {
                this.menu.renderLayers.overlays.addChild((this.menu.overlayBackground.getComponent('render') as RenderComponent).graphic);
                this.menu.overlayBackground.fadeIn();
                this.menu.overlayBackground.setIsDisplayed(true);
                
                const glossaryText = this.menu.glossaryES.getComponent('text') as TextComponent;
		        this.menu.renderLayers.overlays.addChild(glossaryText.getRenderable());
            }

            if (this.menu.aboutButton.getIsClicked()) {
                this.menu.aboutButton.setClicked(!this.menu.aboutButton.getIsClicked());
                this.menu.aboutButton.resetButton();
            }

            this.menu.menuContainer.addChild(this.menu.glossaryXButton.getContainer());
        }
    }

    handleAboutClick() {
        this.menu.aboutButton.setClicked(!this.menu.aboutButton.getIsClicked());
        this.menu.aboutButton.setClickable(!this.menu.aboutButton.getIsClicked());
        this.menu.aboutButton.resetButton();

        this.menu.menuHidden.addChild(this.menu.aboutOrnament.getGraphic());
        this.menu.menuContainer.addChild(this.menu.aboutClickedOrnament.getGraphic());
        this.menu.redrawFrame();

        if (this.menu.aboutButton.getIsClicked()) {
            if (!this.menu.overlayBackground.getIsDisplayed()) {
                this.menu.renderLayers.overlays.addChild((this.menu.overlayBackground.getComponent('render') as RenderComponent).graphic);
                this.menu.overlayBackground.fadeIn();
                this.menu.overlayBackground.setIsDisplayed(true);
            }

            if (this.menu.glossaryButton.getIsClicked()) {
                this.menu.glossaryButton.setClicked(!this.menu.glossaryButton.getIsClicked());
                this.menu.glossaryButton.resetButton();
            }

            this.menu.menuContainer.addChild(this.menu.aboutXButton.getContainer());
        } 
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
            this.menu.glossaryXButton.setHidden(!this.menu.glossaryButton.getIsHidden());
            this.menu.menuHidden.addChild(this.menu.glossaryXButton.getContainer());

            this.menu.glossaryButton.setClicked(false);
            this.menu.glossaryButton.setClickable(true);
            this.menu.glossaryButton.setHidden(false);

            this.menu.menuContainer.addChild(this.menu.glossaryOrnament.getGraphic());
            this.menu.menuHidden.addChild(this.menu.glossaryClickedOrnament.getGraphic());

            this.menu.overlayBackground.fadeOut();
            this.menu.overlayBackground.setIsDisplayed(false);

            const glossaryText = this.menu.glossaryES.getComponent('text') as TextComponent;
		    this.menu.menuHidden.addChild(glossaryText.getRenderable());
            
            setTimeout(() => {
                if (this.menu.overlayBackground.isAnimationComplete() && 
                    this.menu.overlayBackground.getCurrentAlpha() === 0) {
                    this.menu.menuHidden.addChild((this.menu.overlayBackground.getComponent('render') as RenderComponent).graphic);
                }
            }, 500);

            this.menu.redrawFrame();
            this.menu.glossaryButton.resetButton();
            this.menu.glossaryXButton.resetButton();
        } else if (event.type.includes('ABOUT')) {
            this.menu.aboutXButton.setHidden(!this.menu.aboutButton.getIsHidden());
            this.menu.menuHidden.addChild(this.menu.aboutXButton.getContainer());

            this.menu.aboutButton.setClicked(false);
            this.menu.aboutButton.setClickable(true);
            this.menu.aboutButton.setHidden(false);

            this.menu.menuContainer.addChild(this.menu.aboutOrnament.getGraphic());
            this.menu.menuHidden.addChild(this.menu.aboutClickedOrnament.getGraphic());

            this.menu.overlayBackground.fadeOut();
            this.menu.overlayBackground.setIsDisplayed(false);
            
            setTimeout(() => {
                if (this.menu.overlayBackground.isAnimationComplete() && 
                    this.menu.overlayBackground.getCurrentAlpha() === 0) {
                    this.menu.menuHidden.addChild((this.menu.overlayBackground.getComponent('render') as RenderComponent).graphic);
                }
            }, 500);

            this.menu.redrawFrame();
            this.menu.aboutButton.resetButton();
            this.menu.aboutXButton.resetButton();
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
            this.menu.config.filters = false;
        } else {
            this.menu.filtersButton.updateText(text.substring(0, text.indexOf('OFF')) + 'ON');
            this.menu.visualRoot.filters = this.menu.visualRootFilters;
            this.menu.menuContainer.filters = this.menu.menuContainerFilters;
            this.menu.config.filters = true;
        }
    
        this.menu.filtersButton.setClicked(!this.menu.filtersButton.getIsClicked());
        this.menu.filtersButton.resetButton();
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
    
        menu.startButton.resetButton();
        menu.playButton.resetButton();
        menu.optionsButton.resetButton();
        menu.glossaryButton.resetButton();
        menu.aboutButton.resetButton();
        menu.filtersButton.resetButton();
        menu.classicButton.resetButton();
        menu.onlineButton.resetButton();
        menu.localButton.resetButton();
        menu.IAButton.resetButton();
        menu.duelButton.resetButton();
        menu.tournamentButton.resetButton();
        menu.startXButton.resetButton();
        menu.optionsXButton.resetButton();
        menu.glossaryXButton.resetButton();
        menu.aboutXButton.resetButton();
        
        menu.playOrnament.resetOrnament();
        menu.startOrnament.resetOrnament();
        menu.optionsOrnament.resetOrnament();
        menu.optionsClickedOrnament.resetOrnament();
    
        if (menu.title) {
            menu.title.updateBlockingVisibility();
        }

        const titleORender = this.menu.titleO.getComponent('render') as RenderComponent;

        if (this.menu.config.classicMode) {
            this.menu.menuHidden.addChild(this.menu.ballButton.getContainer());       
            this.menu.renderLayers.logo.addChild(titleORender.graphic);
        } else {
            this.menu.renderLayers.foreground.addChild(this.menu.ballButton.getContainer());
            this.menu.menuHidden.addChild(titleORender.graphic);
        }
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

    cleanup(): void {
        // Clear event queue
        this.menu.eventQueue = [];
        
        // Reset all button states to default
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