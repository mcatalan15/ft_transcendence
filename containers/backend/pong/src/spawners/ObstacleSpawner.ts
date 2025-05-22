import { ObstacleFactory } from '../factories/ObstacleFactory';
import { WorldSystem } from '../systems/WorldSystem';
import { ObstacleBehavior } from '../utils/Types';

export class ObstacleSpawner {
	private static buildObstacle(
		worldSystem: WorldSystem,
		depth: number,
		figureType: string,
		pattern?: number,
	): void {
		for (let i = 0; i < depth; i++) {
			const obstacleBehavior = this.generateObstacleBehavior('none', 'in');

			let position = i === 0 ? 'first' : i === depth - 1 ? 'last' : 'middle';
			let uniqueId = `${position}${figureType}Obstacle-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

			let obstacle = ObstacleFactory.createObstacle(worldSystem.game, obstacleBehavior, figureType, uniqueId, pattern, i);

			worldSystem.obstacleQueue.push(obstacle);
		}
	}

	static buildLedge(worldSystem: WorldSystem, depth: number): void {
		this.buildObstacle(worldSystem, depth, 'ledge');
	}

	static buildPachinko(worldSystem: WorldSystem, depth: number, pattern: number): void {
		switch (pattern) {
			case (0):
				this.buildObstacle(worldSystem, depth, 'diamondPachinko', pattern);
				break;
			case (1):
				this.buildObstacle(worldSystem, depth, 'honeycombPachinko', pattern);
				break;
			default:
				this.buildObstacle(worldSystem, depth, 'funnelPachinko', pattern);
		}
	}

	static buildWindmills(worldSystem: WorldSystem, depth: number, pattern: number): void {
		switch (pattern) {
			case (0):
				this.buildObstacle(worldSystem, depth, 'windmills', pattern);
				break;
			default:
				this.buildObstacle(worldSystem, depth, 'giants', pattern);
		}
		
	}

	// Utils
	private static generateObstacleBehavior(
		animation: string,
		fade: string,
	): ObstacleBehavior {
		return {
		animation,
		fade,
		};
	}
}