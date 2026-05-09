/**
 * Mechatronics M04 — IMU heading-driven turning controller.
 *
 * Faithful re-implementation of the in-place turning logic from
 * decision_making.ino on a BNO055 9-DOF IMU. The robot rotates in place by
 * driving the two motors in opposition (left = +pwm, right = -pwm) until the
 * relative heading change matches a commanded angle.
 *
 * Controller (lab firmware):
 *   U(z)/E(z) = K (z - a) / (z - b)  =>  u[k] = b·u[k-1] + K·e[k] - K·a·e[k-1]
 *   Defaults from Lab firmware: K = 5.956, a = 0.9851, b = 0.9704
 *
 * Plant (rotational analog of M01's first-order velocity model):
 *   ω[k+1] = ω[k] + α (K_rot · pwm[k] / PWM_MAX - ω[k])
 *   heading[k+1] = heading[k] + ω[k] · dt
 *   K_rot ≈ 6 rad/s at full PWM, τ = 0.05 s.
 *
 * Sample period: 40 ms (matches the real STREAMPERIOD).
 *
 * The controller takes the *relative* heading change since start (with
 * 0..360 wraparound), so a 90° command always reaches its target regardless
 * of where the robot starts.
 */

import { PWM_MAX } from "../motorStepResponse/motorStepResponse";
import { voltsToPwm } from "../speedControl/speedControl";

export const TURN_K = 5.956;
export const TURN_A = 0.9851;
export const TURN_B = 0.9704;

export const TURN_SAMPLE_S = 0.04;
export const ROT_GAIN_RAD_S = 6;
export const ROT_TAU_S = 0.05;

export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export interface TurningSample {
  t: number;
  refDeg: number;
  headingDeg: number;
  relHeadingDeg: number;
  errorRad: number;
  controlV: number;
  pwm: number;
  omegaRadS: number;
}

export interface TurningOptions {
  targetDeg: number;
  K?: number;
  a?: number;
  b?: number;
  startHeadingDeg?: number;
  durationS?: number;
  sampleS?: number;
  rotGain?: number;
  rotTau?: number;
}

/**
 * Wrap a heading delta into the controller's expected range:
 * - Positive turns (right): wrap [0, 360)
 * - Negative turns (left): wrap (-360, 0]
 *
 * Mirrors the rel_position adjustment in turning_right (rel_position += 360
 * if negative) and turning_left (no wrap, sign indicates direction).
 */
export function wrapRelHeadingDeg(rel: number, turningRight: boolean): number {
  if (turningRight) {
    let r = rel;
    while (r < 0) r += 360;
    while (r >= 360) r -= 360;
    return r;
  }
  let r = rel;
  while (r > 0) r -= 360;
  while (r <= -360) r += 360;
  return r;
}

/**
 * Run the closed-loop turning simulation. Returns one sample per controller
 * tick (sampleS, default 40 ms).
 */
export function runImuTurning(opts: TurningOptions): TurningSample[] {
  const {
    targetDeg,
    K = TURN_K,
    a = TURN_A,
    b = TURN_B,
    startHeadingDeg = 0,
    durationS = 2,
    sampleS = TURN_SAMPLE_S,
    rotGain = ROT_GAIN_RAD_S,
    rotTau = ROT_TAU_S,
  } = opts;

  const turningRight = targetDeg >= 0;
  const targetRad = targetDeg * DEG_TO_RAD;

  const dt = sampleS;
  const alpha = 1 - Math.exp(-dt / rotTau);
  const steps = Math.max(1, Math.round(durationS / dt));

  let omega = 0;
  let heading = startHeadingDeg;
  let prevError = 0;
  let prevControl = 0;

  const trace: TurningSample[] = [];

  for (let k = 0; k <= steps; k += 1) {
    const t = k * dt;
    const relRaw = heading - startHeadingDeg;
    const relAdjusted = wrapRelHeadingDeg(relRaw, turningRight);
    const relRad = relAdjusted * DEG_TO_RAD;
    const error = targetRad - relRad;

    const control =
      b * prevControl + K * error - K * a * prevError;

    const pwm = Math.max(-PWM_MAX, Math.min(PWM_MAX, voltsToPwm(control)));

    trace.push({
      t,
      refDeg: targetDeg,
      headingDeg: heading,
      relHeadingDeg: relAdjusted,
      errorRad: error,
      controlV: control,
      pwm,
      omegaRadS: omega,
    });

    const omegaCmd = (rotGain * pwm) / PWM_MAX;
    omega = omega + alpha * (omegaCmd - omega);
    heading = heading + omega * dt * RAD_TO_DEG;

    prevError = error;
    prevControl = control;
  }

  return trace;
}

/**
 * Helper: final heading reached by the controller.
 */
export function finalRelHeadingDeg(trace: TurningSample[]): number {
  return trace[trace.length - 1].relHeadingDeg;
}

/**
 * Helper: final |error| in degrees.
 */
export function finalAbsErrorDeg(trace: TurningSample[]): number {
  const last = trace[trace.length - 1];
  return Math.abs(last.errorRad) * RAD_TO_DEG;
}
