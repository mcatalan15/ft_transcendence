/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TextComponent.js                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/02 10:54:07 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/08 17:31:49 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class TextComponent {
    constructor(text, x, y) {
        this.type = 'text';
        this.textObject = new PIXI.Text(text, {
            fontFamily: '"Roboto Mono", monospace', // Fallback fonts
            fontSize: 15,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'light',
            letterSpacing: 1,
            // These properties help with text crispness:
            resolution: 10,        // Higher resolution rendering
            antialias: false,     // Disable antialiasing for sharper edges
            dropShadow: false,
            strokeThickness: 0.5, // Slight outline for better definition
            stroke: 0xFFFFFF      // Same as fill color
        });

        // Ensure text is positioned at integer pixels
        this.textObject.x = Math.round(x);
        this.textObject.y = Math.round(y);
    }

    setText(newText) {
        this.textObject.text = newText;
    }

    updatePosition(x, y) {
        this.textObject.x = x;
        this.textObject.y = y;
    }

    getRenderable() {
        return this.textObject;
    }
}