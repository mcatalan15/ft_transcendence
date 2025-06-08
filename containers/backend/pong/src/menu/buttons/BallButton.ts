/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BallButton.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:21:53 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/08 21:10:20 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics} from "pixi.js";

import { Menu } from "../Menu";

import { BaseButton, ButtonAnimationConfig, ButtonStyle } from "./BaseButton";

import { MenuButtonConfig } from "../../utils/MenuUtils";
import { getThemeColors } from "../../utils/Utils";

export class BallButton extends BaseButton {
    private onClick: () => void;

    constructor(id: string, layer: string, menu: Menu, onClick: () => void) {
        const config: MenuButtonConfig = {
            text: '',
            color: getThemeColors(menu.config.classicMode).white,
            onClick,
            index: 0
        };
        
        super(id, layer, menu, config);
        this.onClick = onClick;
    }

    protected createButton(): void {
        this.buttonGraphic.clear();
        const radius = this.isHovered ? 80 : 75;
        const color = getThemeColors(this.menu.config.classicMode).white;
        
        this.buttonGraphic.circle(0, 0, radius);
        this.buttonGraphic.fill(color);
    }

    protected getButtonPoints(): number[] {
        return []; // Not applicable for circular button
    }

    protected getButtonDimensions(): { width: number, height: number } {
        const radius = this.isHovered ? 80 : 75;
        return { width: radius * 2, height: radius * 2 };
    }

    protected getTextStyle(): ButtonStyle {
        return {
            fontSize: 24,
            fontFamily: 'monospace',
            fontWeight: 'bold'
        };
    }

    protected getAnimationConfig(): ButtonAnimationConfig {
        return {
            floatSpeed: 1.5,
            floatAmplitude: 8,
            floatOffset: 0
        };
    }

    protected onButtonClick(): void {
        // Ball button specific click logic
    }

    protected highlightOrnament(): void {
        // Ball button doesn't interact with ornaments
    }

    protected resetOrnamentColor(): void {
        // Ball button doesn't interact with ornaments
    }

    protected shouldAddVFXComponent(): boolean {
        return true;
    }

    protected getRenderComponentKey(): string {
        return 'ballButton';
    }

    protected getAnimationComponentKey(): string {
        return 'ballFloat';
    }

    protected handleClick(): void {
        this.onClick();
    }

    public getBallGraphic(): Graphics {
        return this.buttonGraphic;
    }
}