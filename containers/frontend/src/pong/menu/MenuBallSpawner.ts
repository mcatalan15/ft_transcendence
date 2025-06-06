/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuBallSpawner.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/30 11:45:18 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/03 17:37:48 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from './Menu';

import { DefaultBall } from '../entities/balls/DefaultBall'

import { RenderComponent } from '../components/RenderComponent'
import { PhysicsComponent } from '../components/PhysicsComponent';

import { isBall } from '../utils/Guards';



export class MenuBallSpawner {
	static spawnDefaultBallInMenu(menu: Menu): void {
		if (menu.ballAmount >=  menu.maxBalls) {
			let randomIndex = Math.floor(Math.random() * menu.maxBalls);
			
			for (const entity of menu.entities){
				if (isBall(entity)) {
					if (randomIndex > 0) {
						menu.removeEntity(entity.id);
						break;
					} else
					{
						randomIndex--;
					}
				}
			}
		}

		const ball = new DefaultBall('defaultBall', 'foreground', menu.width - 470, 320, true);
		const ballRender = ball.getComponent('render') as RenderComponent;
        const ballPhysics = ball.getComponent('physics') as PhysicsComponent;

        ballRender.graphic.x = ballPhysics.x;
		ballRender.graphic.y = ballPhysics.y;

		menu.renderLayers.midground.addChild(ballRender.graphic);
		menu.entities.push(ball);
		menu.ballAmount++;
    }
}