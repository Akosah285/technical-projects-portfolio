/**
 * Tilt → 7-segment display (Lab 5 of E85, WI21).
 *
 * The physical setup wires an LSM303AGR accelerometer to the AVR's
 * I2C bus and an Adafruit HT16K33 4-digit 7-segment display to the
 * same bus. The firmware (lab5.c) samples the accelerometer at 1 Hz
 * via TIMER1, computes the tilt angle along one axis with
 *
 *   tilt = asin(Ax / g)      (Ax in ±1g, g = 1000 sensor units)
 *
 * and pushes a deci-degree value (e.g. -123 = -12.3°) through
 * `SevenSeg_angle()`, which packs four segment-bytes plus the
 * minus-sign and decimal-point bits.
 *
 * We model the same arithmetic and the same packing pure-functionally
 * so the player UI can render an SVG 7-segment display segment-by
 * segment from the same byte values the firmware sends over I2C.
 */

/** Bit layout matches HT16K33 / common-cathode 7-segment standard:
 *
 *      a (0x01)
 *  f         b
 * (0x20)   (0x02)
 *      g (0x40)
 *  e         c
 * (0x10)   (0x04)
 *      d (0x08)
 *      dp (0x80)
 */
export const SEG = {
  a: 0x01,
  b: 0x02,
  c: 0x04,
  d: 0x08,
  e: 0x10,
  f: 0x20,
  g: 0x40,
  dp: 0x80,
} as const;

export const MINUS = SEG.g; // bare middle segment
export const ERR = SEG.a | SEG.d | SEG.e | SEG.f | SEG.g; // 'E'

/** Standard HT16K33 / Adafruit numbertable for digits 0..9. */
export const DIGIT_TABLE: ReadonlyArray<number> = [
  0x3f, // 0
  0x06, // 1
  0x5b, // 2
  0x4f, // 3
  0x66, // 4
  0x6d, // 5
  0x7d, // 6
  0x07, // 7
  0x7f, // 8
  0x6f, // 9
];

export const G_RAW = 1000; // 1g in sensor units

/**
 * Compute tilt angle in degrees from the LSM303AGR raw X reading.
 * The original firmware does asin(Ax * 0.001) and clamps to [-1, 1]
 * before the call to `asin`.
 */
export function accelToTiltDeg(ax: number): number {
  if (!Number.isFinite(ax)) throw new Error("ax must be finite");
  const ratio = Math.max(-1, Math.min(1, ax / G_RAW));
  return (Math.asin(ratio) * 180) / Math.PI;
}

/** Tilt in deci-degrees (10⨯ degrees, integer), the value passed to SevenSeg_angle. */
export function accelToDeciDeg(ax: number): number {
  return Math.round(accelToTiltDeg(ax) * 10);
}

/**
 * Faithful re-render of `SevenSeg_angle()`.
 * Returns the 4 segment bytes [d0, d1, d2, d3] for a deci-degree
 * value, plus a flag for which digit carries the decimal point and
 * whether the value is in range.
 *
 * Original layout (5-position display with a colon between
 * positions 1 and 2 — we drop the colon and keep 4 digits):
 *
 *   pos 0  → minus sign or hundreds digit
 *   pos 1  → hundreds (or 0)
 *   pos 2  → tens, with decimal point
 *   pos 3  → ones
 *
 * For -999 ≤ deci ≤ 999 the output is `±A.B` with 1 decimal place
 * (deci=900 → "9 0.0"; deci=-450 → "- 4 5.0"; deci=23 → "  2.3").
 * Out of range → "EEEE".
 */
export interface AngleDisplay {
  digits: [number, number, number, number];
  inRange: boolean;
}

export function formatAngleSegments(deciDeg: number): AngleDisplay {
  if (!Number.isInteger(deciDeg)) {
    throw new Error("deciDeg must be an integer (call accelToDeciDeg first)");
  }
  if (deciDeg < -999 || deciDeg > 999) {
    return { digits: [ERR, ERR, ERR, ERR], inRange: false };
  }
  const negative = deciDeg < 0;
  const v = Math.abs(deciDeg);
  const hundreds = Math.floor(v / 100);
  const tens = Math.floor((v % 100) / 10);
  const ones = v % 10;

  const d0 = negative ? MINUS : 0x00;
  const d1 = DIGIT_TABLE[hundreds];
  const d2 = DIGIT_TABLE[tens] | SEG.dp;
  const d3 = DIGIT_TABLE[ones];
  return { digits: [d0, d1, d2, d3], inRange: true };
}

/** Returns true iff the named segment is set in the byte. */
export function isSegOn(byte: number, name: keyof typeof SEG): boolean {
  return (byte & SEG[name]) !== 0;
}
