/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuPowerupManager.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:47:11 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/11 17:42:01 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "./Menu";
import { RenderComponent } from "../components/RenderComponent";
import { EnlargePowerup } from '../entities/powerups/EnlargePowerup';
import { MagnetizePowerup } from '../entities/powerups/MagnetizePowerup';
import { ShieldPowerup } from '../entities/powerups/ShieldPowerUp';
import { ShootPowerup } from '../entities/powerups/ShootPowerup';
import { ShrinkPowerDown } from "../entities/powerups/ShrinkPowerDown";
import { InvertPowerDown } from "../entities/powerups/InvertPowerDown";
import { FlatPowerDown } from "../entities/powerups/FlatPowerDown";
import { SlowPowerDown } from "../entities/powerups/SlowPowerDown";
import { CurveBallPowerup } from "../entities/powerups/CurveBallPowerup";
import { SpinBallPowerup } from "../entities/powerups/SpinBallPowerup";
import { BurstBallPowerup } from "../entities/powerups/BurstBallPowerup";
import { MultiplyBallPowerup } from "../entities/powerups/MultiplyBallPowerup";

export class MenuPowerupManager {
    // Store all powerups for easy access
    private static powerupEntities: any[] = [];
	private static isAnimating: boolean = false;

    static createPowerups(menu: Menu) {
        const enlargePowerup = new EnlargePowerup('enlarge', 'overlays', this, 170, 175);
        const renderComponent = enlargePowerup.getComponent('render') as RenderComponent;
        if (renderComponent) {
            renderComponent.graphic.alpha = 0; // Start invisible
            menu.menuHidden.addChild(renderComponent.graphic); // Start hidden
        }
        menu.entities.push(enlargePowerup);
        menu.enlargePowerup = enlargePowerup;
        this.powerupEntities.push(enlargePowerup);

        const magnetizePowerup = new MagnetizePowerup('magnetize', 'overlays', this, 170, 248);
        const magnetRenderComponent = magnetizePowerup.getComponent('render') as RenderComponent;
        if (magnetRenderComponent) {
            magnetRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(magnetRenderComponent.graphic);
        }
        menu.entities.push(magnetizePowerup);
        menu.magnetizePowerup = magnetizePowerup;
        this.powerupEntities.push(magnetizePowerup);

        const shieldPowerup = new ShieldPowerup('shield', 'overlays', this, 170, 320);
        const shieldRenderComponent = shieldPowerup.getComponent('render') as RenderComponent;
        if (shieldRenderComponent) {
            shieldRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(shieldRenderComponent.graphic);
        }
        menu.entities.push(shieldPowerup);
        menu.shieldPowerup = shieldPowerup;
        this.powerupEntities.push(shieldPowerup);

        const shootPowerup = new ShootPowerup('shoot', 'overlays', this, 170, 390);
        const shootRenderComponent = shootPowerup.getComponent('render') as RenderComponent;
        if (shootRenderComponent) {
            shootRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(shootRenderComponent.graphic);
        }
        menu.entities.push(shootPowerup);
        menu.shootPowerup = shootPowerup;
        this.powerupEntities.push(shootPowerup);
    }

    static createPowerdowns(menu: Menu) {
        const shrinkPowerDown = new ShrinkPowerDown('shrink', 'overlays', this, 690, 170);
        const shrinkRenderComponent = shrinkPowerDown.getComponent('render') as RenderComponent;
        if (shrinkRenderComponent) {
            shrinkRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(shrinkRenderComponent.graphic);
        }
        menu.entities.push(shrinkPowerDown);
        this.powerupEntities.push(shrinkPowerDown);

        const invertPowerDown = new InvertPowerDown('invert', 'overlays', this, 690, 240);
        const invertRenderComponent = invertPowerDown.getComponent('render') as RenderComponent;
        if (invertRenderComponent) {
            invertRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(invertRenderComponent.graphic);
        }
        menu.entities.push(invertPowerDown);
        this.powerupEntities.push(invertPowerDown);

        const flatPowerDown = new FlatPowerDown('flat', 'overlays', this, 690, 310);
        const flatRenderComponent = flatPowerDown.getComponent('render') as RenderComponent;
        if (flatRenderComponent) {
            flatRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(flatRenderComponent.graphic);
        }
        menu.entities.push(flatPowerDown);
        this.powerupEntities.push(flatPowerDown);

        const slowPowerDown = new SlowPowerDown('slow', 'overlays', this, 690, 380);
        const slowRenderComponent = slowPowerDown.getComponent('render') as RenderComponent;
        if (slowRenderComponent) {
            slowRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(slowRenderComponent.graphic);
        }
        menu.entities.push(slowPowerDown);
        this.powerupEntities.push(slowPowerDown);
    }

    static createBallchanges(menu: Menu) {
        const curveBallPowerup = new CurveBallPowerup('curve', 'overlays', this, 1250, 175);
        const curveRenderComponent = curveBallPowerup.getComponent('render') as RenderComponent;
        if (curveRenderComponent) {
            curveRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(curveRenderComponent.graphic);
        }
        menu.entities.push(curveBallPowerup);
        this.powerupEntities.push(curveBallPowerup);

        const spinBallPowerup = new SpinBallPowerup('spin', 'overlays', this, 1250, 245);
        const spinRenderComponent = spinBallPowerup.getComponent('render') as RenderComponent;
        if (spinRenderComponent) {
            spinRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(spinRenderComponent.graphic);
        }
        menu.entities.push(spinBallPowerup);
        this.powerupEntities.push(spinBallPowerup);

        const burstBallPowerup = new BurstBallPowerup('burst', 'overlays', this, 1250, 315);
        const burstRenderComponent = burstBallPowerup.getComponent('render') as RenderComponent;
        if (burstRenderComponent) {
            burstRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(burstRenderComponent.graphic);
        }
        menu.entities.push(burstBallPowerup);
        this.powerupEntities.push(burstBallPowerup);

        const multiplyBallPowerup = new MultiplyBallPowerup('multiply', 'overlays', this, 1250, 385);
        const multiplyRenderComponent = multiplyBallPowerup.getComponent('render') as RenderComponent;
        if (multiplyRenderComponent) {
            multiplyRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(multiplyRenderComponent.graphic);
        }
        menu.entities.push(multiplyBallPowerup);
        this.powerupEntities.push(multiplyBallPowerup);
    }

    // Animation methods
    static fadeInAllPowerups(menu: Menu): void {
		this.powerupEntities.forEach(powerup => {
			const renderComponent = powerup.getComponent('render') as RenderComponent;
			if (renderComponent) {
				// Move to appropriate layer
				if (powerup.affectation === 'powerUp') {
					menu.renderLayers.powerups.addChild(renderComponent.graphic);
				} else if (powerup.affectation === 'powerDown') {
					menu.renderLayers.powerdowns.addChild(renderComponent.graphic);
				} else if (powerup.affectation === 'ballChange') {
					menu.renderLayers.ballchanges.addChild(renderComponent.graphic);
				}
			}
		});
	
		// Faster fade in speed
		this.animatePowerupsAlpha(1, 0.15); // Increased from 0.08 to 0.15
	}

    static fadeOutAllPowerups(menu: Menu, onComplete?: () => void): void {
		// Much faster fade out speed
		this.animatePowerupsAlpha(0, 0.25, () => { // Increased from 0.08 to 0.25
			// After fade out, move back to hidden
			this.powerupEntities.forEach(powerup => {
				const renderComponent = powerup.getComponent('render') as RenderComponent;
				if (renderComponent) {
					menu.menuHidden.addChild(renderComponent.graphic);
				}
			});
			
			if (onComplete) {
				onComplete();
			}
		});
	}

    private static animatePowerupsAlpha(targetAlpha: number, speed: number, onComplete?: () => void): void {
		this.isAnimating = true;
		
		const animate = () => {
			let allComplete = true;
	
			this.powerupEntities.forEach(powerup => {
				const renderComponent = powerup.getComponent('render') as RenderComponent;
				if (renderComponent) {
					const current = renderComponent.graphic.alpha;
					const diff = targetAlpha - current;
					
					if (Math.abs(diff) > 0.01) {
						renderComponent.graphic.alpha += diff * speed;
						allComplete = false;
					} else {
						renderComponent.graphic.alpha = targetAlpha;
					}
				}
			});
	
			if (!allComplete) {
				requestAnimationFrame(animate);
			} else {
				this.isAnimating = false;
				if (onComplete) {
					onComplete();
				}
			}
		};
	
		animate();
	}

    static getAllPowerupRenderables(): any[] {
        return this.powerupEntities.map(powerup => {
            const renderComponent = powerup.getComponent('render') as RenderComponent;
            return renderComponent ? renderComponent.graphic : null;
        }).filter(graphic => graphic !== null);
    }

	static arePowerupsAnimating(): boolean {
		return this.isAnimating;
	}

    static cleanup(): void {
        this.powerupEntities = [];
    }
}