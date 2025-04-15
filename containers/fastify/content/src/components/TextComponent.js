/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TextComponent.js                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/11 14:21:11 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/15 12:22:39 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class TextComponent {
	constructor({
		tag = '',
		text = '',
		x = 0,
		y = 0,
		style = {},
		anchor = { x: 0.5, y: 0.5},
		rotation = 0,
	}) {
		this.type = 'text';
		this.tag = tag;

		const styleOne = {
			fontFamily: '"Roboto Mono", monospace',
			fontSize: 10,
			fill: 0xFAF3E0,
			align: 'center',
			fontWeight: 'light',
			letterSpacing: 1,
			resolution: 2,
			antialias: false,
			dropShadow: false,
			strokeThickness: 0,
			stroke: 0xFAF3E0,
		};

		this.textObject = new PIXI.Text(text, { ...styleOne, ...style });

		this.textObject.anchor.set(anchor.x, anchor.y);
		this.textObject.x = Math.round(x);
		this.textObject.y = Math.round(y);
		this.textObject.rotation = rotation;

        if (rotation === Math.PI/2 || rotation === -Math.PI/2) {
            // Adjust anchor for vertical text if needed
            this.textObject.anchor.set(0.5, 0);
        }
	}

	setText(newText) {
		this.textObject.text = newText;
	}

	setRotation(rotation) {
        this.textObject.rotation = rotation;
    }

	updatePosition(x, y) {
		this.textObject.x = Math.round(x);
		this.textObject.y = Math.round(y);
	}

	getRenderable() {
		return this.textObject;
	}

	getTag() {
		return this.tag;
	}

	getText() {
		return this.text;
	}
}