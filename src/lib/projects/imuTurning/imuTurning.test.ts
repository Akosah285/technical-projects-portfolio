import { describe, expect, it } from "vitest";
import {
  DEG_TO_RAD,
  finalAbsErrorDeg,
  finalRelHeadingDeg,
  runImuTurning,
  TURN_A,
  TURN_B,
  TURN_K,
  TURN_SAMPLE_S,
  wrapRelHeadingDeg,
} from "./imuTurning";
import { PWM_MAX } from "../motorStepResponse/motorStepResponse";

describe("wrapRelHeadingDeg", () => {
  it("turning right: wraps negative deltas into [0, 360)", () => {
    expect(wrapRelHeadingDeg(-10, true)).toBe(350);
    expect(wrapRelHeadingDeg(0, true)).toBe(0);
    expect(wrapRelHeadingDeg(45, true)).toBe(45);
    expect(wrapRelHeadingDeg(360, true)).toBe(0);
    expect(wrapRelHeadingDeg(370, true)).toBe(10);
  });

  it("turning left: wraps positive deltas into (-360, 0]", () => {
    expect(wrapRelHeadingDeg(10, false)).toBe(-350);
    expect(wrapRelHeadingDeg(-45, false)).toBe(-45);
    expect(wrapRelHeadingDeg(-360, false)).toBe(0);
    expect(wrapRelHeadingDeg(-370, false)).toBe(-10);
  });
});

describe("runImuTurning", () => {
  it("produces a trace of length round(durationS / sampleS) + 1", () => {
    const t = runImuTurning({
      targetDeg: 90,
      durationS: 1,
      sampleS: TURN_SAMPLE_S,
    });
    expect(t.length).toBe(Math.round(1 / TURN_SAMPLE_S) + 1);
  });

  it("starts at the commanded start heading with full error = target", () => {
    const trace = runImuTurning({
      targetDeg: 90,
      startHeadingDeg: 30,
      durationS: 0.04,
    });
    const first = trace[0];
    expect(first.t).toBe(0);
    expect(first.headingDeg).toBe(30);
    expect(first.relHeadingDeg).toBe(0);
    expect(first.errorRad).toBeCloseTo(90 * DEG_TO_RAD, 6);
    expect(first.omegaRadS).toBe(0);
  });

  it("converges to within 5° of a 90° right-hand turn within 2 s", () => {
    const trace = runImuTurning({ targetDeg: 90, durationS: 2 });
    expect(finalAbsErrorDeg(trace)).toBeLessThan(5);
    expect(finalRelHeadingDeg(trace)).toBeGreaterThan(85);
    expect(finalRelHeadingDeg(trace)).toBeLessThan(95);
  });

  it("converges to within 5° of a -90° left-hand turn within 2 s", () => {
    const trace = runImuTurning({ targetDeg: -90, durationS: 2 });
    expect(finalAbsErrorDeg(trace)).toBeLessThan(5);
    expect(finalRelHeadingDeg(trace)).toBeLessThan(-85);
    expect(finalRelHeadingDeg(trace)).toBeGreaterThan(-95);
  });

  it("converges on small turns too (30°)", () => {
    const trace = runImuTurning({ targetDeg: 30, durationS: 2 });
    expect(finalAbsErrorDeg(trace)).toBeLessThan(5);
  });

  it("handles 180° backward-turn command (still converges)", () => {
    const trace = runImuTurning({ targetDeg: 180, durationS: 3 });
    expect(finalAbsErrorDeg(trace)).toBeLessThan(10);
    expect(finalRelHeadingDeg(trace)).toBeGreaterThan(170);
  });

  it("zero target keeps the robot at start heading (relHeading stays 0)", () => {
    const trace = runImuTurning({
      targetDeg: 0,
      durationS: 1,
      startHeadingDeg: 42,
    });
    for (const s of trace) {
      expect(Math.abs(s.relHeadingDeg)).toBeLessThan(0.001);
      expect(s.headingDeg).toBeCloseTo(42, 6);
    }
  });

  it("PWM saturates at ±PWM_MAX (never exceeds)", () => {
    const trace = runImuTurning({ targetDeg: 90, durationS: 2 });
    for (const s of trace) {
      expect(s.pwm).toBeGreaterThanOrEqual(-PWM_MAX);
      expect(s.pwm).toBeLessThanOrEqual(PWM_MAX);
    }
  });

  it("right-hand turn drives positive PWM at the start (forward command)", () => {
    const trace = runImuTurning({ targetDeg: 90, durationS: 0.5 });
    expect(trace[0].pwm).toBeGreaterThan(0);
  });

  it("left-hand turn drives negative PWM at the start", () => {
    const trace = runImuTurning({ targetDeg: -90, durationS: 0.5 });
    expect(trace[0].pwm).toBeLessThan(0);
  });

  it("doubling K speeds up convergence (smaller error at fixed time)", () => {
    const baseline = runImuTurning({
      targetDeg: 90,
      durationS: 0.4,
      K: TURN_K,
    });
    const fast = runImuTurning({
      targetDeg: 90,
      durationS: 0.4,
      K: TURN_K * 2,
    });
    expect(finalAbsErrorDeg(fast)).toBeLessThan(finalAbsErrorDeg(baseline));
  });

  it("uses lab default gains K, a, b", () => {
    expect(TURN_K).toBeCloseTo(5.956, 4);
    expect(TURN_A).toBeCloseTo(0.9851, 4);
    expect(TURN_B).toBeCloseTo(0.9704, 4);
  });

  it("control effort is ~K·target at t=0 (no prior history)", () => {
    const target = 30;
    const trace = runImuTurning({ targetDeg: target, durationS: 0.04 });
    const expected = TURN_K * target * DEG_TO_RAD;
    expect(trace[0].controlV).toBeCloseTo(expected, 6);
  });

  it("samples are at uniform spacing equal to sampleS", () => {
    const trace = runImuTurning({
      targetDeg: 45,
      durationS: 0.4,
      sampleS: 0.04,
    });
    for (let i = 1; i < trace.length; i += 1) {
      expect(trace[i].t - trace[i - 1].t).toBeCloseTo(0.04, 9);
    }
  });

  it("heading monotone-ish increases for a right turn (no overshoot worse than 10°)", () => {
    const trace = runImuTurning({ targetDeg: 90, durationS: 2 });
    const peak = Math.max(...trace.map((s) => s.relHeadingDeg));
    expect(peak).toBeLessThan(100);
  });

  it("custom sampleS still converges to a 90° turn", () => {
    const trace = runImuTurning({
      targetDeg: 90,
      durationS: 2,
      sampleS: 0.02,
    });
    expect(finalAbsErrorDeg(trace)).toBeLessThan(8);
  });
});
