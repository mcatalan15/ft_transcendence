/*   CrossCutSpawner.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/09 16:30:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/15 12:45:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';

import { PongGame } from '../engine/Game';
import { CrossCutFactory, CrossCutPosition } from '../entities/crossCuts/CrossCutFactory';

/**
 * @deprecated Use CrossCutFactory directly instead
 * This class is kept for backwards compatibility but delegates to CrossCutFactory
 */
export class CrossCutSpawner {
	/**
	 * Creates a cross-cut and adds it to the game
	 * @deprecated Use CrossCutFactory.createCrossCut instead
	 */
	static spawnCrossCut(
		game: PongGame,
		points: Point[],
		position: string,
		x: number,
		y: number
	) {
		console.warn('CrossCutSpawner.spawnCrossCut is deprecated. Use CrossCutFactory.createCrossCut instead.');
		return CrossCutFactory.createCrossCut(
			game,
			points, 
			position as CrossCutPosition,
			x,
			y
		);
	}
}