import { describe, it, expect } from "vitest";
import {
  INITIAL,
  MAX_HUNDREDTHS,
  formatDisplay,
  step,
  toBcd,
  type Snapshot,
} from "./stopwatch";

const tickN = (start: Snapshot, n: number): Snapshot => {
  let s = start;
  for (let i = 0; i < n; i++) s = step(s, { type: "tick" });
  return s;
};

describe("FSM transitions", () => {
  it("starts STOPPED at 00.00", () => {
    expect(INITIAL.state).toBe("STOPPED");
    expect(INITIAL.hundredths).toBe(0);
  });

  it("start_stop toggles between STOPPED and RUNNING", () => {
    const a = step(INITIAL, { type: "start_stop" });
    expect(a.state).toBe("RUNNING");
    const b = step(a, { type: "start_stop" });
    expect(b.state).toBe("STOPPED");
  });

  it("tick advances time only while RUNNING", () => {
    const stoppedAfterTick = step(INITIAL, { type: "tick" });
    expect(stoppedAfterTick.hundredths).toBe(0);

    const running = step(INITIAL, { type: "start_stop" });
    const after5 = tickN(running, 5);
    expect(after5.hundredths).toBe(5);
  });
});

describe("clear semantics", () => {
  it("clear resets to 0 when STOPPED", () => {
    const running = step(INITIAL, { type: "start_stop" });
    const after = tickN(running, 314);
    const stopped = step(after, { type: "start_stop" });
    expect(stopped.hundredths).toBe(314);
    const cleared = step(stopped, { type: "clear" });
    expect(cleared.hundredths).toBe(0);
    expect(cleared.state).toBe("STOPPED");
  });

  it("clear is ignored while RUNNING", () => {
    const running = step(INITIAL, { type: "start_stop" });
    const after = tickN(running, 100);
    const ignored = step(after, { type: "clear" });
    expect(ignored.state).toBe("RUNNING");
    expect(ignored.hundredths).toBe(100);
  });
});

describe("rollover at 99.99", () => {
  it("99.99 + 1 → 00.00 (wraps), state stays RUNNING", () => {
    const running = step(INITIAL, { type: "start_stop" });
    const at9999 = { ...running, hundredths: MAX_HUNDREDTHS };
    const next = step(at9999, { type: "tick" });
    expect(next.hundredths).toBe(0);
    expect(next.state).toBe("RUNNING");
  });
});

describe("BCD packing", () => {
  it("00.00 → [0,0,0,0]", () => {
    expect(toBcd(0).digits).toEqual([0, 0, 0, 0]);
  });
  it("12.34 (1234 hundredths) → [1,2,3,4]", () => {
    expect(toBcd(1234).digits).toEqual([1, 2, 3, 4]);
  });
  it("99.99 → [9,9,9,9]", () => {
    expect(toBcd(MAX_HUNDREDTHS).digits).toEqual([9, 9, 9, 9]);
  });
  it("decimal point always at index 1", () => {
    expect(toBcd(0).dpAt).toBe(1);
    expect(toBcd(1234).dpAt).toBe(1);
  });
  it("rejects negative or non-integer hundredths", () => {
    expect(() => toBcd(-1)).toThrow();
    expect(() => toBcd(1.5)).toThrow();
  });
});

describe("formatDisplay", () => {
  it("renders SS.HH", () => {
    expect(formatDisplay(0)).toBe("00.00");
    expect(formatDisplay(5)).toBe("00.05");
    expect(formatDisplay(123)).toBe("01.23");
    expect(formatDisplay(MAX_HUNDREDTHS)).toBe("99.99");
  });
});

describe("end-to-end timed scenario", () => {
  it("start, run 250 ticks (2.50s), stop, hold, clear, run again → 1.00s", () => {
    let s = INITIAL;
    s = step(s, { type: "start_stop" });
    s = tickN(s, 250);
    expect(formatDisplay(s.hundredths)).toBe("02.50");
    s = step(s, { type: "start_stop" });
    expect(s.state).toBe("STOPPED");
    s = tickN(s, 999);
    expect(s.hundredths).toBe(250);
    s = step(s, { type: "clear" });
    expect(s.hundredths).toBe(0);
    s = step(s, { type: "start_stop" });
    s = tickN(s, 100);
    expect(formatDisplay(s.hundredths)).toBe("01.00");
  });
});
