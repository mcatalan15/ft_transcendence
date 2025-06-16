/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Overlay.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/16 16:51:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";

import { Menu } from "../Menu";
import { Entity } from "../../engine/Entity";

import { MenuPowerupManager } from "../managers/MenuPowerupManager";
import { MenuImageManager } from "../managers/MenuImageManager";

import { AnimationComponent } from "../../components/AnimationComponent";
import { RenderComponent } from "../../components/RenderComponent";

import { GAME_COLORS } from "../../utils/Types";

export interface OverlayContent {
    entity: Entity;
    layer: string;
}

export abstract class Overlay extends Entity {
    protected menu: Menu;
    protected content: OverlayContent[] = [];
    protected background: Graphics;
    protected quitButton?: any;
    protected isContentInitialized: boolean = false;
    
    // Animation properties
    protected targetAlpha: number = 0;
    protected currentAlpha: number = 0;
    protected animationProgress: number = 0;
    protected animationSpeed: number = 2;
    protected isAnimating: boolean = false;
    protected isDisplayed: boolean = false;

    constructor(id: string, menu: Menu, backgroundColor: number = 0x151515, strokeColor: number = GAME_COLORS.menuOrange) {
        super(id, 'overlays');
        this.menu = menu;
        
        // Create background
        this.background = new Graphics();
        this.background.rect(0, 0, 1635, 600);
        this.background.x = 75;
        this.background.y = 75;
        this.background.fill({ color: backgroundColor, alpha: 1 });
        this.background.stroke({ color: strokeColor, width: 3 });
        this.background.alpha = 0;

        const renderComponent = new RenderComponent(this.background);
        this.addComponent(renderComponent, 'render');

        const animationComponent = new AnimationComponent();
        this.addComponent(animationComponent, 'animation');

    }

    protected abstract initializeContent(): void;
    protected abstract getStrokeColor(): number;
    protected abstract onHideComplete(): void;

    public initialize(): void {
        if (!this.isContentInitialized) {
            this.initializeContent();
            this.isContentInitialized = true;
        }
    }
    
    protected addContent(entity: Entity, layerName: string): void {
        this.content.push({ entity, layer: layerName });
        
        const render = entity.getComponent('render') as RenderComponent;
        if (render && render.graphic) {
            render.graphic.alpha = 0;
        }

        if (entity.getAllRenderables && typeof entity.getAllRenderables === 'function') {
            entity.getAllRenderables().forEach((renderable: any) => {
                if (renderable) renderable.alpha = 0;
            });
        }
    }

    protected setQuitButton(button: any): void {
        this.quitButton = button;
        if (button) {
            button.getContainer().alpha = 0;
        }
    }

    public show(): void {
        this.isDisplayed = true;
        
        this.menu.renderLayers.overlays.addChild(this.background);
        
        this.content.forEach(({ entity, layer }) => {
            const targetLayer = this.menu.renderLayers[layer as keyof typeof this.menu.renderLayers];
            if (targetLayer) {
                const render = entity.getComponent('render') as RenderComponent;
                if (render && render.graphic) {
                    targetLayer.addChild(render.graphic);
                }

                if (entity.getAllRenderables && typeof entity.getAllRenderables === 'function') {
                    entity.getAllRenderables().forEach((renderable: any) => {
                        if (renderable && targetLayer) {
                            targetLayer.addChild(renderable);
                        }
                    });
                }
            }
        });

        if (this.quitButton) {
            this.menu.renderLayers.overlayQuits.addChild(this.quitButton.getContainer());
        }

        this.fadeIn();
    }

    public hide(): void {
        this.fadeOut(() => {
            this.isDisplayed = false;
            
            this.menu.menuHidden.addChild(this.background);
            
            this.content.forEach(({ entity }) => {
                const render = entity.getComponent('render') as RenderComponent;
                if (render && render.graphic) {
                    this.menu.menuHidden.addChild(render.graphic);
                }

                if (entity.getAllRenderables && typeof entity.getAllRenderables === 'function') {
                    entity.getAllRenderables().forEach((renderable: any) => {
                        if (renderable) {
                            this.menu.menuHidden.addChild(renderable);
                        }
                    });
                }
            });

            if (this.quitButton) {
                this.menu.menuHidden.addChild(this.quitButton.getContainer());
            }
        });
    }

    private fadeIn(): void {
        this.targetAlpha = 1;
        this.animationProgress = 0;
        this.currentAlpha = 0;
        this.isAnimating = true;
        

        this.resetAllAlphas();
    }

    private fadeOut(onComplete?: () => void): void {
        this.targetAlpha = 0;
        this.animationProgress = 0;
        this.isAnimating = true;
        
        this.animateToTarget(() => {
            this.isDisplayed = false;
            
            this.menu.menuHidden.addChild(this.background);
            
            this.content.forEach(({ entity }) => {
                const render = entity.getComponent('render') as RenderComponent;
                if (render && render.graphic) {
                    this.menu.menuHidden.addChild(render.graphic);
                }
    
                if (entity.getAllRenderables && typeof entity.getAllRenderables === 'function') {
                    entity.getAllRenderables().forEach((renderable: any) => {
                        if (renderable) {
                            this.menu.menuHidden.addChild(renderable);
                        }
                    });
                }
            });
    
            if (this.quitButton) {
                this.menu.menuHidden.addChild(this.quitButton.getContainer());
            }
    
            this.onHideComplete();
            
            if (onComplete) onComplete();
        });
    }

    private resetAllAlphas(): void {
        this.background.alpha = 0;
        
        this.content.forEach(({ entity }) => {
            const render = entity.getComponent('render') as RenderComponent;
            if (render && render.graphic) {
                render.graphic.alpha = 0;
            }

            if (entity.getAllRenderables && typeof entity.getAllRenderables === 'function') {
                entity.getAllRenderables().forEach((renderable: any) => {
                    if (renderable) renderable.alpha = 0;
                });
            }
        });

        if (this.quitButton) {
            this.quitButton.getContainer().alpha = 0;
        }
        
        this.animateToTarget();
    }

    private animateToTarget(onComplete?: () => void): void {
        const animate = () => {
            this.animationProgress += this.animationSpeed * (1/60);
            this.animationProgress = Math.min(this.animationProgress, 1.0);

            const easedProgress = this.easeInOutCubic(this.animationProgress);
            const startAlpha = this.targetAlpha === 1 ? 0 : 1;
            this.currentAlpha = startAlpha + (this.targetAlpha - startAlpha) * easedProgress;

            this.updateAllAlphas(this.currentAlpha);

            if (this.animationProgress >= 1.0) {
                this.isAnimating = false;
                this.currentAlpha = this.targetAlpha;
                this.updateAllAlphas(this.currentAlpha);
                
                if (onComplete) onComplete();
            } else {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    private updateAllAlphas(alpha: number): void {
        this.background.alpha = alpha;

        this.content.forEach(({ entity }) => {
            const render = entity.getComponent('render') as RenderComponent;
            if (render && render.graphic) {
                render.graphic.alpha = alpha;
            }

            if (entity.getAllRenderables && typeof entity.getAllRenderables === 'function') {
                entity.getAllRenderables().forEach((renderable: any) => {
                    if (renderable) renderable.alpha = alpha;
                });
            }
        });

        if (this.quitButton) {
            this.quitButton.getContainer().alpha = alpha;
        }

        if (this.id === 'glossaryOverlay') {
            this.updatePowerupAlphas(alpha);
            this.updateWallImageAlphas(alpha);
        } else if (this.id === 'aboutOverlay') {
            this.updateAvatarImageAlphas(alpha); // Add avatar alpha updates for About overlay
        }
    }

    private updatePowerupAlphas(alpha: number): void {       
        MenuPowerupManager.powerupEntities?.forEach((powerup: any) => {
            if (powerup.id === 'paddleL' || powerup.id === 'paddleR') {
                const renderComponent = powerup.getComponent('render');
                const textComponent = powerup.getComponent('text');
                
                if (renderComponent && renderComponent.graphic) {
                    renderComponent.graphic.alpha = alpha;
                }
                
                if (textComponent && textComponent.getRenderable()) {
                    const textRenderable = textComponent.getRenderable();
                    textRenderable.alpha = alpha;
                }
            } else {
                const renderComponent = powerup.getComponent('render');
                if (renderComponent && renderComponent.graphic) {
                    renderComponent.graphic.alpha = alpha;
                }
            }
        });
    }

    private updateWallImageAlphas(alpha: number): void {
        const wallImages = MenuImageManager.getAllWallImages();
        wallImages.forEach((wallImage: any) => {
            if (wallImage) {
                wallImage.alpha = alpha;
            }
        });
    }

    private updateAvatarImageAlphas(alpha: number): void {
        const avatarImages = MenuImageManager.getAllAvatarImages();
        avatarImages.forEach((avatarImage: any) => {
            if (avatarImage) {
                avatarImage.alpha = alpha;
            }
        });
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    public isAnimationComplete(): boolean {
        return !this.isAnimating;
    }

    public getIsAnimating(): boolean {
        return this.isAnimating;
    }

    public getCurrentAlpha(): number {
        return this.currentAlpha;
    }

    public getIsDisplayed(): boolean {
        return this.isDisplayed;
    }

    public changeStrokeColor(color: number): void {
        this.background.clear();
        this.background.rect(0, 0, 1635, 600);
        this.background.x = 75;
        this.background.y = 75;
        this.background.fill({ color: 0x151515, alpha: 1 });
        this.background.stroke({ color: color, width: 3 });
        this.background.alpha = this.currentAlpha;
    }

    // Cleanup
    public cleanup(): void {
        this.content.forEach(({ entity }) => {
            const render = entity.getComponent('render') as RenderComponent;
            if (render && render.graphic) {
                if (render.graphic.parent) {
                    render.graphic.parent.removeChild(render.graphic);
                }
                render.graphic.destroy();
            }
        });
        
        if (this.background && this.background.parent) {
            this.background.parent.removeChild(this.background);
            this.background.destroy();
        }
    }
}