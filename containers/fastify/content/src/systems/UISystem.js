/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UISystem.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/15 14:00:36 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/15 16:14:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class UISystem {
	constructor (game, app) {
		this.game = game;
		this.app = app;
		this.renderedTextComponents = new Set();
	}

	update(entities, delta) {
		entities.forEach(entity => {
            const renderComponent = entity.getComponent('render');

			if (entity.id === 'UI') {
                entity.updateTimer(delta.deltaTime * 15);

				const textComponents = entity.getComponentsByType('text');
                
                textComponents.forEach(textComponent => {
                    const textObject = textComponent.getRenderable();
                    const tag = textComponent.getTag();

					while (this.game.eventQueue.length > 0) {
						const event = this.game.eventQueue.shift();
					
						if (event.type === 'SCORE') {
							this.updateScore(entities, event);
						}
					}

                    if (tag === 'score' || textComponent.instanceId === 'score') {
                        textObject.x = this.game.width / 2;
                        textObject.y = entity.topOffset - 5;
                    } else if (tag === 'timer' || textComponent.instanceId === 'timer') {
                        textObject.x = entity.width - 30;
                        textObject.y = entity.topOffset + 5;
                    }
                    
                    this.ensureTextIsRendered(textComponent, textObject);
                });
            }
		});
	}

	updateScore(entities, event) {
		const uiEntity = entities.find(e => e.id === 'UI');
		if (event.side === 'left')
			uiEntity.incrementScore('left');
		else if (event.side === 'right')
			uiEntity.incrementScore('right');
		
		let newScore = `${uiEntity.getScore('left')} - ${uiEntity.getScore('right')}`;

		uiEntity.setScoreText(newScore);
	}

	ensureTextIsRendered(textComponent, textObject) {
        if (!this.renderedTextComponents.has(textComponent)) {
            this.app.stage.addChild(textObject);
            this.renderedTextComponents.add(textComponent);
        }

        textObject.visible = true;
    }
}