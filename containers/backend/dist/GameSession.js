"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSession = void 0;
const GameCore_1 = require("./GameCore");
class GameSession {
    constructor() {
        this.core = new GameCore_1.GameCore();
        this.paddleInputs = { p1: 0, p2: 0 }; // -1 = up, 0 = none, 1 = down
    }
    setInput(player, dir) {
        if (player === 1)
            this.paddleInputs.p1 = dir;
        else
            this.paddleInputs.p2 = dir;
    }
    tick() {
        this.core.update(this.paddleInputs.p1, this.paddleInputs.p2);
        return this.core.getState();
    }
}
exports.GameSession = GameSession;
