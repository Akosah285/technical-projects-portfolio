import { describe, it, expect } from "vitest";
import { pongInit, type PongState } from "@/lib/projects/pong/physics";
import { autoDemoInput } from "./autoDemoInput";

describe("autoDemoInput", () => {
  it("presses start while the game is idle so the demo loop begins", () => {
    const input = autoDemoInput(pongInit());

    expect(input.start).toBe(true);
  });

  it("presses start while the game is in game-over so the demo loop continues", () => {
    const state: PongState = { ...pongInit(), phase: "game-over" };
    const input = autoDemoInput(state);

    expect(input.start).toBe(true);
  });

  it("does not press start while the game is playing", () => {
    const state: PongState = { ...pongInit(), phase: "playing" };
    const input = autoDemoInput(state);

    expect(input.start).toBe(false);
  });

  it("presses leftDown when the ball is below the left paddle", () => {
    const state: PongState = {
      ...pongInit(),
      phase: "playing",
      paddleLeft: { x: 0, y: 50 },
      ball: { x: 100, y: 200, vx: 0, vy: 0 },
    };
    const input = autoDemoInput(state);

    expect(input.leftDown).toBe(true);
    expect(input.leftUp).toBe(false);
  });

  it("presses leftUp when the ball is above the left paddle", () => {
    const state: PongState = {
      ...pongInit(),
      phase: "playing",
      paddleLeft: { x: 0, y: 300 },
      ball: { x: 100, y: 50, vx: 0, vy: 0 },
    };
    const input = autoDemoInput(state);

    expect(input.leftUp).toBe(true);
    expect(input.leftDown).toBe(false);
  });

  it("presses rightDown when the ball is below the right paddle", () => {
    const c = pongInit().config;
    const state: PongState = {
      ...pongInit(),
      phase: "playing",
      paddleRight: { x: c.width - c.paddleWidth, y: 50 },
      ball: { x: 100, y: 250, vx: 0, vy: 0 },
    };
    const input = autoDemoInput(state);

    expect(input.rightDown).toBe(true);
    expect(input.rightUp).toBe(false);
  });

  it("presses rightUp when the ball is above the right paddle", () => {
    const c = pongInit().config;
    const state: PongState = {
      ...pongInit(),
      phase: "playing",
      paddleRight: { x: c.width - c.paddleWidth, y: 300 },
      ball: { x: 100, y: 50, vx: 0, vy: 0 },
    };
    const input = autoDemoInput(state);

    expect(input.rightUp).toBe(true);
    expect(input.rightDown).toBe(false);
  });
});
