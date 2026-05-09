/**
 * Motor step response — open-loop first-order system identification.
 *
 * From E147 Lab 1 (Lab1_part2_timed_loop.ino + BigCompilationExample.ino):
 * apply a constant PWM step (e.g. -400) to the brushed DC motor through the
 * Arduino Motor Shield, sample the LS7366 quadrature encoder every STREAMPERIOD
 * microseconds, and observe the velocity trace as it rises from 0 to its
 * steady-state value.
 *
 * The brushed motor + load behaves like a first-order system:
 *   τ · dv/dt + v = K · u            (u in volts, v in rad/s)
 * with discrete-time solution
 *   v[n+1] = v[n] + α · (v_ss − v[n]),   α = 1 − exp(−Δt/τ)
 * and steady-state v_ss = K · u.
 *
 * Conventions used by the lab firmware:
 *  - PWM range is [−PWM_MAX, +PWM_MAX] with PWM_MAX = 400 (ArduinoMotorShield).
 *  - Motor saturates at ±VMAX = ±9.6 V; PWM scales linearly to volts.
 *  - Encoder has COUNTS_PER_REV = 1440 counts/rev (4× the 360-CPR stripe).
 */

export interface MotorParams {
  /** Steady-state velocity (rad/s) at full positive PWM. */
  K: number;
  /** Mechanical time constant (seconds). */
  tau: number;
}

export interface StepResponseSnapshot {
  /** Time since step (seconds). */
  t: number;
  /** Velocity (rad/s). */
  velocity: number;
  /** Applied PWM (signed, [-PWM_MAX..PWM_MAX]). */
  pwm: number;
  /** Motor terminal voltage (V), proportional to PWM. */
  voltage: number;
}

export const PWM_MAX = 400;
export const VMAX = 9.6;
export const COUNTS_PER_REV = 1440;

/**
 * Default motor characterisation values. Chosen to match the order-of-magnitude
 * student-fit values reported in the Lab 1 / Lab 2 writeups: ~78 rad/s steady
 * state at the lab's nominal step input, ~60 ms time constant.
 */
export const DEFAULT_MOTOR: MotorParams = { K: 100, tau: 0.06 };

export function pwmToVolts(pwm: number): number {
  return (pwm / PWM_MAX) * VMAX;
}

export function steadyStateVelocity(pwm: number, p: MotorParams = DEFAULT_MOTOR): number {
  return (pwm / PWM_MAX) * p.K;
}

/** One discrete-time step of the first-order velocity model. */
export function stepVelocity(
  prev: number,
  pwm: number,
  dt: number,
  p: MotorParams = DEFAULT_MOTOR,
): number {
  if (p.tau <= 0) return steadyStateVelocity(pwm, p);
  const target = steadyStateVelocity(pwm, p);
  const alpha = 1 - Math.exp(-dt / p.tau);
  return prev + alpha * (target - prev);
}

/**
 * Run the step-response open-loop experiment.
 * Returns one snapshot at every dt seconds, including t=0 (v=0).
 */
export function runStepResponse(
  pwm: number,
  duration: number,
  dt: number,
  p: MotorParams = DEFAULT_MOTOR,
): StepResponseSnapshot[] {
  const samples: StepResponseSnapshot[] = [];
  const n = Math.max(1, Math.floor(duration / dt) + 1);
  const v0 = 0;
  let v = v0;
  for (let i = 0; i < n; i++) {
    samples.push({
      t: i * dt,
      velocity: v,
      pwm,
      voltage: pwmToVolts(pwm),
    });
    v = stepVelocity(v, pwm, dt, p);
  }
  return samples;
}

/** Lab firmware: counts/sec from the encoder → rad/s. */
export function countsPerSecondToRadS(cps: number): number {
  return (cps / COUNTS_PER_REV) * 2 * Math.PI;
}

/** Average the last 10% of samples — robust steady-state estimate. */
export function estimateSteadyState(samples: StepResponseSnapshot[]): number {
  if (samples.length === 0) return 0;
  const tail = samples.slice(Math.floor(samples.length * 0.9));
  return tail.reduce((s, x) => s + x.velocity, 0) / tail.length;
}

/**
 * Estimate the time constant by finding when velocity first reaches 63.2% of
 * its steady-state value — the textbook one-τ rise definition.
 */
export function estimateTimeConstant(samples: StepResponseSnapshot[]): number {
  if (samples.length === 0) return 0;
  const ss = estimateSteadyState(samples);
  if (ss === 0) return 0;
  const threshold = 0.632 * ss;
  for (const s of samples) {
    if (Math.sign(ss) >= 0 ? s.velocity >= threshold : s.velocity <= threshold) {
      return s.t;
    }
  }
  return samples[samples.length - 1]?.t ?? 0;
}
