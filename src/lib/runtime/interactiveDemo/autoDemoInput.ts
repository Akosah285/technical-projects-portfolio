import type { PongState, PongInput } from "@/lib/projects/pong/physics";

const NO_INPUT: PongInput = {
  leftUp: false,
  leftDown: false,
  rightUp: false,
  rightDown: false,
  start: false,
};

function trackPaddle(
  paddleY: number,
  paddleHeight: number,
  ballY: number,
): { up: boolean; down: boolean } {
  const paddleCenter = paddleY + paddleHeight / 2;
  return {
    up: ballY < paddleCenter,
    down: ballY > paddleCenter,
  };
}

export function autoDemoInput(state: PongState): PongInput {
  if (state.phase !== "playing") {
    return { ...NO_INPUT, start: true };
  }

  const { config, ball, paddleLeft, paddleRight } = state;
  const left = trackPaddle(paddleLeft.y, config.paddleHeight, ball.y);
  const right = trackPaddle(paddleRight.y, config.paddleHeight, ball.y);

  return {
    leftUp: left.up,
    leftDown: left.down,
    rightUp: right.up,
    rightDown: right.down,
    start: false,
  };
}
