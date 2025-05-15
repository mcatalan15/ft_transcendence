import { GameCore } from './GameCore';

export class GameSession {
  core = new GameCore();
  paddleInputs = { p1: 0, p2: 0 }; // -1 = up, 0 = none, 1 = down

  setInput(player: 1 | 2, dir: number) {
    if (player === 1) this.paddleInputs.p1 = dir;
    else this.paddleInputs.p2 = dir;
  }

  tick() {
    this.core.update(this.paddleInputs.p1, this.paddleInputs.p2);
    return this.core.getState();
  }
}