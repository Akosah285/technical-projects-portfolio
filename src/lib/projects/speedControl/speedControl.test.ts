import { describe, expect, it } from "vitest";
import { PWM_MAX, VMAX } from "../motorStepResponse/motorStepResponse";
import {
  DEFAULT_P,
  DEFAULT_PI,
  PLANT_DEFAULT,
  controlEffort,
  runClosedLoop,
  steadyStateP,
  tickClosedLoop,
  voltsToPwm,
  type ClosedLoopState,
} from "./speedControl";

const ZERO_STATE: ClosedLoopState = { velocity: 0, controlVolts: 0, errorPrev: 0 };

describe("controlEffort — P controller", () => {
  it("returns Kp · (ref − v) and error = ref − v", () => {
    const { controlVolts, error } = controlEffort(
      { velocity: 30, controlVolts: 0, errorPrev: 0 },
      80,
      { kind: "P", Kp: 0.2 },
    );
    expect(error).toBeCloseTo(50);
    expect(controlVolts).toBeCloseTo(10);
  });
  it("is zero when error is zero", () => {
    const { controlVolts } = controlEffort(
      { velocity: 80, controlVolts: 5, errorPrev: 5 },
      80,
      DEFAULT_P,
    );
    expect(controlVolts).toBe(0);
  });
});

describe("controlEffort — PI controller", () => {
  it("uses the discrete recurrence u[k] = u[k-1] + a·e[k] − b·e[k-1]", () => {
    const { controlVolts, error } = controlEffort(
      { velocity: 50, controlVolts: 4, errorPrev: 30 },
      90,
      { kind: "PI", a: 0.1, b: 0.05 },
    );
    expect(error).toBeCloseTo(40);
    expect(controlVolts).toBeCloseTo(4 + 0.1 * 40 - 0.05 * 30);
  });
  it("integrates a constant error over time (output keeps growing)", () => {
    let s: ClosedLoopState = { velocity: 0, controlVolts: 0, errorPrev: 0 };
    const reference = 50;
    const ctrl = { kind: "PI" as const, a: 0.1, b: 0.05 };
    const us: number[] = [];
    for (let i = 0; i < 5; i++) {
      const { controlVolts, error } = controlEffort(s, reference, ctrl);
      us.push(controlVolts);
      s = { velocity: 0, controlVolts, errorPrev: error };
    }
    for (let i = 1; i < us.length; i++) {
      expect(us[i]).toBeGreaterThan(us[i - 1]!);
    }
  });
});

describe("voltsToPwm", () => {
  it("returns 0 PWM at 0 V", () => {
    expect(voltsToPwm(0)).toBe(0);
  });
  it("returns +PWM_MAX at +VMAX", () => {
    expect(voltsToPwm(VMAX)).toBe(PWM_MAX);
  });
  it("returns −PWM_MAX at −VMAX", () => {
    expect(voltsToPwm(-VMAX)).toBe(-PWM_MAX);
  });
  it("clamps voltages outside ±VMAX", () => {
    expect(voltsToPwm(VMAX * 2)).toBe(PWM_MAX);
    expect(voltsToPwm(-VMAX * 2)).toBe(-PWM_MAX);
  });
  it("scales linearly between 0 and VMAX", () => {
    expect(voltsToPwm(VMAX / 2)).toBe(PWM_MAX / 2);
  });
});

describe("tickClosedLoop", () => {
  it("first tick from zero state computes pwm = sat(Kp · ref · 400/VMAX)", () => {
    const { snapshot } = tickClosedLoop(ZERO_STATE, 80, 0.01, DEFAULT_P);
    expect(snapshot.error).toBeCloseTo(80);
    expect(snapshot.controlVolts).toBeCloseTo(0.12 * 80);
    expect(snapshot.pwm).toBe(voltsToPwm(0.12 * 80));
  });
  it("advances state correctly: u stored, errorPrev stored, velocity updated", () => {
    const { state } = tickClosedLoop(ZERO_STATE, 80, 0.01, DEFAULT_P);
    expect(state.controlVolts).toBeCloseTo(0.12 * 80);
    expect(state.errorPrev).toBeCloseTo(80);
    expect(state.velocity).toBeGreaterThan(0);
  });
});

describe("steadyStateP — closed-form regression target", () => {
  it("matches the simulation steady-state within 2% after 20 time constants", () => {
    const ref = 78.5;
    const expected = steadyStateP(ref, DEFAULT_P);
    const trace = runClosedLoop(ref, 20 * PLANT_DEFAULT.tau, 0.001, DEFAULT_P);
    const final = trace[trace.length - 1]!.velocity;
    expect(Math.abs(final - expected) / expected).toBeLessThan(0.02);
  });
  it("steady-state error is non-zero (P controller cannot eliminate it)", () => {
    const ref = 78.5;
    const ss = steadyStateP(ref, DEFAULT_P);
    expect(ss).toBeLessThan(ref);
    expect(ref - ss).toBeGreaterThan(1);
  });
});

describe("runClosedLoop — PI controller", () => {
  it("converges to the reference (zero steady-state error)", () => {
    const ref = 78.5;
    const trace = runClosedLoop(ref, 60 * PLANT_DEFAULT.tau, 0.001, DEFAULT_PI);
    const final = trace[trace.length - 1]!.velocity;
    expect(Math.abs(final - ref) / ref).toBeLessThan(0.01);
  });
  it("PI ends closer to the reference than P at the same horizon", () => {
    const ref = 78.5;
    const dur = 30 * PLANT_DEFAULT.tau;
    const dt = 0.001;
    const pTrace = runClosedLoop(ref, dur, dt, DEFAULT_P);
    const piTrace = runClosedLoop(ref, dur, dt, DEFAULT_PI);
    const pErr = Math.abs(pTrace[pTrace.length - 1]!.error);
    const piErr = Math.abs(piTrace[piTrace.length - 1]!.error);
    expect(piErr).toBeLessThan(pErr);
  });
});

describe("runClosedLoop — invariants for both controllers", () => {
  for (const ctrl of [DEFAULT_P, DEFAULT_PI] as const) {
    it(`${ctrl.kind}: first sample has t=0, v=0, error=ref`, () => {
      const trace = runClosedLoop(50, 0.05, 0.005, ctrl);
      expect(trace[0]?.t).toBe(0);
      expect(trace[0]?.velocity).toBe(0);
      expect(trace[0]?.error).toBeCloseTo(50);
    });
    it(`${ctrl.kind}: pwm always within ±PWM_MAX`, () => {
      const trace = runClosedLoop(120, 0.4, 0.002, ctrl);
      for (const s of trace) {
        expect(Math.abs(s.pwm)).toBeLessThanOrEqual(PWM_MAX);
      }
    });
  }
});
