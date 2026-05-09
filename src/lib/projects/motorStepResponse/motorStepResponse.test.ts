import { describe, expect, it } from "vitest";
import {
  COUNTS_PER_REV,
  DEFAULT_MOTOR,
  PWM_MAX,
  VMAX,
  countsPerSecondToRadS,
  estimateSteadyState,
  estimateTimeConstant,
  pwmToVolts,
  runStepResponse,
  steadyStateVelocity,
  stepVelocity,
} from "./motorStepResponse";

describe("pwmToVolts", () => {
  it("returns 0 V at PWM = 0", () => {
    expect(pwmToVolts(0)).toBe(0);
  });
  it("returns ±VMAX at ±PWM_MAX (full saturation)", () => {
    expect(pwmToVolts(PWM_MAX)).toBeCloseTo(VMAX);
    expect(pwmToVolts(-PWM_MAX)).toBeCloseTo(-VMAX);
  });
  it("scales linearly between 0 and PWM_MAX", () => {
    expect(pwmToVolts(PWM_MAX / 2)).toBeCloseTo(VMAX / 2);
  });
});

describe("steadyStateVelocity", () => {
  it("is zero at PWM = 0", () => {
    expect(steadyStateVelocity(0)).toBe(0);
  });
  it("returns K at PWM_MAX with default motor params", () => {
    expect(steadyStateVelocity(PWM_MAX)).toBeCloseTo(DEFAULT_MOTOR.K);
  });
  it("is symmetric in sign", () => {
    expect(steadyStateVelocity(-PWM_MAX)).toBeCloseTo(-DEFAULT_MOTOR.K);
  });
});

describe("stepVelocity (one discrete-time step)", () => {
  it("returns prev when dt is zero (no time has passed)", () => {
    expect(stepVelocity(42, 200, 0)).toBeCloseTo(42);
  });
  it("snaps to steady-state when tau is zero (instant motor)", () => {
    const v = stepVelocity(0, PWM_MAX, 0.01, { K: 50, tau: 0 });
    expect(v).toBeCloseTo(50);
  });
  it("after dt = tau, velocity is ~63.2% of the way from 0 → v_ss", () => {
    const params = { K: 100, tau: 0.06 };
    const v = stepVelocity(0, PWM_MAX, params.tau, params);
    expect(v / params.K).toBeCloseTo(0.632, 2);
  });
});

describe("runStepResponse", () => {
  it("first sample is (t=0, v=0) regardless of PWM", () => {
    const trace = runStepResponse(PWM_MAX, 0.2, 0.005);
    expect(trace[0]?.t).toBe(0);
    expect(trace[0]?.velocity).toBe(0);
  });
  it("samples carry the applied PWM and the corresponding voltage", () => {
    const trace = runStepResponse(200, 0.05, 0.005);
    for (const s of trace) {
      expect(s.pwm).toBe(200);
      expect(s.voltage).toBeCloseTo(pwmToVolts(200));
    }
  });
  it("settles within 5% of steady-state by 5τ for a positive step", () => {
    const params = { K: 80, tau: 0.05 };
    const trace = runStepResponse(PWM_MAX, 5 * params.tau, 0.001, params);
    const final = trace[trace.length - 1]!.velocity;
    expect(Math.abs(final - params.K) / params.K).toBeLessThan(0.05);
  });
  it("velocity is monotonic non-decreasing for a positive step (no overshoot)", () => {
    const trace = runStepResponse(PWM_MAX, 0.5, 0.005);
    for (let i = 1; i < trace.length; i++) {
      expect(trace[i]!.velocity).toBeGreaterThanOrEqual(trace[i - 1]!.velocity);
    }
  });
  it("velocity is monotonic non-increasing for a negative step", () => {
    const trace = runStepResponse(-PWM_MAX, 0.5, 0.005);
    for (let i = 1; i < trace.length; i++) {
      expect(trace[i]!.velocity).toBeLessThanOrEqual(trace[i - 1]!.velocity);
    }
  });
});

describe("estimateSteadyState + estimateTimeConstant (round-trip)", () => {
  it("recovers steady-state K from a generated trace within 2%", () => {
    const params = { K: 75, tau: 0.04 };
    const trace = runStepResponse(PWM_MAX, 10 * params.tau, 0.0005, params);
    const ss = estimateSteadyState(trace);
    expect(Math.abs(ss - params.K) / params.K).toBeLessThan(0.02);
  });
  it("recovers time constant tau from a generated trace within 1 sample", () => {
    const params = { K: 60, tau: 0.08 };
    const dt = 0.001;
    const trace = runStepResponse(PWM_MAX, 10 * params.tau, dt, params);
    const tauEst = estimateTimeConstant(trace);
    expect(Math.abs(tauEst - params.tau)).toBeLessThan(2 * dt);
  });
  it("works for a negative step too", () => {
    const params = { K: 50, tau: 0.05 };
    const trace = runStepResponse(-PWM_MAX, 8 * params.tau, 0.001, params);
    const ss = estimateSteadyState(trace);
    expect(ss).toBeCloseTo(-params.K, 0);
  });
});

describe("countsPerSecondToRadS (lab firmware conversion)", () => {
  it("returns 2π for COUNTS_PER_REV counts per second (one rev per second)", () => {
    expect(countsPerSecondToRadS(COUNTS_PER_REV)).toBeCloseTo(2 * Math.PI);
  });
  it("is linear", () => {
    expect(countsPerSecondToRadS(2 * COUNTS_PER_REV)).toBeCloseTo(4 * Math.PI);
  });
});
