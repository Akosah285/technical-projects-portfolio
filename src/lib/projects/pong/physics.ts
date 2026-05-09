export interface PongConfig {
  width: number;
  height: number;
  paddleWidth: number;
  paddleHeight: number;
  paddleSpeed: number;
  ballRadius: number;
  ballSpeedX: number;
  ballSpeedY: number;
}

export const DEFAULT_PONG_CONFIG: PongConfig = {
  width: 400,
  height: 400,
  paddleWidth: 20,
  paddleHeight: 80,
  paddleSpeed: 10,
  ballRadius: 7,
  ballSpeedX: 5,
  ballSpeedY: 4,
};

export type PongPhase = "idle" | "playing" | "game-over";

export interface PongState {
  config: PongConfig;
  paddleLeft: { x: number; y: number };
  paddleRight: { x: number; y: number };
  ball: { x: number; y: number; vx: number; vy: number };
  score: { left: number; right: number };
  phase: PongPhase;
  serveSign: 1 | -1;
}

export interface PongInput {
  leftUp: boolean;
  leftDown: boolean;
  rightUp: boolean;
  rightDown: boolean;
  start: boolean;
}

export function pongInit(
  config: PongConfig = DEFAULT_PONG_CONFIG,
  seed = 0,
): PongState {
  return {
    config,
    paddleLeft: { x: 0, y: 0 },
    paddleRight: {
      x: config.width - config.paddleWidth,
      y: config.height - config.paddleHeight,
    },
    ball: {
      x: config.width / 2,
      y: config.height / 2,
      vx: 0,
      vy: 0,
    },
    score: { left: 0, right: 0 },
    phase: "idle",
    serveSign: seed % 2 === 0 ? 1 : -1,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function movePaddle(
  paddle: { x: number; y: number },
  up: boolean,
  down: boolean,
  speed: number,
  height: number,
  paddleHeight: number,
): { x: number; y: number } {
  const dy = (down ? speed : 0) - (up ? speed : 0);
  return { ...paddle, y: clamp(paddle.y + dy, 0, height - paddleHeight) };
}

export function pongTick(state: PongState, input: PongInput): PongState {
  const { config } = state;

  const paddleLeft = movePaddle(
    state.paddleLeft,
    input.leftUp,
    input.leftDown,
    config.paddleSpeed,
    config.height,
    config.paddleHeight,
  );
  const paddleRight = movePaddle(
    state.paddleRight,
    input.rightUp,
    input.rightDown,
    config.paddleSpeed,
    config.height,
    config.paddleHeight,
  );

  if (
    (state.phase === "idle" || state.phase === "game-over") &&
    input.start
  ) {
    return {
      ...state,
      paddleLeft,
      paddleRight,
      phase: "playing",
      ball: {
        x: config.width / 2,
        y: config.height / 2,
        vx: config.ballSpeedX * state.serveSign,
        vy: config.ballSpeedY,
      },
    };
  }

  if (state.phase !== "playing") {
    return { ...state, paddleLeft, paddleRight };
  }

  let { x, y, vx, vy } = state.ball;
  x += vx;
  y += vy;

  if (y <= config.ballRadius || y >= config.height - config.ballRadius) {
    vy = -vy;
  }

  const hitsLeftPaddle =
    x <= state.paddleLeft.x + config.paddleWidth + config.ballRadius &&
    x > state.paddleLeft.x &&
    y >= state.paddleLeft.y &&
    y <= state.paddleLeft.y + config.paddleHeight;
  const hitsRightPaddle =
    x >= state.paddleRight.x - config.ballRadius &&
    x < state.paddleRight.x + config.paddleWidth &&
    y >= state.paddleRight.y &&
    y <= state.paddleRight.y + config.paddleHeight;

  if (hitsLeftPaddle || hitsRightPaddle) {
    vx = -vx;
  }

  if (x >= config.width - config.ballRadius || x <= config.ballRadius) {
    const scoredLeft = x >= config.width - config.ballRadius;
    const score = {
      left: state.score.left + (scoredLeft ? 1 : 0),
      right: state.score.right + (scoredLeft ? 0 : 1),
    };
    return {
      ...state,
      paddleLeft,
      paddleRight,
      score,
      phase: "game-over",
      ball: {
        x: config.width / 2,
        y: config.height / 2,
        vx: 0,
        vy: 0,
      },
    };
  }

  return { ...state, paddleLeft, paddleRight, ball: { x, y, vx, vy } };
}
