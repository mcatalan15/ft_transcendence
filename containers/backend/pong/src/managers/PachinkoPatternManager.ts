export class PachinkoPatternManager {

	static createDiamondPattern(radius: number) {
		const circlePositions = [
			{ x: 0, y: radius * 10 },
			{ x: 0, y: -radius * 10 },
			{ x: 0, y: radius * 20 },
			{ x: 0, y: -radius * 20 },
			{ x: 0, y: radius * 30 },
			{ x: 0, y: -radius * 30 },

			{ x: radius * 10, y: radius * 5 },
			{ x: radius * 10, y: -radius * 5 },
			{ x: radius * 10, y: radius * 15 },
			{ x: radius * 10, y: -radius * 15 },
			{ x: radius * 10, y: radius * 25 },
			{ x: radius * 10, y: -radius * 25 },

			{ x: radius * 20, y: 0 },
			{ x: radius * 20, y: radius * 10 },
			{ x: radius * 20, y: -radius * 10 },
			{ x: radius * 20, y: radius * 20 },
			{ x: radius * 20, y: -radius * 20 },

			{ x: radius * 30, y: radius * 5 },
			{ x: radius * 30, y: -radius * 5 },
			{ x: radius * 30, y: radius * 15 },
			{ x: radius * 30, y: -radius * 15 },

			{ x: radius * 40, y: 0 },
			{ x: radius * 40, y: radius * 10 },
			{ x: radius * 40, y: -radius * 10 },
			
			{ x: radius * 50, y: radius * 5 },
			{ x: radius * 50, y: -radius * 5 },

			{ x: radius * 60, y: 0 },

			{ x: -radius * 10, y: -radius * 5 },
			{ x: -radius * 10, y: radius * 5 },
			{ x: -radius * 10, y: -radius * 15 },
			{ x: -radius * 10, y: radius * 15 },
			{ x: -radius * 10, y: -radius * 25 },
			{ x: -radius * 10, y: radius * 25 },

			{ x: -radius * 20, y: 0 },
			{ x: -radius * 20, y: -radius * 10 },
			{ x: -radius * 20, y: radius * 10 },
			{ x: -radius * 20, y: -radius * 20 },
			{ x: -radius * 20, y: radius * 20 },

			{ x: -radius * 30, y: -radius * 5 },
			{ x: -radius * 30, y: radius * 5 },
			{ x: -radius * 30, y: -radius * 15 },
			{ x: -radius * 30, y: radius * 15 },

			{ x: -radius * 40, y: 0 },
			{ x: -radius * 40, y: -radius * 10 },
			{ x: -radius * 40, y: radius * 10 },
			
			{ x: -radius * 50, y: -radius * 5 },
			{ x: -radius * 50, y: radius * 5 },

			{ x: -radius * 60, y: 0 },
		];

		return circlePositions;
	}

	static createSpiralPattern(radius: number) {
		const circlePositions = [];
		
		// Inner spiral - 8 circles
		const innerRadius = radius * 10;
		for (let i = 0; i < 8; i++) {
			const angle = (i * Math.PI / 4); // 45 degree increments (8 circles)
			circlePositions.push({
				x: innerRadius * Math.cos(angle),
				y: innerRadius * Math.sin(angle)
			});
		}
		
		// Middle spiral - 16 circles
		const middleRadius = radius * 20;
		for (let i = 0; i < 16; i++) {
			const angle = (i * Math.PI / 8); // 22.5 degree increments (16 circles)
			circlePositions.push({
				x: middleRadius * Math.cos(angle),
				y: middleRadius * Math.sin(angle)
			});
		}
		
		// Outer spiral - 24 circles
		const outerRadius = radius * 30;
		for (let i = 0; i < 24; i++) {
			const angle = (i * Math.PI / 12); // 15 degree increments (24 circles)
			circlePositions.push({
				x: outerRadius * Math.cos(angle),
				y: outerRadius * Math.sin(angle)
			});
		}
		
		const barrierRightOne = radius * 40;
		for (let i = 0; i < 9; i++) {
			const angle = ((i - 4) * Math.PI / 16); // 15 degree increments (24 circles)
			circlePositions.push({
				x: barrierRightOne * Math.cos(angle),
				y: barrierRightOne * Math.sin(angle)
			});
		}

		const barrierRightTwo = radius * 50;
		for (let i = 0; i < 9; i++) {
			const angle = ((i - 4) * Math.PI / 20); // 15 degree increments (24 circles)
			circlePositions.push({
				x: barrierRightTwo * Math.cos(angle),
				y: barrierRightTwo * Math.sin(angle)
			});
		}

		const barrierLeftOne = radius * 40;
		for (let i = 0; i < 9; i++) {
			const angle = ((i + 12) * Math.PI / 16); // 15 degree increments (24 circles)
			circlePositions.push({
				x: barrierLeftOne * Math.cos(angle),
				y: barrierLeftOne * Math.sin(angle)
			});
		}

		const barrierLeftTwo = radius * 50;
		for (let i = 0; i < 9; i++) {
			const angle = ((i + 16) * Math.PI / 20); // 15 degree increments (24 circles)
			circlePositions.push(	{
				x: barrierLeftTwo * Math.cos(angle),
				y: barrierLeftTwo * Math.sin(angle)
			});
		}

		return circlePositions;
	}
  
	static createZigzagPattern(radius: number) {
		const circlePositions = [];
		
		const yPositions = [-30, -20, -10, 0, 10, 20, 30];
		
		for (let i = 0; i < yPositions.length; i++) {
			const y = yPositions[i];
			
			const isEvenRow = Math.abs(y / 10) % 2 === 0;
			const startX = isEvenRow ? -55 : -60;
			const endX = isEvenRow ? 55 : 60;
			const step = 10;
			
			// Add all points for this row
			for (let x = startX; x <= endX; x += step) {
				circlePositions.push({ x: x * radius, y: y * radius });
			}
		}
		
		return circlePositions;
	}
	
	// 5. V-FORMATION PATTERN (BONUS)
	static createVFormationPattern(radius: number) {
		const circlePositions = [
		// Central V pointing down
		{ x: 0, y: -radius * 20 },
		{ x: radius * 5, y: -radius * 15 },
		{ x: -radius * 5, y: -radius * 15 },
		{ x: radius * 10, y: -radius * 10 },
		{ x: -radius * 10, y: -radius * 10 },
		{ x: radius * 15, y: -radius * 5 },
		{ x: -radius * 15, y: -radius * 5 },
		{ x: radius * 20, y: radius * 0 },
		{ x: -radius * 20, y: radius * 0 },
		
		// Secondary V pointing up
		{ x: 0, y: radius * 15 },
		{ x: radius * 5, y: radius * 10 },
		{ x: -radius * 5, y: radius * 10 },
		{ x: radius * 10, y: radius * 5 },
		{ x: -radius * 10, y: radius * 5 },
		
		// Additional V at top pointing down
		{ x: 0, y: -radius * 30 },
		{ x: radius * 5, y: -radius * 25 },
		{ x: -radius * 5, y: -radius * 25 },
		{ x: radius * 10, y: -radius * 20 },
		{ x: -radius * 10, y: -radius * 20 },
		];
		
		return circlePositions;
	};
}
  