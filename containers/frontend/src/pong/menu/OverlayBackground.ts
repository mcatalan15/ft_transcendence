// Update OverlayBackground.ts to support animation
import { Graphics } from "pixi.js";
import { Entity } from "../engine/Entity";
import { RenderComponent } from "../components/RenderComponent";
import { AnimationComponent } from "../components/AnimationComponent";

export class OverlayBackground extends Entity {
    private targetAlpha: number = 0;
    private currentAlpha: number = 0;
    private animationProgress: number = 0;
    private animationSpeed: number = 0.08; // Adjust for faster/slower fade
    private isAnimating: boolean = false;
    private isDisplayed: boolean = false;

    constructor(id: string, layer: string, width: number, height: number) {
        super(id, layer);
        
        const overlayBackground = new Graphics();
        overlayBackground.rect(0, 0, width / 2 - 200, height);
        overlayBackground.x = width / 2 + 200;
        overlayBackground.fill({color: 0x151515, alpha: 1});
		overlayBackground.alpha = 0;
        
        const renderComponent = new RenderComponent(overlayBackground);
        this.addComponent(renderComponent, 'render');

        // Add animation component
        const animationComponent = new AnimationComponent();
        this.addComponent(animationComponent, 'animation');
    }

    public fadeIn(): void {
        this.targetAlpha = 1;
        this.animationProgress = 0;
        this.isAnimating = true;
    }

    public fadeOut(): void {
        this.targetAlpha = 0;
        this.animationProgress = 0;
        this.isAnimating = true;
    }

    public updateAnimation(deltaTime: number): void {
        if (!this.isAnimating) return;

        this.animationProgress += this.animationSpeed * deltaTime;
        this.animationProgress = Math.min(this.animationProgress, 1.0);

        // Smooth easing function (ease in-out)
        const easedProgress = this.easeInOutCubic(this.animationProgress);
        
        // Interpolate between current and target alpha
        const startAlpha = this.targetAlpha === 1 ? 0 : 1;
        this.currentAlpha = startAlpha + (this.targetAlpha - startAlpha) * easedProgress;

        // Update the graphic's alpha
        const render = this.getComponent('render') as RenderComponent;
        if (render && render.graphic) {
            render.graphic.alpha = this.currentAlpha;
        }

        // Check if animation is complete
        if (this.animationProgress >= 1.0) {
            this.isAnimating = false;
            this.currentAlpha = this.targetAlpha;
            
            // Update the graphic one final time to ensure exact target alpha
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
}