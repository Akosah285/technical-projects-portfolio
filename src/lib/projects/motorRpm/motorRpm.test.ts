import { describe, it, expect } from "vitest";
import {
  DEAD_BAND,
  FULL_THROTTLE_RPM,
  MAX_ADC,
  MID_ADC,
  MOTOR_MAX,
  PULSES_PER_REV,
  configureMotor,
  expectedPulsesPerSecond,
  pulsesToRPM,
} from "./motorRpm";

describe("configureMotor — Lab 7 mapping", () => {
  it("BRAKE within ±DEAD_BAND of MID_ADC, pwm = 0", () => {
    for (const adc of [MID_ADC - DEAD_BAND, MID_ADC, MID_ADC + DEAD_BAND]) {
      const c = configureMotor(adc);
      expect(c.mode).toBe("BRAKE");
      expect(c.pwm).toBe(0);
    }
  });

  it("FWD just above the dead band, REV just below", () => {
    expect(configureMotor(MID_ADC + DEAD_BAND + 1).mode).toBe("FWD");
    expect(configureMotor(MID_ADC - DEAD_BAND - 1).mode).toBe("REV");
  });

  it("FWD pwm grows monotonically from 0 to MOTOR_MAX as adc increases", () => {
    let prev = -1;
    for (let adc = MID_ADC + DEAD_BAND + 1; adc <= MAX_ADC; adc += 25) {
      const c = configureMotor(adc);
      expect(c.mode).toBe("FWD");
      expect(c.pwm).toBeGreaterThanOrEqual(prev);
      prev = c.pwm;
    }
    expect(configureMotor(MAX_ADC).pwm).toBe(MOTOR_MAX);
  });

  it("REV is symmetric: pwm matches FWD at the mirrored ADC value", () => {
    for (const offset of [50, 100, 200, 400]) {
      const fwd = configureMotor(MID_ADC + DEAD_BAND + offset);
      const rev = configureMotor(MID_ADC - DEAD_BAND - offset);
      expect(fwd.mode).toBe("FWD");
      expect(rev.mode).toBe("REV");
      expect(rev.pwm).toBe(fwd.pwm);
    }
  });

  it("rejects out-of-range or non-finite adc", () => {
    expect(() => configureMotor(-1)).toThrow();
    expect(() => configureMotor(1024)).toThrow();
    expect(() => configureMotor(Number.NaN)).toThrow();
  });
});

describe("pulsesToRPM", () => {
  it("FWD pulses become positive RPM (3 × pulses)", () => {
    expect(pulsesToRPM(10, "FWD")).toBe(30);
    expect(pulsesToRPM(75, "FWD")).toBe(225);
  });

  it("REV pulses become negative RPM", () => {
    expect(pulsesToRPM(10, "REV")).toBe(-30);
  });

  it("BRAKE produces zero", () => {
    expect(pulsesToRPM(0, "BRAKE")).toBe(0);
  });

  it("rejects bogus inputs", () => {
    expect(() => pulsesToRPM(-1, "FWD")).toThrow();
    expect(() => pulsesToRPM(1.5, "FWD")).toThrow();
  });
});

describe("expectedPulsesPerSecond", () => {
  it("BRAKE = 0", () => {
    expect(expectedPulsesPerSecond({ mode: "BRAKE", pwm: 0 })).toBe(0);
  });

  it("FWD at full throttle ≈ FULL_THROTTLE_RPM/60 × pulses-per-rev", () => {
    const pps = expectedPulsesPerSecond({ mode: "FWD", pwm: MOTOR_MAX });
    expect(pps).toBeCloseTo((FULL_THROTTLE_RPM / 60) * PULSES_PER_REV, 6);
  });

  it("scales linearly with PWM", () => {
    const half = expectedPulsesPerSecond({ mode: "FWD", pwm: MOTOR_MAX / 2 });
    const full = expectedPulsesPerSecond({ mode: "FWD", pwm: MOTOR_MAX });
    expect(half).toBeCloseTo(full / 2, 6);
  });
});
