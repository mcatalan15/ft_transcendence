/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LedgePatternManager.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/19 09:08:04 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/19 16:21:24 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

export class LedgePatternManager {
	static createLedgePattern(game: PongGame) {
		const generalWidth = game.width / 2;
		const generalHeight = game.height / 3;

		const fifthWidth = generalWidth / 5;
		const tenthWidth = generalWidth / 10;
		const halfHeight = generalHeight / 2;

		const PATH_BREAK = { x: NaN, y: NaN }; 
		
		const ledgePositions = [
			// Left chunk
			{ x: -((2 * fifthWidth) + tenthWidth), y: -halfHeight },
			{ x: -((2 * fifthWidth) + tenthWidth), y: halfHeight },
			{ x: -(fifthWidth + tenthWidth), y: halfHeight },
			{ x: -(fifthWidth + tenthWidth), y: -halfHeight },
			{ x: -((2 * fifthWidth) + tenthWidth), y: -halfHeight },

			PATH_BREAK,

			// Center up chunk
			{ x: -tenthWidth, y: -halfHeight },
			{ x: -tenthWidth, y: halfHeight },
			{ x: tenthWidth, y: halfHeight },
			{ x: tenthWidth, y: -halfHeight },
			{ x: -tenthWidth, y: -halfHeight },

			PATH_BREAK,

			// Right chunk
			{ x: ((2 * fifthWidth) + tenthWidth), y: -halfHeight },
			{ x: ((2 * fifthWidth) + tenthWidth), y: halfHeight },
			{ x: (fifthWidth + tenthWidth), y: halfHeight },
			{ x: (fifthWidth + tenthWidth), y: -halfHeight },
			{ x: ((2 * fifthWidth) + tenthWidth), y: -halfHeight },
		];
		
		return ledgePositions;
	}
}
  