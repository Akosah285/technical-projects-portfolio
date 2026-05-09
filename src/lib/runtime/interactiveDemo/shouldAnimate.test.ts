import { describe, it, expect } from "vitest";
import { shouldAnimate } from "./shouldAnimate";

describe("shouldAnimate", () => {
  it("animates while interactive and the document is visible", () => {
    expect(shouldAnimate("interactive", true)).toBe(true);
  });

  it("animates while in auto-demo and the document is visible", () => {
    expect(shouldAnimate("auto-demo", true)).toBe(true);
  });

  it("pauses while the document is hidden, regardless of mode", () => {
    expect(shouldAnimate("interactive", false)).toBe(false);
    expect(shouldAnimate("auto-demo", false)).toBe(false);
    expect(shouldAnimate("static", false)).toBe(false);
  });

  it("never animates in static mode", () => {
    expect(shouldAnimate("static", true)).toBe(false);
    expect(shouldAnimate("static", false)).toBe(false);
  });
});
