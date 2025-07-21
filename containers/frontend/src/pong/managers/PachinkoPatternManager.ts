/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PachinkoPatternManager.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/19 09:08:08 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:24:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PachinkoPatternManager {
	static createDiamondPattern(radius: number) {
		const circlePositions = [];
	
		const maxOffset = 6;
	
		for (let xStep = -maxOffset; xStep <= maxOffset; xStep++) {
			const x = xStep * radius * 6;
			
			const height = (maxOffset + 1) - Math.abs(xStep);
	
			for (let yStep = -height + 1; yStep < height; yStep += 2) {
				const y = yStep * radius * 3;

				if (x === 0 && y === 0) continue;

				circlePositions.push({ x, y });
			}
		}
	
		return circlePositions;
	}

	static createHexGridPattern(radius: number, rings = 3) {
		const circlePositions = [];
	
		for (let q = -rings; q <= rings; q++) {
			const r1 = Math.max(-rings, -q - rings);
			const r2 = Math.min(rings, -q + rings);
			for (let r = r1; r <= r2; r++) {
				const x = radius * 4 * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
				const y = radius * 4 * (3 / 2 * r);

				if (x === 0 && y ===0) continue;
				
				circlePositions.push({ x, y });
			}
		}
	
		return circlePositions;
	}

	static createHorizontalDoubleFunnelPattern(radius: number, depth = 5, height = 5) {
		const circlePositions = [];
	
		for (let x = -depth; x <= depth; x++) {
			const colHeight = height - Math.abs(x);
			for (let y = -colHeight; y <= colHeight; y++) {
				if (y === 0 && x === 0) continue;
				circlePositions.push({
					x: x * radius * 2,
					y: y * radius * 2,
				});
			}
		}
	
		return circlePositions;
	}

	static createDoubleFunnelPattern(radius: number, minPositions = 3, maxColumns = 4) {
		const circlePositions = [];
		
		for (let col = -maxColumns; col <= maxColumns; col++) {
		  const positions = minPositions + Math.abs(col);
		  
		  const yOffset = (positions - 1) / 2;
		  
		  for (let p = 0; p < positions; p++) {
			const x = col * radius * 8;
			const y = (p - yOffset) * radius * 6;

			if (x === 0 && y === 0) continue;

			circlePositions.push({ x, y });
		  }
		}
		
		return circlePositions;
	  }
}