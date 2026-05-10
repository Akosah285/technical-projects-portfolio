import { describe, it, expect } from "vitest";

import {
  initialServoState,
  processServoCommand,
  tickHeartbeat,
  dutyToAngle,
  LOW_DUTY,
  HIGH_DUTY,
  STEP,
} from "./pwmServo";

describe("dutyToAngle", () => {
  it("maps low duty to 0°", () => {
    expect(dutyToAngle(LOW_DUTY)).toBeCloseTo(0, 5);
  });
  it("maps high duty to 180°", () => {
    expect(dutyToAngle(HIGH_DUTY)).toBeCloseTo(180, 5);
  });
  it("maps midpoint 7.75 to 90°", () => {
    expect(dutyToAngle(7.75)).toBeCloseTo(90, 5);
  });
});

describe("processServoCommand", () => {
  it("starts at 7.5% duty (initial main() value), heartbeat 0, not done", () => {
    expect(initialServoState.duty).toBeCloseTo(7.5, 5);
    expect(initialServoState.heartbeatCount).toBe(0);
    expect(initialServoState.heartbeatLed).toBe(false);
    expect(initialServoState.done).toBe(false);
  });

  it("'a' nudges duty up by STEP (0.25)", () => {
    const next = processServoCommand(initialServoState, "a");
    expect(next.duty).toBeCloseTo(7.5 + STEP, 5);
  });

  it("'s' nudges duty down by STEP", () => {
    const next = processServoCommand(initialServoState, "s");
    expect(next.duty).toBeCloseTo(7.5 - STEP, 5);
  });

  it("multiple 'a' presses accumulate", () => {
    let s = initialServoState;
    s = processServoCommand(s, "a");
    s = processServoCommand(s, "a");
    expect(s.duty).toBeCloseTo(7.5 + 2 * STEP, 5);
  });

  it("'high' snaps to HIGH_DUTY", () => {
    const next = processServoCommand(initialServoState, "high");
    expect(next.duty).toBeCloseTo(HIGH_DUTY, 5);
  });

  it("'low' snaps to LOW_DUTY", () => {
    const next = processServoCommand(initialServoState, "low");
    expect(next.duty).toBeCloseTo(LOW_DUTY, 5);
  });

  it("'a' clamps at HIGH_DUTY (mirrors servo_set range guard — duty unchanged when out of range)", () => {
    const high = processServoCommand(initialServoState, "high");
    const next = processServoCommand(high, "a");
    expect(next.duty).toBeCloseTo(HIGH_DUTY, 5);
  });

  it("'s' clamps at LOW_DUTY", () => {
    const low = processServoCommand(initialServoState, "low");
    const next = processServoCommand(low, "s");
    expect(next.duty).toBeCloseTo(LOW_DUTY, 5);
  });

  it("'q' marks done", () => {
    const next = processServoCommand(initialServoState, "q");
    expect(next.done).toBe(true);
  });

  it("unknown command is a no-op", () => {
    const next = processServoCommand(initialServoState, "z");
    expect(next.duty).toBe(initialServoState.duty);
    expect(next.log).toEqual(initialServoState.log);
  });

  it("commands after done are ignored", () => {
    const done = processServoCommand(initialServoState, "q");
    const next = processServoCommand(done, "a");
    expect(next.duty).toBe(done.duty);
    expect(next.done).toBe(true);
  });

  it("logs each accepted command", () => {
    const next = processServoCommand(initialServoState, "a");
    expect(next.log[next.log.length - 1]).toMatch(/duty/i);
  });
});

describe("tickHeartbeat (1Hz TTC interrupt)", () => {
  it("increments heartbeatCount", () => {
    const next = tickHeartbeat(initialServoState);
    expect(next.heartbeatCount).toBe(1);
  });

  it("toggles heartbeatLed (LED4) on every tick", () => {
    const a = tickHeartbeat(initialServoState);
    expect(a.heartbeatLed).toBe(true);
    const b = tickHeartbeat(a);
    expect(b.heartbeatLed).toBe(false);
  });

  it("does not affect duty", () => {
    const next = tickHeartbeat(initialServoState);
    expect(next.duty).toBe(initialServoState.duty);
  });
});
