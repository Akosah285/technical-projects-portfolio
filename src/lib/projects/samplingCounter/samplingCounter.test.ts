import { describe, it, expect } from "vitest";
import { DEFAULT_TCOUNT, INITIAL, runFor, sampleHz, tick } from "./samplingCounter";

describe("sampling counter — spec behaviour (one-cycle pulse)", () => {
  it("counts up by one every tick", () => {
    let s = INITIAL;
    for (let i = 1; i <= 5; i++) {
      s = tick(s, 10);
      expect(s.count).toBe(i);
      expect(s.takeSample).toBe(0);
    }
  });

  it("asserts take_sample exactly when count == TCount, then resets to 0", () => {
    const tc = 5;
    let s = INITIAL;
    for (let i = 0; i < tc; i++) s = tick(s, tc);
    expect(s.count).toBe(tc);
    expect(s.takeSample).toBe(0);
    // next edge: count == tc → take_sample asserts, count resets
    s = tick(s, tc);
    expect(s.count).toBe(0);
    expect(s.takeSample).toBe(1);
    // following edge: pulse clears (spec behaviour)
    s = tick(s, tc);
    expect(s.takeSample).toBe(0);
    expect(s.count).toBe(1);
  });

  it("free-runs forever, pulsing every (TCount + 1) ticks", () => {
    const { pulses, state } = runFor(INITIAL, 3 * (10 + 1), 10);
    expect(pulses).toBe(3);
    expect(state.takeSample).toBe(1);
  });
});

describe("literalVhdl mode (bug-faithful)", () => {
  it("once asserted, take_sample stays HIGH", () => {
    let s = INITIAL;
    for (let i = 0; i < 11; i++) s = tick(s, 10, { literalVhdl: true });
    expect(s.takeSample).toBe(1);
    // even after another non-matching tick, it stays HIGH
    s = tick(s, 10, { literalVhdl: true });
    expect(s.takeSample).toBe(1);
  });
});

describe("sampleHz derivation", () => {
  it("100 MHz / TCount=100000 → ~1 kHz", () => {
    expect(sampleHz(100_000_000, DEFAULT_TCOUNT)).toBeCloseTo(999.99, 1);
  });
  it("validates inputs", () => {
    expect(() => sampleHz(0, 10)).toThrow();
    expect(() => sampleHz(1, 0)).toThrow();
    expect(() => sampleHz(1, 1.5)).toThrow();
  });
});

describe("tick validation", () => {
  it("rejects bad TCount", () => {
    expect(() => tick(INITIAL, 0)).toThrow();
    expect(() => tick(INITIAL, -1)).toThrow();
    expect(() => tick(INITIAL, 1.5)).toThrow();
  });
});
