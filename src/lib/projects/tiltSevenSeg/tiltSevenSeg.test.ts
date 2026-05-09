import { describe, it, expect } from "vitest";
import {
  DIGIT_TABLE,
  ERR,
  MINUS,
  SEG,
  accelToDeciDeg,
  accelToTiltDeg,
  formatAngleSegments,
  isSegOn,
} from "./tiltSevenSeg";

describe("DIGIT_TABLE", () => {
  it("matches the standard HT16K33 / Adafruit numbertable", () => {
    expect(DIGIT_TABLE).toEqual([0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f]);
  });

  it("digit 8 lights all 7 segments (no dp)", () => {
    const d = DIGIT_TABLE[8];
    expect(isSegOn(d, "a")).toBe(true);
    expect(isSegOn(d, "b")).toBe(true);
    expect(isSegOn(d, "c")).toBe(true);
    expect(isSegOn(d, "d")).toBe(true);
    expect(isSegOn(d, "e")).toBe(true);
    expect(isSegOn(d, "f")).toBe(true);
    expect(isSegOn(d, "g")).toBe(true);
    expect(isSegOn(d, "dp")).toBe(false);
  });
});

describe("accelToTiltDeg", () => {
  it("0 g → 0°", () => {
    expect(accelToTiltDeg(0)).toBe(0);
  });

  it("+1 g → +90°", () => {
    expect(accelToTiltDeg(1000)).toBeCloseTo(90, 6);
  });

  it("-1 g → -90°", () => {
    expect(accelToTiltDeg(-1000)).toBeCloseTo(-90, 6);
  });

  it("clamps over-range values to ±90°", () => {
    expect(accelToTiltDeg(2500)).toBeCloseTo(90, 6);
    expect(accelToTiltDeg(-2500)).toBeCloseTo(-90, 6);
  });

  it("rejects NaN", () => {
    expect(() => accelToTiltDeg(Number.NaN)).toThrow();
  });
});

describe("accelToDeciDeg", () => {
  it("returns rounded deci-degrees", () => {
    // sin(45°) = 0.7071 → ax ≈ 707
    expect(accelToDeciDeg(707)).toBeGreaterThanOrEqual(449);
    expect(accelToDeciDeg(707)).toBeLessThanOrEqual(451);
  });
});

describe("formatAngleSegments", () => {
  it("requires integer input", () => {
    expect(() => formatAngleSegments(12.5)).toThrow();
  });

  it("displays positive 90.0 as [_, '9', '0.', '0']", () => {
    const r = formatAngleSegments(900);
    expect(r.inRange).toBe(true);
    expect(r.digits[0]).toBe(0);
    expect(r.digits[1]).toBe(DIGIT_TABLE[9]);
    expect(r.digits[2]).toBe(DIGIT_TABLE[0] | SEG.dp);
    expect(r.digits[3]).toBe(DIGIT_TABLE[0]);
  });

  it("displays -45.0 as ['-', '4', '5.', '0']", () => {
    const r = formatAngleSegments(-450);
    expect(r.inRange).toBe(true);
    expect(r.digits[0]).toBe(MINUS);
    expect(r.digits[1]).toBe(DIGIT_TABLE[4]);
    expect(r.digits[2]).toBe(DIGIT_TABLE[5] | SEG.dp);
    expect(r.digits[3]).toBe(DIGIT_TABLE[0]);
  });

  it("displays 0.0 with the decimal point on the tens position", () => {
    const r = formatAngleSegments(0);
    expect(r.digits).toEqual([0x00, DIGIT_TABLE[0], DIGIT_TABLE[0] | SEG.dp, DIGIT_TABLE[0]]);
  });

  it("out-of-range values produce four 'E's and inRange = false", () => {
    const r1 = formatAngleSegments(1000);
    const r2 = formatAngleSegments(-1000);
    expect(r1).toEqual({ digits: [ERR, ERR, ERR, ERR], inRange: false });
    expect(r2).toEqual({ digits: [ERR, ERR, ERR, ERR], inRange: false });
  });

  it("the decimal point is always on digit 2 for in-range values", () => {
    for (const d of [-999, -123, -10, -1, 0, 1, 10, 123, 999]) {
      const r = formatAngleSegments(d);
      expect(isSegOn(r.digits[2], "dp")).toBe(true);
    }
  });
});

describe("isSegOn", () => {
  it("inspects individual segments by name", () => {
    expect(isSegOn(0x06, "b")).toBe(true);
    expect(isSegOn(0x06, "c")).toBe(true);
    expect(isSegOn(0x06, "a")).toBe(false);
  });
});
