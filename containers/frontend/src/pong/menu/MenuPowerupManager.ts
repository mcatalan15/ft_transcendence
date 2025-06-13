/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuPowerupManager.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:47:11 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/13 11:01:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "./Menu";

import { Paddle } from "../entities/Paddle";

import { RenderComponent } from "../components/RenderComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { TextComponent } from "../components/TextComponent";

import { MenuImageManager } from "./MenuImageManager";

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
import { isPaddle } from "../utils/Guards";

export class MenuPowerupManager {
    // Store all powerups for easy access
    private static powerupEntities: any[] = [];
	private static isAnimating: boolean = false;

    static createPowerups(menu: Menu) {
        const enlargePowerup = new EnlargePowerup('enlarge', 'overlays', menu, 170, 175);
        const renderComponent = enlargePowerup.getComponent('render') as RenderComponent;
        if (renderComponent) {
            renderComponent.graphic.alpha = 0; // Start invisible
            menu.menuHidden.addChild(renderComponent.graphic); // Start hidden
        }
        menu.entities.push(enlargePowerup);
        menu.enlargePowerup = enlargePowerup;
        this.powerupEntities.push(enlargePowerup);

        const magnetizePowerup = new MagnetizePowerup('magnetize', 'overlays', menu, 170, 248);
        const magnetRenderComponent = magnetizePowerup.getComponent('render') as RenderComponent;
        if (magnetRenderComponent) {
            magnetRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(magnetRenderComponent.graphic);
        }
        menu.entities.push(magnetizePowerup);
        menu.magnetizePowerup = magnetizePowerup;
        this.powerupEntities.push(magnetizePowerup);

        const shieldPowerup = new ShieldPowerup('shield', 'overlays', menu, 170, 320);
        const shieldRenderComponent = shieldPowerup.getComponent('render') as RenderComponent;
        if (shieldRenderComponent) {
            shieldRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(shieldRenderComponent.graphic);
        }
        menu.entities.push(shieldPowerup);
        menu.shieldPowerup = shieldPowerup;
        this.powerupEntities.push(shieldPowerup);

        const shootPowerup = new ShootPowerup('shoot', 'overlays', menu, 170, 390);
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
        const shrinkPowerDown = new ShrinkPowerDown('shrink', 'overlays', menu, 690, 170);
        const shrinkRenderComponent = shrinkPowerDown.getComponent('render') as RenderComponent;
        if (shrinkRenderComponent) {
            shrinkRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(shrinkRenderComponent.graphic);
        }
        menu.entities.push(shrinkPowerDown);
        menu.shrinkPowerdown = shrinkPowerDown;
        this.powerupEntities.push(shrinkPowerDown);

        const invertPowerDown = new InvertPowerDown('invert', 'overlays', menu, 690, 240);
        const invertRenderComponent = invertPowerDown.getComponent('render') as RenderComponent;
        if (invertRenderComponent) {
            invertRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(invertRenderComponent.graphic);
        }
        menu.entities.push(invertPowerDown);
        menu.invertPowerdown = invertPowerDown;
        this.powerupEntities.push(invertPowerDown);

        const flatPowerDown = new FlatPowerDown('flat', 'overlays', menu, 690, 310);
        const flatRenderComponent = flatPowerDown.getComponent('render') as RenderComponent;
        if (flatRenderComponent) {
            flatRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(flatRenderComponent.graphic);
        }
        menu.entities.push(flatPowerDown);
        menu.flattenPowerdown = flatPowerDown;
        this.powerupEntities.push(flatPowerDown);

        const slowPowerDown = new SlowPowerDown('slow', 'overlays', menu, 690, 380);
        const slowRenderComponent = slowPowerDown.getComponent('render') as RenderComponent;
        if (slowRenderComponent) {
            slowRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(slowRenderComponent.graphic);
        }
        menu.entities.push(slowPowerDown);
        menu.slowPowerdown = slowPowerDown;
        this.powerupEntities.push(slowPowerDown);
    }

    static createBallchanges(menu: Menu) {
        const curveBallPowerup = new CurveBallPowerup('curve', 'overlays', menu, 1250, 175);
        const curveRenderComponent = curveBallPowerup.getComponent('render') as RenderComponent;
        if (curveRenderComponent) {
            curveRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(curveRenderComponent.graphic);
        }
        menu.entities.push(curveBallPowerup);
        menu.curveBallChange = curveBallPowerup;
        this.powerupEntities.push(curveBallPowerup);

        const spinBallPowerup = new SpinBallPowerup('spin', 'overlays', menu, 1250, 245);
        const spinRenderComponent = spinBallPowerup.getComponent('render') as RenderComponent;
        if (spinRenderComponent) {
            spinRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(spinRenderComponent.graphic);
        }
        menu.entities.push(spinBallPowerup);
        menu.spinBallChange = spinBallPowerup;
        this.powerupEntities.push(spinBallPowerup);

        const burstBallPowerup = new BurstBallPowerup('burst', 'overlays', menu, 1250, 315);
        const burstRenderComponent = burstBallPowerup.getComponent('render') as RenderComponent;
        if (burstRenderComponent) {
            burstRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(burstRenderComponent.graphic);
        }
        menu.entities.push(burstBallPowerup);
        menu.burstBallChange = burstBallPowerup;
        this.powerupEntities.push(burstBallPowerup);

        const multiplyBallPowerup = new MultiplyBallPowerup('multiply', 'overlays', menu, 1250, 385);
        const multiplyRenderComponent = multiplyBallPowerup.getComponent('render') as RenderComponent;
        if (multiplyRenderComponent) {
            multiplyRenderComponent.graphic.alpha = 0;
            menu.menuHidden.addChild(multiplyRenderComponent.graphic);
        }
        menu.entities.push(multiplyBallPowerup);
        menu.multiplyBallChange = multiplyBallPowerup;
        this.powerupEntities.push(multiplyBallPowerup);
    }

    // Animation methods
    static fadeInAllPowerups(menu: Menu): void {
		this.powerupEntities.forEach(powerup => {
			const renderComponent = powerup.getComponent('render') as RenderComponent;
			if (renderComponent) {
				if (powerup.affectation === 'powerUp') {
					menu.renderLayers.powerups.addChild(renderComponent.graphic);
				} else if (powerup.affectation === 'powerDown') {
					menu.renderLayers.powerdowns.addChild(renderComponent.graphic);
				} else if (powerup.affectation === 'ballChange') {
					menu.renderLayers.ballchanges.addChild(renderComponent.graphic);
				}
			}

            if (isPaddle(powerup) && powerup.id === 'paddleL') {
                const paddleLText = powerup.getComponent('text') as TextComponent;
                menu.renderLayers.powerups.addChild(renderComponent.graphic);
                menu.renderLayers.powerups.addChild(paddleLText.getRenderable());
            } else if (isPaddle(powerup) && powerup.id === 'paddleR') {
                const paddleRText = powerup.getComponent('text') as TextComponent;
                menu.renderLayers.powerdowns.addChild(renderComponent.graphic);
                menu.renderLayers.powerdowns.addChild(paddleRText.getRenderable());
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
                const textComponent = powerup.getComponent('text') as TextComponent;
				if (renderComponent) {
					menu.menuHidden.addChild(renderComponent.graphic);
				}

                if (textComponent) {
                    menu.menuHidden.addChild(textComponent.getRenderable());
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
                const textComponent = powerup.getComponent('text') as TextComponent;
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

                if (textComponent) {
                    const current = textComponent.getRenderable().alpha;
                    const diff = targetAlpha - current;
                    
                    if (Math.abs(diff) > 0.01) {
                        textComponent.getRenderable().alpha += diff * speed;
                        allComplete = false;
                    } else {
                        textComponent.getRenderable().alpha = targetAlpha;
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

    static createGlossaryPaddles(menu: Menu) {
		const paddleL = new Paddle('paddleL', 'foreground', menu, menu.paddleOffset, menu.height / 2, true, 'PLAYER');
		const paddleLPhysics = paddleL.getComponent('physics') as PhysicsComponent;
		paddleLPhysics.x = 160;
		paddleLPhysics.y = menu.height / 2 + 200;
		const paddleLRender = paddleL.getComponent('render') as RenderComponent;
		const paddleLText = paddleL.getComponent('text') as TextComponent;
		menu.menuHidden.addChild(paddleLRender.graphic);
		menu.menuHidden.addChild(paddleLText.getRenderable());
		menu.entities.push(paddleL);
        menu.paddleL = paddleL;

		const paddleR = new Paddle('paddleR', 'foreground', menu, menu.width - menu.paddleOffset, menu.height / 2, false, "#@%$&");
		const paddleRPhysics = paddleR.getComponent('physics') as PhysicsComponent;
		paddleRPhysics.x = 190;
		paddleRPhysics.y = menu.height / 2 + 200;
		const paddleRRender = paddleR.getComponent('render') as RenderComponent;
		const paddleRText = paddleR.getComponent('text') as TextComponent;
		menu.menuHidden.addChild(paddleRRender.graphic);    
		menu.menuHidden.addChild(paddleRText.getRenderable());
		menu.entities.push(paddleR);
        menu.paddleR = paddleR;
        
        this.powerupEntities.push(paddleL, paddleR);
	}

    static cleanup(): void {
        this.powerupEntities = [];
    }
}