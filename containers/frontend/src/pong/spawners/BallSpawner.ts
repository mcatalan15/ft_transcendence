/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BallSpawner.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/28 12:15:13 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/04 15:05:12 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import { DefaultBall } from '../entities/balls/DefaultBall'
import { CurveBall } from '../entities/balls/CurveBall'
import { MultiplyBall } from '../entities/balls/MultiplyBall';
import { BurstBall } from '../entities/balls/BurstBall';
import { SpinBall } from '../entities/balls/SpinBall';

import { RenderComponent } from '../components/RenderComponent'
import { PhysicsComponent } from '../components/PhysicsComponent';
import { VFXComponent } from '../components/VFXComponent';

import { ParticleSpawner } from './ParticleSpawner';

import { GAME_COLORS } from '../utils/Types';

export class BallSpawner {
	static spawnDefaultBall(game: PongGame): void {
		if (game.hasEnded) return;

        const ball = new DefaultBall('defaultBall', 'foreground', game.width / 2, game.height / 2, true);
		const ballRender = ball.getComponent('render') as RenderComponent;
        const ballPhysics = ball.getComponent('physics') as PhysicsComponent;

        if (!game.config.classicMode) {
            ParticleSpawner.spawnBasicExplosion(game, ballPhysics.x + ballPhysics.width / 4, ballPhysics.y, GAME_COLORS.orange, 2);
        }

        ballRender.graphic.x = ballPhysics.x;
		ballRender.graphic.y = ballPhysics.y;

		game.renderLayers.foreground.addChild(ballRender.graphic);
		game.entities.push(ball);
        game.data.balls.defaultBalls++;
		console.log("DefaultBall spawned")
    }

    static spawnCurveBallAt(game: PongGame, physics: PhysicsComponent, lastHit: string): CurveBall {
        const ball = new CurveBall('curveBall', 'foreground', physics.x, physics.y, true);
    
        // Override default physics with the passed data
        const physicsComponent = ball.getComponent('physics') as PhysicsComponent;
        physicsComponent.x = physics.x;
        physicsComponent.y = physics.y;
        physicsComponent.velocityX = physics.velocityX;
        physicsComponent.velocityY = physics.velocityY;
        physicsComponent.restitution = physics.restitution;
        physicsComponent.mass = physics.mass;
        
        ball.lastHit = lastHit;
    
        const ballRender = ball.getComponent('render') as RenderComponent;
        const ballPhysics = ball.getComponent('physics') as PhysicsComponent;

        ParticleSpawner.spawnBasicExplosion(game, ballPhysics.x + ballPhysics.width / 4, ballPhysics.y, GAME_COLORS.orange, 2);

        ballRender.graphic.x = ballPhysics.x;
		ballRender.graphic.y = ballPhysics.y;
        
        game.renderLayers.foreground.addChild(ballRender.graphic);
        game.entities.push(ball);
    
        game.data.balls.curveBalls++;
        console.log("CurveBall spawned at", physics.x, physics.y);
        return ball;
    }

    static spawnMultiplyBallsAt(game: PongGame, physics: PhysicsComponent, lastHit: string): MultiplyBall[] {
        const clones: MultiplyBall[] = [];
    
        // Decide randomly which index is the real ball (0, 1, or 2)
        const realIndex = Math.floor(Math.random() * 3);
    
        for (let i = 0; i < 3; i++) {
            const isGoodBall = i === realIndex;
            const offsetY = (i - 1) * 100; 
            const offsetX = (i - 1) * 50; 
            const clone = new MultiplyBall(`multiplyBall_${i}`, 'foreground', physics.x, physics.y + offsetY, isGoodBall);
    
            // Copy physics values from the original ball
            const clonePhysics = clone.getComponent('physics') as PhysicsComponent;
            clonePhysics.x = physics.x + offsetX;
            clonePhysics.y = physics.y + offsetY;
            clonePhysics.velocityX = physics.velocityX;
            clonePhysics.velocityY = physics.velocityY;
            clonePhysics.restitution = physics.restitution;
            clonePhysics.mass = physics.mass;
    
            // Add to scene and entity list
            const cloneRender = clone.getComponent('render') as RenderComponent;

            cloneRender.graphic.x = clonePhysics.x;
		    cloneRender.graphic.y = clonePhysics.y;

            game.renderLayers.foreground.addChild(cloneRender.graphic);
            game.entities.push(clone);
            clones.push(clone);

            const vfx = clone.getComponent('vfx') as VFXComponent;
            if (clone.isGoodBall) {
                clone.lastHit = lastHit;
                vfx.startFlash(GAME_COLORS.green, 50);
                ParticleSpawner.spawnBasicExplosion(game, clonePhysics.x + clonePhysics.width / 4, clonePhysics.y, GAME_COLORS.green, 1);
            } else {
                vfx.startFlash(GAME_COLORS.rose, 50);
                ParticleSpawner.spawnBasicExplosion(game, clonePhysics.x + clonePhysics.width / 4, clonePhysics.y, GAME_COLORS.rose, 1);
            }
    
            console.log(`${isGoodBall ? "REAL" : "FAKE"} MultiplyBall spawned at (${clonePhysics.x}, ${clonePhysics.y})`);
        }
    
        game.data.balls.multiplyBalls++;
        return clones;
    }

    static spawnBurstBallAt(game: PongGame, physics: PhysicsComponent, lastHit: string): BurstBall {
        const ball = new BurstBall('burstBall', 'foreground', physics.x, physics.y, true);
    
        const physicsComponent = ball.getComponent('physics') as PhysicsComponent;
        physicsComponent.x = physics.x;
        physicsComponent.y = physics.y;
        physicsComponent.velocityX = physics.velocityX;
        physicsComponent.velocityY = physics.velocityY;
        physicsComponent.restitution = physics.restitution;
        physicsComponent.mass = physics.mass;

        ball.lastHit = lastHit;
    
        const ballRender = ball.getComponent('render') as RenderComponent;
        const ballPhysics = ball.getComponent('physics') as PhysicsComponent;

        ParticleSpawner.spawnBasicExplosion(game, ballPhysics.x + ballPhysics.width / 4, ballPhysics.y, GAME_COLORS.orange, 2);

        ballRender.graphic.x = ballPhysics.x;
		ballRender.graphic.y = ballPhysics.y;
        
        game.renderLayers.foreground.addChild(ballRender.graphic);
        game.entities.push(ball);
    
        game.data.balls.burstBalls++;
        console.log("BurstBall spawned at", physics.x, physics.y);
        return ball;
    }

    static spawnSpinBallAt(game: PongGame, physics: PhysicsComponent, lastHit: string): SpinBall {
        const ball = new SpinBall('curveBall', 'foreground', physics.x, physics.y, true);
    
        const physicsComponent = ball.getComponent('physics') as PhysicsComponent;
        physicsComponent.x = physics.x;
        physicsComponent.y = physics.y;
        physicsComponent.velocityX = physics.velocityX;
        physicsComponent.velocityY = physics.velocityY;
        physicsComponent.restitution = physics.restitution;
        physicsComponent.mass = physics.mass;

        ball.lastHit = lastHit;
    
        const ballRender = ball.getComponent('render') as RenderComponent;
        const ballPhysics = ball.getComponent('physics') as PhysicsComponent;

        ParticleSpawner.spawnBasicExplosion(game, ballPhysics.x + ballPhysics.width / 4, ballPhysics.y, GAME_COLORS.orange, 2);

        ballRender.graphic.x = ballPhysics.x;
		ballRender.graphic.y = ballPhysics.y;
        
        game.renderLayers.foreground.addChild(ballRender.graphic);
        game.entities.push(ball);
    
        game.data.balls.spinBalls++;
        console.log("CurveBall spawned at", physics.x, physics.y);
        return ball;
    }

    static generateId(): string {
        return `ball_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
}