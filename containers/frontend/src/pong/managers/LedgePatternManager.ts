/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LedgePatternManager.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/19 09:08:04 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 20:36:28 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

export class LedgePatternManager {
	static createLedgePattern(game: PongGame) {
		const generalWidth = game.width / 2;
		const generalHeight = game.height / 3;

		const seventhWidth = generalWidth / 7;
		const fourteenthWidth = generalWidth / 14;
		const halfHeight = generalHeight / 2;

		const PATH_BREAK = { x: NaN, y: NaN }; 
		
		const ledgePositions = [
			{ x: -((3 * seventhWidth) + fourteenthWidth), y: -halfHeight },
			{ x: -((3 * seventhWidth) + fourteenthWidth * 2), y: 0},
			{ x: -((3 * seventhWidth) + fourteenthWidth), y: halfHeight },
			{ x: -(2 * seventhWidth + fourteenthWidth), y: halfHeight },
			{ x: -(2 * seventhWidth + fourteenthWidth * 2), y: 0 },
			{ x: -(2 *seventhWidth + fourteenthWidth), y: -halfHeight },
			{ x: -((3 * seventhWidth) + fourteenthWidth), y: -halfHeight },

			PATH_BREAK,

			{ x: -((seventhWidth) + fourteenthWidth), y: -halfHeight },
			{ x: -((seventhWidth) + fourteenthWidth * 2), y: 0 },
			{ x: -((seventhWidth) + fourteenthWidth), y: halfHeight },
			{ x: -(fourteenthWidth), y: halfHeight },
			{ x: -(fourteenthWidth * 2), y: 0 },
			{ x: -(fourteenthWidth), y: -halfHeight },
			{ x: -((seventhWidth) + fourteenthWidth), y: -halfHeight },
			
			PATH_BREAK,

			{ x: fourteenthWidth, y: -halfHeight },
			{ x: fourteenthWidth * 2, y: 0 },
			{ x: fourteenthWidth, y: halfHeight },
			{ x: seventhWidth + fourteenthWidth, y: halfHeight },
			{ x: seventhWidth + (fourteenthWidth * 2), y: 0 },
			{ x: seventhWidth + fourteenthWidth, y: -halfHeight },
			{ x: fourteenthWidth, y: -halfHeight },

			PATH_BREAK,

			{ x: fourteenthWidth + (2 * seventhWidth), y: -halfHeight },
			{ x: (2 * fourteenthWidth) + (2 * seventhWidth), y: 0 },
			{ x: fourteenthWidth + (2 * seventhWidth), y: halfHeight },
			{ x: fourteenthWidth + (3 * seventhWidth), y: halfHeight },
			{ x: (2 * fourteenthWidth) + (3 * seventhWidth), y: 0 },
			{ x: fourteenthWidth + (3 * seventhWidth), y: -halfHeight },
			{ x: fourteenthWidth + (2 * seventhWidth), y: -halfHeight },
		];
		
		return ledgePositions;
	}
}
  