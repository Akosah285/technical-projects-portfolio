import { describe, it, expect } from "vitest";

import {
  initialAdcState,
  pressButton,
  setPot,
  potToDuty,
  LOW_DUTY,
  TEMP_C,
  VCC_V,
} from "./adcSensors";

describe("potToDuty (mirrors pot_to_duty in step3-outline.c)", () => {
  it("0 V → LOW_DUTY (5.25%)", () => {
    expect(potToDuty(0)).toBeCloseTo(LOW_DUTY, 5);
  });
  it("1 V → 5/2.9 + 5.25 ≈ 6.974%", () => {
    expect(potToDuty(1)).toBeCloseTo(5 / 2.9 + LOW_DUTY, 5);
  });
  it("0.5 V → halfway through pot range", () => {
    expect(potToDuty(0.5)).toBeCloseTo(5 * 0.5 / 2.9 + LOW_DUTY, 5);
  });
});

describe("pressButton dispatches to the right ADC channel", () => {
  it("button 0 logs temp readout", () => {
    const next = pressButton(initialAdcState, 0);
    expect(next.log[next.log.length - 1]).toBe(`[Temp = ${TEMP_C.toFixed(2)} c]`);
  });

  it("button 1 logs VccInt readout", () => {
    const next = pressButton(initialAdcState, 1);
    expect(next.log[next.log.length - 1]).toBe(`[VccInt = ${VCC_V.toFixed(2)} v]`);
  });

  it("button 2 logs pot voltage at the current slider value", () => {
    const s = setPot(initialAdcState, 0.73);
    const next = pressButton(s, 2);
    expect(next.log[next.log.length - 1]).toBe(`[Pot = 0.73 v]`);
  });

  it("button 3 converts pot to duty and updates servo", () => {
    const s = setPot(initialAdcState, 1.0);
    const next = pressButton(s, 3);
    expect(next.duty).toBeCloseTo(potToDuty(1.0), 5);
    expect(next.log[next.log.length - 1]).toMatch(/duty/i);
  });

  it("button 3 at pot=0 yields duty=LOW_DUTY", () => {
    const s = setPot(initialAdcState, 0);
    const next = pressButton(s, 3);
    expect(next.duty).toBeCloseTo(LOW_DUTY, 5);
  });

  it("unknown button index is a no-op", () => {
    const next = pressButton(initialAdcState, 7);
    expect(next).toEqual(initialAdcState);
  });

  it("button 0 / 1 do not change pot or duty", () => {
    const s = setPot(initialAdcState, 0.42);
    const next = pressButton(s, 0);
    expect(next.pot).toBe(0.42);
    expect(next.duty).toBe(s.duty);
  });
});

describe("setPot updates the slider", () => {
  it("changes pot to provided voltage", () => {
    const next = setPot(initialAdcState, 0.91);
    expect(next.pot).toBe(0.91);
  });

  it("does not touch duty until button 3 is pressed", () => {
    const next = setPot(initialAdcState, 0.91);
    expect(next.duty).toBe(initialAdcState.duty);
  });

  it("does not append to the log", () => {
    const next = setPot(initialAdcState, 0.91);
    expect(next.log).toEqual(initialAdcState.log);
  });
});
