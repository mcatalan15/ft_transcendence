/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ButtonSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:32:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/06 18:29:46 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "./Menu";

import { System } from "../engine/System";

import { GameEvent } from "../utils/Types";

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
        } else if (event.type === 'GLOSSARY_CLICK') {
            //this.handleGlossaryClick(event, entities);
        } else if (event.type === 'OPTIONS_CLICK') {
            this.handleOptionsClick();
        } else if (event.type === 'ABOUT_CLICK') {
            //this.handleAboutClick(event, entities);
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

        //this.updatePlayButton(entities);
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

    }

    handlePlayClick(){
        //Hide Start Button
        this.menu.startButton.setHidden(false);
        this.menu.menuContainer.addChild(this.menu.startButton.getContainer());

        // Show Play Button
        this.menu.playButton.setClicked(false);
        this.menu.playButton.setHidden(true);
        this.menu.menuHidden.addChild(this.menu.playButton.getContainer());
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
    }

    resetLayer(event: GameEvent){
        if (event.type.includes('START')) {
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
        } else if (event.type.includes('OPTIONS')) {
            this.menu.optionsXButton.setHidden(!this.menu.onlineButton.getIsHidden());
            this.menu.menuHidden.addChild(this.menu.optionsXButton.getContainer());

            this.menu.optionsButton.setHidden(false);
            this.menu.filtersButton.setHidden(true);
            this.menu.classicButton.setHidden(true);

            this.menu.menuContainer.addChild(this.menu.optionsButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.filtersButton.getContainer());
            this.menu.menuHidden.addChild(this.menu.classicButton.getContainer());
        }
    }

    handleLocalClick() {
        console.log('1');
    };

    handleOnlineClick() {
        console.log('2');
    };

    handleIAClick() {
        console.log('3');
    };

    handleDuelClick() {
        console.log('4');
    };

    handleTournamentClick() {
        console.log('5');
    };

    handleFiltersClicked() {
        const text = this.menu.filtersButton.getText();
        const isClicked = this.menu.filtersButton.getIsClicked();

        if (isClicked) {
            this.menu.filtersButton.updateText(text.substring(0, text.indexOf('ON')) + 'OFF');
            this.menu.visualRoot.filters = [];
            this.menu.menuContainer.filters = [];
            this.menu.config.filters = true;
        } else if (!isClicked) {
            this.menu.filtersButton.updateText(text.substring(0, text.indexOf('OFF')) + 'ON')
            this.menu.visualRoot.filters = this.menu.visualRootFilters;
            this.menu.menuContainer.filters = this.menu.menuContainerFilters;
            this.menu.config.filters = false;
        }

        this.menu.filtersButton.setClicked(!this.menu.filtersButton.getIsClicked());
    };

    handleClassicClicked() {
        console.log('7');
    };
}