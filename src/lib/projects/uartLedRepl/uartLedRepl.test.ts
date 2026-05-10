import { describe, expect, it } from "vitest";
import {
  initialReplState,
  processCommand,
  type ReplState,
} from "./uartLedRepl";

describe("uartLedRepl initial state", () => {
  it("starts with all four board LEDs off, the PS LED on, and no RGB color", () => {
    const s = initialReplState();
    expect(s.boardLeds).toEqual([false, false, false, false]);
    expect(s.psLed).toBe(true);
    expect(s.rgbColor).toBe("off");
    expect(s.done).toBe(false);
    expect(s.log[0]).toMatch(/\[Hello\]/);
  });
});

describe("uartLedRepl board LED commands", () => {
  it("toggles board LED 0 when '0' is entered", () => {
    const s = processCommand(initialReplState(), "0");
    expect(s.boardLeds[0]).toBe(true);
    expect(s.log.at(-1)).toBe("[0 on]");
  });

  it("toggles back off when '0' is entered twice", () => {
    let s = processCommand(initialReplState(), "0");
    s = processCommand(s, "0");
    expect(s.boardLeds[0]).toBe(false);
    expect(s.log.at(-1)).toBe("[0 off]");
  });

  it("addresses each of the four board LEDs independently", () => {
    let s = initialReplState();
    s = processCommand(s, "1");
    s = processCommand(s, "2");
    s = processCommand(s, "3");
    expect(s.boardLeds).toEqual([false, true, true, true]);
  });
});

describe("uartLedRepl RGB color commands", () => {
  it("sets the RGB LED red on 'r'", () => {
    expect(processCommand(initialReplState(), "r").rgbColor).toBe("red");
  });

  it("sets the RGB LED green on 'g'", () => {
    expect(processCommand(initialReplState(), "g").rgbColor).toBe("green");
  });

  it("sets the RGB LED blue on 'b'", () => {
    expect(processCommand(initialReplState(), "b").rgbColor).toBe("blue");
  });

  it("sets the RGB LED yellow (red + green) on 'y'", () => {
    expect(processCommand(initialReplState(), "y").rgbColor).toBe("yellow");
  });

  it("overwrites prior color on a new color command", () => {
    let s = processCommand(initialReplState(), "r");
    s = processCommand(s, "b");
    expect(s.rgbColor).toBe("blue");
  });
});

describe("uartLedRepl quit command", () => {
  it("sets done=true on 'q' and clears all LEDs", () => {
    let s = processCommand(initialReplState(), "0");
    s = processCommand(s, "r");
    s = processCommand(s, "q");
    expect(s.done).toBe(true);
    expect(s.boardLeds).toEqual([false, false, false, false]);
    expect(s.psLed).toBe(false);
    expect(s.rgbColor).toBe("off");
    expect(s.log.at(-1)).toBe("[done]");
  });
});

describe("uartLedRepl unknown commands", () => {
  it("ignores unrecognised commands without changing state", () => {
    const before = initialReplState();
    const after = processCommand(before, "x");
    expect(after.boardLeds).toEqual(before.boardLeds);
    expect(after.psLed).toBe(before.psLed);
    expect(after.rgbColor).toBe(before.rgbColor);
    expect(after.done).toBe(false);
  });

  it("ignores commands longer than one character (M1 only parses singles)", () => {
    const before = initialReplState();
    const after = processCommand(before, "high");
    expect(after.boardLeds).toEqual(before.boardLeds);
    expect(after.rgbColor).toBe(before.rgbColor);
  });

  it("ignores out-of-range LED indices like '4' or '9'", () => {
    const after = processCommand(initialReplState(), "4");
    expect(after.boardLeds).toEqual([false, false, false, false]);
  });
});

describe("uartLedRepl after done is set", () => {
  it("does not process further commands once done is true", () => {
    let s: ReplState = processCommand(initialReplState(), "q");
    s = processCommand(s, "0");
    expect(s.boardLeds[0]).toBe(false);
  });
});
