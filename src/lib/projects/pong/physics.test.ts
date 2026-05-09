import { describe, it, expect } from "vitest";
import {
  pongInit,
  pongTick,
  DEFAULT_PONG_CONFIG,
  type PongInput,
} from "./physics";

const NO_INPUT: PongInput = {
  leftUp: false,
  leftDown: false,
  rightUp: false,
  rightDown: false,
  start: false,
};

describe("pongInit", () => {
  it("starts with paddles at left/right edges, ball centered, score 0-0, idle", () => {
    const state = pongInit();
    const c = DEFAULT_PONG_CONFIG;

    expect(state.paddleLeft).toEqual({ x: 0, y: 0 });
    expect(state.paddleRight).toEqual({ x: c.width - c.paddleWidth, y: c.height - c.paddleHeight });
    expect(state.ball).toMatchObject({ x: c.width / 2, y: c.height / 2 });
    expect(state.score).toEqual({ left: 0, right: 0 });
    expect(state.phase).toBe("idle");
  });
});

describe("pongTick — start input", () => {
  it("transitions idle → playing and gives the ball a velocity", () => {
    const initial = pongInit();
    const next = pongTick(initial, { ...NO_INPUT, start: true });

    expect(next.phase).toBe("playing");
    expect(Math.abs(next.ball.vx)).toBe(DEFAULT_PONG_CONFIG.ballSpeedX);
    expect(Math.abs(next.ball.vy)).toBe(DEFAULT_PONG_CONFIG.ballSpeedY);
  });
});

describe("pongTick — paddle movement", () => {
  it("moves the left paddle down on leftDown", () => {
    const next = pongTick(pongInit(), { ...NO_INPUT, leftDown: true });

    expect(next.paddleLeft.y).toBe(DEFAULT_PONG_CONFIG.paddleSpeed);
  });

  it("moves the left paddle up on leftUp", () => {
    const start = pongInit();
    const lowered = { ...start, paddleLeft: { ...start.paddleLeft, y: 100 } };
    const next = pongTick(lowered, { ...NO_INPUT, leftUp: true });

    expect(next.paddleLeft.y).toBe(100 - DEFAULT_PONG_CONFIG.paddleSpeed);
  });

  it("clamps the left paddle to y >= 0", () => {
    const next = pongTick(pongInit(), { ...NO_INPUT, leftUp: true });

    expect(next.paddleLeft.y).toBe(0);
  });

  it("clamps the left paddle to y <= height - paddleHeight", () => {
    const c = DEFAULT_PONG_CONFIG;
    const start = pongInit();
    const atBottom = {
      ...start,
      paddleLeft: { ...start.paddleLeft, y: c.height - c.paddleHeight },
    };
    const next = pongTick(atBottom, { ...NO_INPUT, leftDown: true });

    expect(next.paddleLeft.y).toBe(c.height - c.paddleHeight);
  });

  it("moves the right paddle independently", () => {
    const c = DEFAULT_PONG_CONFIG;
    const start = pongInit();
    const next = pongTick(start, { ...NO_INPUT, rightUp: true });

    expect(next.paddleRight.y).toBe(c.height - c.paddleHeight - c.paddleSpeed);
  });
});

describe("pongTick — ball motion", () => {
  it("integrates ball position by velocity each playing tick", () => {
    const c = DEFAULT_PONG_CONFIG;
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const next = pongTick(playing, NO_INPUT);

    expect(next.ball.x).toBe(playing.ball.x + playing.ball.vx);
    expect(next.ball.y).toBe(playing.ball.y + playing.ball.vy);
    expect(c.ballSpeedX).toBeGreaterThan(0); // sanity
  });

  it("does not move the ball while idle", () => {
    const initial = pongInit();
    const next = pongTick(initial, NO_INPUT);

    expect(next.ball.x).toBe(initial.ball.x);
    expect(next.ball.y).toBe(initial.ball.y);
  });
});

describe("pongTick — ball-wall collision", () => {
  it("reverses vy when the ball hits the top wall", () => {
    const c = DEFAULT_PONG_CONFIG;
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const atTop = {
      ...playing,
      ball: { ...playing.ball, y: c.ballRadius - 1, vy: -3 },
    };
    const next = pongTick(atTop, NO_INPUT);

    expect(next.ball.vy).toBe(3);
  });

  it("reverses vy when the ball hits the bottom wall", () => {
    const c = DEFAULT_PONG_CONFIG;
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const atBottom = {
      ...playing,
      ball: { ...playing.ball, y: c.height - c.ballRadius + 1, vy: 3 },
    };
    const next = pongTick(atBottom, NO_INPUT);

    expect(next.ball.vy).toBe(-3);
  });
});

describe("pongTick — ball-paddle collision", () => {
  it("reverses vx when the ball hits the left paddle", () => {
    const c = DEFAULT_PONG_CONFIG;
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const heading = {
      ...playing,
      paddleLeft: { x: 0, y: 100 },
      ball: {
        ...playing.ball,
        x: c.paddleWidth + c.ballRadius - 1,
        y: 140,
        vx: -5,
      },
    };
    const next = pongTick(heading, NO_INPUT);

    expect(next.ball.vx).toBe(5);
  });

  it("reverses vx when the ball hits the right paddle", () => {
    const c = DEFAULT_PONG_CONFIG;
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const heading = {
      ...playing,
      paddleRight: { x: c.width - c.paddleWidth, y: 100 },
      ball: {
        ...playing.ball,
        x: c.width - c.paddleWidth - c.ballRadius + 1,
        y: 140,
        vx: 5,
      },
    };
    const next = pongTick(heading, NO_INPUT);

    expect(next.ball.vx).toBe(-5);
  });

  it("does NOT reverse vx when the ball is past the paddle vertically (miss)", () => {
    const c = DEFAULT_PONG_CONFIG;
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const missing = {
      ...playing,
      paddleLeft: { x: 0, y: 0 },
      ball: {
        ...playing.ball,
        x: c.paddleWidth + c.ballRadius - 1,
        y: 300,
        vx: -5,
      },
    };
    const next = pongTick(missing, NO_INPUT);

    expect(next.ball.vx).toBe(-5);
  });
});

describe("pongTick — scoring", () => {
  it("when the ball exits the right edge, left scores and phase → game-over", () => {
    const c = DEFAULT_PONG_CONFIG;
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const escaping = {
      ...playing,
      ball: { ...playing.ball, x: c.width, vx: 5 },
    };
    const next = pongTick(escaping, NO_INPUT);

    expect(next.score).toEqual({ left: 1, right: 0 });
    expect(next.phase).toBe("game-over");
    expect(next.ball.x).toBe(c.width / 2);
    expect(next.ball.y).toBe(c.height / 2);
  });

  it("when the ball exits the left edge, right scores and phase → game-over", () => {
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const escaping = {
      ...playing,
      ball: { ...playing.ball, x: 0, vx: -5 },
    };
    const next = pongTick(escaping, NO_INPUT);

    expect(next.score).toEqual({ left: 0, right: 1 });
    expect(next.phase).toBe("game-over");
  });

  it("after a game-over, pressing start resumes play with score preserved", () => {
    const c = DEFAULT_PONG_CONFIG;
    const playing = pongTick(pongInit(), { ...NO_INPUT, start: true });
    const escaping = {
      ...playing,
      ball: { ...playing.ball, x: c.width, vx: 5 },
    };
    const gameOver = pongTick(escaping, NO_INPUT);
    const restarted = pongTick(gameOver, { ...NO_INPUT, start: true });

    expect(restarted.phase).toBe("playing");
    expect(restarted.score).toEqual({ left: 1, right: 0 });
  });
});

describe("pongTick — determinism", () => {
  it("two games with the same seed produce the same ball position after N ticks", () => {
    const inputs: PongInput[] = [
      { ...NO_INPUT, start: true },
      ...Array.from({ length: 50 }, () => NO_INPUT),
    ];

    const runA = inputs.reduce<{ state: ReturnType<typeof pongInit> }>(
      (acc, inp) => ({ state: pongTick(acc.state, inp) }),
      { state: pongInit(DEFAULT_PONG_CONFIG, 7) },
    );
    const runB = inputs.reduce<{ state: ReturnType<typeof pongInit> }>(
      (acc, inp) => ({ state: pongTick(acc.state, inp) }),
      { state: pongInit(DEFAULT_PONG_CONFIG, 7) },
    );

    expect(runA.state.ball).toEqual(runB.state.ball);
    expect(runA.state.score).toEqual(runB.state.score);
  });

  it("opposite seeds serve the ball in opposite directions", () => {
    const evenSeed = pongTick(pongInit(DEFAULT_PONG_CONFIG, 0), {
      ...NO_INPUT,
      start: true,
    });
    const oddSeed = pongTick(pongInit(DEFAULT_PONG_CONFIG, 1), {
      ...NO_INPUT,
      start: true,
    });

    expect(Math.sign(evenSeed.ball.vx)).toBe(-Math.sign(oddSeed.ball.vx));
  });
});
