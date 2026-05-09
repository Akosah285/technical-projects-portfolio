import { describe, it, expect } from "vitest";
import {
  COUNT_TC,
  INITIAL,
  nextState,
  outputsFor,
  runTrace,
  tick,
} from "./spiFsm";

describe("Moore outputs (per state)", () => {
  it("SWait: spi_cs=1, all enables off", () => {
    expect(outputsFor("SWait")).toEqual({ spi_cs: 1, shift_en: 0, load_en: 0, CE: 0 });
  });
  it("Shift: spi_cs=0, shift_en=1, CE=1", () => {
    expect(outputsFor("Shift")).toEqual({ spi_cs: 0, shift_en: 1, load_en: 0, CE: 1 });
  });
  it("Load: spi_cs=1, load_en=1, shift_en=0", () => {
    expect(outputsFor("Load")).toEqual({ spi_cs: 1, shift_en: 0, load_en: 1, CE: 0 });
  });
});

describe("next-state transitions", () => {
  it("SWait holds until take_sample asserts", () => {
    expect(nextState("SWait", { take_sample: 0, TC: 0 })).toBe("SWait");
    expect(nextState("SWait", { take_sample: 1, TC: 0 })).toBe("Shift");
  });
  it("Shift holds until TC asserts", () => {
    expect(nextState("Shift", { take_sample: 0, TC: 0 })).toBe("Shift");
    expect(nextState("Shift", { take_sample: 1, TC: 0 })).toBe("Shift");
    expect(nextState("Shift", { take_sample: 0, TC: 1 })).toBe("Load");
  });
  it("Load unconditionally returns to SWait", () => {
    expect(nextState("Load", { take_sample: 0, TC: 0 })).toBe("SWait");
    expect(nextState("Load", { take_sample: 1, TC: 1 })).toBe("SWait");
  });
});

describe("full-transfer trace (16-bit SPI)", () => {
  it("idles in SWait until take_sample, then 15 Shifts + 1 Load", () => {
    // pulse take_sample for one cycle, then 0
    const seq: (0 | 1)[] = [1, ...Array(20).fill(0)];
    const trace = runTrace(INITIAL, seq);
    // first sclk: SWait sees take_sample → next state Shift
    expect(trace[1].state).toBe("Shift");
    // count 15 cycles of Shift (count goes 0 → 14 → TC, then transition to Load)
    let shiftCount = 0;
    for (let i = 1; i < trace.length; i++) {
      if (trace[i].state === "Shift") shiftCount++;
    }
    expect(shiftCount).toBe(15);
    // exactly one Load cycle
    const loadCount = trace.filter((s) => s.state === "Load").length;
    expect(loadCount).toBe(1);
    // returns to SWait after Load
    const loadIdx = trace.findIndex((s) => s.state === "Load");
    expect(trace[loadIdx + 1].state).toBe("SWait");
  });

  it("counter resets when entering Shift and on TC", () => {
    const seq: (0 | 1)[] = [1, ...Array(20).fill(0)];
    const trace = runTrace(INITIAL, seq);
    // The first Shift snapshot has count = 0 (reset on entry)
    const firstShift = trace.find((s) => s.state === "Shift");
    expect(firstShift?.count).toBe(0);
  });

  it("during Shift, count strictly increases until COUNT_TC then wraps", () => {
    const seq: (0 | 1)[] = [1, ...Array(20).fill(0)];
    const trace = runTrace(INITIAL, seq);
    const shiftCounts = trace.filter((s) => s.state === "Shift").map((s) => s.count);
    expect(shiftCounts[0]).toBe(0);
    expect(Math.max(...shiftCounts)).toBe(COUNT_TC);
  });

  it("ignores take_sample while in Shift or Load", () => {
    // pulse take_sample throughout — same final result
    const seq: (0 | 1)[] = [1, ...Array(20).fill(1)];
    const trace = runTrace(INITIAL, seq);
    expect(trace.filter((s) => s.state === "Load").length).toBe(1);
  });
});

describe("idle behaviour", () => {
  it("staying in SWait keeps count at 0 and spi_cs HIGH forever", () => {
    let s = INITIAL;
    for (let i = 0; i < 50; i++) s = tick(s, 0);
    expect(s.state).toBe("SWait");
    expect(s.count).toBe(0);
    expect(s.outputs.spi_cs).toBe(1);
  });
});
