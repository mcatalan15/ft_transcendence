import { DepthLineFactory } from '../factories/DepthLineFactory';
import { WorldSystem } from '../systems/WorldSystem';
import { DepthLineBehavior } from '../utils/Types';

export class ObstacleSpawner {
  private static buildObstacle(
    worldSystem: WorldSystem,
    depth: number,
    figureType: string,
    options: {
      useFlip?: boolean,
      maxHeightDivisor?: number
    } = {}
  ): void {
    const { width, height, topWallOffset, bottomWallOffset, wallThickness } = worldSystem.game;
    const maxHeightDivisor = options.maxHeightDivisor || 2.2;
    const maxFigureHeight = height / maxHeightDivisor - topWallOffset - wallThickness;

    const rampUpEnd = Math.floor(depth / 5);
    const rampDownStart = Math.floor(depth * 4 / 5);
    
    const flip = options.useFlip ? Math.floor(Math.random() * 2) : undefined;

    for (let i = 0; i < depth; i++) {
      let heightRatio;
      
      if (i < rampUpEnd) {
        heightRatio = i / rampUpEnd;
      } else if (i >= rampDownStart) {
        heightRatio = (depth - i - 1) / (depth - rampDownStart);
      } else {
        heightRatio = 1.0;
      }
      
      const figureHeight = heightRatio * maxFigureHeight;

      const behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in', figureHeight);
      const behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in', figureHeight);

      let position = i === 0 ? 'first' : i === depth - 1 ? 'last' : 'middle';
      let uniqueId = `${position}${figureType}Obstacle-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      let bottomLine = DepthLineFactory.createDepthLine(
        figureType.toLowerCase(),
        worldSystem.game,
        uniqueId,
        width,
        height,
        topWallOffset,
        bottomWallOffset,
        wallThickness,
        'bottom',
        behaviorBottom,
        flip
      );
      worldSystem.depthLineQueue.push(bottomLine);

      let topLine = DepthLineFactory.createDepthLine(
        figureType.toLowerCase(),
        worldSystem.game,
        uniqueId,
        width,
        height,
        topWallOffset,
        bottomWallOffset,
        wallThickness,
        'top',
        behaviorTop, 
        flip
      );
      worldSystem.depthLineQueue.push(topLine);
    }
  }

  static buildLedge(worldSystem: WorldSystem, depth: number): void {
    this.buildObstacle(worldSystem, depth, 'Ledge', { maxHeightDivisor: 2.2 });
  }

  // Utils
  private static generateDepthLineBehavior(
    movement: string,
    direction: string,
    fade: string,
    linePekHeight: number
  ): DepthLineBehavior {
    return {
      movement,
      direction,
      fade,
      linePekHeight,
    };
  }
}