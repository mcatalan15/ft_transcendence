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
import { CrossCutFactory, CrossCutPosition } from '../factories/CrossCutFactory';

export class CrossCutSpawner {
	static spawnCrossCut(
		game: PongGame,
		points: Point[],
		position: string,
		type: string,
		x: number,
		y: number
	) {
		return CrossCutFactory.createCrossCut(
			game,
			points, 
			position as CrossCutPosition,
			type,
			x,
			y
		);
	}
}