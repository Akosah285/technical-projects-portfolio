import { describe, it, expect } from "vitest";
import {
  COUNT_PROGRAM,
  LED_PINS,
  SEQ_PROGRAM,
  applyAction,
  isPinLit,
  runProgram,
  type Action,
} from "./blinky";

describe("applyAction", () => {
  it("setBit sets the right bit and leaves others alone", () => {
    const s = applyAction({ DDRD: 0, PORTD: 0 }, { kind: "setBit", reg: "DDRD", bit: 2 });
    expect(s.DDRD).toBe(0b00000100);
  });

  it("clearBit clears just one bit", () => {
    const s = applyAction(
      { DDRD: 0xff, PORTD: 0xff },
      { kind: "clearBit", reg: "PORTD", bit: 4 },
    );
    expect(s.PORTD).toBe(0b11101111);
  });

  it("toggleBit flips the bit", () => {
    const s1 = applyAction({ DDRD: 0, PORTD: 0 }, { kind: "toggleBit", reg: "PORTD", bit: 7 });
    const s2 = applyAction(s1, { kind: "toggleBit", reg: "PORTD", bit: 7 });
    expect(s1.PORTD).toBe(0b10000000);
    expect(s2.PORTD).toBe(0);
  });

  it("assign overwrites the whole register and is masked to 8 bits", () => {
    const s = applyAction(
      { DDRD: 0, PORTD: 0 },
      { kind: "assign", reg: "PORTD", value: 0x1ff },
    );
    expect(s.PORTD).toBe(0xff);
  });

  it("delay leaves register state untouched", () => {
    const s0 = { DDRD: 0xff, PORTD: 0x55 };
    const s1 = applyAction(s0, { kind: "delay", ms: 1000 });
    expect(s1).toEqual(s0);
  });
});

describe("isPinLit", () => {
  it("requires both DDRD and PORTD bits set", () => {
    expect(isPinLit({ DDRD: 0xff, PORTD: 0 }, 2)).toBe(false);
    expect(isPinLit({ DDRD: 0, PORTD: 0xff }, 2)).toBe(false);
    expect(isPinLit({ DDRD: 0xff, PORTD: 0xff }, 2)).toBe(true);
  });

  it("rejects bits outside 0..7", () => {
    expect(() => isPinLit({ DDRD: 0, PORTD: 0 }, -1)).toThrow();
    expect(() => isPinLit({ DDRD: 0, PORTD: 0 }, 8)).toThrow();
  });
});

describe("runProgram", () => {
  it("emits one frame per action with monotonically non-decreasing time", () => {
    const program: Action[] = [
      { kind: "setBit", reg: "DDRD", bit: 2 },
      { kind: "setBit", reg: "PORTD", bit: 2 },
      { kind: "delay", ms: 100 },
      { kind: "clearBit", reg: "PORTD", bit: 2 },
      { kind: "delay", ms: 200 },
    ];
    const frames = runProgram(program);
    expect(frames).toHaveLength(program.length);
    expect(frames.map((f) => f.timeMs)).toEqual([0, 0, 100, 100, 300]);
  });

  it("non-delay frames have durationMs = 0; delay frames carry the wait", () => {
    const program: Action[] = [
      { kind: "setBit", reg: "DDRD", bit: 0 },
      { kind: "delay", ms: 50 },
    ];
    const [a, b] = runProgram(program);
    expect(a.durationMs).toBe(0);
    expect(b.durationMs).toBe(50);
  });
});

describe("SEQ_PROGRAM", () => {
  it("the LEDs only light up after their DDRD bits are configured", () => {
    const frames = runProgram(SEQ_PROGRAM);
    const setupFrames = frames.slice(0, 3);
    for (const f of setupFrames) {
      expect(LED_PINS.some((p) => isPinLit(f.state, p.bit))).toBe(false);
    }
  });

  it("over the whole sequence each LED gets lit at least once", () => {
    const frames = runProgram(SEQ_PROGRAM);
    for (const pin of LED_PINS) {
      expect(frames.some((f) => isPinLit(f.state, pin.bit))).toBe(true);
    }
  });

  it("at any moment in the loop body at most one LED is lit (true sequence)", () => {
    const frames = runProgram(SEQ_PROGRAM);
    const loopBody = frames.slice(3); // skip the 3 DDRD-setup frames
    for (const f of loopBody) {
      const litCount = LED_PINS.filter((p) => isPinLit(f.state, p.bit)).length;
      expect(litCount).toBeLessThanOrEqual(1);
    }
  });
});

describe("COUNT_PROGRAM", () => {
  it("after each `assign PORTD` the lit-LED pattern matches the count's binary representation", () => {
    const frames = runProgram(COUNT_PROGRAM);
    const assignFrames = frames.filter((f) => f.description.startsWith("PORTD ="));
    expect(assignFrames).toHaveLength(8);
    for (let n = 0; n < 8; n += 1) {
      const f = assignFrames[n];
      const expected = [
        Boolean((n >> 0) & 1), // D2
        Boolean((n >> 1) & 1), // D4
        Boolean((n >> 2) & 1), // D7
      ];
      const actual = LED_PINS.map((p) => isPinLit(f.state, p.bit));
      expect(actual).toEqual(expected);
    }
  });
});
