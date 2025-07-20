/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuAnimationSystem.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/17 15:58:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../../engine/Entity';
import type { System } from '../../engine/System'

import { Menu } from '../Menu';
import { Title } from '../menuEntities/Title';
import { BallButton } from '../menuButtons/BallButton';

import { RenderComponent } from '../../components/RenderComponent';
import { AnimationComponent } from '../../components/AnimationComponent';

import { FrameData } from '../../utils/Types';
import { isRenderComponent, isMenuLine, isPowerup } from '../../utils/Guards'
import { MenuLine } from '../menuEntities/MenuLine';
import { OverlayBackground } from '../menuOverlays/OverlayBackground';
import { GlossaryTexts } from '../menuOverlays/GlossaryTexts';
import { Powerup } from '../../entities/powerups/Powerup';
import { PhysicsComponent } from '../../components/PhysicsComponent';

export class MenuAnimationSystem implements System {
	private menu: Menu;
	lastCutId: string | null = null;
	isDespawningCrossCut: boolean = false;

	constructor(menu: Menu) {
		this.menu = menu;

	}

	
update(entities: Entity[], delta: FrameData): void {
	const entitiesToRemove: string[] = [];

	// 2. Update entities
	for (const entity of entities) {
		if (entity.id === 'ballButton') {
			this.animateBallButton(delta, entity as BallButton);
		} else if (isMenuLine(entity)) {
			this.animateMenuLine(delta, entitiesToRemove, entity);
		} else if (isPowerup(entity)) {
			if (!this.menu.config.classicMode) {
				this.animatePowerup(entity)
			}
		}
	}
	
	// 3. Cleanup
	for (const id of entitiesToRemove) {
		this.menu.removeEntity(id);
	}
}
	animateTitle(delta: FrameData, entity: Title) {
		let titleBackdrop;
		let titleText;
		let titleBall;
		let titleBlock;
		for (const [key, component] of entity.components) {
			if (isRenderComponent(component)) {
				if (component.instanceId === 'backDrop') titleBackdrop = component;
				else if (component.instanceId === 'textRender') titleText = component;
				else if (component.instanceId === 'ballRender') titleBall = component;
				else if (component.instanceId === 'block') titleBlock = component;
			}
		}

		const animation = entity.getComponent('animation') as AnimationComponent;

		if (!titleBackdrop || !titleText || !titleBall || !titleBlock || !animation) {
			console.log("Missing components:", { titleBackdrop: !!titleBackdrop, titleText: !!titleText, titleBlock: !!titleBlock, animation: !!animation });
			return
		};

		if (animation.options) {
			const animationOptions = animation.options;
			
			// Set initial positions if not already set
			if (!animationOptions.initialized) {
				animationOptions.backdropInitialX = titleBackdrop.graphic.x;
				animationOptions.backdropInitialY = titleBackdrop.graphic.y;
				animationOptions.textInitialX = titleText.graphic.x + 500;
				animationOptions.textInitialY = titleText.graphic.y - 40 + 160;
				animationOptions.ballInitialX = titleText.graphic.x - 65 + 500;
				animationOptions.ballInitialY = titleText.graphic.y - 30 + 160;
				animationOptions.blockInitialX = titleBlock.graphic.x + 500;
				animationOptions.blockInitialY = titleBlock.graphic.y;
				animationOptions.initialized = true;
			}
	
			const floatOffset = Math.sin((Date.now() / 800 * (animationOptions.floatSpeed as number)) + (animationOptions.floatOffset as number)) * (animationOptions.floatAmplitude as number);
	
			// Apply animation to each component using their individual initial positions
			titleBackdrop.graphic.position.set(
				animationOptions.backdropInitialX as number, 
				(animationOptions.backdropInitialY as number)
			);
	
			titleText.graphic.position.set(
				animationOptions.textInitialX as number, 
				(animationOptions.textInitialY as number)
			);

			titleBall.graphic.position.set(
				(animationOptions.ballInitialX as number),
				((animationOptions.ballInitialY as number) + floatOffset)
			);
	
			titleBlock.graphic.position.set(
				animationOptions.blockInitialX as number, 
				(animationOptions.blockInitialY as number)
			);
		}
	}

	animateMenuLine(delta: FrameData, entitiesToRemove: string[], entity: MenuLine) {
		// Update the animation progress
		entity.updateAnimation(delta.deltaTime);
	
		// Check if the line has reached its target and should be despawned
		if (entity.isAnimationComplete()) {
			entitiesToRemove.push(entity.id);
		}
	}

	animateBallButton(delta: FrameData, entity: BallButton) {
		entity.isAnimating = true;
		
		const animation = entity.getComponent('animation') as AnimationComponent;
		const render = entity.getComponent('render') as RenderComponent;
	
		if (!animation || !render) {
			return;
		}
	
		if (animation.options) {
			const animationOptions = animation.options;
			
			// Set initial position if not already set
			if (!animationOptions.initialized) {
				animationOptions.initialX = render.graphic.x;
				animationOptions.initialY = render.graphic.y;
				animationOptions.initialized = true;
			}
	
			// Calculate floating animation
			const floatOffset = Math.sin((Date.now() / 800 * (animationOptions.floatSpeed as number)) + (animationOptions.floatOffset as number)) * (animationOptions.floatAmplitude as number);
	
			// Apply animation - more pronounced when hovered
			const amplitudeMultiplier = entity.getIsHovered() ? 1.5 : 1.0;
			
			render.graphic.position.set(
				animationOptions.initialX as number,
				(animationOptions.initialY as number) + (floatOffset * amplitudeMultiplier)
			);
		}

		entity.isAnimating = false;
	}

	animateOverlayBackground(delta: FrameData, entity: OverlayBackground) {
        if (entity.getIsAnimating()) {
            entity.updateAnimation(delta.deltaTime);
        }
    }

	animatePowerup(entity: Powerup) {	
		const render = entity.getComponent('render') as RenderComponent;
		const animation = entity.getComponent('animation') as AnimationComponent;
		const physics = entity.getComponent('physics') as PhysicsComponent;
		
		if (!render || !animation || !physics) return;
		
		if (animation.options) {
			const animationOptions = animation.options;
			
			// Remove the floatOffset to sync all powerups
			const floatY = animationOptions.initialY as number + 
			Math.sin(Date.now() / 800 * (animationOptions.floatSpeed as number)) * 
			(animationOptions.floatAmplitude as number);
		
			physics.y = floatY;
			render.graphic.position.set(physics.x, floatY);
		}	
	}

	cleanup(): void {
		this.lastCutId = null;
		this.isDespawningCrossCut = false;
		
		const entitiesToRemove: string[] = [];
		for (const entity of this.menu.entities) {
			if (isMenuLine(entity)) {
				entitiesToRemove.push(entity.id);
			}
			if (entity.hasComponent('animation')) {
				const animComponent = entity.getComponent('animation') as AnimationComponent;
				if (animComponent?.options) {
					animComponent.options.initialized = false;
				}
			}
		}
		
		for (const entityId of entitiesToRemove) {
			this.menu.removeEntity(entityId);
		}
	}
}