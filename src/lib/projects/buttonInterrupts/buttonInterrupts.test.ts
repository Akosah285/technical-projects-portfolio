import { describe, expect, it } from "vitest";
import {
  initialIsrState,
  pressButton,
  flipSwitch,
  decodeButtonBits,
  decodeSwitchEdge,
} from "./buttonInterrupts";

describe("decodeButtonBits — single-bit firmware switch", () => {
  it.each([
    [0x1, 0],
    [0x2, 1],
    [0x4, 2],
    [0x8, 3],
  ])("maps raw bits 0x%s to button index %d", (raw, idx) => {
    expect(decodeButtonBits(raw)).toBe(idx);
  });

  it("returns null when no buttons are set (e.g. spurious interrupt)", () => {
    expect(decodeButtonBits(0)).toBeNull();
  });

  it("returns null when multiple buttons are pressed (the firmware falls through default:)", () => {
    expect(decodeButtonBits(0x3)).toBeNull(); // btn0 + btn1
    expect(decodeButtonBits(0xf)).toBeNull(); // all four
  });
});

describe("decodeSwitchEdge — XOR change detection", () => {
  it("identifies the single switch that flipped", () => {
    expect(decodeSwitchEdge(0x0, 0x1)).toBe(0);
    expect(decodeSwitchEdge(0x0, 0x2)).toBe(1);
    expect(decodeSwitchEdge(0x0, 0x4)).toBe(2);
    expect(decodeSwitchEdge(0x0, 0x8)).toBe(3);
  });

  it("identifies a switch flipping back from on to off", () => {
    expect(decodeSwitchEdge(0xf, 0xb)).toBe(2); // bit 2 cleared
  });

  it("returns null when nothing changed", () => {
    expect(decodeSwitchEdge(0x5, 0x5)).toBeNull();
  });

  it("returns null when multiple switches changed simultaneously", () => {
    expect(decodeSwitchEdge(0x0, 0x3)).toBeNull(); // sw0 + sw1 both flipped
  });
});

describe("initialIsrState", () => {
  it("starts with no switches set, no ISRs fired, all LEDs off", () => {
    const s = initialIsrState();
    expect(s.prevSwitches).toBe(0);
    expect(s.isrCount).toBe(0);
    expect(s.ledBank).toEqual([false, false, false, false]);
    expect(s.log).toEqual([]);
  });
});

describe("pressButton — top-level ISR for the button bank", () => {
  it("toggles the targeted LED, increments ISR count, and appends a log entry", () => {
    const s = pressButton(initialIsrState(), 0x4); // btn 2
    expect(s.ledBank).toEqual([false, false, true, false]);
    expect(s.isrCount).toBe(1);
    expect(s.log[0]).toEqual({ source: "button", index: 2, count: 1 });
  });

  it("toggles the same LED back off on a second press", () => {
    let s = pressButton(initialIsrState(), 0x1);
    s = pressButton(s, 0x1);
    expect(s.ledBank[0]).toBe(false);
    expect(s.isrCount).toBe(2);
  });

  it("ignores spurious / multi-button presses without changing LEDs or counter", () => {
    const before = pressButton(initialIsrState(), 0x1);
    const after = pressButton(before, 0xf); // all four — falls through default
    expect(after).toEqual(before);
  });
});

describe("flipSwitch — top-level ISR for the switch bank", () => {
  it("registers a single-bit edge, updates prevSwitches, toggles LED, increments count", () => {
    const s = flipSwitch(initialIsrState(), 0x2); // sw 1 flipped on
    expect(s.prevSwitches).toBe(0x2);
    expect(s.ledBank).toEqual([false, true, false, false]);
    expect(s.isrCount).toBe(1);
    expect(s.log[0]).toEqual({ source: "switch", index: 1, count: 1 });
  });

  it("supports flipping a switch back off (still single-bit edge against prev)", () => {
    let s = flipSwitch(initialIsrState(), 0x4); // sw 2 ON
    s = flipSwitch(s, 0x0); // sw 2 OFF
    expect(s.prevSwitches).toBe(0x0);
    expect(s.ledBank[2]).toBe(false); // toggled back off
    expect(s.isrCount).toBe(2);
  });

  it("ignores changes that don't decode to a single switch (firmware falls through default)", () => {
    const before = flipSwitch(initialIsrState(), 0x1);
    const after = flipSwitch(before, 0x6); // would imply sw 0,1,2 changed
    expect(after).toEqual(before);
  });

  it("interleaves cleanly with button presses (independent counters in the log entries)", () => {
    let s = pressButton(initialIsrState(), 0x1);
    s = flipSwitch(s, 0x8);
    s = pressButton(s, 0x4);
    expect(s.isrCount).toBe(3);
    expect(s.log.map((e) => e.source)).toEqual([
      "button",
      "switch",
      "button",
    ]);
    expect(s.log.map((e) => e.index)).toEqual([0, 3, 2]);
  });
});
