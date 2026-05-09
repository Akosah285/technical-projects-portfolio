/**
 * DC motor + PWM + RPM speedometer (Lab 7 of E85, WI21).
 *
 * The physical setup wires:
 *   - a 10kΩ potentiometer to ADC channel 0 (0..1023)
 *   - a TB6612 H-bridge to drive a small DC motor with PWM on PD9
 *   - an optical/IR speed sensor on PIND7 with pull-up,
 *     producing one pulse per propeller blade per rev (3 blades).
 *
 * The control rule the firmware implements:
 *
 *   adc near MID_ADC (within ±DEAD_BAND)  → BRAKE, pwm = 0
 *   adc above MID + DEAD_BAND             → FWD, pwm rises with adc
 *   adc below MID - DEAD_BAND             → REV, pwm rises with -adc
 *
 * RPM is computed every 1 second from the pulse count at 3
 * pulses-per-revolution: RPM = 3 · pulses / 1s · 60s = 180 · pulses,
 * but the original code uses 3·pulses (per second) and prints that
 * as "RPM" — so we keep the same convention.
 */

export type MotorMode = "FWD" | "REV" | "BRAKE";

export const MID_ADC = 512;
export const MAX_ADC = 1023;
export const DEAD_BAND = 5;
export const MOTOR_MIN = 0;
export const MOTOR_MAX = 1250;
export const PULSES_PER_REV = 3;

export interface MotorCommand {
  mode: MotorMode;
  /** PWM duty value, between MOTOR_MIN and MOTOR_MAX (always positive). */
  pwm: number;
}

/** Map an ADC reading from the potentiometer to the motor command. */
export function configureMotor(adcValue: number): MotorCommand {
  if (!Number.isFinite(adcValue)) throw new Error("adc must be finite");
  if (adcValue < 0 || adcValue > MAX_ADC) {
    throw new RangeError("adc out of 10-bit range");
  }
  if (Math.abs(adcValue - MID_ADC) <= DEAD_BAND) {
    return { mode: "BRAKE", pwm: 0 };
  }
  // For FWD: pwm grows from 0 at (MID + dead) up to MOTOR_MAX at MAX_ADC.
  // For REV: symmetric on the other side.
  const span = MAX_ADC - (MID_ADC + DEAD_BAND);
  if (adcValue > MID_ADC + DEAD_BAND) {
    const t = (adcValue - (MID_ADC + DEAD_BAND)) / span;
    return {
      mode: "FWD",
      pwm: Math.round(MOTOR_MIN + (MOTOR_MAX - MOTOR_MIN) * t),
    };
  }
  // adc < MID_ADC - DEAD_BAND
  const t = ((MID_ADC - DEAD_BAND) - adcValue) / span;
  return {
    mode: "REV",
    pwm: Math.round(MOTOR_MIN + (MOTOR_MAX - MOTOR_MIN) * t),
  };
}

/**
 * Compute the displayed RPM from a 1-second pulse count, mirroring
 * the lab's `RPM = 3 * pulses` formula (with sign for direction).
 */
export function pulsesToRPM(pulses: number, mode: MotorMode): number {
  if (pulses < 0 || !Number.isInteger(pulses)) {
    throw new Error("pulses must be a non-negative integer");
  }
  const magnitude = PULSES_PER_REV * pulses;
  return mode === "REV" ? -magnitude : magnitude;
}

/**
 * Model a one-second tick: given the motor's current command,
 * estimate how many sensor pulses would arrive. Real motors
 * accelerate, but for the simulator we map PWM linearly to RPM
 * with a small slip, then derive pulses.
 *
 * MOTOR_MAX PWM ≈ 1500 RPM at the spindle, with 3 pulses/rev
 * → 75 pulses/sec at full throttle.
 */
export const FULL_THROTTLE_RPM = 1500;

export function expectedPulsesPerSecond(command: MotorCommand): number {
  if (command.mode === "BRAKE") return 0;
  const dutyFraction = (command.pwm - MOTOR_MIN) / (MOTOR_MAX - MOTOR_MIN);
  const rpm = dutyFraction * FULL_THROTTLE_RPM;
  return (rpm / 60) * PULSES_PER_REV;
}
