import { describe, expect, it } from "vitest";
import { PWM_MAX } from "../motorStepResponse/motorStepResponse";
import {
  DEFAULT_CONTROLLER,
  PLANT_DEFAULT,
  ZERO_STATE,
  controlEffort,
  runPositionControl,
  squareWaveReference,
  tickPosition,
} from "./positionControl";

describe("controlEffort — discrete K(z-a)/(z-b)", () => {
  it("uses the recurrence u[k] = b·u[k-1] + K·e[k] − K·a·e[k-1]", () => {
    const state = { position: 0.2, velocity: 0, controlVolts: 1.5, errorPrev: 0.4 };
    const ref = 1.0;
    const ctrl = { K: 5, a: 0.9, b: 0.5 };
    const { controlVolts, error } = controlEffort(state, ref, ctrl);
    expect(error).toBeCloseTo(0.8);
    // 0.5·1.5 + 5·0.8 − 5·0.9·0.4 = 0.75 + 4.0 − 1.8 = 2.95
    expect(controlVolts).toBeCloseTo(2.95);
  });
  it("error reflects current position (not velocity)", () => {
    const state = { position: 1.5, velocity: 999, controlVolts: 0, errorPrev: 0 };
    const { error } = controlEffort(state, 1.5, { K: 1, a: 0, b: 0 });
    expect(error).toBe(0);
  });
});

describe("squareWaveReference", () => {
  it("returns +amplitude at t = 0", () => {
    expect(squareWaveReference(0, 1.0, 0.4)).toBe(1.0);
  });
  it("returns +amplitude just before the first flip", () => {
    expect(squareWaveReference(0.39, 1.0, 0.4)).toBe(1.0);
  });
  it("flips to −amplitude at exactly halfPeriod", () => {
    expect(squareWaveReference(0.4, 1.0, 0.4)).toBe(-1.0);
  });
  it("flips back to +amplitude at 2·halfPeriod", () => {
    expect(squareWaveReference(0.8, 1.0, 0.4)).toBe(1.0);
  });
  it("works for arbitrary amplitude (e.g. π/3)", () => {
    const r = Math.PI / 3;
    expect(squareWaveReference(0.5, r, 0.4)).toBe(-r);
  });
});

describe("tickPosition — single sample period", () => {
  it("integrates position by velocity·dt (left-edge Euler)", () => {
    const start = { position: 0.5, velocity: 2.0, controlVolts: 0, errorPrev: 0 };
    const next = tickPosition(start, 0.5, 0.01, { K: 0, a: 0, b: 0 });
    // K = 0 so no control, no plant excitation. Position += v·dt.
    expect(next.position).toBeCloseTo(0.5 + 2.0 * 0.01);
  });
  it("stores the new control voltage and current error in the next state", () => {
    const next = tickPosition(ZERO_STATE, 1.0, 0.01, DEFAULT_CONTROLLER);
    // first tick from zero: e=1, u = K · 1 = 7.143
    expect(next.controlVolts).toBeCloseTo(DEFAULT_CONTROLLER.K * 1.0);
    expect(next.errorPrev).toBe(1.0);
  });
});

describe("runPositionControl — square-wave tracking", () => {
  it("first sample carries (t=0, position=0, reference=+amp, error=+amp)", () => {
    const trace = runPositionControl(1.0, 0.4, 0.05, 0.005);
    expect(trace[0]?.t).toBe(0);
    expect(trace[0]?.position).toBe(0);
    expect(trace[0]?.reference).toBe(1.0);
    expect(trace[0]?.error).toBe(1.0);
  });
  it("the closed loop drives position close to the reference within one half-period (within 30 %)", () => {
    const amp = Math.PI / 3;
    const halfP = 0.4;
    const trace = runPositionControl(amp, halfP, halfP, 0.001);
    const last = trace[trace.length - 1]!;
    expect(Math.abs(last.position - amp) / amp).toBeLessThan(0.3);
  });
  it("reference flips sign at exactly halfPeriod, error jumps in magnitude", () => {
    const halfP = 0.4;
    const dt = 0.001;
    const trace = runPositionControl(1.0, halfP, 1.2, dt);
    const flipIdx = Math.round(halfP / dt);
    expect(trace[flipIdx]!.reference).toBe(-1.0);
    expect(trace[flipIdx - 1]!.reference).toBe(1.0);
    // error magnitude jumps because position is positive but ref is now negative
    expect(Math.abs(trace[flipIdx]!.error)).toBeGreaterThan(Math.abs(trace[flipIdx - 1]!.error));
  });
  it("PWM stays within ±PWM_MAX even during big reference jumps", () => {
    const trace = runPositionControl(2.0, 0.3, 1.0, 0.001);
    for (const s of trace) {
      expect(Math.abs(s.pwm)).toBeLessThanOrEqual(PWM_MAX);
    }
  });
  it("position eventually decreases after a +→− flip (controller chases the new reference)", () => {
    const halfP = 0.4;
    const dt = 0.001;
    const trace = runPositionControl(1.0, halfP, 2 * halfP, dt);
    const flipIdx = Math.round(halfP / dt);
    const peakAfterFlip = trace
      .slice(flipIdx, flipIdx + Math.round(0.05 / dt))
      .reduce((max, s) => Math.max(max, s.position), -Infinity);
    const finalPos = trace[trace.length - 1]!.position;
    expect(finalPos).toBeLessThan(peakAfterFlip);
  });
});

describe("plant + controller defaults are sane", () => {
  it("DEFAULT_CONTROLLER values match the lab firmware", () => {
    expect(DEFAULT_CONTROLLER.K).toBeCloseTo(7.143);
    expect(DEFAULT_CONTROLLER.a).toBeCloseTo(0.9231);
    expect(DEFAULT_CONTROLLER.b).toBeCloseTo(0.5094);
  });
  it("PLANT_DEFAULT matches the M01 plant", () => {
    expect(PLANT_DEFAULT.K).toBe(100);
    expect(PLANT_DEFAULT.tau).toBe(0.06);
  });
});
