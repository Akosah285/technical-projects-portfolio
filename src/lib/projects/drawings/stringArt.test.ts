import { describe, expect, it } from "vitest";
import { stringArtLines } from "./stringArt";

describe("stringArtLines", () => {
  it("emits two stick lines plus n+1 string lines (the original loop runs x = 0..n inclusive)", () => {
    const result = stringArtLines({
      stickA: { x1: 30, y1: 40, x2: 60, y2: 220 },
      stickB: { x1: 300, y1: 195, x2: 200, y2: 350 },
      n: 30,
    });
    expect(result.sticks.length).toBe(2);
    expect(result.strings.length).toBe(31);
  });

  it("the first string connects the start of stick A to the end of stick B (x = 0)", () => {
    const result = stringArtLines({
      stickA: { x1: 0, y1: 0, x2: 100, y2: 0 },
      stickB: { x1: 0, y1: 100, x2: 100, y2: 100 },
      n: 4,
    });
    const first = result.strings[0];
    expect(first.x1).toBeCloseTo(0);
    expect(first.y1).toBeCloseTo(0);
    expect(first.x2).toBeCloseTo(100);
    expect(first.y2).toBeCloseTo(100);
  });

  it("the last string connects the end of stick A to the start of stick B (x = n)", () => {
    const result = stringArtLines({
      stickA: { x1: 0, y1: 0, x2: 100, y2: 0 },
      stickB: { x1: 0, y1: 100, x2: 100, y2: 100 },
      n: 4,
    });
    const last = result.strings[result.strings.length - 1];
    expect(last.x1).toBeCloseTo(100);
    expect(last.y1).toBeCloseTo(0);
    expect(last.x2).toBeCloseTo(0);
    expect(last.y2).toBeCloseTo(100);
  });

  it("string colors interpolate from blue (x=0) to cyan-ish (x=n) — green channel = x/n", () => {
    const result = stringArtLines({
      stickA: { x1: 0, y1: 0, x2: 1, y2: 0 },
      stickB: { x1: 0, y1: 1, x2: 1, y2: 1 },
      n: 4,
    });
    expect(result.strings[0].color).toMatch(/rgb\(0,\s*0,\s*255\)/);
    const last = result.strings[result.strings.length - 1];
    expect(last.color).toMatch(/rgb\(0,\s*255,\s*255\)/);
  });
});
