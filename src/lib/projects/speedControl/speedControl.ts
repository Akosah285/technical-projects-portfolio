/**
 * Closed-loop speed control of the brushed DC motor.
 *
 * Two controllers, same first-order plant (M01 motorStepResponse):
 *
 *   P (Lab 2):   u[k] = Kp · e[k]
 *   PI (Lab 3):  u[k] = u[k-1] + a · e[k] − b · e[k-1]
 *                where a = Kp + Ki · Ts, b = Kp
 *                (backward-difference discretisation of the continuous
 *                 PI law u(t) = Kp · e(t) + Ki · ∫ e dt)
 *
 * The pure proportional law leaves a measurable steady-state error because
 * the only way it can produce a non-zero control output is for the error to
 * stay non-zero. The PI law's integrator drives the steady-state error to
 * zero — that's the entire point of Lab 3, and the comparison is the entire
 * point of this slice.
 */

import {
  PWM_MAX,
  VMAX,
  pwmToVolts,
  stepVelocity,
  type MotorParams,
} from "../motorStepResponse/motorStepResponse";

export interface PController {
  kind: "P";
  Kp: number;
}

export interface PIController {
  kind: "PI";
  a: number;
  b: number;
}

export type Controller = PController | PIController;

export interface ClosedLoopState {
  /** Plant output velocity (rad/s). */
  velocity: number;
  /** u[k-1] — the last control voltage applied. Needed by the PI recurrence. */
  controlVolts: number;
  /** e[k-1] — the previous error. Needed by the PI recurrence. */
  errorPrev: number;
}

export interface ClosedLoopSnapshot {
  t: number;
  velocity: number;
  reference: number;
  error: number;
  controlVolts: number;
  pwm: number;
}

/** Same first-order plant the M01 step-response slice uses. */
export const PLANT_DEFAULT: MotorParams = { K: 100, tau: 0.06 };

/** Lab 2 default proportional gain (volts per rad/s). */
export const DEFAULT_P: PController = { kind: "P", Kp: 0.12 };

/** Lab 3 default discrete PI tuple — `a = 0.106, b = 0.094`. */
export const DEFAULT_PI: PIController = { kind: "PI", a: 0.106, b: 0.094 };

/** Compute the next control effort (volts) and the current error. */
export function controlEffort(
  state: ClosedLoopState,
  reference: number,
  ctrl: Controller,
): { controlVolts: number; error: number } {
  const error = reference - state.velocity;
  if (ctrl.kind === "P") {
    return { controlVolts: ctrl.Kp * error, error };
  }
  return {
    controlVolts: state.controlVolts + ctrl.a * error - ctrl.b * state.errorPrev,
    error,
  };
}

/** Map a control voltage onto the PWM register, clamping to ±PWM_MAX. */
export function voltsToPwm(volts: number): number {
  const raw = Math.round(volts * (PWM_MAX / VMAX));
  if (raw > PWM_MAX) return PWM_MAX;
  if (raw < -PWM_MAX) return -PWM_MAX;
  return raw;
}

/** One closed-loop sample period — compute control, saturate, advance plant. */
export function tickClosedLoop(
  state: ClosedLoopState,
  reference: number,
  dt: number,
  ctrl: Controller,
  plant: MotorParams = PLANT_DEFAULT,
): { state: ClosedLoopState; snapshot: Omit<ClosedLoopSnapshot, "t"> } {
  const { controlVolts, error } = controlEffort(state, reference, ctrl);
  const pwm = voltsToPwm(controlVolts);
  const next: ClosedLoopState = {
    velocity: stepVelocity(state.velocity, pwm, dt, plant),
    controlVolts,
    errorPrev: error,
  };
  return {
    state: next,
    snapshot: {
      velocity: state.velocity,
      reference,
      error,
      controlVolts,
      pwm,
    },
  };
}

export function runClosedLoop(
  reference: number,
  duration: number,
  dt: number,
  ctrl: Controller,
  plant: MotorParams = PLANT_DEFAULT,
): ClosedLoopSnapshot[] {
  const samples: ClosedLoopSnapshot[] = [];
  const n = Math.max(1, Math.floor(duration / dt) + 1);
  let state: ClosedLoopState = { velocity: 0, controlVolts: 0, errorPrev: 0 };
  for (let i = 0; i < n; i++) {
    const { state: next, snapshot } = tickClosedLoop(state, reference, dt, ctrl, plant);
    samples.push({ t: i * dt, ...snapshot });
    state = next;
  }
  return samples;
}

/**
 * Closed-form steady-state velocity for a pure-P controller against the
 * first-order plant v_ss = (K/VMAX) · u with u = Kp · (ref − v_ss).
 *
 *   v_ss = ref · (K · Kp / VMAX) / (1 + K · Kp / VMAX)
 *
 * Useful as a regression target — `runClosedLoop` should converge here
 * after several time constants.
 */
export function steadyStateP(reference: number, ctrl: PController, plant: MotorParams = PLANT_DEFAULT): number {
  const loopGain = (plant.K * ctrl.Kp) / VMAX;
  return (reference * loopGain) / (1 + loopGain);
}

/** Re-export so callers don't need a second import. */
export { pwmToVolts };
