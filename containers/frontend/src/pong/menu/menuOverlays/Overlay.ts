/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Overlay.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/13 19:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 11:50:19 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";

import { Menu } from "../Menu";
import { Entity } from "../../engine/Entity";

import { MenuPowerupManager } from "../menuManagers/MenuPowerupManager";
import { MenuImageManager } from "../menuManagers/MenuImageManager";

import { AnimationComponent } from "../../components/AnimationComponent";
import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { MenuBigInputButton } from "../menuButtons/MenuBigInputButton";
import { MenuSmallInputButton } from "../menuButtons/MenuSmallInputButton";

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
	protected readyButton?: any;
	protected inputButton?: MenuBigInputButton;
	protected tournamentInputButtons: MenuSmallInputButton[] = [];
	protected isContentInitialized: boolean = false;
	protected overlayType: string;
	
	// Animation properties
	protected targetAlpha: number = 0;
	protected currentAlpha: number = 0;
	protected animationProgress: number = 0;
	protected animationSpeed: number = 2;
	public isAnimating: boolean = false;
	protected isDisplayed: boolean = false;

	constructor(id: string, menu: Menu, overlayType: string, backgroundColor: number = 0x151515, strokeColor: number = GAME_COLORS.menuOrange) {
		super(id, 'overlays');
		this.menu = menu;
		this.overlayType = overlayType;
		
		// Create background
		this.background = new Graphics();
		this.background.rect(0, 0, 1635, 600);
		this.background.x = 75;
		this.background.y = 75;
		this.background.fill({ color: backgroundColor, alpha: 1 });
		//this.background.stroke({ color: strokeColor, width: 3 });
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

	protected setReadyButton(button: any): void {
		this.readyButton = button;
		if (button) {
			button.getContainer().alpha = 0;
		}
	}

	protected setPlayInputButton(button: MenuBigInputButton): void {
		this.inputButton = button;
		if (button) {
			button.getContainer().alpha = 0;
		}
	}

	protected setTournamentInputButtons(buttons: MenuSmallInputButton[]): void {
        this.tournamentInputButtons = buttons;
        for (const button of buttons) {
            if (button) {
                this.menu.renderLayers.overlays.addChild(button.getContainer());
                button.getContainer().alpha = 0;
                button.setHidden(true);
            }
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

		if (this.inputButton && this.menu.config.variant === '1v1' && this.menu.config.mode !== 'online') {
			this.menu.renderLayers.overlays.addChild(this.inputButton.getContainer());
		}

		if (this.tournamentInputButtons && this.menu.config.variant === 'tournament') {
			this.tournamentInputButtons.forEach(button => {
				if (button) {
					this.menu.renderLayers.overlays.addChild(button.getContainer());
					button.getContainer().alpha = 0;
				}
			});
		}

		this.fadeIn();
	}

	public hide(onComplete?: () => void): void {
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
	
			if (this.inputButton) {
				this.menu.menuHidden.addChild(this.inputButton.getContainer());
			}
	
			if (this.tournamentInputButtons) {
				this.tournamentInputButtons.forEach(button => {
					if (button) {
						this.menu.menuHidden.addChild(button.getContainer());
					}
				});
			}
	
			this.onHideComplete();
			
			if (onComplete) onComplete();
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

			if (this.inputButton) {
				this.menu.menuHidden.addChild(this.inputButton.getContainer());
			}
	
			this.onHideComplete();
			
			if (onComplete) onComplete();
		});
	}

	private getAllCurrentElements(): any[] {
		const elements: any[] = [];
		
		elements.push(this.background);
		
		this.content.forEach(({ entity }) => {
			const render = entity.getComponent('render') as RenderComponent;
			if (render && render.graphic) {
				elements.push(render.graphic);
			}

			if (entity.getAllRenderables && typeof entity.getAllRenderables === 'function') {
				entity.getAllRenderables().forEach((renderable: any) => {
					if (renderable) elements.push(renderable);
				});
			}

			const textComponent = entity.getComponent('text') as TextComponent;
			if (textComponent && textComponent.getRenderable()) {
				elements.push(textComponent.getRenderable());
			}
		});

		if (this.quitButton) {
			elements.push(this.quitButton.getContainer());
		}

		if (this.inputButton) {
			elements.push(this.inputButton.getContainer());
		}

		if (this.tournamentInputButtons) {
			this.tournamentInputButtons.forEach(button => {
				if (button) {
					elements.push(button.getContainer());
				}
			});
		}

		if (this.overlayType === 'play') {
			const playAvatars = MenuImageManager.getAllPlayAvatarImages();
			playAvatars.forEach((avatar: any) => {
				if (avatar) {
					if (!avatar.parent) {
						this.menu.renderLayers.overlays.addChild(avatar);
					}
					elements.push(avatar);
				}
			});
			
			if (this.menu.readyButton) elements.push(this.menu.readyButton.getContainer());
			if (this.menu.tournamentGlossaryButton) elements.push(this.menu.tournamentGlossaryButton.getContainer());
			if (this.menu.tournamentFiltersButton) elements.push(this.menu.tournamentFiltersButton.getContainer());
		} else if (this.overlayType === 'tournament') {
			const tournamentAvatars = MenuImageManager.getAllTournamentAvatarImages();
			tournamentAvatars.forEach((avatar: any) => {
				if (avatar) {
					if (!avatar.parent) {
						this.menu.renderLayers.overlays.addChild(avatar);
					}
					elements.push(avatar);
				}
			});
			
			if (!(this.menu.tournamentManager.getHasActiveTournament() && this.menu.tournamentManager.getTournamentConfig()!.isFinished)) {
				if (this.menu.readyButton) elements.push(this.menu.readyButton.getContainer());
				if (this.menu.tournamentGlossaryButton) elements.push(this.menu.tournamentGlossaryButton.getContainer());
				if (this.menu.tournamentFiltersButton) elements.push(this.menu.tournamentFiltersButton.getContainer());
			}
		} else if (this.overlayType === 'glossary') {
			const wallImages = MenuImageManager.getAllWallImages();
			wallImages.forEach((image: any) => {
				if (image) {
					if (!image.parent) {
						this.menu.renderLayers.overlays.addChild(image);
					}
					elements.push(image);
				}
			});
			
			MenuPowerupManager.powerupEntities?.forEach((powerup: any) => {
				const renderComponent = powerup.getComponent('render');
				if (renderComponent && renderComponent.graphic) {
					elements.push(renderComponent.graphic);
				}
				
				const textComponent = powerup.getComponent('text');
				if (textComponent && textComponent.getRenderable()) {
					elements.push(textComponent.getRenderable());
				}
			});
		} else if (this.overlayType === 'info') {
			const avatarImages = this.menu.config.classicMode ? 
				MenuImageManager.getAllClassicAvatarImages() : 
				MenuImageManager.getAllAvatarImages();
			avatarImages.forEach((image: any) => {
				if (image) {
					if (!image.parent) {
						this.menu.renderLayers.overlays.addChild(image);
					}
					elements.push(image);
				}
			});
			
			const logoImages = this.menu.config.classicMode ? 
				MenuImageManager.getAllClassicLogoImages() : 
				MenuImageManager.getAllPinkLogoImages();
			logoImages.forEach((image: any) => {
				if (image) {
					if (!image.parent) {
						this.menu.renderLayers.overlays.addChild(image);
					}
					elements.push(image);
				}
			});
		}

		return elements;
	}

	private animateToTarget(onComplete?: () => void): void {
		const animate = () => {
			this.animationProgress += this.animationSpeed * (1/60);
			this.animationProgress = Math.min(this.animationProgress, 1.0);

			const easedProgress = this.easeInOutCubic(this.animationProgress);
			const startAlpha = this.targetAlpha === 1 ? 0 : 1;
			this.currentAlpha = startAlpha + (this.targetAlpha - startAlpha) * easedProgress;

			const elements = this.getAllCurrentElements();
			
			elements.forEach(element => {
				if (element && typeof element.alpha !== 'undefined') {
					element.alpha = this.currentAlpha;
				}
			});

			if (this.animationProgress >= 1.0) {
				this.isAnimating = false;
				this.currentAlpha = this.targetAlpha;
				
				if (onComplete) onComplete();
			} else {
				requestAnimationFrame(animate);
			}
		};

		animate();
	}

	private resetAllAlphas(): void {
		const elements = this.getAllCurrentElements();
		elements.forEach(element => {
			if (element && typeof element.alpha !== 'undefined') {
				element.alpha = 0;
			}
		});
		
		this.animateToTarget();
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
		this.background.rect(0, 0, 1635, 610);
		this.background.x = 75;
		this.background.y = 65;
		this.background.fill({ color: 0x151515, alpha: 1 });
		this.background.moveTo(0, 57.2);
		this.background.lineTo(0, 610);
		this.background.lineTo(778, 610);
		this.background.moveTo(871, 610);
		this.background.lineTo(1635, 610);
		this.background.lineTo(1635, 57.2);
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