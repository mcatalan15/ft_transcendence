import { FigureFactory } from '../factories/FigureFactory';
import { WorldSystem } from '../systems/WorldSystem';
import { DepthLineBehavior } from '../utils/Types';

export class WallFiguresSpawner {
  private static buildWallFigure(
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
    const isFlipped = flip ? 'Flipped' : 'Regular';

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
      let uniqueId = `${position}${isFlipped}${figureType}DepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      let bottomLine = FigureFactory.createDepthLine(
        figureType,
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
      worldSystem.figureQueue.push(bottomLine);

      let topLine = FigureFactory.createDepthLine(
        figureType,
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
      worldSystem.figureQueue.push(topLine);
    }
  }

  static buildPyramids(worldSystem: WorldSystem, depth: number): void {
    this.buildWallFigure(worldSystem, depth, 'pyramid', { maxHeightDivisor: 2.5 });
  }

  static buildTrenches(worldSystem: WorldSystem, depth: number): void {
    this.buildWallFigure(worldSystem, depth, 'trenches', { useFlip: true, maxHeightDivisor: 2 });
  }

  static buildLightning(worldSystem: WorldSystem, depth: number): void {
    this.buildWallFigure(worldSystem, depth, 'lightning', { useFlip: true, maxHeightDivisor: 2 });
  }

  static buildSteps(worldSystem: WorldSystem, depth: number): void {
    this.buildWallFigure(worldSystem, depth, 'steps', { maxHeightDivisor: 2 });
  }

  static buildAccelerator(worldSystem: WorldSystem, depth: number): void {
    this.buildWallFigure(worldSystem, depth, 'hourglass', { maxHeightDivisor: 2 });
  }

  static buildMaw(worldSystem: WorldSystem, depth: number): void {
    this.buildWallFigure(worldSystem, depth, 'maw', { maxHeightDivisor: 2 });
  }

  static buildRakes(worldSystem: WorldSystem, depth: number): void {
    this.buildWallFigure(worldSystem, depth, 'rake', { maxHeightDivisor: 2 });
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