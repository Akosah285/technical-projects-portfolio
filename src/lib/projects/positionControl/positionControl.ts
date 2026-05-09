/**
 * Discrete-time motor position control — ENGS 147 Lab 4.
 *
 * The plant is the same first-order brushed DC motor as M01/M02, but the
 * output we now control is angular position (the integral of velocity).
 * That gives the open-loop plant from voltage to position the structure
 *
 *   G(s) = (K_motor/VMAX) / (s · (τ·s + 1))
 *
 * — a near-integrator plus a first-order pole. Lab 4 designs a discrete
 * lead-style compensator
 *
 *   C(z) = K · (z − a) / (z − b)        ⇒    u[k] = b·u[k-1] + K·e[k] − K·a·e[k-1]
 *
 * The reference is a square wave (the firmware flips its sign every
 * 37 sample periods), and the closed loop chases each new reference through
 * the same plant.
 *
 * Defaults match the student's own tuning:  K = 7.143,  a = 0.9231,  b = 0.5094.
 */

import {
  PWM_MAX,
  stepVelocity,
  type MotorParams,
} from "../motorStepResponse/motorStepResponse";
import { voltsToPwm } from "../speedControl/speedControl";

export interface ZDomainController {
  K: number;
  a: number;
  b: number;
}

export interface PositionState {
  position: number;
  velocity: number;
  controlVolts: number;
  errorPrev: number;
}

export interface PositionSnapshot {
  t: number;
  reference: number;
  position: number;
  velocity: number;
  error: number;
  controlVolts: number;
  pwm: number;
}

export const PLANT_DEFAULT: MotorParams = { K: 100, tau: 0.06 };

export const DEFAULT_CONTROLLER: ZDomainController = {
  K: 7.143,
  a: 0.9231,
  b: 0.5094,
};

export const ZERO_STATE: PositionState = {
  position: 0,
  velocity: 0,
  controlVolts: 0,
  errorPrev: 0,
};

export function controlEffort(
  state: PositionState,
  reference: number,
  ctrl: ZDomainController,
): { controlVolts: number; error: number } {
  const error = reference - state.position;
  const u =
    ctrl.b * state.controlVolts + ctrl.K * error - ctrl.K * ctrl.a * state.errorPrev;
  return { controlVolts: u, error };
}

/** One sample period of the closed loop. */
export function tickPosition(
  state: PositionState,
  reference: number,
  dt: number,
  ctrl: ZDomainController,
  plant: MotorParams = PLANT_DEFAULT,
): PositionState {
  const { controlVolts, error } = controlEffort(state, reference, ctrl);
  const pwm = voltsToPwm(controlVolts);
  const velocityNext = stepVelocity(state.velocity, pwm, dt, plant);
  // Left-edge Euler — position advances using the velocity the plant carried
  // through the just-completed interval.
  const positionNext = state.position + state.velocity * dt;
  return {
    position: positionNext,
    velocity: velocityNext,
    controlVolts,
    errorPrev: error,
  };
}

/** Square wave: +amplitude on even half-periods, −amplitude on odd half-periods. */
export function squareWaveReference(
  t: number,
  amplitude: number,
  halfPeriod: number,
): number {
  if (halfPeriod <= 0) return amplitude;
  const phase = Math.floor(t / halfPeriod);
  return phase % 2 === 0 ? amplitude : -amplitude;
}

export function runPositionControl(
  amplitude: number,
  halfPeriod: number,
  duration: number,
  dt: number,
  ctrl: ZDomainController = DEFAULT_CONTROLLER,
  plant: MotorParams = PLANT_DEFAULT,
): PositionSnapshot[] {
  const samples: PositionSnapshot[] = [];
  const n = Math.max(1, Math.floor(duration / dt) + 1);
  let state: PositionState = { ...ZERO_STATE };
  for (let i = 0; i < n; i++) {
    const t = i * dt;
    const reference = squareWaveReference(t, amplitude, halfPeriod);
    const { controlVolts, error } = controlEffort(state, reference, ctrl);
    const pwm = voltsToPwm(controlVolts);
    samples.push({
      t,
      reference,
      position: state.position,
      velocity: state.velocity,
      error,
      controlVolts,
      pwm,
    });
    state = tickPosition(state, reference, dt, ctrl, plant);
  }
  return samples;
}

/** Re-export for the player. */
export { PWM_MAX };
