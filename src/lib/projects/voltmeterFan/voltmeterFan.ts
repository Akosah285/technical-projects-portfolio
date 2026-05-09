/**
 * Voltmeter + temperature → fan controller (Lab 3 + Lab 4 of E85, WI21).
 *
 * The original setup wires a TMP36 analog temperature sensor into
 * the AVR ADC. The 10-bit ADC samples the sensor once a second
 * (TIMER1 compare-match interrupt) and the firmware drives three
 * pins on PORTB:
 *
 *   PORTB0 — red LED   (hot)
 *   PORTB1 — green LED (cool)
 *   PORTB2 — fan       (cooling load)
 *
 * Decision rule (with built-in hysteresis):
 *   celsius ≤ LOW  →  green on,  red off, fan off
 *   celsius ≥ HIGH →  red   on,  green off, fan on
 *   otherwise      →  hold previous outputs (deadband)
 *
 * Calibration of TMP36 (datasheet):
 *   V_out [mV] = 10 · T[°C] + 500
 *   so T[°C] = (V_out − 500) / 10
 */

export const LOW_C = 26;
export const HIGH_C = 28;
export const VDD_MV = 5000;
export const ADC_RESOLUTION = 1024;

export interface ControllerState {
  redOn: boolean;
  greenOn: boolean;
  fanOn: boolean;
}

export const INITIAL_CONTROLLER: ControllerState = {
  redOn: false,
  greenOn: false,
  fanOn: false,
};

export function tmp36VoltageMv(celsius: number): number {
  if (!Number.isFinite(celsius)) throw new Error("celsius must be finite");
  return 10 * celsius + 500;
}

export function voltageMvToAdc(voltageMv: number, vddMv = VDD_MV): number {
  if (!Number.isFinite(voltageMv) || !Number.isFinite(vddMv) || vddMv <= 0) {
    throw new Error("invalid voltage / vdd");
  }
  const raw = Math.round((voltageMv / vddMv) * (ADC_RESOLUTION - 1));
  return Math.max(0, Math.min(ADC_RESOLUTION - 1, raw));
}

export function adcToVoltageMv(adc: number, vddMv = VDD_MV): number {
  if (adc < 0 || adc >= ADC_RESOLUTION) throw new RangeError("adc out of range");
  return (adc * vddMv) / (ADC_RESOLUTION - 1);
}

export function voltageMvToCelsius(voltageMv: number): number {
  return (voltageMv - 500) / 10;
}

export function celsiusToFahrenheit(c: number): number {
  return 1.8 * c + 32;
}

/**
 * Apply the controller's hysteresis rule.
 * Pure function — pass in the previous output state to preserve
 * deadband behaviour.
 */
export function controllerStep(
  prev: ControllerState,
  celsius: number,
  low = LOW_C,
  high = HIGH_C,
): ControllerState {
  if (low > high) throw new Error("low must be ≤ high");
  if (celsius <= low) {
    return { redOn: false, greenOn: true, fanOn: false };
  }
  if (celsius >= high) {
    return { redOn: true, greenOn: false, fanOn: true };
  }
  return { ...prev };
}

export interface FullReading {
  celsius: number;
  voltageMv: number;
  adc: number;
  recoveredCelsius: number;
  fahrenheit: number;
  outputs: ControllerState;
}

/** End-to-end measurement pipeline as the firmware would run it. */
export function measureAndControl(
  ambientCelsius: number,
  prev: ControllerState = INITIAL_CONTROLLER,
  vddMv: number = VDD_MV,
): FullReading {
  const voltageMv = tmp36VoltageMv(ambientCelsius);
  const adc = voltageMvToAdc(voltageMv, vddMv);
  const recoveredVoltageMv = adcToVoltageMv(adc, vddMv);
  const recoveredCelsius = voltageMvToCelsius(recoveredVoltageMv);
  const outputs = controllerStep(prev, recoveredCelsius);
  return {
    celsius: ambientCelsius,
    voltageMv,
    adc,
    recoveredCelsius,
    fahrenheit: celsiusToFahrenheit(recoveredCelsius),
    outputs,
  };
}
