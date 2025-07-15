export interface Vector2 {
  x: number;
  y: number;
}

export interface ServerGameState {
  ball: Vector2;
  ballVelocity?: Vector2;  // Optional for prediction
  paddle1: Vector2;
  paddle2: Vector2;
  score1: number;
  score2: number;
  powerups?: Array<{
    id: string;
    type: string;
    position: Vector2;
    active: boolean;
  }>;
  timestamp: number;
}