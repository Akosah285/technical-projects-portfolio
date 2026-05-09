import { describe, expect, it } from "vitest";
import { Counter, Timer, formatCounter, formatTimer } from "./counterTimer";

describe("Counter (faithful port of counterclass.py)", () => {
  it("starts at the initial value passed in", () => {
    const c = new Counter(10, 5);
    expect(c.getValue()).toBe(5);
  });

  it("clamps initial to limit-1 when initial >= limit (the original prints an error)", () => {
    const c = new Counter(15, 21, 4);
    expect(c.getValue()).toBe(14);
  });

  it("clamps initial to limit-1 when initial < 0", () => {
    const c = new Counter(10, -5);
    expect(c.getValue()).toBe(9);
  });

  it("tick() decrements by one (the original is a countdown counter)", () => {
    const c = new Counter(10, 5);
    c.tick();
    expect(c.getValue()).toBe(4);
  });

  it("tick() returns false on a normal decrement and true on the wrap from 0 to limit-1", () => {
    const c = new Counter(10, 1);
    expect(c.tick()).toBe(false);
    expect(c.getValue()).toBe(0);
    expect(c.tick()).toBe(true);
    expect(c.getValue()).toBe(9);
  });

  it("formatCounter pads on the left with zeroes to min_digits", () => {
    expect(formatCounter(new Counter(100, 7, 4))).toBe("0007");
    expect(formatCounter(new Counter(100, 99, 4))).toBe("0099");
    expect(formatCounter(new Counter(10, 5, 1))).toBe("5");
  });
});

describe("Timer (faithful port of timer.py)", () => {
  it("starts at the supplied hh:mm:ss and renders that way", () => {
    const t = new Timer(12, 34, 56);
    expect(formatTimer(t)).toBe("12:34:56");
  });

  it("tick() decrements seconds first", () => {
    const t = new Timer(0, 0, 30);
    t.tick();
    expect(formatTimer(t)).toBe("00:00:29");
  });

  it("when seconds wrap from 0 → 59, minutes decrement", () => {
    const t = new Timer(1, 5, 0);
    t.tick();
    expect(formatTimer(t)).toBe("01:04:59");
  });

  it("when minutes wrap from 0 → 59 (with seconds also wrapping), hours decrement", () => {
    const t = new Timer(2, 0, 0);
    t.tick();
    expect(formatTimer(t)).toBe("01:59:59");
  });

  it("isZero() is true exactly when hh = mm = ss = 0", () => {
    expect(new Timer(0, 0, 0).isZero()).toBe(true);
    expect(new Timer(0, 0, 1).isZero()).toBe(false);
  });
});
