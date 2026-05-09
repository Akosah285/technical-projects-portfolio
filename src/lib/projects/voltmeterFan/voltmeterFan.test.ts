import { describe, it, expect } from "vitest";
import {
  HIGH_C,
  INITIAL_CONTROLLER,
  LOW_C,
  adcToVoltageMv,
  celsiusToFahrenheit,
  controllerStep,
  measureAndControl,
  tmp36VoltageMv,
  voltageMvToAdc,
  voltageMvToCelsius,
  type ControllerState,
} from "./voltmeterFan";

describe("TMP36 calibration", () => {
  it("25 °C → 750 mV (datasheet)", () => {
    expect(tmp36VoltageMv(25)).toBe(750);
  });

  it("0 °C → 500 mV", () => {
    expect(tmp36VoltageMv(0)).toBe(500);
  });

  it("inverse converts back", () => {
    for (const c of [-10, 0, 10, 22, 25, 30, 50]) {
      expect(voltageMvToCelsius(tmp36VoltageMv(c))).toBeCloseTo(c, 9);
    }
  });

  it("rejects non-finite input", () => {
    expect(() => tmp36VoltageMv(Number.NaN)).toThrow();
  });
});

describe("ADC quantisation", () => {
  it("0 V maps to ADC 0; VDD maps to max code", () => {
    expect(voltageMvToAdc(0)).toBe(0);
    expect(voltageMvToAdc(5000)).toBe(1023);
  });

  it("clamps over- and under-voltage to the legal range", () => {
    expect(voltageMvToAdc(-100)).toBe(0);
    expect(voltageMvToAdc(10000)).toBe(1023);
  });

  it("ADC ↔ voltage round-trip is within one LSB", () => {
    const lsbMv = 5000 / 1023;
    for (let v = 0; v <= 5000; v += 137) {
      const adc = voltageMvToAdc(v);
      const vBack = adcToVoltageMv(adc);
      expect(Math.abs(v - vBack)).toBeLessThan(lsbMv);
    }
  });

  it("ADC index out of range is rejected", () => {
    expect(() => adcToVoltageMv(-1)).toThrow();
    expect(() => adcToVoltageMv(1024)).toThrow();
  });
});

describe("Celsius ↔ Fahrenheit", () => {
  it("converts standard reference points", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(25)).toBe(77);
  });
});

describe("controllerStep — Lab 4 hysteresis rule", () => {
  it("below LOW: green on, red off, fan off", () => {
    const s = controllerStep(INITIAL_CONTROLLER, LOW_C - 5);
    expect(s).toEqual({ redOn: false, greenOn: true, fanOn: false });
  });

  it("above HIGH: red on, green off, fan on", () => {
    const s = controllerStep(INITIAL_CONTROLLER, HIGH_C + 5);
    expect(s).toEqual({ redOn: true, greenOn: false, fanOn: true });
  });

  it("between LOW and HIGH: holds the previous state (hysteresis)", () => {
    const cool: ControllerState = { redOn: false, greenOn: true, fanOn: false };
    const hot: ControllerState = { redOn: true, greenOn: false, fanOn: true };
    expect(controllerStep(cool, 27)).toEqual(cool);
    expect(controllerStep(hot, 27)).toEqual(hot);
  });

  it("at exactly LOW or HIGH the rule fires (≤ / ≥)", () => {
    expect(controllerStep(INITIAL_CONTROLLER, LOW_C).greenOn).toBe(true);
    expect(controllerStep(INITIAL_CONTROLLER, HIGH_C).redOn).toBe(true);
  });

  it("rejects inverted thresholds", () => {
    expect(() => controllerStep(INITIAL_CONTROLLER, 27, 30, 20)).toThrow();
  });
});

describe("measureAndControl — full pipeline", () => {
  it("a 22 °C reading lands in the cool branch", () => {
    const r = measureAndControl(22);
    expect(r.outputs.greenOn).toBe(true);
    expect(r.outputs.fanOn).toBe(false);
    expect(r.adc).toBeGreaterThan(0);
    expect(r.adc).toBeLessThan(1024);
  });

  it("a 35 °C reading turns the fan on", () => {
    const r = measureAndControl(35);
    expect(r.outputs.fanOn).toBe(true);
    expect(r.outputs.redOn).toBe(true);
  });

  it("recovers temperature within ~0.05 °C after ADC quantisation", () => {
    for (const c of [10, 20, 25, 30]) {
      const r = measureAndControl(c);
      expect(Math.abs(r.recoveredCelsius - c)).toBeLessThan(0.5);
    }
  });

  it("hysteresis preserved when crossing through the dead-band", () => {
    let state: ControllerState = INITIAL_CONTROLLER;
    state = measureAndControl(35, state).outputs;
    expect(state.fanOn).toBe(true);
    state = measureAndControl(27, state).outputs;
    // Fan should still be on inside the deadband while cooling down
    expect(state.fanOn).toBe(true);
    state = measureAndControl(LOW_C, state).outputs;
    // Just hit LOW → cools off
    expect(state.fanOn).toBe(false);
  });
});
