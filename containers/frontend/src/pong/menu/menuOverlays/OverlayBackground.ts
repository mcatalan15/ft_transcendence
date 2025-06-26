// Update OverlayBackground.ts to support animation
import { Graphics } from "pixi.js";
import { Menu } from "../Menu";
import { Entity } from "../../engine/Entity";
import { RenderComponent } from "../../components/RenderComponent";
import { AnimationComponent } from "../../components/AnimationComponent";
import { GAME_COLORS } from "../../utils/Types";

export class OverlayBackground extends Entity {
    private background!: Graphics;
    private targetAlpha: number = 0;
    private currentAlpha: number = 0;
    private animationProgress: number = 0;
    private animationSpeed: number = 0.5;
    private isAnimating: boolean = false;
    private isDisplayed: boolean = false;

    constructor(id: string, layer: string) {
        super(id, layer);

        const overlayBackground = new Graphics();
        overlayBackground.rect(0, 0, 1635, 600);
        overlayBackground.x = 75;
        overlayBackground.y = 75;
        overlayBackground.fill({color: 0x151515, alpha: 1});
        overlayBackground.stroke({color: GAME_COLORS.menuOrange, width: 3});
		overlayBackground.alpha = 0;

        this.background = overlayBackground;
        
        const renderComponent = new RenderComponent(overlayBackground);
        this.addComponent(renderComponent, 'render');

        const animationComponent = new AnimationComponent();
        this.addComponent(animationComponent, 'animation');
    }

    public fadeIn(): void {
        // Force reset before starting animation
        this.targetAlpha = 1;
        this.animationProgress = 0;
        this.currentAlpha = 0; // Ensure we start from 0
        this.isAnimating = true;
        
        // Ensure graphic starts from 0
        const render = this.getComponent('render') as RenderComponent;
        if (render && render.graphic) {
            render.graphic.alpha = 0;
        }
    }

    public fadeOut(): void {
        this.targetAlpha = 0;
        this.animationProgress = 0;
        this.isAnimating = true;
    }

    public resetAnimationState(): void {
        // Reset all animation properties to initial state
        this.targetAlpha = 0;
        this.currentAlpha = 0;
        this.animationProgress = 0;
        this.isAnimating = false;
        
        // Ensure graphic alpha is also reset
        const render = this.getComponent('render') as RenderComponent;
        if (render && render.graphic) {
            render.graphic.alpha = 0;
        }
        
        console.log("OverlayBackground animation state reset");
    }

    public updateAnimation(deltaTime: number): void {
        if (!this.isAnimating) return;

        this.animationProgress += this.animationSpeed * deltaTime;
        this.animationProgress = Math.min(this.animationProgress, 1.0);

        const easedProgress = this.easeInOutCubic(this.animationProgress);
        
        const startAlpha = this.targetAlpha === 1 ? 0 : 1;
        this.currentAlpha = startAlpha + (this.targetAlpha - startAlpha) * easedProgress;

        const render = this.getComponent('render') as RenderComponent;
        if (render && render.graphic) {
            render.graphic.alpha = this.currentAlpha;
        }

        if (this.animationProgress >= 1.0) {
            this.isAnimating = false;
            this.currentAlpha = this.targetAlpha;
            
            if (render && render.graphic) {
                render.graphic.alpha = this.currentAlpha;
            }
        }
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

    public setIsDisplayed(displayed: boolean): void {
        this.isDisplayed = displayed;
    }

    public changeStrokeColor(color: number) {
        this.background.clear();
        this.background.rect(0, 0, 1635, 600);
        this.background.x = 75;
        this.background.y = 75;
        this.background.fill({color: 0x151515, alpha: 1});
        this.background.stroke({color: color, width: 3});
		this.background.alpha = 1;
    }
}