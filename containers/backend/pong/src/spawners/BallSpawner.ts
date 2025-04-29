/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BallSpawner.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/28 12:15:13 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/29 15:33:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import { Ball } from '../entities/balls/Ball'
import { DefaultBall } from '../entities/balls/DefaultBall'
import { CurveBall } from '../entities/balls/CurveBall'

import { RenderComponent } from '../components/RenderComponent'
import { PhysicsComponent } from '../components/PhysicsComponent';

export class BallSpawner {
	static spawnDefaultBall(game: PongGame): void {
		const ball = new DefaultBall('defaultBall', 'foreground', game.width / 2, game.height / 2);
		const ballRender = ball.getComponent('render') as RenderComponent;
		game.renderLayers.foreground.addChild(ballRender.graphic);
		game.entities.push(ball);
		console.log("DefaultBall spawned")
    }

    static spawnCurveBall(game: PongGame): void {
        const ball = new CurveBall('curveBall', 'foreground', game.width / 2, game.height / 2);
        const ballRender = ball.getComponent('render') as RenderComponent;
        game.renderLayers.foreground.addChild(ballRender.graphic);
        game.entities.push(ball);
        console.log("CurveBall spawned");
    }

    static spawnCurveBallAt(game: PongGame, physics: PhysicsComponent): CurveBall {
        const ball = new CurveBall('curveBall', 'foreground', physics.x, physics.y);
    
        // Override default physics with the passed data
        const physicsComponent = ball.getComponent('physics') as PhysicsComponent;
        physicsComponent.x = physics.x;
        physicsComponent.y = physics.y;
        physicsComponent.velocityX = physics.velocityX;
        physicsComponent.velocityY = physics.velocityY;
        physicsComponent.restitution = physics.restitution;
        physicsComponent.mass = physics.mass;
    
        const ballRender = ball.getComponent('render') as RenderComponent;
        game.renderLayers.foreground.addChild(ballRender.graphic);
        game.entities.push(ball);
    
        console.log("CurveBall spawned at", physics.x, physics.y);
        return ball;
    }

    /*spawnSpecialBall(type: BallType, x: number, y: number, velocityX: number, velocityY: number): Ball {
        switch (type) {
            case 'rugby':
                return new RugbyBall(this.generateId(), 'ballLayer', x, y, velocityX, velocityY);
            case 'poison':
                return new PoisonBall(this.generateId(), 'ballLayer', x, y, velocityX, velocityY);
            case 'multiplying':
                return new MultiplyingBall(this.generateId(), 'ballLayer', x, y, velocityX, velocityY);
            case 'arrow':
                return new ArrowBall(this.generateId(), 'ballLayer', x, y, velocityX, velocityY);
            case 'glitch':
                return new GlitchBall(this.generateId(), 'ballLayer', x, y, velocityX, velocityY);
            default:
                throw new Error(`Unknown ball type: ${type}`);
        }
    }*/

    despawnBall(ball: Ball) {
        // Remove ball from your world/entities list here
    }

    static generateId(): string {
        return `ball_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
}